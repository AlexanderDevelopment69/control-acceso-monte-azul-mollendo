import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
import type { CreateSolicitudVisitaDto } from './dto/create-solicitud-visita.dto.js';
import type { UpdateSolicitudVisitaDto } from './dto/update-solicitud-visita.dto.js';
import type { QuerySolicitudesVisitaDto } from './dto/query-solicitudes-visita.dto.js';

@Injectable()
export class SolicitudesVisitaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  // Alcance base: la agenda el administrador, sin flujo de aprobación.
  async create(dto: CreateSolicitudVisitaDto, user: AuthenticatedUser) {
    const persona = await this.prisma.persona.findUnique({ where: { id: dto.personaId } });
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }

    const solicitud = await this.prisma.solicitudVisita.create({
      data: {
        personaId: dto.personaId,
        empresaId: persona.empresaId,
        personaVisitada: dto.personaVisitada,
        motivo: dto.motivo,
        fechaHoraProgramada: new Date(dto.fechaHoraProgramada),
        estado: 'programada',
      },
    });

    await this.auditoriaService.registrar({
      usuarioId: user.id,
      tablaAfectada: 'solicitud_visita',
      registroId: solicitud.id,
      accion: 'crear',
    });

    return solicitud;
  }

  async findAll(query: QuerySolicitudesVisitaDto) {
    return this.prisma.solicitudVisita.findMany({
      where: {
        empresaId: query.empresaId,
        personaId: query.personaId,
        fechaHoraProgramada: {
          gte: query.desde ? new Date(query.desde) : undefined,
          lte: query.hasta ? new Date(query.hasta) : undefined,
        },
      },
      include: { persona: { select: { id: true, nombres: true, apellidos: true } } },
      orderBy: { fechaHoraProgramada: 'desc' },
    });
  }

  async findOne(id: number) {
    const solicitud = await this.prisma.solicitudVisita.findUnique({
      where: { id },
      include: { persona: { select: { id: true, nombres: true, apellidos: true } } },
    });
    if (!solicitud) {
      throw new NotFoundException('Solicitud de visita no encontrada');
    }
    return solicitud;
  }

  async update(id: number, dto: UpdateSolicitudVisitaDto, user: AuthenticatedUser) {
    const solicitud = await this.findOne(id);

    const actualizada = await this.prisma.solicitudVisita.update({
      where: { id: solicitud.id },
      data: {
        fechaHoraProgramada: dto.fechaHoraProgramada ? new Date(dto.fechaHoraProgramada) : undefined,
        estado: dto.estado,
      },
    });

    await this.auditoriaService.registrar({
      usuarioId: user.id,
      tablaAfectada: 'solicitud_visita',
      registroId: solicitud.id,
      accion: 'modificar',
    });

    return actualizada;
  }
}
