import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { CreateTipoDocumentoDto } from './dto/create-tipo-documento.dto.js';
import { documentoDeLaLista } from './documentos-personal.js';

@Injectable()
export class TiposDocumentoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  /**
   * El documento que se sube: solo uno de la lista fija (DOCUMENTOS_PERSONAL).
   * Si ya existe (sin distinguir mayúsculas), devuelve el existente en vez de
   * fallar; si no, lo crea con el nombre de la lista.
   */
  async create(dto: CreateTipoDocumentoDto, usuarioId: number) {
    const nombre = documentoDeLaLista(dto.nombre);
    if (!nombre) throw new BadRequestException('Seleccione un documento de la lista');
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
