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
import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { PuestosService } from './puestos.service.js';
import { CreatePuestoDto } from './dto/create-puesto.dto.js';
import { SetRequisitosDto } from './dto/set-requisitos.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
let PuestosController = class PuestosController {
    puestosService;
    constructor(puestosService) {
        this.puestosService = puestosService;
    }
    findAll() {
        return this.puestosService.findAll();
    }
    create(dto, user) {
        return this.puestosService.create(dto, user.id);
    }
    findRequisitos(id) {
        return this.puestosService.findRequisitos(id);
    }
    setRequisitos(id, dto, user) {
        return this.puestosService.setRequisitos(id, dto, user.id);
    }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PuestosController.prototype, "findAll", null);
__decorate([
    Post(),
    Roles('administrador'),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreatePuestoDto, Object]),
    __metadata("design:returntype", void 0)
], PuestosController.prototype, "create", null);
__decorate([
    Get(':id/requisitos'),
    __param(0, Param('id', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PuestosController.prototype, "findRequisitos", null);
__decorate([
    Post(':id/requisitos'),
    Roles('administrador'),
    __param(0, Param('id', ParseIntPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, SetRequisitosDto, Object]),
    __metadata("design:returntype", void 0)
], PuestosController.prototype, "setRequisitos", null);
PuestosController = __decorate([
    Controller('puestos'),
    __metadata("design:paramtypes", [PuestosService])
], PuestosController);
export { PuestosController };
//# sourceMappingURL=puestos.controller.js.map