var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var IntegracionesService_1;
import { Injectable, Logger } from '@nestjs/common';
let IntegracionesService = IntegracionesService_1 = class IntegracionesService {
    logger = new Logger(IntegracionesService_1.name);
    async recibirWebhookAlcoholimetro(payload) {
        this.logger.log(`Webhook alcoholímetro recibido: ${JSON.stringify(payload)}`);
        return { recibido: true };
    }
    async enviarComandoTorniquete(dto) {
        this.logger.log(`Comando torniquete ${dto.torniqueteId}: ${dto.comando} (mock, sin SDK real todavía)`);
        return { enviado: true };
    }
};
IntegracionesService = IntegracionesService_1 = __decorate([
    Injectable()
], IntegracionesService);
export { IntegracionesService };
//# sourceMappingURL=integraciones.service.js.map