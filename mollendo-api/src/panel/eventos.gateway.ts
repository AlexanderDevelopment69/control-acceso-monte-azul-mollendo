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
// Va bajo /api/v1 (path de socket.io) para que el portal lo pueda reenviar con
// la misma regla que la API cuando usa NEXT_PUBLIC_API_URL=/api/v1.
@WebSocketGateway({
  path: '/api/v1/socket.io',
  // Acepta la ruta sin barra final (el portal no la agrega; ver lib/ws.ts).
  addTrailingSlash: false,
  namespace: '/ws/eventos',
  cors: {
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .split(',')
      .map((origen) => origen.trim())
      .filter(Boolean),
  },
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
      if (payload.rol !== 'administrador' && payload.rol !== 'vigilancia') {
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
