import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
import type { CreatePersonaDto } from './dto/create-persona.dto.js';
import type { UpdatePersonaDto } from './dto/update-persona.dto.js';
import type { UpdateEstadoPersonaDto } from './dto/update-estado-persona.dto.js';
import type { QueryPersonasDto } from './dto/query-personas.dto.js';

@Injectable()
export class PersonasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  private assertPuedeGestionar(persona: { empresaId: number }, user: AuthenticatedUser): void {
    if (user.rol === 'empresa' && persona.empresaId !== user.empresaId) {
      throw new ForbiddenException('No puede gestionar personal de otra empresa');
    }
  }

  async create(dto: CreatePersonaDto, user: AuthenticatedUser) {
    if (user.rol !== 'empresa') {
      throw new ForbiddenException('Solo la empresa proveedora registra a su propio personal');
    }

    const existente = await this.prisma.persona.findUnique({
      where: {
        tipoDocumentoIdentidad_numeroDocumento: {
          tipoDocumentoIdentidad: dto.tipoDocumentoIdentidad,
          numeroDocumento: dto.numeroDocumento,
        },
      },
    });
    if (existente) {
      throw new ConflictException('Ya existe una persona registrada con ese documento');
    }

    const persona = await this.prisma.persona.create({
      data: { ...dto, empresaId: user.empresaId },
    });
    await this.auditoriaService.registrar({
      usuarioId: user.id,
      tablaAfectada: 'persona',
      registroId: persona.id,
      accion: 'crear',
    });
    return persona;
  }

  async findAll(query: QueryPersonasDto, user: AuthenticatedUser) {
    const empresaId = user.rol === 'empresa' ? user.empresaId : query.empresaId;

    return this.prisma.persona.findMany({
      where: { empresaId, puestoId: query.puestoId, estado: query.estado },
      include: { empresa: { select: { id: true, razonSocial: true } }, puesto: true },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findOne(id: number, user: AuthenticatedUser) {
    const persona = await this.prisma.persona.findUnique({
      where: { id },
      include: {
        empresa: { select: { id: true, razonSocial: true } },
        puesto: true,
        documentos: { include: { tipoDocumento: true }, orderBy: { creadoEn: 'desc' } },
      },
    });
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }
    this.assertPuedeGestionar(persona, user);
    return persona;
  }

  async update(id: number, dto: UpdatePersonaDto, user: AuthenticatedUser) {
    const persona = await this.findOne(id, user);
    const actualizada = await this.prisma.persona.update({ where: { id: persona.id }, data: dto });
    await this.auditoriaService.registrar({
      usuarioId: user.id,
      tablaAfectada: 'persona',
      registroId: persona.id,
      accion: 'modificar',
    });
    return actualizada;
  }

  async updateEstado(id: number, dto: UpdateEstadoPersonaDto, user: AuthenticatedUser) {
    const persona = await this.findOne(id, user);
    const actualizada = await this.prisma.persona.update({
      where: { id: persona.id },
      data: { estado: dto.estado },
    });
    await this.auditoriaService.registrar({
      usuarioId: user.id,
      tablaAfectada: 'persona',
      registroId: persona.id,
      accion: 'modificar',
    });
    return actualizada;
  }
}
