import { existsSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Express } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
import type { CreateDocumentoDto } from './dto/create-documento.dto.js';
import { borrarArchivo, guardarArchivo } from '../common/archivos-persona.util.js';
import { claveDia } from '../panel/dashboard.util.js';

/** Tipo de contenido según la extensión con que se guardó el archivo (ver documentos-storage.util.ts). */
const TIPO_POR_EXTENSION: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

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
    archivo: Express.Multer.File,
    user: AuthenticatedUser,
  ) {
    await this.findPersona(personaId);
    // Un vencimiento ya pasado es casi siempre un error al elegir la fecha: el
    // documento quedaría vencido al instante y la persona no podría ingresar.
    // Vence hoy sí vale (sigue válido todo el día).
    if (dto.fechaVencimiento && dto.permitirVencido !== 'true' && dto.fechaVencimiento.slice(0, 10) < claveDia(new Date())) {
      throw new BadRequestException(
        'La fecha de vencimiento ya pasó: el documento quedaría vencido y la persona no podría ingresar. Revise la fecha.',
      );
    }
    const tipoDocumento = await this.prisma.tipoDocumento.findUnique({ where: { id: dto.tipoDocumentoId } });
    if (!tipoDocumento) {
      throw new NotFoundException('Tipo de documento no encontrado');
    }

    const ultimaVersion = await this.prisma.documentoPersona.findFirst({
      where: { personaId, tipoDocumentoId: dto.tipoDocumentoId },
      orderBy: { version: 'desc' },
    });

    // El archivo se escribe en disco recién ahora, con la petición ya validada.
    const archivoPath = guardarArchivo(personaId, archivo);
    let documento;
    try {
      documento = await this.prisma.documentoPersona.create({
        data: {
          personaId,
          tipoDocumentoId: dto.tipoDocumentoId,
          fechaEmision: dto.fechaEmision ? new Date(dto.fechaEmision) : null,
          fechaVencimiento: dto.fechaVencimiento ? new Date(dto.fechaVencimiento) : null,
          archivoUrl: archivoPath,
          version: (ultimaVersion?.version ?? 0) + 1,
        },
      });
    } catch (error) {
      borrarArchivo(archivoPath);
      throw error;
    }

    await this.auditoriaService.registrar({
      usuarioId: user.id,
      tablaAfectada: 'documento_persona',
      registroId: documento.id,
      accion: 'crear',
    });

    return documento;
  }

  /**
   * Archivo de una versión de un documento de la persona, para verlo o
   * descargarlo. PDF e imágenes se abren en el navegador; Word se descarga.
   */
  async archivo(personaId: number, documentoId: number) {
    const documento = await this.prisma.documentoPersona.findFirst({
      where: { id: documentoId, personaId },
      include: { tipoDocumento: { select: { nombre: true } }, persona: { select: { numeroDocumento: true, nombres: true, apellidos: true } } },
    });
    if (!documento) {
      throw new NotFoundException('Documento no encontrado');
    }
    if (!documento.archivoUrl || !existsSync(documento.archivoUrl)) {
      throw new NotFoundException('El archivo del documento no está disponible');
    }
    const extension = extname(documento.archivoUrl).toLowerCase();
    const tipo = TIPO_POR_EXTENSION[extension] ?? 'application/octet-stream';
    // Nombre legible y seguro para la cabecera: "SCTR-Salud_99010001_v2.pdf".
    const base = `${documento.tipoDocumento.nombre}_${documento.persona.numeroDocumento}_v${documento.version}`
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^A-Za-z0-9_-]+/g, '-');
    return {
      ruta: resolve(documento.archivoUrl),
      tipo,
      nombre: `${base}${extension}`,
      enLinea: tipo === 'application/pdf' || tipo.startsWith('image/'),
      // Para la Auditoría (quién abrió qué).
      descripcion: `Abrió el archivo de “${documento.tipoDocumento.nombre}” v${documento.version} de ${documento.persona.apellidos}, ${documento.persona.nombres}`,
    };
  }

  async findHistorial(personaId: number) {
    await this.findPersona(personaId);
    return this.prisma.documentoPersona.findMany({
      where: { personaId },
      include: { tipoDocumento: true },
      orderBy: [{ tipoDocumentoId: 'asc' }, { version: 'desc' }],
    });
  }

  /**
   * Elimina un documento de la persona con todas sus versiones (filas y
   * archivos en disco). Cada versión borrada queda en la auditoría como
   * "eliminar". Si era su único documento, la persona pasa a "sin documentos".
   */
  async eliminarDocumento(personaId: number, tipoDocumentoId: number, user: AuthenticatedUser) {
    await this.findPersona(personaId);
    const versiones = await this.prisma.documentoPersona.findMany({ where: { personaId, tipoDocumentoId } });
    if (versiones.length === 0) {
      throw new NotFoundException('La persona no tiene ese documento');
    }

    await this.prisma.documentoPersona.deleteMany({ where: { personaId, tipoDocumentoId } });

    for (const doc of versiones) {
      borrarArchivo(doc.archivoUrl);
      await this.auditoriaService.registrar({
        usuarioId: user.id,
        tablaAfectada: 'documento_persona',
        registroId: doc.id,
        accion: 'eliminar',
      });
    }

    return { eliminados: versiones.length };
  }
}
