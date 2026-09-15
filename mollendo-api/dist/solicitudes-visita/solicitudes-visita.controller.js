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
import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { SolicitudesVisitaService } from './solicitudes-visita.service.js';
import { CreateSolicitudVisitaDto } from './dto/create-solicitud-visita.dto.js';
import { UpdateSolicitudVisitaDto } from './dto/update-solicitud-visita.dto.js';
import { QuerySolicitudesVisitaDto } from './dto/query-solicitudes-visita.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
let SolicitudesVisitaController = class SolicitudesVisitaController {
    solicitudesVisitaService;
    constructor(solicitudesVisitaService) {
        this.solicitudesVisitaService = solicitudesVisitaService;
    }
    create(dto, user) {
        return this.solicitudesVisitaService.create(dto, user);
    }
    findAll(query, user) {
        return this.solicitudesVisitaService.findAll(query, user);
    }
    update(id, dto, user) {
        return this.solicitudesVisitaService.update(id, dto, user);
    }
};
__decorate([
    Post(),
    Roles('empresa'),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateSolicitudVisitaDto, Object]),
    __metadata("design:returntype", void 0)
], SolicitudesVisitaController.prototype, "create", null);
__decorate([
    Get(),
    Roles('administracion', 'empresa', 'vigilancia'),
    __param(0, Query()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [QuerySolicitudesVisitaDto, Object]),
    __metadata("design:returntype", void 0)
], SolicitudesVisitaController.prototype, "findAll", null);
__decorate([
    Patch(':id'),
    Roles('empresa'),
    __param(0, Param('id', ParseIntPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, UpdateSolicitudVisitaDto, Object]),
    __metadata("design:returntype", void 0)
], SolicitudesVisitaController.prototype, "update", null);
SolicitudesVisitaController = __decorate([
    Controller('solicitudes-visita'),
    __metadata("design:paramtypes", [SolicitudesVisitaService])
], SolicitudesVisitaController);
export { SolicitudesVisitaController };
//# sourceMappingURL=solicitudes-visita.controller.js.map