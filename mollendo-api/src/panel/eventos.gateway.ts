import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { JwtPayload } from '../auth/types/authenticated-user.type.js';

// Canal en tiempo real para el panel de vigilancia (spec, sección 9.9) —
// evita que el panel tenga que refrescar para ver ingresos/denegaciones.
@WebSocketGateway({
  namespace: '/ws/eventos',
  cors: { origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' },
})
export class EventosGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventosGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket): void {
    const token = client.handshake.auth?.['token'] ?? client.handshake.query?.['token'];
    try {
      const payload = this.jwtService.verify<JwtPayload>(String(token), { secret: process.env.JWT_SECRET });
      if (payload.rol !== 'administracion' && payload.rol !== 'vigilancia') {
        throw new Error('Rol no autorizado para el panel de vigilancia');
      }
    } catch {
      client.disconnect(true);
      return;
    }
    this.logger.log(`Cliente conectado al panel: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Cliente desconectado del panel: ${client.id}`);
  }

  @OnEvent('evento-acceso.registrado')
  handleEventoAcceso(payload: unknown): void {
    this.server.emit('evento-acceso', payload);
  }
}
