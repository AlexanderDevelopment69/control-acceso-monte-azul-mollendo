import { Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import fs from 'node:fs';
import path from 'node:path';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { EstadoLectorDni } from '../lectores-dni/lectores-dni.service.js';
import type { EstadoReleUsb } from '../integraciones/rele-usb.service.js';
import type { AbrirMolineteEvent } from '../eventos-acceso/eventos-acceso.service.js';
import { Public } from '../common/decorators/public.decorator.js';
import { claveEquiposValida } from '../common/seguridad/equipos.util.js';

/** Lo que el controlador informa cada pocos segundos. */
export interface EstadoReportado {
  lectoresDni: { ingreso: EstadoLectorDni; salida: EstadoLectorDni };
  releMolinetes: EstadoReleUsb;
  /** Personal guardado para dejar salir sin conexión (opción B). */
  listaPersonal: { personas: number; actualizado: string | null };
  /** Salidas hechas sin conexión que todavía no llegaron al servidor. */
  salidasPendientes: number;
  /** IP del Controlador (PC) en la red de la garita (los controladores anteriores no la envían). */
  ipLocal?: string | null;
}

/** ¿Qué puertas están en contingencia "sin lector"? */
export interface SinLector {
  ingreso: boolean;
  salida: boolean;
}

interface Conexion {
  desde: string;
  direccion: string;
  ultimoReporte: string | null;
  estado: EstadoReportado | null;
}

/** ¿Los molinetes los abre un controlador conectado por internet (y no la API en el mismo Controlador (PC))? */
export const molinetesRemotos = () => process.env.MOLINETES_REMOTOS === 'true';

/**
 * Canal con el controlador (el Controlador (PC) en la garita, con
 * `node dist/controlador/main.js`; ver src/controlador/). El controlador se
 * conecta desde la garita hacia el servidor (no hay que abrir puertos en la
 * garita), se identifica con la clave de equipos (DEVICE_API_KEY), recibe aquí
 * la orden "abrir" de cada molinete y cada pocos segundos informa el estado de
 * sus lectores de DNI y relés.
 */
// Sin la sesión del portal (JWT): el controlador se valida con la clave de equipos al conectarse.
@Public()
@WebSocketGateway({
  path: '/api/v1/socket.io',
  addTrailingSlash: false,
  namespace: '/ws/controlador',
})
export class ControladorGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit, OnModuleDestroy {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly eventEmitter: EventEmitter2) {}

  private readonly logger = new Logger(ControladorGateway.name);
  private readonly conexiones = new Map<string, Conexion>();
  /**
   * Lo último que informó el controlador, para seguir mostrando sus lectores y
   * relés (como desconectados) cuando se corta la conexión. Se guarda en disco
   * (junto a los documentos) para recordarlo aunque se reinicie el servidor.
   */
  private ultimoConocido: { estado: EstadoReportado; cuando: string } | null = leerUltimoConocido();
  /** Último estado "sin lector" avisado, para avisar solo cuando cambia. */
  private sinLectorAvisado: SinLector = { ingreso: false, salida: false };
  private revision: ReturnType<typeof setInterval> | null = null;
  /** Desde cuándo se espera que vuelva el Controlador (PC) tras la orden de reinicio (null: no se pidió). */
  private reiniciandoDesde: string | null = null;

  onModuleInit() {
    // También cambia cuando el controlador deja de reportar sin cortar la conexión (ver estado()).
    this.revision = setInterval(() => this.revisarSinLector(), 5000);
  }

  onModuleDestroy() {
    if (this.revision) clearInterval(this.revision);
  }

  handleConnection(cliente: Socket): void {
    const clave = cliente.handshake.auth?.['clave'];
    if (!claveEquiposValida(clave)) {
      this.logger.warn(`Controlador rechazado (clave de equipos inválida) desde ${cliente.handshake.address}`);
      cliente.disconnect(true);
      return;
    }
    this.conexiones.set(cliente.id, {
      desde: new Date().toISOString(),
      direccion: cliente.handshake.address,
      ultimoReporte: null,
      estado: null,
    });
    // Volvió (tras el reinicio pedido o por su cuenta): ya no se está reiniciando.
    this.reiniciandoDesde = null;
    this.logger.log(`Controlador conectado desde ${cliente.handshake.address}`);
  }

  handleDisconnect(cliente: Socket): void {
    if (this.conexiones.delete(cliente.id)) this.logger.warn('Controlador desconectado');
    this.revisarSinLector();
  }

  @SubscribeMessage('estado')
  recibirEstado(@ConnectedSocket() cliente: Socket, @MessageBody() estado: EstadoReportado): void {
    const conexion = this.conexiones.get(cliente.id);
    if (!conexion) return;
    conexion.estado = estado;
    conexion.ultimoReporte = new Date().toISOString();
    this.ultimoConocido = { estado, cuando: conexion.ultimoReporte };
    guardarUltimoConocido(this.ultimoConocido);
    this.revisarSinLector();
  }

  /**
   * Contingencia "sin lector": el lector de DNI de esa puerta está
   * desconectado y el controlador sigue en línea (sin el controlador no se
   * abre ningún molinete). Ingreso: entra quien aprueba rostro y alcohol.
   * Salida: el vigilante la abre desde "Presentes ahora".
   */
  sinLector(): SinLector {
    if (!molinetesRemotos()) return { ingreso: false, salida: false };
    const { conectado, estado } = this.estado();
    const caido = (l: EstadoLectorDni | undefined) => conectado && !!l && l.configurado && !l.conectado;
    return { ingreso: caido(estado?.lectoresDni.ingreso), salida: caido(estado?.lectoresDni.salida) };
  }

  /** Avisa a los paneles (y deja en el registro) cuando la contingencia se activa o termina. */
  private revisarSinLector() {
    const ahora = this.sinLector();
    for (const puerta of ['ingreso', 'salida'] as const) {
      if (ahora[puerta] === this.sinLectorAvisado[puerta]) continue;
      if (ahora[puerta]) this.logger.warn(`Contingencia activada: lector de DNI de ${puerta} sin conexión`);
      else this.logger.log(`Contingencia terminada: lector de DNI de ${puerta} (conectado, o sin el controlador)`);
    }
    if (ahora.ingreso !== this.sinLectorAvisado.ingreso || ahora.salida !== this.sinLectorAvisado.salida) {
      this.sinLectorAvisado = ahora;
      this.eventEmitter.emit('sin-lector.cambio', ahora);
    }
  }

  /** Orden de abrir un molinete (DNI de salida, o ingreso verificado por el G4 Pro). */
  @OnEvent('molinete.abrir')
  abrirMolinete(evento: AbrirMolineteEvent): void {
    if (!molinetesRemotos()) return;
    if (this.conexiones.size === 0) {
      this.logger.warn(`Abrir molinete de ${evento.tipoMovimiento}: no hay controlador conectado (orden perdida)`);
      return;
    }
    this.server.emit('abrir', { tipoMovimiento: evento.tipoMovimiento, eventoId: evento.eventoId });
    this.logger.log(`Orden de abrir el molinete de ${evento.tipoMovimiento} enviada al controlador`);
  }

  /** Ingreso o salida denegados: el controlador activa el relé de aviso de esa puerta (contacto seco), si lo tiene. */
  @OnEvent('evento-acceso.registrado')
  avisarDenegado(evento: { tipoMovimiento?: string; resultado?: string; numeroDocumento?: string }): void {
    if (!molinetesRemotos() || evento.resultado !== 'denegado') return;
    if (evento.tipoMovimiento !== 'ingreso' && evento.tipoMovimiento !== 'salida') return;
    if (this.conexiones.size === 0) return;
    this.server.emit('aviso-denegado', { tipoMovimiento: evento.tipoMovimiento, numeroDocumento: evento.numeroDocumento ?? null });
  }

  /** Tarjeta de contingencia rechazada (sin evento de acceso): suena igual el aviso de esa puerta. */
  @OnEvent('aviso.denegado')
  avisarTarjetaRechazada(aviso: { tipoMovimiento: 'ingreso' | 'salida' }): void {
    if (!molinetesRemotos() || this.conexiones.size === 0) return;
    this.server.emit('aviso-denegado', { tipoMovimiento: aviso.tipoMovimiento, numeroDocumento: null });
  }

  /**
   * Orden de reiniciar el Controlador (PC) (botón de "Sistema y APIs"). El
   * controlador responde si puede hacerlo y luego se reinicia; vuelve solo en
   * unos 2 minutos. `error`: por qué no se envió o no se pudo.
   */
  async reiniciar(): Promise<{ enviado: boolean; error?: string }> {
    if (!molinetesRemotos() || !this.estado().conectado) {
      return { enviado: false, error: 'El controlador no está conectado: no se le puede enviar la orden.' };
    }
    let respuestas: { ok: boolean; error?: string }[];
    try {
      respuestas = await this.server.timeout(ESPERA_REINICIO_MS).emitWithAck('reiniciar');
    } catch {
      // Sin respuesta: un controlador anterior (no conoce la orden) o se cortó la conexión.
      this.logger.warn('Reiniciar el Controlador (PC): no respondió a la orden');
      return { enviado: false, error: 'El Controlador (PC) no respondió a la orden; no se reinició.' };
    }
    const fallo = respuestas.find((r) => !r?.ok);
    if (fallo) {
      this.logger.error(`Reiniciar el Controlador (PC): no se pudo (${fallo.error ?? 'sin detalle'})`);
      return { enviado: false, error: `El Controlador (PC) no pudo reiniciarse: ${fallo.error ?? 'sin detalle'}.` };
    }
    this.reiniciandoDesde = new Date().toISOString();
    this.logger.warn('Orden de reiniciar enviada al Controlador (PC)');
    return { enviado: true };
  }

  /** Para "Sistema y APIs": el controlador conectado (el más reciente) y lo que informó. */
  estado() {
    const conexion = [...this.conexiones.values()].sort((a, b) => b.desde.localeCompare(a.desde))[0] ?? null;
    // El controlador informa su estado cada ~5 s. Si el socket sigue en memoria
    // pero dejó de reportar (p. ej. el Controlador (PC) perdió luz), socket.io tarda ~45 s
    // en darlo por caído; acá lo marcamos "Desconectado" a los ~18 s por la
    // frescura del último reporte, sin tocar la conexión (la orden de abrir
    // molinete no se ve afectada). Se cuenta desde el último reporte o, si recién
    // se conectó y aún no reportó, desde que se conectó.
    const UMBRAL_REPORTE_MS = 18 * 1000;
    const referencia = conexion?.ultimoReporte ?? conexion?.desde ?? null;
    const fresco = !!conexion && !!referencia && Date.now() - new Date(referencia).getTime() < UMBRAL_REPORTE_MS;
    return {
      remoto: molinetesRemotos(),
      conectado: fresco,
      desde: conexion?.desde ?? null,
      direccion: conexion?.direccion ?? null,
      ultimoReporte: conexion?.ultimoReporte ?? this.ultimoConocido?.cuando ?? null,
      // Fresco: lo que informó. Caído o sin reportar hace rato: lo último conocido
      // con lectores y relés como no conectados.
      estado: fresco ? conexion!.estado : this.ultimoConocido ? comoDesconectado(this.ultimoConocido.estado) : null,
      // Se deja de esperar a los 10 minutos: si no volvió, ya no se está reiniciando (otra falla).
      reiniciandoDesde:
        this.reiniciandoDesde && Date.now() - new Date(this.reiniciandoDesde).getTime() < MAX_REINICIO_MS ? this.reiniciandoDesde : null,
    };
  }
}

