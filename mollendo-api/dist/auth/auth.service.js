var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { asJwtExpiry } from '../common/utils/jwt-expiry.util.js';
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    buildTokens(payload) {
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: asJwtExpiry(process.env.JWT_EXPIRES_IN ?? '1h'),
        });
        const refreshToken = this.jwtService.sign({ sub: payload.sub }, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: asJwtExpiry(process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'),
        });
        return { accessToken, refreshToken };
    }
    async login(dto) {
        const usuario = await this.prisma.usuario.findUnique({ where: { correo: dto.correo } });
        if (!usuario) {
            throw new UnauthorizedException('Correo o contraseña incorrectos');
        }
        if (usuario.estadoCuenta !== 'activo') {
            throw new UnauthorizedException('La cuenta no está activa');
        }
        const passwordValida = await compare(dto.password, usuario.passwordHash);
        if (!passwordValida) {
            throw new UnauthorizedException('Correo o contraseña incorrectos');
        }
        const payload = {
            sub: usuario.id,
            empresaId: usuario.empresaId,
            rol: usuario.rol,
            correo: usuario.correo,
        };
        return this.buildTokens(payload);
    }
    async refreshToken(refreshToken) {
        let sub;
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
            sub = payload.sub;
        }
        catch {
            throw new UnauthorizedException('Refresh token inválido o expirado');
        }
        const usuario = await this.prisma.usuario.findUnique({ where: { id: sub } });
        if (!usuario || usuario.estadoCuenta !== 'activo') {
            throw new UnauthorizedException('Cuenta no válida o inactiva');
        }
        const payload = {
            sub: usuario.id,
            empresaId: usuario.empresaId,
            rol: usuario.rol,
            correo: usuario.correo,
        };
        return this.buildTokens(payload);
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        JwtService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map