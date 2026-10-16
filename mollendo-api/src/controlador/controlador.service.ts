import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import fs from 'node:fs';
import path from 'node:path';
import { io, type Socket } from 'socket.io-client';
import type { IngresoDto } from '../eventos-acceso/dto/ingreso.dto.js';
import type { SalidaDto } from '../eventos-acceso/dto/salida.dto.js';
import { AVISO_DE, ReleUsbService } from '../integraciones/rele-usb.service.js';
import { LectoresDniService } from '../lectores-dni/lectores-dni.service.js';
import { RegistroLecturas, type ResultadoLectura } from '../lectores-dni/registro-lecturas.js';
import { ipLocalDelEquipo } from './ip-local.util.js';

/** Cada cuánto se informa al servidor el estado de los lectores y relés. */
const ESTADO_CADA_MS = 15_000;
/** Cada cuánto se renueva la lista del personal para las salidas sin conexión. */
const LISTA_PERSONAL_CADA_MS = 10 * 60_000;
/** Cuánto se espera al servidor antes de considerar que no hay conexión. */
const ESPERA_SERVIDOR_MS = 5_000;

interface SalidaPendiente {
  dto: SalidaDto;
  fechaHora: string;
}

/** El servidor no respondió (sin internet, caído o demasiado lento): no es un rechazo. */
class SinConexion extends Error {}

/**
 * Controlador: la mini PC en la garita cuando el servidor está en la
 * nube. Manda al servidor cada DNI leído (`POST /eventos-acceso/ingreso|salida`
 * con la clave de equipos), recibe por un canal permanente la orden de abrir
 * cada molinete (lo abre el relé USB) e informa el estado de lectores y relés.
 * El canal lo abre la mini PC hacia el servidor: no hay que abrir puertos en
 * la garita.
 *
 * Sin conexión (opción B): nadie puede entrar, pero sí salir. Se deja salir a
 * quien está en la lista del personal (todo el personal registrado, que se guarda en disco
 * y se renueva cada 10 minutos) y esas salidas se envían al servidor, con su
 * hora, cuando vuelve la conexión.
 *
 * Configuración: SERVIDOR_URL (p. ej. https://accesos.empresa.com),
 * DEVICE_API_KEY (la misma clave de equipos del servidor), CONTROLADOR_DATOS
 * (carpeta de la lista del personal y las salidas pendientes) y las de lectores y relés
 * (LECTOR_DNI_*, RELE_*), iguales que en el servidor de la mini PC.
 */
