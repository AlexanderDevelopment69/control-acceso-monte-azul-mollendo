var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
let DocumentosService = class DocumentosService {
    prisma;
    auditoriaService;
    constructor(prisma, auditoriaService) {
        this.prisma = prisma;
        this.auditoriaService = auditoriaService;
    }
    async findPersonaConAcceso(personaId, user) {
        const persona = await this.prisma.persona.findUnique({ where: { id: personaId } });
        if (!persona) {
            throw new NotFoundException('Persona no encontrada');
        }
        if (user.rol === 'empresa' && persona.empresaId !== user.empresaId) {
            throw new ForbiddenException('No puede gestionar documentos de otra empresa');
        }
        return persona;
    }
    async subirDocumento(personaId, dto, archivoPath, user) {
        if (user.rol !== 'empresa') {
            throw new ForbiddenException('Solo la empresa proveedora carga documentos de su personal');
        }
        await this.findPersonaConAcceso(personaId, user);
        const ultimaVersion = await this.prisma.documentoPersona.findFirst({
            where: { personaId, tipoDocumentoId: dto.tipoDocumentoId },
            orderBy: { version: 'desc' },
        });
        const fechaVencimiento = dto.fechaVencimiento ? new Date(dto.fechaVencimiento) : null;
        const vigente = fechaVencimiento ? fechaVencimiento >= new Date() : true;
        const documento = await this.prisma.documentoPersona.create({
            data: {
                personaId,
                tipoDocumentoId: dto.tipoDocumentoId,
                fechaEmision: dto.fechaEmision ? new Date(dto.fechaEmision) : null,
                fechaVencimiento,
                archivoUrl: archivoPath,
                vigente,
                estadoAprobacion: 'pendiente',
                version: (ultimaVersion?.version ?? 0) + 1,
            },
        });
        await this.auditoriaService.registrar({
            usuarioId: user.id,
            tablaAfectada: 'documento_persona',
            registroId: documento.id,
            accion: 'crear',
        });
        return documento;
    }
    async findHistorial(personaId, user) {
        await this.findPersonaConAcceso(personaId, user);
        return this.prisma.documentoPersona.findMany({
            where: { personaId },
            include: { tipoDocumento: true },
            orderBy: [{ tipoDocumentoId: 'asc' }, { version: 'desc' }],
        });
    }
    async updateEstado(documentoId, dto, user) {
        if (user.rol !== 'empresa') {
            throw new ForbiddenException('Solo la empresa proveedora aprueba/rechaza documentos de su personal');
        }
        const documento = await this.prisma.documentoPersona.findUnique({
            where: { id: documentoId },
            include: { persona: true },
        });
        if (!documento) {
            throw new NotFoundException('Documento no encontrado');
        }
        if (documento.persona.empresaId !== user.empresaId) {
            throw new ForbiddenException('No puede gestionar documentos de otra empresa');
        }
        const actualizado = await this.prisma.documentoPersona.update({
            where: { id: documentoId },
            data: { estadoAprobacion: dto.estadoAprobacion },
        });
        await this.auditoriaService.registrar({
            usuarioId: user.id,
            tablaAfectada: 'documento_persona',
            registroId: documento.id,
            accion: dto.estadoAprobacion === 'aprobado' ? 'aprobar' : 'modificar',
        });
        return actualizado;
    }
};
DocumentosService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        AuditoriaService])
], DocumentosService);
export { DocumentosService };
//# sourceMappingURL=documentos.service.js.map