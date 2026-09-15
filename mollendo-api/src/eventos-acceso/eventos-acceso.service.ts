import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import { evaluarIngreso, evaluarSalida } from './validacion-acceso.engine.js';
import type { IngresoDto } from './dto/ingreso.dto.js';
import type { SalidaDto } from './dto/salida.dto.js';
import type { QueryEventosAccesoDto } from './dto/query-eventos-acceso.dto.js';

@Injectable()
export class EventosAccesoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async findPersonaPorDocumento(tipoDocumentoIdentidad: string, numeroDocumento: string) {
    const persona = await this.prisma.persona.findUnique({
      where: {
        tipoDocumentoIdentidad_numeroDocumento: {
          tipoDocumentoIdentidad: tipoDocumentoIdentidad as never,
          numeroDocumento,
        },
      },
    });
    if (!persona) {
      throw new NotFoundException('Persona no registrada en el sistema');
    }
    return persona;
  }

  private async getDocumentosRequeridos(puestoId: number | null) {
    if (!puestoId) {
      // Catálogo de puestos/requisitos aún pendiente de poblar con el cliente
      // (spec, sección 5.1) — sin puesto asignado no hay reglas que evaluar.
      return [];
    }
    const requisitos = await this.prisma.requisitoPorPuesto.findMany({
      where: { puestoId, obligatorio: true },
      include: { tipoDocumento: true },
    });
    return requisitos.map((r) => ({ tipoDocumentoId: r.tipoDocumentoId, nombre: r.tipoDocumento.nombre }));
  }

  private async getDocumentosVigentesAprobados(personaId: number): Promise<Set<number>> {
    const documentos = await this.prisma.documentoPersona.findMany({
      where: { personaId },
      orderBy: { version: 'desc' },
    });

    const ultimaVersionPorTipo = new Map<number, (typeof documentos)[number]>();
    for (const doc of documentos) {
      if (!ultimaVersionPorTipo.has(doc.tipoDocumentoId)) {
        ultimaVersionPorTipo.set(doc.tipoDocumentoId, doc);
      }
    }

    const hoy = new Date();
    const vigentesAprobados = new Set<number>();
    for (const [tipoDocumentoId, doc] of ultimaVersionPorTipo) {
      const vigente = doc.fechaVencimiento ? doc.fechaVencimiento >= hoy : true;
      if (doc.estadoAprobacion === 'aprobado' && vigente) {
        vigentesAprobados.add(tipoDocumentoId);
      }
    }
    return vigentesAprobados;
  }

  async registrarIngreso(dto: IngresoDto) {
    const persona = await this.findPersonaPorDocumento(dto.tipoDocumentoIdentidad, dto.numeroDocumento);

    const [documentosRequeridos, documentosVigentesAprobados] = await Promise.all([
      this.getDocumentosRequeridos(persona.puestoId),
      this.getDocumentosVigentesAprobados(persona.id),
    ]);

    const resultado = evaluarIngreso({
      personaActiva: persona.estado === 'activo',
      alcoholConforme: dto.alcoholConforme,
      documentosRequeridos,
      documentosVigentesAprobados,
    });

    const evento = await this.prisma.eventoAcceso.create({
      data: {
        personaId: persona.id,
        tipoMovimiento: 'ingreso',
        resultado: resultado.autorizado ? 'autorizado' : 'denegado',
        denegadoPorBaja: resultado.denegadoPorBaja,
        denegadoPorAlcohol: resultado.denegadoPorAlcohol,
        denegadoPorDocumentos: resultado.denegadoPorDocumentos,
        torniqueteId: dto.torniqueteId,
      },
    });

    const respuesta = {
      eventoId: evento.id,
      resultado: evento.resultado,
      persona: { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos },
      motivos: {
        dadoDeBaja: resultado.denegadoPorBaja,
        alcohol: resultado.denegadoPorAlcohol,
        documentos: resultado.denegadoPorDocumentos,
        documentosFaltantes: resultado.documentosFaltantes,
      },
    };

    this.eventEmitter.emit('evento-acceso.registrado', respuesta);
    return respuesta;
  }

  async registrarSalida(dto: SalidaDto) {
    const persona = await this.findPersonaPorDocumento(dto.tipoDocumentoIdentidad, dto.numeroDocumento);

    const ultimoAutorizado = await this.prisma.eventoAcceso.findFirst({
      where: { personaId: persona.id, resultado: 'autorizado' },
      orderBy: { fechaHora: 'desc' },
    });

    const resultado = evaluarSalida(ultimoAutorizado?.tipoMovimiento ?? null);

    const evento = await this.prisma.eventoAcceso.create({
      data: {
        personaId: persona.id,
        tipoMovimiento: 'salida',
        resultado: resultado.autorizado ? 'autorizado' : 'denegado',
        denegadoSinIngresoPrevio: resultado.denegadoSinIngresoPrevio,
        torniqueteId: dto.torniqueteId,
      },
    });

    const respuesta = {
      eventoId: evento.id,
      resultado: evento.resultado,
      persona: { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos },
      motivos: { sinIngresoPrevio: resultado.denegadoSinIngresoPrevio },
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
