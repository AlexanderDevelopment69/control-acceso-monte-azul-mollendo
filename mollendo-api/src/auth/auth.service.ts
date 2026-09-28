import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import { asJwtExpiry } from '../common/utils/jwt-expiry.util.js';
import type { LoginDto } from './dto/login.dto.js';
import type { CambiarPasswordDto } from './dto/cambiar-password.dto.js';
import type { AuthenticatedUser, JwtPayload } from './types/authenticated-user.type.js';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditoriaService: AuditoriaService,
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

  /** El propio usuario cambia su contraseña; debe confirmar la actual. */
  async cambiarPassword(dto: CambiarPasswordDto, user: AuthenticatedUser) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: user.id } });
    if (!usuario || usuario.estadoCuenta !== 'activo') {
      throw new UnauthorizedException('Cuenta no válida o inactiva');
    }
    // 400 y no 401: un 401 haría que el portal intente renovar la sesión.
    if (!(await compare(dto.passwordActual, usuario.passwordHash))) {
      throw new BadRequestException('La contraseña actual no es correcta');
    }
    if (dto.passwordNueva === dto.passwordActual) {
      throw new BadRequestException('La contraseña nueva debe ser distinta de la actual');
    }

    await this.prisma.usuario.update({
      where: { id: user.id },
      data: { passwordHash: await hash(dto.passwordNueva, SALT_ROUNDS) },
    });
    await this.auditoriaService.registrar({
      usuarioId: user.id,
      tablaAfectada: 'usuario',
      registroId: user.id,
      accion: 'modificar',
    });
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
