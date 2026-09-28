import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
import type { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import type { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { momentoCambioPassword } from '../auth/sesion.util.js';

const SALT_ROUNDS = 10;

// Nunca se devuelve el hash de la contraseña.
const USUARIO_SELECT = { id: true, correo: true, rol: true, estadoCuenta: true, creadoEn: true } as const;

/**
 * Cuentas de acceso (spec base, sección 3): sin invitación por correo, las
 * crea el administrador. Todas pertenecen a la empresa interna (OTP/MAS),
 * la misma del administrador que las crea.
 */
@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll() {
    return this.prisma.usuario.findMany({ select: USUARIO_SELECT, orderBy: { creadoEn: 'asc' } });
  }

  async create(dto: CreateUsuarioDto, user: AuthenticatedUser) {
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

  async update(id: number, dto: UpdateUsuarioDto, user: AuthenticatedUser) {
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
        // Al restablecer la contraseña se cierran las sesiones abiertas de esa cuenta.
        passwordCambiadoEn: dto.password ? momentoCambioPassword() : undefined,
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
}
