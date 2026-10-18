import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';

/** Verificación manual vigente, para el Panel (null = modo normal, con el equipo facial). */
export interface EstadoVerificacionManual {
  activa: boolean;
  periodo: { id: number; motivo: string; desde: string; activadaPor: string | null } | null;
}

/**
 * Contingencia por falla del equipo facial (docs/cliente/Contingencias_Equipos_Acceso.md,
 * sección 4): mientras hay un periodo abierto, cada ingreso en regla lo aprueba un
 * vigilante en el Panel (rostro contra la foto y prueba de alcohol con el
 * alcoholímetro de repuesto). La activan y la terminan el vigilante o el
 * administrador; no vence sola. Cada cambio queda en la auditoría.
 */
@Injectable()
export class VerificacionManualService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private periodoAbierto() {
    return this.prisma.periodoVerificacionManual.findFirst({
      where: { terminadoEn: null },
      orderBy: { id: 'desc' },
      include: { activadoPor: { select: { correo: true } } },
    });
  }

  async activa(): Promise<boolean> {
    return (await this.prisma.periodoVerificacionManual.count({ where: { terminadoEn: null } })) > 0;
  }

  async estado(): Promise<EstadoVerificacionManual> {
    const p = await this.periodoAbierto();
    return {
      activa: !!p,
      periodo: p ? { id: p.id, motivo: p.motivo, desde: p.activadoEn.toISOString(), activadaPor: p.activadoPor?.correo ?? null } : null,
    };
  }

  async activar(motivo: string, usuario: AuthenticatedUser): Promise<EstadoVerificacionManual> {
    const texto = motivo.trim();
    if (texto.length < 3) throw new BadRequestException('Escriba el motivo de la verificación manual');
    if (await this.activa()) throw new BadRequestException('La verificación manual ya está activa');
    const periodo = await this.prisma.periodoVerificacionManual.create({ data: { motivo: texto, activadoPorId: usuario.id } });
    await this.auditoria.registrar({ usuarioId: usuario.id, tablaAfectada: 'periodo_verificacion_manual', registroId: periodo.id, accion: 'crear' });
    return this.avisar();
  }

  async terminar(usuario: AuthenticatedUser): Promise<EstadoVerificacionManual> {
    const abierto = await this.periodoAbierto();
    if (!abierto) throw new BadRequestException('La verificación manual no está activa');
    await this.prisma.periodoVerificacionManual.update({
      where: { id: abierto.id },
      data: { terminadoEn: new Date(), terminadoPorId: usuario.id },
    });
    await this.auditoria.registrar({ usuarioId: usuario.id, tablaAfectada: 'periodo_verificacion_manual', registroId: abierto.id, accion: 'modificar' });
    return this.avisar();
  }

  /** Avisa a los paneles abiertos (franja del modo vigente). */
  private async avisar(): Promise<EstadoVerificacionManual> {
    const estado = await this.estado();
    this.eventEmitter.emit('verificacion-manual.cambio', estado);
    return estado;
  }
}
