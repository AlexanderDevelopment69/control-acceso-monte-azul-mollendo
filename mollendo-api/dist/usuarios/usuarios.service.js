var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
const SALT_ROUNDS = 10;
const USUARIO_SELECT = { id: true, correo: true, rol: true, estadoCuenta: true, creadoEn: true };
let UsuariosService = class UsuariosService {
    prisma;
    auditoriaService;
    constructor(prisma, auditoriaService) {
        this.prisma = prisma;
        this.auditoriaService = auditoriaService;
    }
    findAll() {
        return this.prisma.usuario.findMany({ select: USUARIO_SELECT, orderBy: { creadoEn: 'asc' } });
    }
    async create(dto, user) {
        const existente = await this.prisma.usuario.findUnique({ where: { correo: dto.correo } });
        if (existente) {
            throw new ConflictException('Ya existe un usuario con ese correo');
        }
        const usuario = await this.prisma.usuario.create({
            data: {
                empresaId: user.empresaId,
                correo: dto.correo,
                rol: dto.rol,
                passwordHash: await hash(dto.password, SALT_ROUNDS),
            },
            select: USUARIO_SELECT,
        });
        await this.auditoriaService.registrar({
            usuarioId: user.id,
            tablaAfectada: 'usuario',
            registroId: usuario.id,
            accion: 'crear',
        });
        return usuario;
    }
    async update(id, dto, user) {
        const usuario = await this.prisma.usuario.findUnique({ where: { id } });
        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }
        if (id === user.id && dto.estadoCuenta === 'baja') {
            throw new BadRequestException('No puede dar de baja su propia cuenta');
        }
        const actualizado = await this.prisma.usuario.update({
            where: { id },
            data: {
                estadoCuenta: dto.estadoCuenta,
                passwordHash: dto.password ? await hash(dto.password, SALT_ROUNDS) : undefined,
            },
            select: USUARIO_SELECT,
        });
        await this.auditoriaService.registrar({
            usuarioId: user.id,
            tablaAfectada: 'usuario',
            registroId: id,
            accion: 'modificar',
        });
        return actualizado;
    }
};
UsuariosService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        AuditoriaService])
], UsuariosService);
export { UsuariosService };
//# sourceMappingURL=usuarios.service.js.map