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
import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Res, UploadedFile, UseInterceptors, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { fotosMulterOptions } from './fotos-storage.util.js';
import { PersonasService } from './personas.service.js';
import { CreatePersonaDto } from './dto/create-persona.dto.js';
import { UpdatePersonaDto } from './dto/update-persona.dto.js';
import { UpdateEstadoPersonaDto } from './dto/update-estado-persona.dto.js';
import { QueryPersonasDto } from './dto/query-personas.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
let PersonasController = class PersonasController {
    personasService;
    constructor(personasService) {
        this.personasService = personasService;
    }
    create(dto, user) {
        return this.personasService.create(dto, user);
    }
    findAll(query) {
        return this.personasService.findAll(query);
    }
    findOne(id) {
        return this.personasService.findOne(id);
    }
    update(id, dto, user) {
        return this.personasService.update(id, dto, user);
    }
    updateEstado(id, dto, user) {
        return this.personasService.updateEstado(id, dto, user);
    }
    subirFoto(id, foto, user) {
        if (!foto) {
            throw new BadRequestException('La foto es obligatoria');
        }
        return this.personasService.guardarFoto(id, foto.path, user);
    }
    async verFoto(id, res) {
        res.sendFile(await this.personasService.rutaFoto(id));
    }
};
__decorate([
    Post(),
    Roles('administrador'),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreatePersonaDto, Object]),
    __metadata("design:returntype", void 0)
], PersonasController.prototype, "create", null);
__decorate([
    Get(),
    Roles('administrador', 'vigilancia'),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [QueryPersonasDto]),
    __metadata("design:returntype", void 0)
], PersonasController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    Roles('administrador', 'vigilancia'),
    __param(0, Param('id', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PersonasController.prototype, "findOne", null);
__decorate([
    Patch(':id'),
    Roles('administrador'),
    __param(0, Param('id', ParseIntPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, UpdatePersonaDto, Object]),
    __metadata("design:returntype", void 0)
], PersonasController.prototype, "update", null);
__decorate([
    Patch(':id/estado'),
    Roles('administrador'),
    __param(0, Param('id', ParseIntPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, UpdateEstadoPersonaDto, Object]),
    __metadata("design:returntype", void 0)
], PersonasController.prototype, "updateEstado", null);
__decorate([
    Post(':id/foto'),
    Roles('administrador'),
    UseInterceptors(FileInterceptor('foto', fotosMulterOptions)),
    __param(0, Param('id', ParseIntPipe)),
    __param(1, UploadedFile()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], PersonasController.prototype, "subirFoto", null);
__decorate([
    Get(':id/foto'),
    Roles('administrador', 'vigilancia'),
    __param(0, Param('id', ParseIntPipe)),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PersonasController.prototype, "verFoto", null);
PersonasController = __decorate([
    Controller('personas'),
    __metadata("design:paramtypes", [PersonasService])
], PersonasController);
export { PersonasController };
//# sourceMappingURL=personas.controller.js.map