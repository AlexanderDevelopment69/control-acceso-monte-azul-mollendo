var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DocumentosService_1;
import { existsSync, unlinkSync } from 'node:fs';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
let DocumentosService = DocumentosService_1 = class DocumentosService {
    prisma;
    auditoriaService;
    logger = new Logger(DocumentosService_1.name);
    constructor(prisma, auditoriaService) {
        this.prisma = prisma;
        this.auditoriaService = auditoriaService;
    }
    async findPersona(personaId) {
        const persona = await this.prisma.persona.findUnique({ where: { id: personaId } });
        if (!persona) {
            throw new NotFoundException('Persona no encontrada');
        }
        return persona;
    }
    async subirDocumento(personaId, dto, archivoPath, user) {
        await this.findPersona(personaId);
        const ultimaVersion = await this.prisma.documentoPersona.findFirst({
            where: { personaId, tipoDocumentoId: dto.tipoDocumentoId },
            orderBy: { version: 'desc' },
        });
        const documento = await this.prisma.documentoPersona.create({
            data: {
                personaId,
                tipoDocumentoId: dto.tipoDocumentoId,
                fechaEmision: dto.fechaEmision ? new Date(dto.fechaEmision) : null,
                fechaVencimiento: dto.fechaVencimiento ? new Date(dto.fechaVencimiento) : null,
                archivoUrl: archivoPath,
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
    async findHistorial(personaId) {
        await this.findPersona(personaId);
        return this.prisma.documentoPersona.findMany({
            where: { personaId },
            include: { tipoDocumento: true },
            orderBy: [{ tipoDocumentoId: 'asc' }, { version: 'desc' }],
        });
    }
    async eliminarDocumento(personaId, tipoDocumentoId, user) {
        await this.findPersona(personaId);
        const versiones = await this.prisma.documentoPersona.findMany({ where: { personaId, tipoDocumentoId } });
        if (versiones.length === 0) {
            throw new NotFoundException('La persona no tiene ese documento');
        }
        await this.prisma.documentoPersona.deleteMany({ where: { personaId, tipoDocumentoId } });
        for (const doc of versiones) {
            if (doc.archivoUrl && existsSync(doc.archivoUrl)) {
                try {
                    unlinkSync(doc.archivoUrl);
                }
                catch (error) {
                    this.logger.warn(`No se pudo borrar el archivo ${doc.archivoUrl}: ${String(error)}`);
                }
            }
            await this.auditoriaService.registrar({
                usuarioId: user.id,
                tablaAfectada: 'documento_persona',
                registroId: doc.id,
                accion: 'eliminar',
            });
        }
        return { eliminados: versiones.length };
    }
};
DocumentosService = DocumentosService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        AuditoriaService])
], DocumentosService);
export { DocumentosService };
//# sourceMappingURL=documentos.service.js.map