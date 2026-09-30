import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import { documentosActuales, evaluarIngreso } from './validacion-acceso.engine.js';
import type { IngresoDto } from './dto/ingreso.dto.js';
import type { SalidaDto } from './dto/salida.dto.js';
import type { QueryEventosAccesoDto } from './dto/query-eventos-acceso.dto.js';
import type { Prisma } from '../generated/prisma/client.js';
import { paginacion, palabras, rangoDeDias, type Paginado } from '../common/paginacion.js';

/** Payload del evento interno que ordena abrir el molinete (lo atiende IntegracionesModule). */
export interface AbrirMolineteEvent {
  torniqueteId?: string;
  eventoId: number;
  tipoMovimiento: 'ingreso' | 'salida';
}

@Injectable()
export class EventosAccesoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private findPersonaPorDocumento(tipoDocumentoIdentidad: IngresoDto['tipoDocumentoIdentidad'], numeroDocumento: string) {
    return this.prisma.persona.findUnique({
      where: { tipoDocumentoIdentidad_numeroDocumento: { tipoDocumentoIdentidad, numeroDocumento } },
    });
  }

  /**
   * Documento no registrado: se deniega (en ingreso y en salida) y el intento
   * queda en el historial sin persona, con el documento que leyó el equipo.
   */
  private async registrarNoRegistrada(dto: IngresoDto | SalidaDto, tipoMovimiento: 'ingreso' | 'salida') {
    const evento = await this.prisma.eventoAcceso.create({
      data: {
        tipoDocumentoIdentidad: dto.tipoDocumentoIdentidad,
        numeroDocumento: dto.numeroDocumento,
        tipoMovimiento,
        resultado: 'denegado',
        denegadoNoRegistrado: true,
        torniqueteId: dto.torniqueteId,
      },
    });
    const respuesta = {
      eventoId: evento.id,
      tipoMovimiento,
      resultado: evento.resultado,
      fechaHora: evento.fechaHora.toISOString(),
      persona: null,
      numeroDocumento: dto.numeroDocumento,
      motivos: { personaNoRegistrada: true },
    };
    this.eventEmitter.emit('evento-acceso.registrado', respuesta);
    return respuesta;
  }

  /** Última versión de cada documento de la persona, con su vigencia a hoy. Sin aprobación (alcance base). */
  private async getDocumentosActuales(personaId: number) {
    const documentos = await this.prisma.documentoPersona.findMany({
      where: { personaId },
      include: { tipoDocumento: { select: { nombre: true } } },
    });
    return documentosActuales(documentos, new Date());
  }

  async registrarIngreso(dto: IngresoDto) {
    const persona = await this.findPersonaPorDocumento(dto.tipoDocumentoIdentidad, dto.numeroDocumento);
    if (!persona) {
      return this.registrarNoRegistrada(dto, 'ingreso');
    }

    const resultado = evaluarIngreso({
      personaActiva: persona.estado === 'activo',
      alcoholConforme: dto.alcoholConforme,
      documentos: await this.getDocumentosActuales(persona.id),
    });

    const evento = await this.prisma.eventoAcceso.create({
      data: {
        personaId: persona.id,
        tipoDocumentoIdentidad: persona.tipoDocumentoIdentidad,
        numeroDocumento: persona.numeroDocumento,
        tipoMovimiento: 'ingreso',
        resultado: resultado.autorizado ? 'autorizado' : 'denegado',
        denegadoPorBaja: resultado.denegadoPorBaja,
        denegadoSinDocumentos: resultado.denegadoSinDocumentos,
        denegadoPorAlcohol: resultado.denegadoPorAlcohol,
        denegadoPorDocumentos: resultado.denegadoPorDocumentos,
        torniqueteId: dto.torniqueteId,
      },
    });

    if (resultado.autorizado) {
      this.eventEmitter.emit('molinete.abrir', {
        torniqueteId: dto.torniqueteId,
        eventoId: evento.id,
        tipoMovimiento: 'ingreso',
      } satisfies AbrirMolineteEvent);
    }

    const respuesta = {
      eventoId: evento.id,
      tipoMovimiento: evento.tipoMovimiento,
      resultado: evento.resultado,
      fechaHora: evento.fechaHora.toISOString(),
      persona: { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos, tipoPersona: persona.tipoPersona },
      numeroDocumento: persona.numeroDocumento,
      motivos: {
        dadoDeBaja: resultado.denegadoPorBaja,
        sinDocumentos: resultado.denegadoSinDocumentos,
        alcohol: resultado.denegadoPorAlcohol,
        documentos: resultado.denegadoPorDocumentos,
        documentosVencidos: resultado.documentosVencidos,
      },
    };

    this.eventEmitter.emit('evento-acceso.registrado', respuesta);
    return respuesta;
  }

  /** Salida: sin antipassback; con un documento registrado (aunque esté de baja) se autoriza y abre el molinete. */
  async registrarSalida(dto: SalidaDto) {
    const persona = await this.findPersonaPorDocumento(dto.tipoDocumentoIdentidad, dto.numeroDocumento);
    if (!persona) {
      return this.registrarNoRegistrada(dto, 'salida');
    }

    const evento = await this.prisma.eventoAcceso.create({
      data: {
        personaId: persona.id,
        tipoDocumentoIdentidad: persona.tipoDocumentoIdentidad,
        numeroDocumento: persona.numeroDocumento,
        tipoMovimiento: 'salida',
        resultado: 'autorizado',
        torniqueteId: dto.torniqueteId,
      },
    });

    this.eventEmitter.emit('molinete.abrir', {
      torniqueteId: dto.torniqueteId,
      eventoId: evento.id,
      tipoMovimiento: 'salida',
    } satisfies AbrirMolineteEvent);

    const respuesta = {
      eventoId: evento.id,
      tipoMovimiento: evento.tipoMovimiento,
      resultado: evento.resultado,
      fechaHora: evento.fechaHora.toISOString(),
      persona: { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos, tipoPersona: persona.tipoPersona },
      numeroDocumento: persona.numeroDocumento,
      motivos: {},
    };

    this.eventEmitter.emit('evento-acceso.registrado', respuesta);
    return respuesta;
  }

  /**
   * Historial paginado, más recientes primero. Cada palabra de la búsqueda debe
   * coincidir con el número de documento, los nombres o los apellidos.
   */
  async findAll(query: QueryEventosAccesoDto) {
    const { pagina, porPagina, skip, take } = paginacion(query);
    const where: Prisma.EventoAccesoWhereInput = {
      personaId: query.personaId,
      resultado: query.resultado,
      ...(query.tipoPersona && { persona: { tipoPersona: query.tipoPersona } }),
      fechaHora: rangoDeDias(query.desde, query.hasta),
      AND: palabras(query.busqueda).map((palabra) => ({
        OR: [
          { numeroDocumento: { contains: palabra, mode: 'insensitive' as const } },
          { persona: { nombres: { contains: palabra, mode: 'insensitive' as const } } },
          { persona: { apellidos: { contains: palabra, mode: 'insensitive' as const } } },
        ],
      })),
    };
    const [datos, total] = await Promise.all([
      this.prisma.eventoAcceso.findMany({
        where,
        include: {
          persona: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              tipoPersona: true,
              empresaId: true,
              tipoDocumentoIdentidad: true,
              numeroDocumento: true,
            },
          },
        },
        orderBy: [{ fechaHora: 'desc' }, { id: 'desc' }],
        skip,
        take,
      }),
      this.prisma.eventoAcceso.count({ where }),
    ]);
    return { datos, total, pagina, porPagina } satisfies Paginado<(typeof datos)[number]>;
  }
}
