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
import { Controller, Get, Query } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service.js';
import { QueryAuditoriaDto } from './dto/query-auditoria.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
let AuditoriaController = class AuditoriaController {
    auditoriaService;
    constructor(auditoriaService) {
        this.auditoriaService = auditoriaService;
    }
    findAll(query) {
        return this.auditoriaService.findAll(query);
    }
};
__decorate([
    Get(),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [QueryAuditoriaDto]),
    __metadata("design:returntype", void 0)
], AuditoriaController.prototype, "findAll", null);
AuditoriaController = __decorate([
    Controller('auditoria'),
    Roles('administrador'),
    __metadata("design:paramtypes", [AuditoriaService])
], AuditoriaController);
export { AuditoriaController };
//# sourceMappingURL=auditoria.controller.js.map