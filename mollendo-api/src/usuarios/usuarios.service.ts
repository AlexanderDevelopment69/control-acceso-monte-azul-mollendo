import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
import type { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import type { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { momentoCambioPassword, SESIONES_CERRADAS, type SesionesCerradasEvent } from '../auth/sesion.util.js';

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
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Las cuentas, con `eliminable`: nunca se usó (no entró ni hizo nada que quede
   * a su nombre). Una cuenta usada se da de baja, para no perder quién hizo cada cosa.
   */
  async findAll() {
    const cuentas = await this.prisma.usuario.findMany({
      select: {
        ...USUARIO_SELECT,
        _count: { select: { auditorias: true, eventosVerificados: true, verificacionManualActivada: true, verificacionManualTerminada: true } },
      },
      orderBy: { creadoEn: 'asc' },
    });
    return cuentas.map(({ _count, ...cuenta }) => ({ ...cuenta, eliminable: Object.values(_count).every((n) => n === 0) }));
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
      detalle: `Creó la cuenta ${usuario.correo} (${usuario.rol === 'administrador' ? 'Administrador' : 'Vigilancia'})`,
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
    const correo = dto.correo?.trim().toLowerCase();
    const cambiaCorreo = !!correo && correo !== usuario.correo;
    // El correo de soporte es fijo (soporte@monteazulsur.com.pe): con él entra el equipo técnico.
    if (cambiaCorreo && usuario.rol === 'soporte') {
      throw new ForbiddenException('El correo de la cuenta de soporte no se puede cambiar');
    }
    if (cambiaCorreo && (await this.prisma.usuario.findUnique({ where: { correo } }))) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }
    // Con correo o contraseña nuevos, las sesiones abiertas de la cuenta dejan de valer.
    const cierraSesiones = !!dto.password || cambiaCorreo;

    const actualizado = await this.prisma.usuario.update({
      where: { id },
      data: {
        estadoCuenta: dto.estadoCuenta,
        correo: cambiaCorreo ? correo : undefined,
        passwordHash: dto.password ? await hash(dto.password, SALT_ROUNDS) : undefined,
        // Al restablecer la contraseña o cambiar el correo se cierran las sesiones abiertas de esa cuenta.
        passwordCambiadoEn: cierraSesiones ? momentoCambioPassword() : undefined,
      },
      select: USUARIO_SELECT,
    });
    await this.auditoriaService.registrar({
      usuarioId: user.id,
      tablaAfectada: 'usuario',
      registroId: id,
      accion: 'modificar',
      detalle: [
        cambiaCorreo && `Cambió el correo de ${usuario.correo} a ${correo}`,
        dto.password && `Cambió la contraseña de ${cambiaCorreo ? correo : usuario.correo}`,
        dto.estadoCuenta === 'baja' && usuario.estadoCuenta !== 'baja' && `Dio de baja la cuenta ${usuario.correo}`,
        dto.estadoCuenta === 'activo' && usuario.estadoCuenta === 'baja' && `Reactivó la cuenta ${usuario.correo}`,
      ]
        .filter(Boolean)
        .join('. ') || undefined,
    });
    // Dado de baja, con contraseña restablecida o correo nuevo: también se corta su panel en vivo.
    if (dto.estadoCuenta === 'baja' || cierraSesiones) {
      this.eventEmitter.emit(SESIONES_CERRADAS, { usuarioId: id } satisfies SesionesCerradasEvent);
    }
    return actualizado;
  }

  /** Eliminar una cuenta que nunca se usó (p. ej. creada por error). Si ya se usó, se da de baja. */
  async remove(id: number, user: AuthenticatedUser) {
    if (id === user.id) throw new BadRequestException('No puede eliminar su propia cuenta');
    const cuenta = (await this.findAll()).find((c) => c.id === id);
    if (!cuenta) throw new NotFoundException('Usuario no encontrado');
    if (!cuenta.eliminable) {
      throw new BadRequestException('Esta cuenta ya se usó: désela de baja para conservar su historial');
    }
    await this.prisma.usuario.delete({ where: { id } });
    await this.auditoriaService.registrar({
      usuarioId: user.id,
      tablaAfectada: 'usuario',
      registroId: id,
      accion: 'eliminar',
      detalle: `Eliminó la cuenta ${cuenta.correo}`,
    });
    return { ok: true };
  }
}
