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
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UploadedFile, UseInterceptors, BadRequestException, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentosService } from './documentos.service.js';
import { CreateDocumentoDto } from './dto/create-documento.dto.js';
import { documentosMulterStorage } from './documentos-storage.util.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
let DocumentosController = class DocumentosController {
    documentosService;
    constructor(documentosService) {
        this.documentosService = documentosService;
    }
    subirDocumento(personaId, dto, archivo, user) {
        if (!archivo) {
            throw new BadRequestException('El archivo del documento es obligatorio');
        }
        return this.documentosService.subirDocumento(personaId, dto, archivo.path, user);
    }
    findHistorial(personaId) {
        return this.documentosService.findHistorial(personaId);
    }
    eliminarDocumento(personaId, tipoDocumentoId, user) {
        return this.documentosService.eliminarDocumento(personaId, tipoDocumentoId, user);
    }
};
__decorate([
    Post('personas/:personaId/documentos'),
    Roles('administrador'),
    UseInterceptors(FileInterceptor('archivo', { storage: documentosMulterStorage })),
    __param(0, Param('personaId', ParseIntPipe)),
    __param(1, Body()),
    __param(2, UploadedFile()),
    __param(3, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, CreateDocumentoDto, Object, Object]),
    __metadata("design:returntype", void 0)
], DocumentosController.prototype, "subirDocumento", null);
__decorate([
    Get('personas/:personaId/documentos'),
    Roles('administrador', 'vigilancia'),
    __param(0, Param('personaId', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DocumentosController.prototype, "findHistorial", null);
__decorate([
    Delete('personas/:personaId/documentos/:tipoDocumentoId'),
    Roles('administrador'),
    __param(0, Param('personaId', ParseIntPipe)),
    __param(1, Param('tipoDocumentoId', ParseIntPipe)),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", void 0)
], DocumentosController.prototype, "eliminarDocumento", null);
DocumentosController = __decorate([
    Controller(),
    __metadata("design:paramtypes", [DocumentosService])
], DocumentosController);
export { DocumentosController };
//# sourceMappingURL=documentos.controller.js.map