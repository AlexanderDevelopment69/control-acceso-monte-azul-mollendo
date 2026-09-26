import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import { evaluarIngreso, tiposDocumentoVigentes } from './validacion-acceso.engine.js';
import type { IngresoDto } from './dto/ingreso.dto.js';
import type { SalidaDto } from './dto/salida.dto.js';
import type { QueryEventosAccesoDto } from './dto/query-eventos-acceso.dto.js';

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
   * Una persona no registrada no genera fila en evento_acceso (no hay a quién
   * vincularla), pero sí se deniega y se muestra en la pantalla de garita.
   */
  private responderNoRegistrada(numeroDocumento: string, tipoMovimiento: 'ingreso' | 'salida') {
    const respuesta = {
      eventoId: null,
      tipoMovimiento,
      resultado: 'denegado' as const,
      fechaHora: new Date().toISOString(),
      persona: null,
      numeroDocumento,
      motivos: { personaNoRegistrada: true },
    };
    this.eventEmitter.emit('evento-acceso.registrado', respuesta);
    return respuesta;
  }

  private async getDocumentosRequeridos(puestoId: number) {
    const requisitos = await this.prisma.requisitoPorPuesto.findMany({
      where: { puestoId, obligatorio: true },
      include: { tipoDocumento: true },
    });
    return requisitos.map((r) => ({ tipoDocumentoId: r.tipoDocumentoId, nombre: r.tipoDocumento.nombre }));
  }

  /** Tipos de documento cuya ÚLTIMA versión está vigente hoy. Sin aprobación (alcance base). */
  private async getDocumentosVigentes(personaId: number): Promise<Set<number>> {
    const documentos = await this.prisma.documentoPersona.findMany({ where: { personaId } });
    return tiposDocumentoVigentes(documentos, new Date());
  }

  async registrarIngreso(dto: IngresoDto) {
    const persona = await this.findPersonaPorDocumento(dto.tipoDocumentoIdentidad, dto.numeroDocumento);
    if (!persona) {
      return this.responderNoRegistrada(dto.numeroDocumento, 'ingreso');
    }

    const [documentosRequeridos, documentosVigentes] = await Promise.all([
      persona.puestoId ? this.getDocumentosRequeridos(persona.puestoId) : Promise.resolve([]),
      this.getDocumentosVigentes(persona.id),
    ]);

    const resultado = evaluarIngreso({
      personaActiva: persona.estado === 'activo',
      tienePuesto: persona.puestoId !== null,
      alcoholConforme: dto.alcoholConforme,
      documentosRequeridos,
      documentosVigentes,
    });

    const evento = await this.prisma.eventoAcceso.create({
      data: {
        personaId: persona.id,
        tipoMovimiento: 'ingreso',
        resultado: resultado.autorizado ? 'autorizado' : 'denegado',
        denegadoPorBaja: resultado.denegadoPorBaja,
        denegadoSinPuesto: resultado.denegadoSinPuesto,
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
      persona: { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos },
      numeroDocumento: persona.numeroDocumento,
      motivos: {
        dadoDeBaja: resultado.denegadoPorBaja,
        sinPuesto: resultado.denegadoSinPuesto,
        alcohol: resultado.denegadoPorAlcohol,
        documentos: resultado.denegadoPorDocumentos,
        documentosFaltantes: resultado.documentosFaltantes,
      },
    };

    this.eventEmitter.emit('evento-acceso.registrado', respuesta);
    return respuesta;
  }

  /** Registro básico de salida: sin antipassback, siempre se autoriza y abre el molinete. */
  async registrarSalida(dto: SalidaDto) {
    const persona = await this.findPersonaPorDocumento(dto.tipoDocumentoIdentidad, dto.numeroDocumento);
    if (!persona) {
      return this.responderNoRegistrada(dto.numeroDocumento, 'salida');
    }

    const evento = await this.prisma.eventoAcceso.create({
      data: {
        personaId: persona.id,
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
      persona: { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos },
      numeroDocumento: persona.numeroDocumento,
      motivos: {},
    };

    this.eventEmitter.emit('evento-acceso.registrado', respuesta);
    return respuesta;
  }

  async findAll(query: QueryEventosAccesoDto) {
    return this.prisma.eventoAcceso.findMany({
      where: {
        personaId: query.personaId,
        resultado: query.resultado,
        fechaHora: {
          gte: query.desde ? new Date(query.desde) : undefined,
          lte: query.hasta ? new Date(query.hasta) : undefined,
        },
      },
      include: { persona: { select: { id: true, nombres: true, apellidos: true, empresaId: true } } },
      orderBy: { fechaHora: 'desc' },
      take: 500,
    });
  }
}
