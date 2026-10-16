import { BadRequestException, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import { documentosActuales } from './validacion-acceso.engine.js';
import type { IngresoDto } from './dto/ingreso.dto.js';
import type { SalidaDto } from './dto/salida.dto.js';
import type { QueryEventosAccesoDto } from './dto/query-eventos-acceso.dto.js';
import type { Persona, Prisma } from '../generated/prisma/client.js';
import { paginacion, palabras, rangoDeDias, type Paginado } from '../common/paginacion.js';
import type { RtlogRecibidoEvent } from '../push-sdk/push-sdk.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
import { VerificacionManualService } from './verificacion-manual.service.js';

/** Payload del evento interno que ordena abrir el molinete (lo atiende IntegracionesModule). */
export interface AbrirMolineteEvent {
  torniqueteId?: string;
  eventoId: number;
  tipoMovimiento: 'ingreso' | 'salida';
}

/**
 * Cuánto tiene la persona para completar rostro y alcohol en el G4 Pro desde
 * que se la habilita: 1 minuto (decisión del usuario, 03/oct/2026). Al vencer,
 * se le quita el permiso y el ingreso queda denegado ("No completó rostro y
 * alcohol").
 */
const VENTANA_INGRESO_PENDIENTE_MS = 60 * 1000;

/**
 * En la verificación manual (equipo facial fuera de servicio), el vigilante
 * tiene 2 minutos para comparar el rostro y tomar la prueba de alcohol
 * (contingencias, sección 4). Al vencer, el ingreso queda denegado.
 */
const VENTANA_VERIFICACION_MANUAL_MS = 2 * 60 * 1000;

/** El turno de una espera: el del G4 Pro o el del vigilante. */
const ventanaDe = (pendiente: { manual: boolean }) =>
  pendiente.manual ? VENTANA_VERIFICACION_MANUAL_MS : VENTANA_INGRESO_PENDIENTE_MS;

/** El turno más largo: para buscar en la base las esperas que pueden seguir abiertas. */
const VENTANA_MAXIMA_MS = Math.max(VENTANA_INGRESO_PENDIENTE_MS, VENTANA_VERIFICACION_MANUAL_MS);

/** Cuánto puede esperar en cola un DNI (otra persona estaba habilitada) antes de cerrarse sin verificar. */
const ESPERA_MAXIMA_EN_COLA_MS = 3 * VENTANA_INGRESO_PENDIENTE_MS;

/** Decisión del vigilante en la verificación manual. */
export type DecisionManual = 'apto' | 'alcohol' | 'no-es-la-persona';

/** Cada cuánto se revisan las esperas vencidas. */
const REVISION_VENCIDOS_MS = 5000;

/**
 * DNI en regla esperando el resultado del G4 Pro (rostro + alcohol). Se
 * muestra en el Panel de vigilancia hasta que llega el resultado o vence la
 * espera. `enCola`: todavía no se lo habilitó porque otra persona está en su
 * turno (se habilita a una sola a la vez); entonces `hasta` es null.
 */
export interface IngresoEnEspera {
  id: number;
  personaId: number;
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  empresa: string | null;
  /** Para mostrar su foto en el Panel (el vigilante la compara con quien está frente al terminal). */
  tieneFoto: boolean;
  torniqueteId: string | null;
  desde: string;
  hasta: string | null;
  enCola: boolean;
  /** La decide un vigilante (verificación manual), no el G4 Pro. */
  manual: boolean;
}

const CON_PERSONA = { persona: { include: { empresa: { select: { razonSocial: true } } } } } as const;

type PendienteConPersona = Prisma.IngresoPendienteGetPayload<{ include: typeof CON_PERSONA }>;

function aEnEspera(pendiente: PendienteConPersona): IngresoEnEspera {
  return {
    id: pendiente.id,
    personaId: pendiente.personaId,
    nombres: pendiente.persona.nombres,
    apellidos: pendiente.persona.apellidos,
    numeroDocumento: pendiente.persona.numeroDocumento,
    empresa: pendiente.persona.empresa?.razonSocial ?? null,
    tieneFoto: !!pendiente.persona.fotoUrl,
    torniqueteId: pendiente.torniqueteId,
    desde: (pendiente.habilitadoEn ?? pendiente.creadoEn).toISOString(),
    hasta: pendiente.habilitadoEn ? new Date(pendiente.habilitadoEn.getTime() + ventanaDe(pendiente)).toISOString() : null,
    enCola: !pendiente.habilitadoEn,
    manual: pendiente.manual,
  };
}

/** Pedido a la integración del G4 Pro: dar o quitar el permiso de paso a un DNI (lo atiende IntegracionesModule). */
export interface HabilitarEnEquipoEvent {
  numeroDocumento: string;
  habilitar: boolean;
}

/** Hasta cuántos días después se acepta una salida registrada sin conexión. */
const DIAS_MAX_SIN_CONEXION = 7;

/** Hora de una salida registrada sin conexión: la indicada, si es razonable (no futura ni de hace más de una semana). */
export function fechaSinConexion(fechaHora: string | undefined, ahora = new Date()): Date {
  if (!fechaHora) throw new BadRequestException('Una salida sin conexión debe indicar su fecha y hora');
  const fecha = new Date(fechaHora);
  if (fecha.getTime() > ahora.getTime() + 60_000) throw new BadRequestException('La fecha y hora de la salida no puede ser futura');
  if (ahora.getTime() - fecha.getTime() > DIAS_MAX_SIN_CONEXION * 86_400_000) {
    throw new BadRequestException(`La salida sin conexión es de hace más de ${DIAS_MAX_SIN_CONEXION} días`);
  }
  return fecha;
}

@Injectable()
export class EventosAccesoService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventosAccesoService.name);
  private revision: NodeJS.Timeout | null = null;
  /** Las operaciones sobre las esperas se hacen de a una, para no habilitar a dos personas a la vez. */
  private cola: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly verificacionManual: VerificacionManualService,
  ) {}

  onModuleInit() {
    this.revision = setInterval(() => void this.enSerie(() => this.cerrarVencidos()), REVISION_VENCIDOS_MS);
  }

  onModuleDestroy() {
    if (this.revision) clearInterval(this.revision);
  }

  private enSerie<T>(tarea: () => Promise<T>): Promise<T> {
    const resultado = this.cola.then(tarea, tarea);
    this.cola = resultado.catch((error: Error) => this.logger.error(`Ingreso en espera: ${error.message}`));
    return resultado;
  }

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
   * Fase 1 del ingreso: solo el DNI. Si los documentos están en regla, la
   * persona queda "en espera": se la habilita en el G4 Pro (o queda en cola si
   * otra está en su turno) y el resultado del rostro y el alcohol llega
   * después (ver correlacionarVerificacionDispositivo).
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

    // Con la verificación manual activa, la decide un vigilante y no se usa el G4 Pro.
    const manual = await this.verificacionManual.activa();
    await this.enSerie(async () => {
      // Si ya está esperando (volvió a pasar el DNI), se mantiene su lugar.
      const abierto = (
        await this.prisma.ingresoPendiente.findMany({ where: { personaId: persona.id, consumidoEn: null, ...this.filtroAbiertos() } })
      ).find((p) => this.sigueAbierta(p));
      if (abierto) return;
      const pendiente = await this.prisma.ingresoPendiente.create({
        data: { personaId: persona.id, torniqueteId: dto.torniqueteId, manual },
        include: CON_PERSONA,
      });
      const habilitado = await this.habilitarSiguiente();
      if (habilitado !== pendiente.id) this.eventEmitter.emit('ingreso.en-espera', aEnEspera(pendiente));
    });

    return {
      estado: 'pendiente_verificacion' as const,
      persona: { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos },
      numeroDocumento: persona.numeroDocumento,
      mensaje: manual
        ? 'Documentos en regla. Verificación manual: el vigilante compara el rostro y toma la prueba de alcohol.'
        : 'Documentos en regla. Esperando el resultado del equipo (rostro + alcoholímetro).',
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
   * Esperas que pueden seguir abiertas (en la base): la habilitada dentro del
   * turno más largo, o en cola sin pasarse del máximo. El turno exacto de cada
   * una (G4 Pro o vigilante) lo revisa `sigueAbierta`.
   */
  private filtroAbiertos(ahora = Date.now()): Prisma.IngresoPendienteWhereInput {
    return {
      OR: [
        { habilitadoEn: { gte: new Date(ahora - VENTANA_MAXIMA_MS) } },
        { habilitadoEn: null, creadoEn: { gte: new Date(ahora - ESPERA_MAXIMA_EN_COLA_MS) } },
      ],
    };
  }

  /** ¿Sigue dentro de su turno (o de la espera máxima en cola)? */
  private sigueAbierta(p: { habilitadoEn: Date | null; creadoEn: Date; manual: boolean }, ahora = Date.now()): boolean {
    return p.habilitadoEn
      ? p.habilitadoEn.getTime() >= ahora - ventanaDe(p)
      : p.creadoEn.getTime() >= ahora - ESPERA_MAXIMA_EN_COLA_MS;
  }

  /** La espera habilitada ahora (a lo sumo una: el G4 Pro o el vigilante atienden a una persona a la vez). */
  private async enTurno() {
    const ahora = Date.now();
    const candidatas = await this.prisma.ingresoPendiente.findMany({
      where: { consumidoEn: null, habilitadoEn: { gte: new Date(ahora - VENTANA_MAXIMA_MS) } },
      include: { persona: true },
    });
    return candidatas.find((p) => this.sigueAbierta(p, ahora)) ?? null;
  }

  /**
   * Si nadie está habilitado, habilita en el G4 Pro al DNI más antiguo de la
   * cola: el equipo solo aceptará su rostro (a cualquier otro le da
   * `event=23`). Devuelve el id de la espera habilitada, o null.
   */
  private async habilitarSiguiente(): Promise<number | null> {
    const ahora = Date.now();
    if (await this.enTurno()) return null;
    const siguiente = await this.prisma.ingresoPendiente.findFirst({
      where: { consumidoEn: null, habilitadoEn: null, creadoEn: { gte: new Date(ahora - ESPERA_MAXIMA_EN_COLA_MS) } },
      orderBy: { creadoEn: 'asc' },
    });
    if (!siguiente) return null;
    const habilitado = await this.prisma.ingresoPendiente.update({
      where: { id: siguiente.id },
      data: { habilitadoEn: new Date() },
      include: CON_PERSONA,
    });
    // En la verificación manual no se usa el G4 Pro: las órdenes quedarían
    // pendientes y, al volver, el equipo dejaría a alguien habilitado.
    if (!habilitado.manual) {
      this.eventEmitter.emit('g4pro.habilitar', {
        numeroDocumento: habilitado.persona.numeroDocumento,
        habilitar: true,
      } satisfies HabilitarEnEquipoEvent);
    }
    this.eventEmitter.emit('ingreso.en-espera', aEnEspera(habilitado));
    return habilitado.id;
  }

  /**
   * Cierra una espera con su resultado: registra el ingreso, le quita el
   * permiso en el G4 Pro, avisa al Panel y habilita al siguiente de la cola.
   */
  private async cerrarEspera(
    pendiente: Prisma.IngresoPendienteGetPayload<{ include: { persona: true } }>,
    resultado: {
      autorizado: boolean;
      denegadoPorAlcohol?: boolean;
      denegadoSinVerificacion?: boolean;
      denegadoRostroNoCoincide?: boolean;
      fechaHora?: Date;
      /** Verificación manual: el vigilante que decidió. */
      verificadoPor?: AuthenticatedUser;
    },
    verificacionId?: number,
  ) {
    const eventoAcceso = await this.prisma.eventoAcceso.create({
      data: {
        personaId: pendiente.personaId,
        tipoDocumentoIdentidad: pendiente.persona.tipoDocumentoIdentidad,
        numeroDocumento: pendiente.persona.numeroDocumento,
        tipoMovimiento: 'ingreso',
        resultado: resultado.autorizado ? 'autorizado' : 'denegado',
        denegadoPorAlcohol: resultado.denegadoPorAlcohol ?? false,
        denegadoSinVerificacion: resultado.denegadoSinVerificacion ?? false,
        denegadoRostroNoCoincide: resultado.denegadoRostroNoCoincide ?? false,
        verificacionManual: pendiente.manual,
        verificadoPorId: resultado.verificadoPor?.id,
        torniqueteId: pendiente.torniqueteId ?? undefined,
        ...(resultado.fechaHora ? { fechaHora: resultado.fechaHora } : {}),
      },
    });
    await this.prisma.$transaction([
      this.prisma.ingresoPendiente.update({ where: { id: pendiente.id }, data: { consumidoEn: new Date() } }),
      ...(verificacionId
        ? [this.prisma.verificacionDispositivo.update({ where: { id: verificacionId }, data: { eventoAccesoId: eventoAcceso.id } })]
        : []),
    ]);
    if (pendiente.habilitadoEn && !pendiente.manual) {
      this.eventEmitter.emit('g4pro.habilitar', {
        numeroDocumento: pendiente.persona.numeroDocumento,
        habilitar: false,
      } satisfies HabilitarEnEquipoEvent);
    }
    if (resultado.autorizado) {
      this.eventEmitter.emit('molinete.abrir', {
        torniqueteId: pendiente.torniqueteId ?? undefined,
        eventoId: eventoAcceso.id,
        tipoMovimiento: 'ingreso',
      } satisfies AbrirMolineteEvent);
    }
    this.eventEmitter.emit('evento-acceso.registrado', {
      eventoId: eventoAcceso.id,
      tipoMovimiento: eventoAcceso.tipoMovimiento,
      resultado: eventoAcceso.resultado,
      fechaHora: eventoAcceso.fechaHora.toISOString(),
      persona: { id: pendiente.persona.id, nombres: pendiente.persona.nombres, apellidos: pendiente.persona.apellidos },
      numeroDocumento: pendiente.persona.numeroDocumento,
      motivos: {
        alcohol: !!resultado.denegadoPorAlcohol,
        sinVerificacion: !!resultado.denegadoSinVerificacion,
        rostroNoCoincide: !!resultado.denegadoRostroNoCoincide,
      },
      verificacionManual: pendiente.manual,
      verificadoPor: resultado.verificadoPor?.correo ?? null,
    });
    this.eventEmitter.emit('ingreso.espera-terminada', { id: pendiente.id });
    await this.habilitarSiguiente();
  }

  /**
   * Fase 2 del ingreso: llegó un `rtlog` del G4 Pro (ver
   * PushSdkService.guardarVerificacion). Probado con el equipo real
   * (04/oct/2026):
   * - `event=0`: persona habilitada, rostro y alcohol conformes. Llega con
   *   `pin=0` (el firmware no dice quién en los éxitos), pero como se habilita
   *   a **una sola persona a la vez**, solo puede ser la que está en su turno.
   * - `event=23`: rostro reconocido pero sin permiso de paso, con su `pin`
   *   (DNI): otra persona, o la misma antes de que le llegue el permiso. No
   *   cierra la espera.
   * - `event=27`: rostro (o huella, tarjeta) no registrado. Tampoco cierra la espera.
   * - `event=1`: alcohol sobre el umbral del G4 Pro (confirmado con el equipo
   *   real, 04/oct/2026). El valor medido no llega (`Concentration` viene en 0):
   *   el umbral se configura en el propio equipo ("Umbral de embriaguez").
   * - Cualquier otro código también se trata como alcohol no conforme: ante la
   *   duda, no se abre.
   */
  @OnEvent('dispositivo.rtlog')
  async correlacionarVerificacionDispositivo(evento: RtlogRecibidoEvent): Promise<void> {
    await this.enSerie(async () => {
      const enTurno = await this.enTurno();
      // En la verificación manual decide el vigilante: lo que mande el G4 Pro no cierra la espera.
      const activo = enTurno && !enTurno.manual ? enTurno : null;
      const codigo = evento.eventCode ?? '';

      if (codigo === '23' || codigo === '27') {
        const quien = evento.pin && evento.pin !== '0' ? `DNI ${evento.pin}` : 'rostro no registrado';
        if (activo && evento.pin === activo.persona.numeroDocumento) {
          this.logger.log(`G4 Pro: ${quien} todavía sin permiso (llegando); sigue en espera`);
        } else {
          this.logger.warn(
            `G4 Pro rechazó a ${quien} (event=${codigo})${activo ? `; en su turno está el DNI ${activo.persona.numeroDocumento}` : ''}`,
          );
        }
        return;
      }

      if (!activo) {
        this.logger.warn(`Llegó un rtlog (sn=${evento.serialNumber}, event=${codigo}) sin ninguna persona habilitada`);
        return;
      }

      const autorizado = codigo === '0';
      if (!autorizado && codigo !== '1') this.logger.warn(`G4 Pro: código desconocido event=${codigo}; se deniega por alcohol`);
      await this.cerrarEspera(
        activo,
        { autorizado, denegadoPorAlcohol: !autorizado, fechaHora: evento.horaDispositivo ?? undefined },
        evento.verificacionId,
      );
    });
  }

  /**
   * Esperas vencidas: la persona habilitada no completó rostro y alcohol en
   * su minuto, o un DNI esperó demasiado en cola. Quedan como ingreso
   * denegado ("No completó rostro y alcohol").
   */
  private async cerrarVencidos(): Promise<void> {
    const ahora = Date.now();
    const vencidas = (
      await this.prisma.ingresoPendiente.findMany({
        where: {
          consumidoEn: null,
          OR: [
            { habilitadoEn: { lt: new Date(ahora - VENTANA_INGRESO_PENDIENTE_MS) } },
            { habilitadoEn: null, creadoEn: { lt: new Date(ahora - ESPERA_MAXIMA_EN_COLA_MS) } },
          ],
        },
        include: { persona: true },
        orderBy: { creadoEn: 'asc' },
      })
    ).filter((p) => !this.sigueAbierta(p, ahora));
    for (const pendiente of vencidas) {
      this.logger.log(
        `DNI ${pendiente.persona.numeroDocumento}: ${pendiente.manual ? 'el vigilante no decidió a tiempo' : 'no completó rostro y alcohol a tiempo'}`,
      );
      await this.cerrarEspera(pendiente, { autorizado: false, denegadoSinVerificacion: true });
    }
    if (vencidas.length === 0) await this.habilitarSiguiente();
  }

  /** DNI en regla que todavía esperan el resultado del G4 Pro o del vigilante (habilitado y en cola), para el Panel. */
  async ingresosEnEspera(): Promise<IngresoEnEspera[]> {
    const pendientes = await this.prisma.ingresoPendiente.findMany({
      where: { consumidoEn: null, ...this.filtroAbiertos() },
      orderBy: { creadoEn: 'desc' },
      include: CON_PERSONA,
    });
    return pendientes.filter((p) => this.sigueAbierta(p)).map(aEnEspera);
  }

  /**
   * Decisión del vigilante en la verificación manual: "apto" abre el molinete;
   * "alcohol" y "no es la persona" lo deniegan (y suena el aviso de denegado).
   * Solo vale para la persona en su turno: si ya venció o la decidió otro
   * vigilante, se avisa y no se hace nada.
   */
  async decidirManual(pendienteId: number, decision: DecisionManual, usuario: AuthenticatedUser) {
    return this.enSerie(async () => {
      const enTurno = await this.enTurno();
      if (!enTurno || enTurno.id !== pendienteId || !enTurno.manual) {
        throw new BadRequestException('Esa persona ya no está esperando la verificación manual (venció o ya se decidió)');
      }
      await this.cerrarEspera(enTurno, {
        autorizado: decision === 'apto',
        denegadoPorAlcohol: decision === 'alcohol',
        denegadoRostroNoCoincide: decision === 'no-es-la-persona',
        verificadoPor: usuario,
      });
      return { ok: true };
    });
  }

  /**
   * Salida: sin antipassback; con un documento registrado (aunque esté de baja) se autoriza y abre el molinete.
   * Con `sinConexion`, el controlador ya la dejó pasar sin internet: se registra con su hora y no se abre.
   */
  async registrarSalida(dto: SalidaDto) {
    const fechaHora = dto.sinConexion ? fechaSinConexion(dto.fechaHora) : undefined;
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
        ...(fechaHora && { fechaHora }),
      },
    });

    if (!dto.sinConexion) {
      this.eventEmitter.emit('molinete.abrir', {
        torniqueteId: dto.torniqueteId,
        eventoId: evento.id,
        tipoMovimiento: 'salida',
      } satisfies AbrirMolineteEvent);
    }

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
          verificadoPor: { select: { id: true, correo: true } },
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
