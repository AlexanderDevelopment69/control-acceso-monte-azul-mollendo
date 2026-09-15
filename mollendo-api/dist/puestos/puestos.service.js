var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
let PuestosService = class PuestosService {
    prisma;
    auditoriaService;
    constructor(prisma, auditoriaService) {
        this.prisma = prisma;
        this.auditoriaService = auditoriaService;
    }
    async create(dto, usuarioId) {
        const existente = await this.prisma.puesto.findUnique({
            where: { nombre_caso: { nombre: dto.nombre, caso: dto.caso } },
        });
        if (existente) {
            throw new ConflictException('Ya existe un puesto con ese nombre para ese caso');
        }
        const puesto = await this.prisma.puesto.create({ data: dto });
        await this.auditoriaService.registrar({
            usuarioId,
            tablaAfectada: 'puesto',
            registroId: puesto.id,
            accion: 'crear',
        });
        return puesto;
    }
    async findAll() {
        return this.prisma.puesto.findMany({ orderBy: [{ caso: 'asc' }, { nombre: 'asc' }] });
    }
    async findOne(id) {
        const puesto = await this.prisma.puesto.findUnique({ where: { id } });
        if (!puesto) {
            throw new NotFoundException('Puesto no encontrado');
        }
        return puesto;
    }
    async findRequisitos(puestoId) {
        await this.findOne(puestoId);
        return this.prisma.requisitoPorPuesto.findMany({
            where: { puestoId },
            include: { tipoDocumento: true },
        });
    }
    async setRequisitos(puestoId, dto, usuarioId) {
        await this.findOne(puestoId);
        await this.prisma.$transaction([
            this.prisma.requisitoPorPuesto.deleteMany({ where: { puestoId } }),
            ...dto.requisitos.map((r) => this.prisma.requisitoPorPuesto.create({
                data: { puestoId, tipoDocumentoId: r.tipoDocumentoId, obligatorio: r.obligatorio },
            })),
        ]);
        await this.auditoriaService.registrar({
            usuarioId,
            tablaAfectada: 'requisito_por_puesto',
            registroId: puestoId,
            accion: 'modificar',
        });
        return this.findRequisitos(puestoId);
    }
};
PuestosService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        AuditoriaService])
], PuestosService);
export { PuestosService };
//# sourceMappingURL=puestos.service.js.map