@Injectable()
export class ControladorService implements RegistroLecturas, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('Controlador');
  private readonly servidor = (process.env.SERVIDOR_URL ?? '').trim().replace(/\/+$/, '');
  private readonly clave = process.env.DEVICE_API_KEY ?? '';
  private readonly carpeta = process.env.CONTROLADOR_DATOS?.trim() || '/app/datos-controlador';
  private socket: Socket | null = null;
  private listaPersonal = new Set<string>();
  private listaPersonalActualizada: string | null = null;
  private pendientes: SalidaPendiente[] = [];
  private enviandoPendientes = false;
  private temporizadores: NodeJS.Timeout[] = [];

  constructor(
    private readonly releUsb: ReleUsbService,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    if (!this.servidor || !this.clave) {
      throw new Error('El controlador necesita SERVIDOR_URL y DEVICE_API_KEY');
    }
    fs.mkdirSync(this.carpeta, { recursive: true });
    this.cargarDeDisco();

    this.socket = io(`${this.servidor}/ws/controlador`, {
      path: '/api/v1/socket.io',
      auth: { clave: this.clave },
      transports: ['websocket'],
      reconnectionDelayMax: 10_000,
    });
    this.socket.on('connect', () => {
      this.logger.log(`Conectado al servidor ${this.servidor}`);
      void this.enviarEstado();
      void this.actualizarListaPersonal();
      void this.enviarPendientes();
    });
    this.socket.on('disconnect', (motivo) => this.logger.warn(`Desconectado del servidor (${motivo}); se reintenta solo`));
    this.socket.on('connect_error', (error) => this.logger.warn(`Sin conexión con el servidor: ${error.message}`));
    this.socket.on('aviso-denegado', (aviso: { tipoMovimiento?: 'ingreso' | 'salida'; numeroDocumento: string | null }) => {
      const movimiento = aviso.tipoMovimiento ?? 'ingreso';
      this.logger.log(`${movimiento === 'ingreso' ? 'Ingreso denegado' : 'Salida denegada'}${aviso.numeroDocumento ? ` (${aviso.numeroDocumento})` : ''}: relé de aviso`);
      void this.releUsb.pulso(AVISO_DE[movimiento]);
    });
    this.socket.on('abrir', (orden: { tipoMovimiento: 'ingreso' | 'salida' }) => {
      this.logger.log(`Orden del servidor: abrir el molinete de ${orden.tipoMovimiento}`);
      void this.releUsb.pulso(orden.tipoMovimiento);
    });

    this.temporizadores.push(setInterval(() => void this.enviarEstado(), ESTADO_CADA_MS));
    this.temporizadores.push(setInterval(() => void this.actualizarListaPersonal(), LISTA_PERSONAL_CADA_MS));
    this.logger.log(`Controlador iniciado (servidor ${this.servidor}, lista del personal con ${this.listaPersonal.size} personas)`);
  }

  onModuleDestroy() {
    this.temporizadores.forEach((t) => clearInterval(t));
    this.socket?.disconnect();
  }

  // ---------------------------------------------------------------- lecturas

  async registrarIngreso(dto: IngresoDto): Promise<ResultadoLectura> {
    try {
      return await this.enviar<ResultadoLectura>('POST', '/eventos-acceso/ingreso', dto);
    } catch (error) {
      if (!(error instanceof SinConexion)) throw error;
      // Opción B: sin conexión no se puede entrar (el servidor y el G4 Pro deciden el ingreso).
      this.logger.warn(`Ingreso de ${dto.numeroDocumento} no permitido: sin conexión con el servidor`);
      await this.releUsb.pulso('avisoIngreso');
      return { estado: 'sin conexión: no se permite el ingreso' };
    }
  }

  async registrarSalida(dto: SalidaDto): Promise<ResultadoLectura> {
    try {
      const respuesta = await this.enviar<ResultadoLectura>('POST', '/eventos-acceso/salida', dto);
      // Normalmente la orden de abrir llega por el canal; si el canal está caído, se abre aquí.
      if (respuesta.resultado === 'autorizado' && !this.socket?.connected) {
        this.logger.warn('Canal con el servidor caído: se abre el molinete de salida desde el controlador');
        await this.releUsb.pulso('salida');
      }
      return respuesta;
    } catch (error) {
      if (!(error instanceof SinConexion)) throw error;
      return this.salidaSinConexion(dto);
    }
  }

  /** Sin conexión: sale quien está en la lista del personal; la salida se guarda para enviarla después. */
  private async salidaSinConexion(dto: SalidaDto): Promise<ResultadoLectura> {
    if (!this.listaPersonal.has(dto.numeroDocumento)) {
      this.logger.warn(`Salida de ${dto.numeroDocumento} sin conexión: no está en la lista del personal, no se abre`);
      await this.releUsb.pulso('avisoSalida');
      return { resultado: 'denegado (sin conexión, no está en la lista del personal)' };
    }
    await this.releUsb.pulso('salida');
    this.pendientes.push({ dto, fechaHora: new Date().toISOString() });
    this.guardarPendientes();
    this.logger.warn(`Salida de ${dto.numeroDocumento} sin conexión: se abrió; queda pendiente de enviar (${this.pendientes.length})`);
    return { resultado: 'autorizado (sin conexión)' };
  }

  // ---------------------------------------------------------------- servidor

  private async enviar<T>(metodo: 'GET' | 'POST', ruta: string, cuerpo?: unknown): Promise<T> {
    let respuesta: Response;
    try {
      const opciones: RequestInit = { method: metodo, headers: { 'x-api-key': this.clave }, signal: AbortSignal.timeout(ESPERA_SERVIDOR_MS) };
      if (metodo === 'POST') {
        opciones.headers = { ...opciones.headers, 'Content-Type': 'application/json' };
        opciones.body = JSON.stringify(cuerpo ?? {});
      }
      respuesta = await fetch(`${this.servidor}/api/v1${ruta}`, opciones);
    } catch (error) {
      throw new SinConexion((error as Error).message);
    }
    if (respuesta.status >= 500) throw new SinConexion(`el servidor respondió ${respuesta.status}`);
    const datos = (await respuesta.json().catch(() => ({}))) as T & { message?: unknown };
    if (!respuesta.ok) throw new Error(`${metodo} ${ruta} → ${respuesta.status}: ${JSON.stringify(datos.message)}`);
    return datos;
  }

  private async enviarEstado() {
    if (!this.socket?.connected) return;
    const lectores = this.moduleRef.get(LectoresDniService, { strict: false });
    this.socket.emit('estado', {
      lectoresDni: lectores.estado(),
      releMolinetes: await this.releUsb.estado(),
      listaPersonal: { personas: this.listaPersonal.size, actualizado: this.listaPersonalActualizada },
      salidasPendientes: this.pendientes.length,
      ipLocal: ipLocalDelEquipo(),
    });
  }

  private async actualizarListaPersonal() {
    try {
      const { documentos, generado } = await this.enviar<{ documentos: string[]; generado: string }>('GET', '/controlador/lista-personal');
      this.listaPersonal = new Set(documentos);
      this.listaPersonalActualizada = generado;
      fs.writeFileSync(this.archivo('lista-personal.json'), JSON.stringify({ generado, documentos }));
      this.logger.log(`Lista del personal actualizada: ${documentos.length} personas`);
    } catch (error) {
      this.logger.warn(`No se pudo actualizar la lista del personal (se usa la guardada): ${(error as Error).message}`);
    }
  }

  /** Envía las salidas hechas sin conexión, con su hora; quedan las que no se pudieron enviar. */
  private async enviarPendientes() {
    if (this.enviandoPendientes || this.pendientes.length === 0) return;
    this.enviandoPendientes = true;
    try {
      const quedan: SalidaPendiente[] = [];
      for (const p of this.pendientes) {
        try {
          await this.enviar('POST', '/eventos-acceso/salida', { ...p.dto, sinConexion: true, fechaHora: p.fechaHora });
        } catch (error) {
          if (error instanceof SinConexion) quedan.push(p);
          else this.logger.error(`Salida sin conexión de ${p.dto.numeroDocumento} rechazada por el servidor: ${(error as Error).message}`);
        }
      }
      const enviadas = this.pendientes.length - quedan.length;
      this.pendientes = quedan;
      this.guardarPendientes();
      if (enviadas > 0) this.logger.log(`Salidas sin conexión enviadas al servidor: ${enviadas}`);
    } finally {
      this.enviandoPendientes = false;
    }
  }

  // ---------------------------------------------------------------- disco

  private archivo(nombre: string) {
    return path.join(this.carpeta, nombre);
  }

  private cargarDeDisco() {
    try {
      const { generado, documentos } = JSON.parse(fs.readFileSync(this.archivo('lista-personal.json'), 'utf8')) as { generado: string; documentos: string[] };
      this.listaPersonal = new Set(documentos);
      this.listaPersonalActualizada = generado;
    } catch {
      // todavía no hay lista del personal guardada
    }
    try {
      this.pendientes = JSON.parse(fs.readFileSync(this.archivo('salidas-pendientes.json'), 'utf8')) as SalidaPendiente[];
    } catch {
      this.pendientes = [];
    }
  }

  private guardarPendientes() {
    fs.writeFileSync(this.archivo('salidas-pendientes.json'), JSON.stringify(this.pendientes));
  }
}