/** Cuánto se espera a que el controlador confirme la orden de reinicio. */
const ESPERA_REINICIO_MS = 10_000;
/** Pasado este tiempo sin volver, el portal deja de mostrar "Reiniciando…". */
const MAX_REINICIO_MS = 10 * 60_000;

/** Archivo con el último estado informado por el controlador (en el volumen de documentos). */
const ARCHIVO_ULTIMO = path.join(path.dirname(process.env.DOCUMENTOS_STORAGE_PATH ?? './storage/documentos'), 'controlador-ultimo-estado.json');

function leerUltimoConocido(): { estado: EstadoReportado; cuando: string } | null {
  try {
    return JSON.parse(fs.readFileSync(ARCHIVO_ULTIMO, 'utf8')) as { estado: EstadoReportado; cuando: string };
  } catch {
    return null;
  }
}

function guardarUltimoConocido(ultimo: { estado: EstadoReportado; cuando: string }) {
  try {
    fs.mkdirSync(path.dirname(ARCHIVO_ULTIMO), { recursive: true });
    fs.writeFileSync(ARCHIVO_ULTIMO, JSON.stringify(ultimo));
  } catch {
    // sin disco: queda solo en memoria
  }
}

/** El último estado informado, con todos los lectores y relés desconectados (el controlador no responde). */
function comoDesconectado(estado: EstadoReportado): EstadoReportado {
  const lector = (l: EstadoReportado['lectoresDni']['ingreso']) => ({ ...l, conectado: false, error: 'Controlador desconectado' });
  const rele = <T extends { conectado: boolean; error: string | null }>(r: T): T => ({ ...r, conectado: false, error: 'Controlador desconectado' });
  const reles = estado.releMolinetes;
  return {
    ...estado,
    lectoresDni: { ingreso: lector(estado.lectoresDni.ingreso), salida: lector(estado.lectoresDni.salida) },
    releMolinetes: {
      ingreso: rele(reles.ingreso),
      salida: rele(reles.salida),
      ...(reles.avisoIngreso && { avisoIngreso: rele(reles.avisoIngreso) }),
      ...(reles.avisoSalida && { avisoSalida: rele(reles.avisoSalida) }),
    },
  };
}
