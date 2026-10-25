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
import { PrismaService } from '../prisma/prisma.service.js';
import { emitidoAntesDelCambio, SESIONES_CERRADAS, type SesionesCerradasEvent } from '../auth/sesion.util.js';
import { COOKIE_ACCESO, leerCookie } from '../auth/cookies-sesion.js';

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

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Como en la API: token válido, rol del panel, cuenta activa y sin cambio de
   * contraseña posterior al token. Si no, se corta (el portal renueva la
   * sesión y vuelve a conectarse, o vuelve al inicio de sesión).
   */
  async handleConnection(client: Socket): Promise<void> {
    // El portal se conecta con la cookie de la sesión; otros clientes pueden mandar el token.
    const token =
      client.handshake.auth?.['token'] ?? client.handshake.query?.['token'] ?? leerCookie(client.handshake.headers.cookie, COOKIE_ACCESO);
    try {
      const payload = this.jwtService.verify<JwtPayload>(String(token), { secret: process.env.JWT_SECRET });
      if (payload.rol !== 'administrador' && payload.rol !== 'vigilancia' && payload.rol !== 'soporte') {
        throw new Error('Rol no autorizado para el panel de vigilancia');
      }
      const usuario = await this.prisma.usuario.findUnique({ where: { id: payload.sub } });
      if (!usuario || usuario.estadoCuenta !== 'activo' || emitidoAntesDelCambio(payload.iat, usuario.passwordCambiadoEn)) {
        throw new Error('Cuenta inactiva o contraseña cambiada');
      }
      (client.data as { usuarioId?: number }).usuarioId = usuario.id;
    } catch {
      client.disconnect(true);
      return;
    }
    this.logger.log(`Cliente conectado al panel: ${client.id}`);
  }

  /** Usuario dado de baja o con contraseña nueva: se cortan sus paneles abiertos. */
  @OnEvent(SESIONES_CERRADAS)
  async cerrarSesiones({ usuarioId }: SesionesCerradasEvent): Promise<void> {
    for (const cliente of await this.server.fetchSockets()) {
      if ((cliente.data as { usuarioId?: number }).usuarioId === usuarioId) cliente.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Cliente desconectado del panel: ${client.id}`);
  }

  @OnEvent('evento-acceso.registrado')
  handleEventoAcceso(payload: unknown): void {
    this.server.emit('evento-acceso', payload);
  }

  // DNI en regla esperando el rostro y el alcohol del G4 Pro, y su fin.
  @OnEvent('ingreso.en-espera')
  handleIngresoEnEspera(payload: unknown): void {
    this.server.emit('ingreso-en-espera', payload);
  }

  @OnEvent('ingreso.espera-terminada')
  handleEsperaTerminada(payload: unknown): void {
    this.server.emit('ingreso-espera-terminada', payload);
  }

  // Se activó o terminó la verificación manual: los paneles abiertos actualizan su franja.
  @OnEvent('verificacion-manual.cambio')
  handleVerificacionManual(payload: unknown): void {
    this.server.emit('verificacion-manual', payload);
  }

  // Llegó (o se decidió) una prueba del G4 Pro: el monitor de Sistema y APIs la vuelve a pedir.
  @OnEvent('g4.marcacion')
  handleMarcacionG4(payload: { id: number }): void {
    this.server.emit('g4-marcacion', payload);
  }

  // Salida sin DNI elegida, usada, cancelada o vencida: los paneles actualizan su aviso.
  @OnEvent('salida-sin-dni.cambio')
  handleSalidaSinDni(payload: unknown): void {
    this.server.emit('salida-sin-dni', payload);
  }

  // Se pasó una tarjeta de contingencia (aceptada o no): la lista de usos se vuelve a pedir.
  @OnEvent('tarjeta-contingencia.uso')
  handleUsoTarjeta(): void {
    this.server.emit('tarjeta-contingencia-uso', {});
  }

  // Un equipo se desconectó o volvió (registro de desconexiones): la franja de fallas y "Sistema y APIs" se actualizan.
  @OnEvent('equipos.cambio')
  handleEquiposCambio(): void {
    this.server.emit('equipos-cambio', {});
  }

  // Un lector de DNI se desconectó o volvió (contingencia "sin lector"): los paneles actualizan su franja.
  @OnEvent('sin-lector.cambio')
  handleSinLector(payload: unknown): void {
    this.server.emit('sin-lector', payload);
  }

  // Cambió el orden del ingreso (facial primero, en prueba): los paneles actualizan su franja.
  @OnEvent('modo-ingreso.cambio')
  handleModoIngreso(payload: unknown): void {
    this.server.emit('modo-ingreso', payload);
  }
}
