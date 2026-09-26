import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { asJwtExpiry } from '../common/utils/jwt-expiry.util.js';
import type { LoginDto } from './dto/login.dto.js';
import type { JwtPayload } from './types/authenticated-user.type.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private buildTokens(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: asJwtExpiry(process.env.JWT_EXPIRES_IN ?? '1h'),
    });
    const refreshToken = this.jwtService.sign(
      { sub: payload.sub },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: asJwtExpiry(process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'),
      },
    );
    return { accessToken, refreshToken };
  }

  async login(dto: LoginDto) {
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

    const payload: JwtPayload = {
      sub: usuario.id,
      empresaId: usuario.empresaId,
      rol: usuario.rol,
      correo: usuario.correo,
    };
    return this.buildTokens(payload);
  }

  async refreshToken(refreshToken: string) {
    let sub: number;
    try {
      const payload = this.jwtService.verify<{ sub: number }>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      sub = payload.sub;
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const usuario = await this.prisma.usuario.findUnique({ where: { id: sub } });
    if (!usuario || usuario.estadoCuenta !== 'activo') {
      throw new UnauthorizedException('Cuenta no válida o inactiva');
    }

    const payload: JwtPayload = {
      sub: usuario.id,
      empresaId: usuario.empresaId,
      rol: usuario.rol,
      correo: usuario.correo,
    };
    return this.buildTokens(payload);
  }
}
