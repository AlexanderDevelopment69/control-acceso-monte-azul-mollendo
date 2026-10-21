import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Express } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
import { borrarArchivo, guardarArchivo } from '../common/archivos-persona.util.js';
import type { CreatePersonaDto } from './dto/create-persona.dto.js';
import type { UpdatePersonaDto } from './dto/update-persona.dto.js';
import type { UpdateEstadoPersonaDto } from './dto/update-estado-persona.dto.js';
import type { QueryPersonasDto } from './dto/query-personas.dto.js';
import {
  documentosActuales,
  esDocumentoVigente,
  evaluarIngreso,
  ultimasVersiones,
  type DocumentoCargado,
} from '../eventos-acceso/validacion-acceso.engine.js';

const EMPRESA_SELECT = { select: { id: true, razonSocial: true } } as const;

/**
 * ¿Podría ingresar hoy, suponiendo alcohol conforme? Usa el mismo motor que el
 * molinete, para que el ✔/✖ de la pantalla del administrador nunca difiera de
 * lo que pasa en garita.
 */
function evaluarCumplimiento(
  estado: 'activo' | 'inactivo',
  documentos: (DocumentoCargado & { tipoDocumento: { nombre: string } })[],
) {
  const resultado = evaluarIngreso({
    personaActiva: estado === 'activo',
    alcoholConforme: true,
    documentos: documentosActuales(documentos, new Date()),
  });

  return {
    habilitado: resultado.autorizado,
    dadoDeBaja: resultado.denegadoPorBaja,
    sinDocumentos: resultado.denegadoSinDocumentos,
    documentosVencidos: resultado.documentosVencidos,
  };
}

/** El DNI peruano tiene 8 dígitos; CE y pasaporte solo se limpian en el DTO. */
function validarNumeroDocumento(tipo: 'DNI' | 'CE' | 'PASAPORTE', numero: string): void {
  if (tipo === 'DNI' && !/^\d{8}$/.test(numero)) {
    throw new BadRequestException('El DNI debe tener 8 dígitos');
  }
}

