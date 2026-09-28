var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EventosGateway_1;
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';
let EventosGateway = EventosGateway_1 = class EventosGateway {
    jwtService;
    server;
    logger = new Logger(EventosGateway_1.name);
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    handleConnection(client) {
        const token = client.handshake.auth?.['token'] ?? client.handshake.query?.['token'];
        try {
            const payload = this.jwtService.verify(String(token), { secret: process.env.JWT_SECRET });
            if (payload.rol !== 'administrador' && payload.rol !== 'vigilancia') {
                throw new Error('Rol no autorizado para el panel de vigilancia');
            }
        }
        catch {
            client.disconnect(true);
            return;
        }
        this.logger.log(`Cliente conectado al panel: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Cliente desconectado del panel: ${client.id}`);
    }
    handleEventoAcceso(payload) {
        this.server.emit('evento-acceso', payload);
    }
};
__decorate([
    WebSocketServer(),
    __metadata("design:type", Function)
], EventosGateway.prototype, "server", void 0);
__decorate([
    OnEvent('evento-acceso.registrado'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventosGateway.prototype, "handleEventoAcceso", null);
EventosGateway = EventosGateway_1 = __decorate([
    WebSocketGateway({
        path: '/api/v1/socket.io',
        addTrailingSlash: false,
        namespace: '/ws/eventos',
        cors: {
            origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
                .split(',')
                .map((origen) => origen.trim())
                .filter(Boolean),
        },
    }),
    __metadata("design:paramtypes", [JwtService])
], EventosGateway);
export { EventosGateway };
//# sourceMappingURL=eventos.gateway.js.map