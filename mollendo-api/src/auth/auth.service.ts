import { randomBytes } from 'node:crypto';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailerService } from '../common/mailer/mailer.service.js';
import { asJwtExpiry } from '../common/utils/jwt-expiry.util.js';
import type { LoginDto } from './dto/login.dto.js';
import type { ActivarCuentaDto } from './dto/activar-cuenta.dto.js';
import type { RecuperarPasswordDto } from './dto/recuperar-password.dto.js';
import type { ResetPasswordDto } from './dto/reset-password.dto.js';
import type { JwtPayload } from './types/authenticated-user.type.js';

const SALT_ROUNDS = 10;
const RECUPERACION_EXPIRA_MS = 60 * 60 * 1000; // 1 hora

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
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
    if (!usuario || !usuario.passwordHash) {
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

  async activarCuenta(dto: ActivarCuentaDto): Promise<{ mensaje: string }> {
    const usuario = await this.prisma.usuario.findFirst({
      where: { tokenInvitacion: dto.token, estadoCuenta: 'invitado' },
    });
    if (!usuario || !usuario.tokenExpira || usuario.tokenExpira < new Date()) {
      throw new BadRequestException('El enlace de activación no es válido o ha expirado');
    }

    const passwordHash = await hash(dto.password, SALT_ROUNDS);
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        passwordHash,
        estadoCuenta: 'activo',
        tokenInvitacion: null,
        tokenExpira: null,
      },
    });

    return { mensaje: 'Cuenta activada correctamente' };
  }

  async recuperarPassword(dto: RecuperarPasswordDto): Promise<{ mensaje: string }> {
    const usuario = await this.prisma.usuario.findUnique({ where: { correo: dto.correo } });

    // No se revela si el correo existe o no — respuesta genérica siempre.
    if (usuario && usuario.estadoCuenta === 'activo') {
      const token = randomBytes(32).toString('hex');
      await this.prisma.usuario.update({
        where: { id: usuario.id },
        data: { tokenInvitacion: token, tokenExpira: new Date(Date.now() + RECUPERACION_EXPIRA_MS) },
      });

      const enlace = `${process.env.CORS_ORIGIN}/recuperar-password?token=${token}`;
      await this.mailerService.enviarRecuperacionPassword(usuario.correo, enlace);
    }

    return { mensaje: 'Si el correo existe, se envió un enlace de recuperación' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ mensaje: string }> {
    const usuario = await this.prisma.usuario.findFirst({
      where: { tokenInvitacion: dto.token, estadoCuenta: 'activo' },
    });
    if (!usuario || !usuario.tokenExpira || usuario.tokenExpira < new Date()) {
      throw new BadRequestException('El enlace de recuperación no es válido o ha expirado');
    }

    const passwordHash = await hash(dto.password, SALT_ROUNDS);
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { passwordHash, tokenInvitacion: null, tokenExpira: null },
    });

    return { mensaje: 'Contraseña actualizada correctamente' };
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
