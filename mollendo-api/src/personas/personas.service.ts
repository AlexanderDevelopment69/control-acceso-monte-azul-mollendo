import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
import type { CreatePersonaDto } from './dto/create-persona.dto.js';
import type { UpdatePersonaDto } from './dto/update-persona.dto.js';
import type { UpdateEstadoPersonaDto } from './dto/update-estado-persona.dto.js';
import type { QueryPersonasDto } from './dto/query-personas.dto.js';
import {
  esDocumentoVigente,
  evaluarIngreso,
  tiposDocumentoVigentes,
  ultimasVersiones,
  type DocumentoCargado,
} from '../eventos-acceso/validacion-acceso.engine.js';

const EMPRESA_SELECT = { select: { id: true, razonSocial: true } } as const;
const PUESTO_CON_REQUISITOS = { include: { requisitos: { include: { tipoDocumento: true } } } } as const;

interface PersonaParaCumplimiento {
  estado: 'activo' | 'inactivo';
  puestoId: number | null;
  puesto: { requisitos: { tipoDocumentoId: number; obligatorio: boolean; tipoDocumento: { nombre: string } }[] } | null;
}

/**
 * ¿Podría ingresar hoy, suponiendo alcohol conforme? Usa el mismo motor que el
 * molinete, para que el ✔/✖ de la pantalla del administrador nunca difiera de
 * lo que pasa en garita.
 */
function evaluarCumplimiento(persona: PersonaParaCumplimiento, documentos: DocumentoCargado[]) {
  const documentosRequeridos = (persona.puesto?.requisitos ?? [])
    .filter((r) => r.obligatorio)
    .map((r) => ({ tipoDocumentoId: r.tipoDocumentoId, nombre: r.tipoDocumento.nombre }));

  const resultado = evaluarIngreso({
    personaActiva: persona.estado === 'activo',
    tienePuesto: persona.puestoId !== null,
    alcoholConforme: true,
    documentosRequeridos,
    documentosVigentes: tiposDocumentoVigentes(documentos, new Date()),
  });

  return {
    habilitado: resultado.autorizado,
    dadoDeBaja: resultado.denegadoPorBaja,
    sinPuesto: resultado.denegadoSinPuesto,
    documentosFaltantes: resultado.documentosFaltantes,
  };
}

@Injectable()
export class PersonasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  private async assertEmpresaExiste(empresaId: number): Promise<void> {
    const empresa = await this.prisma.empresa.findUnique({ where: { id: empresaId } });
    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }
  }

  // Alcance base: el administrador registra al personal de cualquier empresa.
  async create(dto: CreatePersonaDto, user: AuthenticatedUser) {
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
    return persona;
  }

  /** Listado con el cumplimiento de cada persona (para el ✔/✖ de la pantalla principal). */
  async findAll(query: QueryPersonasDto) {
    const personas = await this.prisma.persona.findMany({
      where: { empresaId: query.empresaId, puestoId: query.puestoId, estado: query.estado },
      include: {
        empresa: EMPRESA_SELECT,
        puesto: PUESTO_CON_REQUISITOS,
        documentos: { select: { id: true, tipoDocumentoId: true, version: true, fechaVencimiento: true } },
      },
      orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
    });

    return personas.map(({ documentos, puesto, ...persona }) => ({
      ...persona,
      puesto: puesto && { id: puesto.id, nombre: puesto.nombre, caso: puesto.caso },
      cumplimiento: evaluarCumplimiento({ ...persona, puesto }, documentos),
    }));
  }

  /**
   * Ficha completa: cumplimiento, los documentos que exige su puesto con el
   * estado de la última versión de cada uno, y el historial completo.
   */
  async findOne(id: number) {
    const persona = await this.prisma.persona.findUnique({
      where: { id },
      include: {
        empresa: EMPRESA_SELECT,
        puesto: PUESTO_CON_REQUISITOS,
        documentos: { include: { tipoDocumento: true }, orderBy: [{ tipoDocumentoId: 'asc' }, { version: 'desc' }] },
      },
    });
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }

    const hoy = new Date();
    const ultimas = ultimasVersiones(persona.documentos);
    const requisitos = (persona.puesto?.requisitos ?? [])
      .map((r) => {
        const documento = ultimas.get(r.tipoDocumentoId) ?? null;
        return {
          tipoDocumentoId: r.tipoDocumentoId,
          nombre: r.tipoDocumento.nombre,
          obligatorio: r.obligatorio,
          documento: documento && {
            id: documento.id,
            version: documento.version,
            fechaVencimiento: documento.fechaVencimiento,
            creadoEn: documento.creadoEn,
          },
          vigente: documento ? esDocumentoVigente(documento.fechaVencimiento, hoy) : false,
        };
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));

    const { puesto, ...resto } = persona;
    return {
      ...resto,
      puesto: puesto && { id: puesto.id, nombre: puesto.nombre, caso: puesto.caso },
      cumplimiento: evaluarCumplimiento(persona, persona.documentos),
      requisitos,
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
    const persona = await this.findPersona(id);
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
