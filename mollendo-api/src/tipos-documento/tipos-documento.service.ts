import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { CreateTipoDocumentoDto } from './dto/create-tipo-documento.dto.js';

@Injectable()
export class TiposDocumentoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  /**
   * El administrador agrega nombres de documento al subir uno. Si ya existe
   * (sin distinguir mayúsculas), devuelve el existente en vez de fallar.
   */
  async create(dto: CreateTipoDocumentoDto, usuarioId: number) {
    const nombre = dto.nombre.trim();
    const existente = await this.prisma.tipoDocumento.findFirst({
      where: { nombre: { equals: nombre, mode: 'insensitive' } },
    });
    if (existente) {
      return existente;
    }

    const tipoDocumento = await this.prisma.tipoDocumento.create({ data: { nombre } });
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
