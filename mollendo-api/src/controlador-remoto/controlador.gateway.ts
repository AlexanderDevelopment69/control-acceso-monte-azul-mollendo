import { Logger } from '@nestjs/common';
import fs from 'node:fs';
import path from 'node:path';
import { OnEvent } from '@nestjs/event-emitter';
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
  /** IP de la mini PC en la red de la garita (los controladores anteriores no la envían). */
  ipLocal?: string | null;
}

interface Conexion {
  desde: string;
  direccion: string;
  ultimoReporte: string | null;
  estado: EstadoReportado | null;
}

/** ¿Los molinetes los abre un controlador conectado por internet (y no la API en la misma mini PC)? */
export const molinetesRemotos = () => process.env.MOLINETES_REMOTOS === 'true';

/**
 * Canal con el controlador (la mini PC en la garita, con
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
export class ControladorGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ControladorGateway.name);
  private readonly conexiones = new Map<string, Conexion>();
  /**
   * Lo último que informó el controlador, para seguir mostrando sus lectores y
   * relés (como desconectados) cuando se corta la conexión. Se guarda en disco
   * (junto a los documentos) para recordarlo aunque se reinicie el servidor.
   */
  private ultimoConocido: { estado: EstadoReportado; cuando: string } | null = leerUltimoConocido();

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
    this.logger.log(`Controlador conectado desde ${cliente.handshake.address}`);
  }

  handleDisconnect(cliente: Socket): void {
    if (this.conexiones.delete(cliente.id)) this.logger.warn('Controlador desconectado');
  }

  @SubscribeMessage('estado')
  recibirEstado(@ConnectedSocket() cliente: Socket, @MessageBody() estado: EstadoReportado): void {
    const conexion = this.conexiones.get(cliente.id);
    if (!conexion) return;
    conexion.estado = estado;
    conexion.ultimoReporte = new Date().toISOString();
    this.ultimoConocido = { estado, cuando: conexion.ultimoReporte };
    guardarUltimoConocido(this.ultimoConocido);
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

  /** Para "Sistema y APIs": el controlador conectado (el más reciente) y lo que informó. */
  estado() {
    const conexion = [...this.conexiones.values()].sort((a, b) => b.desde.localeCompare(a.desde))[0] ?? null;
    // El controlador informa su estado cada ~5 s. Si el socket sigue en memoria
    // pero dejó de reportar (p. ej. la mini PC perdió luz), socket.io tarda ~45 s
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
    };
  }
}

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
