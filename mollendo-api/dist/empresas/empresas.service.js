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
let EmpresasService = class EmpresasService {
    prisma;
    auditoriaService;
    constructor(prisma, auditoriaService) {
        this.prisma = prisma;
        this.auditoriaService = auditoriaService;
    }
    async create(dto, usuarioId) {
        const existente = await this.prisma.empresa.findUnique({ where: { ruc: dto.ruc } });
        if (existente) {
            throw new ConflictException('Ya existe una empresa registrada con ese RUC');
        }
        const empresa = await this.prisma.empresa.create({ data: dto });
        await this.auditoriaService.registrar({
            usuarioId,
            tablaAfectada: 'empresa',
            registroId: empresa.id,
            accion: 'crear',
        });
        return empresa;
    }
    async findAll(query) {
        return this.prisma.empresa.findMany({
            where: {
                estado: query.estado,
                ...(query.busqueda && {
                    OR: [
                        { razonSocial: { contains: query.busqueda, mode: 'insensitive' } },
                        { ruc: { contains: query.busqueda } },
                    ],
                }),
            },
            orderBy: { creadoEn: 'desc' },
        });
    }
    async findOne(id) {
        const empresa = await this.prisma.empresa.findUnique({ where: { id } });
        if (!empresa) {
            throw new NotFoundException('Empresa no encontrada');
        }
        return empresa;
    }
    async update(id, dto, usuarioId) {
        await this.findOne(id);
        const empresa = await this.prisma.empresa.update({ where: { id }, data: dto });
        await this.auditoriaService.registrar({
            usuarioId,
            tablaAfectada: 'empresa',
            registroId: empresa.id,
            accion: 'modificar',
        });
        return empresa;
    }
};
EmpresasService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        AuditoriaService])
], EmpresasService);
export { EmpresasService };
//# sourceMappingURL=empresas.service.js.map