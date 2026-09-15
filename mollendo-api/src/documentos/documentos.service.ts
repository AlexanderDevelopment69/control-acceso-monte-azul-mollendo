import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
import type { CreateDocumentoDto } from './dto/create-documento.dto.js';
import type { UpdateEstadoDocumentoDto } from './dto/update-estado-documento.dto.js';

@Injectable()
export class DocumentosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  private async findPersonaConAcceso(personaId: number, user: AuthenticatedUser) {
    const persona = await this.prisma.persona.findUnique({ where: { id: personaId } });
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }
    if (user.rol === 'empresa' && persona.empresaId !== user.empresaId) {
      throw new ForbiddenException('No puede gestionar documentos de otra empresa');
    }
    return persona;
  }

  async subirDocumento(
    personaId: number,
    dto: CreateDocumentoDto,
    archivoPath: string,
    user: AuthenticatedUser,
  ) {
    if (user.rol !== 'empresa') {
      throw new ForbiddenException('Solo la empresa proveedora carga documentos de su personal');
    }
    await this.findPersonaConAcceso(personaId, user);

    const ultimaVersion = await this.prisma.documentoPersona.findFirst({
      where: { personaId, tipoDocumentoId: dto.tipoDocumentoId },
      orderBy: { version: 'desc' },
    });

    const fechaVencimiento = dto.fechaVencimiento ? new Date(dto.fechaVencimiento) : null;
    const vigente = fechaVencimiento ? fechaVencimiento >= new Date() : true;

    const documento = await this.prisma.documentoPersona.create({
      data: {
        personaId,
        tipoDocumentoId: dto.tipoDocumentoId,
        fechaEmision: dto.fechaEmision ? new Date(dto.fechaEmision) : null,
        fechaVencimiento,
        archivoUrl: archivoPath,
        vigente,
        estadoAprobacion: 'pendiente',
        version: (ultimaVersion?.version ?? 0) + 1,
      },
    });

    await this.auditoriaService.registrar({
      usuarioId: user.id,
      tablaAfectada: 'documento_persona',
      registroId: documento.id,
      accion: 'crear',
    });

    return documento;
  }

  async findHistorial(personaId: number, user: AuthenticatedUser) {
    await this.findPersonaConAcceso(personaId, user);
    return this.prisma.documentoPersona.findMany({
      where: { personaId },
      include: { tipoDocumento: true },
      orderBy: [{ tipoDocumentoId: 'asc' }, { version: 'desc' }],
    });
  }

  async updateEstado(documentoId: number, dto: UpdateEstadoDocumentoDto, user: AuthenticatedUser) {
    if (user.rol !== 'empresa') {
      throw new ForbiddenException('Solo la empresa proveedora aprueba/rechaza documentos de su personal');
    }

    const documento = await this.prisma.documentoPersona.findUnique({
      where: { id: documentoId },
      include: { persona: true },
    });
    if (!documento) {
      throw new NotFoundException('Documento no encontrado');
    }
    if (documento.persona.empresaId !== user.empresaId) {
      throw new ForbiddenException('No puede gestionar documentos de otra empresa');
    }

    const actualizado = await this.prisma.documentoPersona.update({
      where: { id: documentoId },
      data: { estadoAprobacion: dto.estadoAprobacion },
    });

    await this.auditoriaService.registrar({
      usuarioId: user.id,
      tablaAfectada: 'documento_persona',
      registroId: documento.id,
      accion: dto.estadoAprobacion === 'aprobado' ? 'aprobar' : 'modificar',
    });

    return actualizado;
  }
}
