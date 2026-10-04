import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import { documentosActuales } from './validacion-acceso.engine.js';
import type { IngresoDto } from './dto/ingreso.dto.js';
import type { SalidaDto } from './dto/salida.dto.js';
import type { QueryEventosAccesoDto } from './dto/query-eventos-acceso.dto.js';
import type { Persona, Prisma } from '../generated/prisma/client.js';
import { paginacion, palabras, rangoDeDias, type Paginado } from '../common/paginacion.js';
import type { RtlogRecibidoEvent } from '../push-sdk/push-sdk.service.js';

/** Payload del evento interno que ordena abrir el molinete (lo atiende IntegracionesModule). */
export interface AbrirMolineteEvent {
  torniqueteId?: string;
  eventoId: number;
  tipoMovimiento: 'ingreso' | 'salida';
}

/**
 * Cuánto se espera, desde que se pasa el DNI, a que llegue el resultado del
 * G4 Pro antes de dejar de intentar correlacionarlos: 1 minuto (decisión del
 * usuario, 03/oct/2026; antes 2). Es también el tiempo que el Panel muestra la
 * persona "en espera".
 */
const VENTANA_INGRESO_PENDIENTE_MS = 60 * 1000;

/**
 * DNI en regla esperando el resultado del G4 Pro (rostro + alcohol). Se
 * muestra en el Panel de vigilancia hasta que llega el resultado o vence la
 * espera (`hasta`).
 */
export interface IngresoEnEspera {
  id: number;
  personaId: number;
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  empresa: string | null;
  torniqueteId: string | null;
  desde: string;
  hasta: string;
}

const CON_PERSONA = { persona: { include: { empresa: { select: { razonSocial: true } } } } } as const;

function aEnEspera(pendiente: Prisma.IngresoPendienteGetPayload<{ include: typeof CON_PERSONA }>): IngresoEnEspera {
  return {
    id: pendiente.id,
    personaId: pendiente.personaId,
    nombres: pendiente.persona.nombres,
    apellidos: pendiente.persona.apellidos,
    numeroDocumento: pendiente.persona.numeroDocumento,
    empresa: pendiente.persona.empresa?.razonSocial ?? null,
    torniqueteId: pendiente.torniqueteId,
    desde: pendiente.creadoEn.toISOString(),
    hasta: new Date(pendiente.creadoEn.getTime() + VENTANA_INGRESO_PENDIENTE_MS).toISOString(),
  };
}

@Injectable()
export class EventosAccesoService {
  private readonly logger = new Logger(EventosAccesoService.name);

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

  /**
   * Fase 1 del ingreso: solo el DNI. El G4 Pro abre el ingreso con su propio
   * relé y manda su resultado (rostro + alcohol) por separado, después (ver
   * correlacionarVerificacionDispositivo) -- esta llamada ya no conoce el
   * resultado del alcoholímetro, así que si los documentos están en regla no
   * hay un EventoAcceso definitivo todavía, solo un "en espera".
   */
  async registrarIngreso(dto: IngresoDto) {
    const persona = await this.findPersonaPorDocumento(dto.tipoDocumentoIdentidad, dto.numeroDocumento);
    if (!persona) {
      return this.registrarNoRegistrada(dto, 'ingreso');
    }

    if (persona.estado !== 'activo') {
      return this.registrarIngresoDenegadoInmediato(persona, dto, { denegadoPorBaja: true });
    }

    const documentos = await this.getDocumentosActuales(persona.id);
    const documentosVencidos = documentos.filter((d) => !d.vigente).map((d) => d.nombre);
    const denegadoSinDocumentos = documentos.length === 0;
    const denegadoPorDocumentos = documentosVencidos.length > 0;

    if (denegadoSinDocumentos || denegadoPorDocumentos) {
      return this.registrarIngresoDenegadoInmediato(persona, dto, {
        denegadoSinDocumentos,
        denegadoPorDocumentos,
        documentosVencidos,
      });
    }

    const pendiente = await this.prisma.ingresoPendiente.create({
      data: { personaId: persona.id, torniqueteId: dto.torniqueteId },
      include: CON_PERSONA,
    });
    this.eventEmitter.emit('ingreso.en-espera', aEnEspera(pendiente));

    return {
      estado: 'pendiente_verificacion' as const,
      persona: { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos },
      numeroDocumento: persona.numeroDocumento,
      mensaje: 'Documentos en regla. Esperando el resultado del equipo (rostro + alcoholímetro).',
    };
  }

