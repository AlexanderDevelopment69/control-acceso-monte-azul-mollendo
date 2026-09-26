import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
import type { CreateDocumentoDto } from './dto/create-documento.dto.js';

@Injectable()
export class DocumentosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  private async findPersona(personaId: number) {
    const persona = await this.prisma.persona.findUnique({ where: { id: personaId } });
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }
    return persona;
  }

  // Alcance base: sin aprobación — el documento es válido desde que se carga.
  async subirDocumento(
    personaId: number,
    dto: CreateDocumentoDto,
    archivoPath: string,
    user: AuthenticatedUser,
  ) {
    await this.findPersona(personaId);

    const ultimaVersion = await this.prisma.documentoPersona.findFirst({
      where: { personaId, tipoDocumentoId: dto.tipoDocumentoId },
      orderBy: { version: 'desc' },
    });

    const documento = await this.prisma.documentoPersona.create({
      data: {
        personaId,
        tipoDocumentoId: dto.tipoDocumentoId,
        fechaEmision: dto.fechaEmision ? new Date(dto.fechaEmision) : null,
        fechaVencimiento: dto.fechaVencimiento ? new Date(dto.fechaVencimiento) : null,
        archivoUrl: archivoPath,
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

  async findHistorial(personaId: number) {
    await this.findPersona(personaId);
    return this.prisma.documentoPersona.findMany({
      where: { personaId },
      include: { tipoDocumento: true },
      orderBy: [{ tipoDocumentoId: 'asc' }, { version: 'desc' }],
    });
  }
}
