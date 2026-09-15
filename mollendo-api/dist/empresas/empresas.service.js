var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { randomBytes } from 'node:crypto';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailerService } from '../common/mailer/mailer.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
const INVITACION_EXPIRA_MS = 48 * 60 * 60 * 1000;
let EmpresasService = class EmpresasService {
    prisma;
    mailerService;
    auditoriaService;
    constructor(prisma, mailerService, auditoriaService) {
        this.prisma = prisma;
        this.mailerService = mailerService;
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
    async invitar(id) {
        const empresa = await this.findOne(id);
        const usuarioExistente = await this.prisma.usuario.findUnique({
            where: { correo: empresa.correoContacto },
        });
        if (usuarioExistente?.estadoCuenta === 'activo') {
            throw new BadRequestException('El representante de esta empresa ya activó su cuenta');
        }
        const token = randomBytes(32).toString('hex');
        const tokenExpira = new Date(Date.now() + INVITACION_EXPIRA_MS);
        if (usuarioExistente) {
            await this.prisma.usuario.update({
                where: { id: usuarioExistente.id },
                data: { tokenInvitacion: token, tokenExpira, estadoCuenta: 'invitado' },
            });
        }
        else {
            await this.prisma.usuario.create({
                data: {
                    empresaId: empresa.id,
                    rol: 'empresa',
                    correo: empresa.correoContacto,
                    estadoCuenta: 'invitado',
                    tokenInvitacion: token,
                    tokenExpira,
                },
            });
        }
        const enlace = `${process.env.CORS_ORIGIN}/activar-cuenta?token=${token}`;
        await this.mailerService.enviarInvitacionEmpresa(empresa.correoContacto, enlace);
        return { mensaje: 'Invitación enviada correctamente' };
    }
};
EmpresasService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        MailerService,
        AuditoriaService])
], EmpresasService);
export { EmpresasService };
//# sourceMappingURL=empresas.service.js.map