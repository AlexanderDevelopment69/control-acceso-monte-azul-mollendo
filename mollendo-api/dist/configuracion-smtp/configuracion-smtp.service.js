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
const ID_FILA_UNICA = 1;
let ConfiguracionSmtpService = class ConfiguracionSmtpService {
    prisma;
    auditoriaService;
    constructor(prisma, auditoriaService) {
        this.prisma = prisma;
        this.auditoriaService = auditoriaService;
    }
    async obtener() {
        const fila = await this.prisma.configuracionSmtp.findUnique({ where: { id: ID_FILA_UNICA } });
        if (!fila)
            return { configurado: false };
        const { password: _password, ...resto } = fila;
        return { configurado: true, ...resto, passwordConfigurada: !!fila.password };
    }
    async guardar(dto, usuarioId) {
        const existente = await this.prisma.configuracionSmtp.findUnique({ where: { id: ID_FILA_UNICA } });
        const fila = await this.prisma.configuracionSmtp.upsert({
            where: { id: ID_FILA_UNICA },
            create: {
                id: ID_FILA_UNICA,
                host: dto.host,
                puerto: dto.puerto,
                seguro: dto.seguro ?? false,
                usuario: dto.usuario,
                password: dto.password,
                remitente: dto.remitente,
            },
            update: {
                host: dto.host,
                puerto: dto.puerto,
                seguro: dto.seguro ?? false,
                usuario: dto.usuario,
                password: dto.password ?? existente?.password,
                remitente: dto.remitente,
            },
        });
        await this.auditoriaService.registrar({
            usuarioId,
            tablaAfectada: 'configuracion_smtp',
            registroId: fila.id,
            accion: existente ? 'modificar' : 'crear',
        });
        const { password: _password, ...resto } = fila;
        return { configurado: true, ...resto, passwordConfigurada: !!fila.password };
    }
    async eliminar() {
        await this.prisma.configuracionSmtp.deleteMany({ where: { id: ID_FILA_UNICA } });
        return { eliminado: true };
    }
    async obtenerConfigTransporte() {
        const fila = await this.prisma.configuracionSmtp.findUnique({ where: { id: ID_FILA_UNICA } });
        if (fila) {
            return {
                host: fila.host,
                puerto: fila.puerto,
                seguro: fila.seguro,
                usuario: fila.usuario ?? undefined,
                password: fila.password ?? undefined,
                remitente: fila.remitente,
            };
        }
        if (!process.env.SMTP_HOST)
            return null;
        return {
            host: process.env.SMTP_HOST,
            puerto: Number(process.env.SMTP_PORT ?? 587),
            seguro: false,
            usuario: process.env.SMTP_USER,
            password: process.env.SMTP_PASS,
            remitente: process.env.SMTP_FROM ?? 'no-reply@mollendo.local',
        };
    }
};
ConfiguracionSmtpService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        AuditoriaService])
], ConfiguracionSmtpService);
export { ConfiguracionSmtpService };
//# sourceMappingURL=configuracion-smtp.service.js.map