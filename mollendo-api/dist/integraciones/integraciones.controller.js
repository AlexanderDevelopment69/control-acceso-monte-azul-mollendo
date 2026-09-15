var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IntegracionesService } from './integraciones.service.js';
import { TorniqueteComandoDto } from './dto/torniquete-comando.dto.js';
import { Public } from '../common/decorators/public.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ApiKeyGuard } from '../common/guards/api-key.guard.js';
let IntegracionesController = class IntegracionesController {
    integracionesService;
    constructor(integracionesService) {
        this.integracionesService = integracionesService;
    }
    recibirWebhookAlcoholimetro(payload) {
        return this.integracionesService.recibirWebhookAlcoholimetro(payload);
    }
    enviarComandoTorniquete(dto) {
        return this.integracionesService.enviarComandoTorniquete(dto);
    }
};
__decorate([
    Post('alcoholimetro/webhook'),
    Public(),
    UseGuards(ApiKeyGuard),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegracionesController.prototype, "recibirWebhookAlcoholimetro", null);
__decorate([
    Post('torniquete/comando'),
    Roles('administracion', 'vigilancia'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TorniqueteComandoDto]),
    __metadata("design:returntype", void 0)
], IntegracionesController.prototype, "enviarComandoTorniquete", null);
IntegracionesController = __decorate([
    Controller('integraciones'),
    __metadata("design:paramtypes", [IntegracionesService])
], IntegracionesController);
export { IntegracionesController };
//# sourceMappingURL=integraciones.controller.js.map