@Injectable()
export class PersonasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoriaService: AuditoriaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async assertEmpresaExiste(empresaId: number): Promise<void> {
    const empresa = await this.prisma.empresa.findUnique({ where: { id: empresaId } });
    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }
  }

  // Alcance base: el administrador registra al personal de cualquier empresa.
  async create(dto: CreatePersonaDto, user: AuthenticatedUser) {
    validarNumeroDocumento(dto.tipoDocumentoIdentidad, dto.numeroDocumento);
    await this.assertEmpresaExiste(dto.empresaId);

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
      data: dto,
    });
    await this.auditoriaService.registrar({
      usuarioId: user.id,
      tablaAfectada: 'persona',
      registroId: persona.id,
      accion: 'crear',
    });
    this.eventEmitter.emit('persona.guardada', { personaId: persona.id });
    return persona;
  }

  /** Listado con el cumplimiento de cada persona (para el ✔/✖ de la pantalla principal). */
  async findAll(query: QueryPersonasDto) {
    const personas = await this.prisma.persona.findMany({
      where: { empresaId: query.empresaId, estado: query.estado },
      include: {
        empresa: EMPRESA_SELECT,
        documentos: {
          select: {
            id: true,
            tipoDocumentoId: true,
            version: true,
            fechaVencimiento: true,
            tipoDocumento: { select: { nombre: true } },
          },
        },
      },
      orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
    });

    return personas.map(({ documentos, ...persona }) => ({
      ...persona,
      cumplimiento: evaluarCumplimiento(persona.estado, documentos),
    }));
  }

  /**
   * Ficha completa: cumplimiento, la última versión de cada documento con su
   * vigencia (lo que cuenta en garita) y el historial completo.
   */
  async findOne(id: number) {
    const persona = await this.prisma.persona.findUnique({
      where: { id },
      include: {
        empresa: EMPRESA_SELECT,
        documentos: { include: { tipoDocumento: true }, orderBy: [{ tipoDocumentoId: 'asc' }, { version: 'desc' }] },
      },
    });
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }

    const hoy = new Date();
    const documentosVigentes = [...ultimasVersiones(persona.documentos).values()]
      .map((doc) => ({
        id: doc.id,
        tipoDocumentoId: doc.tipoDocumentoId,
        nombre: doc.tipoDocumento.nombre,
        version: doc.version,
        fechaVencimiento: doc.fechaVencimiento,
        creadoEn: doc.creadoEn,
        vigente: esDocumentoVigente(doc.fechaVencimiento, hoy),
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));

    return {
      ...persona,
      cumplimiento: evaluarCumplimiento(persona.estado, persona.documentos),
      documentosActuales: documentosVigentes,
    };
  }

  private async findPersona(id: number) {
    const persona = await this.prisma.persona.findUnique({ where: { id } });
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }
    return persona;
  }

  async update(id: number, dto: UpdatePersonaDto, user: AuthenticatedUser) {
    const persona = await this.findPersona(id);
    if (dto.empresaId !== undefined && dto.empresaId !== persona.empresaId) {
      await this.assertEmpresaExiste(dto.empresaId);
    }
    const tipo = dto.tipoDocumentoIdentidad ?? persona.tipoDocumentoIdentidad;
    const numero = dto.numeroDocumento ?? persona.numeroDocumento;
    if (tipo !== persona.tipoDocumentoIdentidad || numero !== persona.numeroDocumento) {
      validarNumeroDocumento(tipo, numero);
      const otra = await this.prisma.persona.findUnique({
        where: { tipoDocumentoIdentidad_numeroDocumento: { tipoDocumentoIdentidad: tipo, numeroDocumento: numero } },
      });
      if (otra) {
        throw new ConflictException('Ya existe una persona registrada con ese documento');
      }
    }
    const actualizada = await this.prisma.persona.update({ where: { id: persona.id }, data: dto });
    await this.auditoriaService.registrar({
      usuarioId: user.id,
      tablaAfectada: 'persona',
      registroId: persona.id,
      accion: 'modificar',
    });
    // Al G4 Pro solo le importan el número y el nombre: si cambió solo el perfil o la empresa, no se le envía nada.
    const cambioParaEquipos =
      actualizada.numeroDocumento !== persona.numeroDocumento ||
      actualizada.nombres !== persona.nombres ||
      actualizada.apellidos !== persona.apellidos;
    if (cambioParaEquipos) {
      this.eventEmitter.emit('persona.guardada', {
        personaId: persona.id,
        numeroAnterior: actualizada.numeroDocumento !== persona.numeroDocumento ? persona.numeroDocumento : undefined,
      });
    }
    return actualizada;
  }

  async updateEstado(id: number, dto: UpdateEstadoPersonaDto, user: AuthenticatedUser) {
    const persona = await this.findPersona(id);
    // Al dar de baja se guarda la fecha y, si se escribió, el motivo; al reactivar se borran.
    const motivo = dto.motivo?.replace(/\s+/g, ' ').trim() || null;
    const actualizada = await this.prisma.persona.update({
      where: { id: persona.id },
      data:
        dto.estado === 'inactivo'
          ? { estado: 'inactivo', motivoBaja: motivo, fechaBaja: new Date() }
          : { estado: 'activo', motivoBaja: null, fechaBaja: null },
    });
    await this.auditoriaService.registrar({
      usuarioId: user.id,
      tablaAfectada: 'persona',
      registroId: persona.id,
      accion: 'modificar',
    });
    return actualizada;
  }

  /**
   * Guarda la foto para el reconocimiento facial y borra la anterior del
   * disco. Avisa a la integración para enviarla al terminal G4 Pro, que la
   * convierte en el rostro con el que reconoce a la persona.
   */
  async guardarFoto(id: number, foto: Express.Multer.File, user: AuthenticatedUser) {
    const persona = await this.findPersona(id);
    // Se escribe en disco recién ahora, con la persona ya validada.
    const rutaArchivo = guardarArchivo(id, foto, 'foto-');
    let actualizada;
    try {
      actualizada = await this.prisma.persona.update({ where: { id }, data: { fotoUrl: rutaArchivo } });
    } catch (error) {
      borrarArchivo(rutaArchivo);
      throw error;
    }
    borrarArchivo(persona.fotoUrl);

    await this.auditoriaService.registrar({
      usuarioId: user.id,
      tablaAfectada: 'persona',
      registroId: id,
      accion: 'modificar',
    });
    this.eventEmitter.emit('persona.foto-actualizada', {
      personaId: id,
      tipoDocumentoIdentidad: actualizada.tipoDocumentoIdentidad,
      numeroDocumento: actualizada.numeroDocumento,
      rutaFoto: rutaArchivo,
    });
    return actualizada;
  }

  /** Ruta absoluta de la foto en disco, para enviarla al portal. */
  async rutaFoto(id: number): Promise<string> {
    const persona = await this.findPersona(id);
    if (!persona.fotoUrl || !existsSync(persona.fotoUrl)) {
      throw new NotFoundException('El personal no tiene foto');
    }
    return resolve(persona.fotoUrl);
  }
}
