import { Logger } from '@nestjs/common';
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

/** Lo que el controlador informa cada pocos segundos. */
export interface EstadoReportado {
  lectoresDni: { ingreso: EstadoLectorDni; salida: EstadoLectorDni };
  releMolinetes: EstadoReleUsb;
  /** Personal guardado para dejar salir sin conexión (opción B). */
  listaPersonal: { personas: number; actualizado: string | null };
  /** Salidas hechas sin conexión que todavía no llegaron al servidor. */
  salidasPendientes: number;
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

  handleConnection(cliente: Socket): void {
    const clave = cliente.handshake.auth?.['clave'];
    if (!process.env.DEVICE_API_KEY || clave !== process.env.DEVICE_API_KEY) {
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
    return {
      remoto: molinetesRemotos(),
      conectado: !!conexion,
      desde: conexion?.desde ?? null,
      direccion: conexion?.direccion ?? null,
      ultimoReporte: conexion?.ultimoReporte ?? null,
      estado: conexion?.estado ?? null,
    };
  }
}
