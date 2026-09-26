var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var IntegracionesService_1;
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventosAccesoService } from '../eventos-acceso/eventos-acceso.service.js';
let IntegracionesService = IntegracionesService_1 = class IntegracionesService {
    eventosAccesoService;
    logger = new Logger(IntegracionesService_1.name);
    constructor(eventosAccesoService) {
        this.eventosAccesoService = eventosAccesoService;
    }
    async recibirWebhookZkbio(dto) {
        this.logger.log(`Webhook ZKBio recibido: ${JSON.stringify(dto)}`);
        return this.eventosAccesoService.registrarIngreso({
            tipoDocumentoIdentidad: dto.tipoDocumentoIdentidad ?? 'DNI',
            numeroDocumento: dto.numeroDocumento,
            alcoholConforme: dto.resultadoAlcohol === 'conforme',
            torniqueteId: dto.torniqueteId,
        });
    }
    async abrirMolinete(evento) {
        await this.enviarComandoTorniquete({ torniqueteId: evento.torniqueteId ?? 'T1', comando: 'abrir' });
    }
    async enviarComandoTorniquete(dto) {
        this.logger.log(`Comando molinete ${dto.torniqueteId}: ${dto.comando} (mock, sin SDK real todavía)`);
        return { enviado: true };
    }
};
__decorate([
    OnEvent('molinete.abrir'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegracionesService.prototype, "abrirMolinete", null);
IntegracionesService = IntegracionesService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [EventosAccesoService])
], IntegracionesService);
export { IntegracionesService };
//# sourceMappingURL=integraciones.service.js.map