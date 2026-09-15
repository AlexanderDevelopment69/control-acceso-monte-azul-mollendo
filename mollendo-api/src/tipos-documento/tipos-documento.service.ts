import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { CreateTipoDocumentoDto } from './dto/create-tipo-documento.dto.js';

@Injectable()
export class TiposDocumentoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async create(dto: CreateTipoDocumentoDto, usuarioId: number) {
    const existente = await this.prisma.tipoDocumento.findUnique({ where: { nombre: dto.nombre } });
    if (existente) {
      throw new ConflictException('Ya existe un tipo de documento con ese nombre');
    }

    const tipoDocumento = await this.prisma.tipoDocumento.create({ data: dto });
    await this.auditoriaService.registrar({
      usuarioId,
      tablaAfectada: 'tipo_documento',
      registroId: tipoDocumento.id,
      accion: 'crear',
    });
    return tipoDocumento;
  }

  async findAll() {
    return this.prisma.tipoDocumento.findMany({ orderBy: { nombre: 'asc' } });
  }
}