  /** Documento no registrado, dado de baja, sin documentos o con alguno vencido: se deniega aquí mismo, sin llegar al G4 Pro. */
  private async registrarIngresoDenegadoInmediato(
    persona: Persona,
    dto: IngresoDto,
    motivos: {
      denegadoPorBaja?: boolean;
      denegadoSinDocumentos?: boolean;
      denegadoPorDocumentos?: boolean;
      documentosVencidos?: string[];
    },
  ) {
    const evento = await this.prisma.eventoAcceso.create({
      data: {
        personaId: persona.id,
        tipoDocumentoIdentidad: persona.tipoDocumentoIdentidad,
        numeroDocumento: persona.numeroDocumento,
        tipoMovimiento: 'ingreso',
        resultado: 'denegado',
        denegadoPorBaja: motivos.denegadoPorBaja ?? false,
        denegadoSinDocumentos: motivos.denegadoSinDocumentos ?? false,
        denegadoPorDocumentos: motivos.denegadoPorDocumentos ?? false,
        torniqueteId: dto.torniqueteId,
      },
    });

    const respuesta = {
      eventoId: evento.id,
      tipoMovimiento: evento.tipoMovimiento,
      resultado: evento.resultado,
      fechaHora: evento.fechaHora.toISOString(),
      persona: { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos },
      numeroDocumento: persona.numeroDocumento,
      motivos: {
        dadoDeBaja: motivos.denegadoPorBaja ?? false,
        sinDocumentos: motivos.denegadoSinDocumentos ?? false,
        documentos: motivos.denegadoPorDocumentos ?? false,
        documentosVencidos: motivos.documentosVencidos ?? [],
      },
    };
    this.eventEmitter.emit('evento-acceso.registrado', respuesta);
    return respuesta;
  }

  /**
   * Fase 2 del ingreso: llegó un table=rtlog real del G4 Pro (ver
   * PushSdkService.guardarVerificacion). Se correlaciona con el DNI pendiente
   * más antiguo dentro de la ventana (FIFO: si hay varias personas en fila,
   * la primera que pasó su DNI se empareja con el primer resultado que
   * llega) -- el "pin" que manda el rtlog no sirve para esto, llega en 0
   * incluso con un usuario real enrolado (confirmado con el equipo real).
   *
   * `eventCode === '0'` es la única verificación exitosa que se ha probado
   * hasta ahora (Concentration=0, "Pass"); todavía no se ha confirmado qué
   * manda el equipo cuando el DT1700 da Drink o Fail (ver
   * Opciones_Integracion_G4Pro.md pendiente #3) -- por ahora, cualquier otro
   * código se trata como denegado por alcohol, pero esa interpretación no
   * está verificada con un rechazo real todavía.
   */
  @OnEvent('dispositivo.rtlog')
  async correlacionarVerificacionDispositivo(evento: RtlogRecibidoEvent): Promise<void> {
    const desde = new Date(Date.now() - VENTANA_INGRESO_PENDIENTE_MS);
    const pendiente = await this.prisma.ingresoPendiente.findFirst({
      where: { consumidoEn: null, creadoEn: { gte: desde } },
      orderBy: { creadoEn: 'asc' },
      include: { persona: true },
    });

    if (!pendiente) {
      this.logger.warn(
        `Llegó un rtlog (sn=${evento.serialNumber}, event=${evento.eventCode ?? ''}) sin ningún DNI pendiente en los últimos ${VENTANA_INGRESO_PENDIENTE_MS / 1000}s`,
      );
      return;
    }

    const autorizado = evento.eventCode === '0';
    const eventoAcceso = await this.prisma.eventoAcceso.create({
      data: {
        personaId: pendiente.personaId,
        tipoDocumentoIdentidad: pendiente.persona.tipoDocumentoIdentidad,
        numeroDocumento: pendiente.persona.numeroDocumento,
        tipoMovimiento: 'ingreso',
        resultado: autorizado ? 'autorizado' : 'denegado',
        denegadoPorAlcohol: !autorizado,
        torniqueteId: pendiente.torniqueteId ?? undefined,
        ...(evento.horaDispositivo ? { fechaHora: evento.horaDispositivo } : {}),
      },
    });

    await this.prisma.$transaction([
      this.prisma.ingresoPendiente.update({ where: { id: pendiente.id }, data: { consumidoEn: new Date() } }),
      this.prisma.verificacionDispositivo.update({
        where: { id: evento.verificacionId },
        data: { eventoAccesoId: eventoAcceso.id },
      }),
    ]);

    const respuesta = {
      eventoId: eventoAcceso.id,
      tipoMovimiento: eventoAcceso.tipoMovimiento,
      resultado: eventoAcceso.resultado,
      fechaHora: eventoAcceso.fechaHora.toISOString(),
      persona: { id: pendiente.persona.id, nombres: pendiente.persona.nombres, apellidos: pendiente.persona.apellidos },
      numeroDocumento: pendiente.persona.numeroDocumento,
      motivos: { alcohol: !autorizado },
    };
    this.eventEmitter.emit('evento-acceso.registrado', respuesta);
    this.eventEmitter.emit('ingreso.espera-terminada', { id: pendiente.id });
  }

  /** DNI en regla que todavía esperan el resultado del G4 Pro, más recientes primero (para el Panel). */
  async ingresosEnEspera(): Promise<IngresoEnEspera[]> {
    const pendientes = await this.prisma.ingresoPendiente.findMany({
      where: { consumidoEn: null, creadoEn: { gte: new Date(Date.now() - VENTANA_INGRESO_PENDIENTE_MS) } },
      orderBy: { creadoEn: 'desc' },
      include: CON_PERSONA,
    });
    return pendientes.map(aEnEspera);
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
      persona: { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos },
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
