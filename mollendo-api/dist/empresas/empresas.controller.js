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
import { EmpresasService } from './empresas.service.js';
import { CreateEmpresaDto } from './dto/create-empresa.dto.js';
import { UpdateEmpresaDto } from './dto/update-empresa.dto.js';
import { QueryEmpresasDto } from './dto/query-empresas.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
let EmpresasController = class EmpresasController {
    empresasService;
    constructor(empresasService) {
        this.empresasService = empresasService;
    }
    create(dto, user) {
        return this.empresasService.create(dto, user.id);
    }
    findAll(query) {
        return this.empresasService.findAll(query);
    }
    findOne(id) {
        return this.empresasService.findOne(id);
    }
    update(id, dto, user) {
        return this.empresasService.update(id, dto, user.id);
    }
};
__decorate([
    Post(),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateEmpresaDto, Object]),
    __metadata("design:returntype", void 0)
], EmpresasController.prototype, "create", null);
__decorate([
    Get(),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [QueryEmpresasDto]),
    __metadata("design:returntype", void 0)
], EmpresasController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    __param(0, Param('id', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EmpresasController.prototype, "findOne", null);
__decorate([
    Patch(':id'),
    __param(0, Param('id', ParseIntPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, UpdateEmpresaDto, Object]),
    __metadata("design:returntype", void 0)
], EmpresasController.prototype, "update", null);
EmpresasController = __decorate([
    Controller('empresas'),
    Roles('administrador'),
    __metadata("design:paramtypes", [EmpresasService])
], EmpresasController);
export { EmpresasController };
//# sourceMappingURL=empresas.controller.js.map