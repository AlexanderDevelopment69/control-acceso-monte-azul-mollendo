import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

  async create(dto: CreateSolicitudVisitaDto, user: AuthenticatedUser) {
    if (user.rol !== 'empresa') {
      throw new ForbiddenException('Solo la empresa proveedora registra solicitudes de visita');
    }

    const persona = await this.prisma.persona.findUnique({ where: { id: dto.personaId } });
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }
    if (persona.empresaId !== user.empresaId) {
      throw new ForbiddenException('La persona no pertenece a su empresa');
    }

    // Autoaprobada al crearse — no hay paso de aprobación aparte (spec, sección 9.6)
    const solicitud = await this.prisma.solicitudVisita.create({
      data: {
        personaId: dto.personaId,
        empresaId: user.empresaId,
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

  async findAll(query: QuerySolicitudesVisitaDto, user: AuthenticatedUser) {
    const empresaId = user.rol === 'empresa' ? user.empresaId : query.empresaId;

    return this.prisma.solicitudVisita.findMany({
      where: {
        empresaId,
        fechaHoraProgramada: {
          gte: query.desde ? new Date(query.desde) : undefined,
          lte: query.hasta ? new Date(query.hasta) : undefined,
        },
      },
      include: { persona: { select: { id: true, nombres: true, apellidos: true } } },
      orderBy: { fechaHoraProgramada: 'desc' },
    });
  }

  async findOne(id: number, user: AuthenticatedUser) {
    const solicitud = await this.prisma.solicitudVisita.findUnique({
      where: { id },
      include: { persona: { select: { id: true, nombres: true, apellidos: true } } },
    });
    if (!solicitud) {
      throw new NotFoundException('Solicitud de visita no encontrada');
    }
    if (user.rol === 'empresa' && solicitud.empresaId !== user.empresaId) {
      throw new ForbiddenException('No puede ver solicitudes de otra empresa');
    }
    return solicitud;
  }

  async update(id: number, dto: UpdateSolicitudVisitaDto, user: AuthenticatedUser) {
    const solicitud = await this.findOne(id, user);
    if (user.rol === 'empresa' && solicitud.empresaId !== user.empresaId) {
      throw new ForbiddenException('No puede modificar solicitudes de otra empresa');
    }

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
