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
import { Body, Controller, Get, Post } from '@nestjs/common';
import { TiposDocumentoService } from './tipos-documento.service.js';
import { CreateTipoDocumentoDto } from './dto/create-tipo-documento.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
let TiposDocumentoController = class TiposDocumentoController {
    tiposDocumentoService;
    constructor(tiposDocumentoService) {
        this.tiposDocumentoService = tiposDocumentoService;
    }
    findAll() {
        return this.tiposDocumentoService.findAll();
    }
    create(dto, user) {
        return this.tiposDocumentoService.create(dto, user.id);
    }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TiposDocumentoController.prototype, "findAll", null);
__decorate([
    Post(),
    Roles('administracion'),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateTipoDocumentoDto, Object]),
    __metadata("design:returntype", void 0)
], TiposDocumentoController.prototype, "create", null);
TiposDocumentoController = __decorate([
    Controller('tipos-documento'),
    __metadata("design:paramtypes", [TiposDocumentoService])
], TiposDocumentoController);
export { TiposDocumentoController };
//# sourceMappingURL=tipos-documento.controller.js.map