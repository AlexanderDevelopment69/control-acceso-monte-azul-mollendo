var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
let PersonasService = class PersonasService {
    prisma;
    auditoriaService;
    constructor(prisma, auditoriaService) {
        this.prisma = prisma;
        this.auditoriaService = auditoriaService;
    }
    assertPuedeGestionar(persona, user) {
        if (user.rol === 'empresa' && persona.empresaId !== user.empresaId) {
            throw new ForbiddenException('No puede gestionar personal de otra empresa');
        }
    }
    async create(dto, user) {
        if (user.rol !== 'empresa') {
            throw new ForbiddenException('Solo la empresa proveedora registra a su propio personal');
        }
        const existente = await this.prisma.persona.findUnique({
            where: {
                tipoDocumentoIdentidad_numeroDocumento: {
                    tipoDocumentoIdentidad: dto.tipoDocumentoIdentidad,
                    numeroDocumento: dto.numeroDocumento,
                },
            },
        });
        if (existente) {
            throw new ConflictException('Ya existe una persona registrada con ese documento');
        }
        const persona = await this.prisma.persona.create({
            data: { ...dto, empresaId: user.empresaId },
        });
        await this.auditoriaService.registrar({
            usuarioId: user.id,
            tablaAfectada: 'persona',
            registroId: persona.id,
            accion: 'crear',
        });
        return persona;
    }
    async findAll(query, user) {
        const empresaId = user.rol === 'empresa' ? user.empresaId : query.empresaId;
        return this.prisma.persona.findMany({
            where: { empresaId, puestoId: query.puestoId, estado: query.estado },
            include: { empresa: { select: { id: true, razonSocial: true } }, puesto: true },
            orderBy: { creadoEn: 'desc' },
        });
    }
    async findOne(id, user) {
        const persona = await this.prisma.persona.findUnique({
            where: { id },
            include: {
                empresa: { select: { id: true, razonSocial: true } },
                puesto: true,
                documentos: { include: { tipoDocumento: true }, orderBy: { creadoEn: 'desc' } },
            },
        });
        if (!persona) {
            throw new NotFoundException('Persona no encontrada');
        }
        this.assertPuedeGestionar(persona, user);
        return persona;
    }
    async update(id, dto, user) {
        const persona = await this.findOne(id, user);
        const actualizada = await this.prisma.persona.update({ where: { id: persona.id }, data: dto });
        await this.auditoriaService.registrar({
            usuarioId: user.id,
            tablaAfectada: 'persona',
            registroId: persona.id,
            accion: 'modificar',
        });
        return actualizada;
    }
    async updateEstado(id, dto, user) {
        const persona = await this.findOne(id, user);
        const actualizada = await this.prisma.persona.update({
            where: { id: persona.id },
            data: { estado: dto.estado },
        });
        await this.auditoriaService.registrar({
            usuarioId: user.id,
            tablaAfectada: 'persona',
            registroId: persona.id,
            accion: 'modificar',
        });
        return actualizada;
    }
};
PersonasService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        AuditoriaService])
], PersonasService);
export { PersonasService };
//# sourceMappingURL=personas.service.js.map