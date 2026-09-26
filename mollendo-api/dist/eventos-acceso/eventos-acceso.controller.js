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
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { EventosAccesoService } from './eventos-acceso.service.js';
import { IngresoDto } from './dto/ingreso.dto.js';
import { SalidaDto } from './dto/salida.dto.js';
import { QueryEventosAccesoDto } from './dto/query-eventos-acceso.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { ApiKeyGuard } from '../common/guards/api-key.guard.js';
let EventosAccesoController = class EventosAccesoController {
    eventosAccesoService;
    constructor(eventosAccesoService) {
        this.eventosAccesoService = eventosAccesoService;
    }
    registrarIngreso(dto) {
        return this.eventosAccesoService.registrarIngreso(dto);
    }
    registrarSalida(dto) {
        return this.eventosAccesoService.registrarSalida(dto);
    }
    findAll(query) {
        return this.eventosAccesoService.findAll(query);
    }
};
__decorate([
    Post('ingreso'),
    Public(),
    UseGuards(ApiKeyGuard),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [IngresoDto]),
    __metadata("design:returntype", void 0)
], EventosAccesoController.prototype, "registrarIngreso", null);
__decorate([
    Post('salida'),
    Public(),
    UseGuards(ApiKeyGuard),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SalidaDto]),
    __metadata("design:returntype", void 0)
], EventosAccesoController.prototype, "registrarSalida", null);
__decorate([
    Get(),
    Roles('administrador', 'vigilancia'),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [QueryEventosAccesoDto]),
    __metadata("design:returntype", void 0)
], EventosAccesoController.prototype, "findAll", null);
EventosAccesoController = __decorate([
    Controller('eventos-acceso'),
    __metadata("design:paramtypes", [EventosAccesoService])
], EventosAccesoController);
export { EventosAccesoController };
//# sourceMappingURL=eventos-acceso.controller.js.map