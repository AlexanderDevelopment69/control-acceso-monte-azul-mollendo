var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import { borrarArchivo, guardarArchivo } from '../common/archivos-persona.util.js';
let DocumentosService = class DocumentosService {
    prisma;
    auditoriaService;
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
    async subirDocumento(personaId, dto, archivo, user) {
        await this.findPersona(personaId);
        const tipoDocumento = await this.prisma.tipoDocumento.findUnique({ where: { id: dto.tipoDocumentoId } });
        if (!tipoDocumento) {
            throw new NotFoundException('Tipo de documento no encontrado');
        }
        const ultimaVersion = await this.prisma.documentoPersona.findFirst({
            where: { personaId, tipoDocumentoId: dto.tipoDocumentoId },
            orderBy: { version: 'desc' },
        });
        const archivoPath = guardarArchivo(personaId, archivo);
        let documento;
        try {
            documento = await this.prisma.documentoPersona.create({
                data: {
                    personaId,
                    tipoDocumentoId: dto.tipoDocumentoId,
                    fechaEmision: dto.fechaEmision ? new Date(dto.fechaEmision) : null,
                    fechaVencimiento: dto.fechaVencimiento ? new Date(dto.fechaVencimiento) : null,
                    archivoUrl: archivoPath,
                    version: (ultimaVersion?.version ?? 0) + 1,
                },
            });
        }
        catch (error) {
            borrarArchivo(archivoPath);
            throw error;
        }
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
            borrarArchivo(doc.archivoUrl);
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
DocumentosService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        AuditoriaService])
], DocumentosService);
export { DocumentosService };
//# sourceMappingURL=documentos.service.js.map