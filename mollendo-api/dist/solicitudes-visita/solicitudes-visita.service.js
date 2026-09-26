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
let SolicitudesVisitaService = class SolicitudesVisitaService {
    prisma;
    auditoriaService;
    constructor(prisma, auditoriaService) {
        this.prisma = prisma;
        this.auditoriaService = auditoriaService;
    }
    async create(dto, user) {
        const persona = await this.prisma.persona.findUnique({ where: { id: dto.personaId } });
        if (!persona) {
            throw new NotFoundException('Persona no encontrada');
        }
        const solicitud = await this.prisma.solicitudVisita.create({
            data: {
                personaId: dto.personaId,
                empresaId: persona.empresaId,
                personaVisitada: dto.personaVisitada,
                motivo: dto.motivo,
                fechaHoraProgramada: new Date(dto.fechaHoraProgramada),
                estado: 'programada',
            },
        });
        await this.auditoriaService.registrar({
            usuarioId: user.id,
            tablaAfectada: 'solicitud_visita',
            registroId: solicitud.id,
            accion: 'crear',
        });
        return solicitud;
    }
    async findAll(query) {
        return this.prisma.solicitudVisita.findMany({
            where: {
                empresaId: query.empresaId,
                personaId: query.personaId,
                fechaHoraProgramada: {
                    gte: query.desde ? new Date(query.desde) : undefined,
                    lte: query.hasta ? new Date(query.hasta) : undefined,
                },
            },
            include: { persona: { select: { id: true, nombres: true, apellidos: true } } },
            orderBy: { fechaHoraProgramada: 'desc' },
        });
    }
    async findOne(id) {
        const solicitud = await this.prisma.solicitudVisita.findUnique({
            where: { id },
            include: { persona: { select: { id: true, nombres: true, apellidos: true } } },
        });
        if (!solicitud) {
            throw new NotFoundException('Solicitud de visita no encontrada');
        }
        return solicitud;
    }
    async update(id, dto, user) {
        const solicitud = await this.findOne(id);
        const actualizada = await this.prisma.solicitudVisita.update({
            where: { id: solicitud.id },
            data: {
                fechaHoraProgramada: dto.fechaHoraProgramada ? new Date(dto.fechaHoraProgramada) : undefined,
                estado: dto.estado,
            },
        });
        await this.auditoriaService.registrar({
            usuarioId: user.id,
            tablaAfectada: 'solicitud_visita',
            registroId: solicitud.id,
            accion: 'modificar',
        });
        return actualizada;
    }
};
SolicitudesVisitaService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        AuditoriaService])
], SolicitudesVisitaService);
export { SolicitudesVisitaService };
//# sourceMappingURL=solicitudes-visita.service.js.map