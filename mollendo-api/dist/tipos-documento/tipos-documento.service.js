var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
let TiposDocumentoService = class TiposDocumentoService {
    prisma;
    auditoriaService;
    constructor(prisma, auditoriaService) {
        this.prisma = prisma;
        this.auditoriaService = auditoriaService;
    }
    async create(dto, usuarioId) {
        const nombre = dto.nombre.trim();
        const existente = await this.prisma.tipoDocumento.findFirst({
            where: { nombre: { equals: nombre, mode: 'insensitive' } },
        });
        if (existente) {
            return existente;
        }
        const tipoDocumento = await this.prisma.tipoDocumento.create({ data: { nombre } });
        await this.auditoriaService.registrar({
            usuarioId,
            tablaAfectada: 'tipo_documento',
            registroId: tipoDocumento.id,
            accion: 'crear',
        });
        return tipoDocumento;
    }
    async findAll() {
        return this.prisma.tipoDocumento.findMany({ orderBy: { nombre: 'asc' } });
    }
};
TiposDocumentoService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        AuditoriaService])
], TiposDocumentoService);
export { TiposDocumentoService };
//# sourceMappingURL=tipos-documento.service.js.map