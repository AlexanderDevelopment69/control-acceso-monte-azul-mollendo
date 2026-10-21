import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import { documentosActuales } from './validacion-acceso.engine.js';
import type { IngresoDto } from './dto/ingreso.dto.js';
import type { SalidaDto } from './dto/salida.dto.js';
import type { QueryEventosAccesoDto } from './dto/query-eventos-acceso.dto.js';
import type { CorreccionAntipassbackDto } from './dto/correccion-antipassback.dto.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { Persona, Prisma } from '../generated/prisma/client.js';
import { paginacion, palabras, rangoDeDias, type Paginado } from '../common/paginacion.js';
import type { AttlogRecibidoEvent, RtlogRecibidoEvent } from '../push-sdk/push-sdk.service.js';
import { leerModoAsistencia } from '../push-sdk/protocolo-g4.js';
import { alcoholConforme } from '../push-sdk/asistencia.util.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
import { VerificacionManualService } from './verificacion-manual.service.js';
import { ModoIngresoService } from './modo-ingreso.service.js';
import type { PaseExitoso } from '../push-sdk/verify-success.util.js';
import { pinDeDocumento } from '../push-sdk/comandos-acceso.util.js';
import { versionFoto } from '../common/archivos-persona.util.js';
import { TarjetasContingenciaService } from '../tarjetas-contingencia/tarjetas-contingencia.service.js';
import type { TarjetaContingencia } from '../generated/prisma/client.js';
import type { TarjetaLeidaDto } from './dto/tarjeta-leida.dto.js';
import { ControladorGateway } from '../controlador-remoto/controlador.gateway.js';

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

/**
 * G4 Pro en asistencia, orden DNI primero: el minuto es para soplar. El aviso
 * de la prueba llega 10 a 17 s después del soplido (lo que tarda el equipo en
 * decir "correcto", visto en su Verify.txt el 21/10/2026), así que la espera
 * sigue abierta esto después del minuto: vale la prueba hecha (soplada) dentro
 * del minuto aunque su aviso llegue después. Pasado esto, "No completó rostro y alcohol".
 */
const GRACIA_AVISO_G4_MS = 20 * 1000;

/** El turno más largo: para buscar en la base las esperas que pueden seguir abiertas. */
const VENTANA_MAXIMA_MS = Math.max(VENTANA_INGRESO_PENDIENTE_MS + GRACIA_AVISO_G4_MS, VENTANA_VERIFICACION_MANUAL_MS);

/** Cuánto puede esperar en cola un DNI (otra persona estaba habilitada) antes de cerrarse sin verificar. */
const ESPERA_MAXIMA_EN_COLA_MS = 3 * VENTANA_INGRESO_PENDIENTE_MS;

/**
 * Orden "facial primero" (pedido de TMAM, 17/10/2026): desde que el G4 Pro
 * aprueba rostro y alcohol, hay 20 s para pasar el DNI.
 */
const VENTANA_DNI_FACIAL_PRIMERO_MS = 20 * 1000;

/**
 * Orden "facial primero": si el DNI llega antes de saber quién aprobó (se lee
 * del G4 Pro, tarda unos segundos), se espera hasta esto. Pasado ese tiempo
 * se sigue como antes, sin confirmar quién sopló.
 */
const ESPERA_QUIEN_APROBO_MS = 6 * 1000;

/**
 * G4 Pro en asistencia: si alguien dio alcohol alto y enseguida pasa su DNI,
 * se le responde con ese rechazo (no queda esperando otra prueba).
 */
const RECHAZO_ALCOHOL_RECIENTE_MS = 60 * 1000;

/**
 * G4 Pro en asistencia, "facial primero" (pedido de TMAM, 19/10/2026): desde
 * que aparece "pase su DNI" en el Panel (llega el aviso del G4, ~1 s después
 * del "correcto"), la persona tiene esto para pasar su DNI. Contado desde la
 * hora de la prueba (la del soplido: el G4 dice "correcto" unos 8 s después,
 * visto en su Verify.txt el 21/10/2026) quedaban 5 s en el Panel y no alcanzaba. Eran 15 s; desde el 21/10/2026, 30 s (pedido de
 * TMAM: con varias personas esperando, cada aprobación es de quien sopló).
 */
const PLAZO_DNI_DESDE_AVISO_MS = 30 * 1000;

/**
 * G4 Pro en asistencia, "facial primero": el aviso de la prueba llega al
 * servidor 10-12 s después del soplido, ~1 s después del "correcto" (Verify.txt
 * del G4, 21/10/2026); si la persona pasa el DNI apenas oye "correcto", puede
 * llegar antes que el aviso. Un DNI sin aprobación espera en silencio (sin
 * mostrarse en el Panel) hasta esto a que llegue su prueba, hecha antes del
 * DNI; si no llega, "DNI antes del facial".
 */
const ESPERA_PRUEBA_EN_CAMINO_MS = 8 * 1000;

/**
 * G4 Pro en asistencia: en cada pase vale solo la primera marcación del
 * alcoholímetro (pedido de TMAM, 19/10/2026: sin bloqueos, pero volver a
 * soplar no cambia el resultado). Las marcaciones de la misma persona hasta
 * este tiempo después de la primera se ignoran; luego, un soplido nuevo es
 * otro intento.
 */
const MISMO_PASE_MS = 20 * 1000;

/**
 * Orden normal con el G4 Pro en asistencia: diferencia aceptada entre la hora
 * del G4 Pro (la de la prueba, al terminar de soplar) y la del servidor (la
 * del DNI) al decidir si la prueba fue después del DNI. Ninguna: los relojes
 * difieren en 1-2 s (medido el 19/10/2026), menos de lo que toma hacer rostro
 * y soplar después de pasar el DNI.
 */
const TOLERANCIA_RELOJ_MS = 0;

/** Salida sin DNI: desde que el vigilante elige al trabajador en el Panel, tiene esto para pasar la tarjeta. */
const VENTANA_SALIDA_SIN_DNI_MS = 2 * 60 * 1000;

/** Salida sin DNI preparada en el Panel (falta pasar la tarjeta por el lector de salida). */
export interface SalidaSinDni {
  personaId: number;
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  hasta: string;
  preparadaPor: string;
}

/** Pedido a la integración del G4 Pro: quién aprobó el rtlog de esta hora (responde por emitAsync). */
export interface QuienAproboEvent {
  serialNumber: string;
  horaDispositivo: Date;
}

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
  /** Cambia con cada foto nueva (ver versionFoto). */
  fotoVersion: string | null;
  torniqueteId: string | null;
  desde: string;
  hasta: string | null;
  enCola: boolean;
  /** La decide un vigilante (verificación manual), no el G4 Pro. */
  manual: boolean;
  /** Orden "facial primero": alguien aprobó rostro y alcohol (el equipo no dice quién) y falta su DNI. */
  esperaDni?: boolean;
}

/**
 * Orden "facial primero": la aprobación del G4 Pro que espera un DNI. El
 * `rtlog` no dice quién aprobó (manda `pin=0`); se averigua aparte en el
 * archivo de rastreo del equipo (`quien`, ver verify-success.util.ts).
 */
interface AprobacionSinDni {
  /** Para el Panel (negativo: no es una espera de la base). */
  id: number;
  en: number;
  /** Hasta cuándo sirve para pasar el DNI. */
  vence: number;
  verificacionId: number;
  /** Quién aprobó, cuando se sepa (null: no se pudo saber). */
  quien: Promise<PaseExitoso | null>;
  /** Lo mismo, ya resuelto (undefined: todavía se está leyendo). */
  quienSabido?: PaseExitoso | null;
  /** G4 Pro en asistencia: la persona del sistema que sopló (para su foto en el Panel). */
  persona?: { id: number; tieneFoto: boolean; fotoVersion: string | null };
}

/** La aprobación como fila del Panel ("Aprobó rostro y alcohol: falta que pase su DNI"). */
function aprobacionEnEspera(a: AprobacionSinDni): IngresoEnEspera {
  return {
    id: a.id,
    personaId: a.persona?.id ?? 0,
    nombres: a.quienSabido ? `Aprobó ${a.quienSabido.nombre}` : 'Aprobó rostro y alcohol',
    apellidos: '',
    numeroDocumento: a.quienSabido?.pin ?? '—',
    empresa: null,
    tieneFoto: a.persona?.tieneFoto ?? false,
    fotoVersion: a.persona?.fotoVersion ?? null,
    torniqueteId: null,
    desde: new Date(a.en).toISOString(),
    hasta: new Date(a.vence).toISOString(),
    enCola: false,
    manual: false,
    esperaDni: true,
  };
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
    fotoVersion: versionFoto(pendiente.persona.fotoUrl),
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
  /** Orden "facial primero": las aprobaciones del G4 Pro que esperan su DNI (cada una con sus 20 s). */
  private aprobaciones: AprobacionSinDni[] = [];
  /** ¿El G4 Pro está en asistencia? (se revisa con cada vuelta de cerrarVencidos; ver GRACIA_AVISO_G4_MS). */
  private asistenciaG4 = false;
  /** G4 Pro en asistencia: hora de la primera marcación del pase de cada DNI (ver MISMO_PASE_MS). */
  private primerasMarcaciones = new Map<string, number>();
  /** G4 Pro en asistencia: último alcohol alto de cada DNI (para responder a su DNI, ver RECHAZO_ALCOHOL_RECIENTE_MS). */
  private rechazosAlcohol = new Map<string, { en: number; eventoId: number }>();
  /** G4 Pro en asistencia, "facial primero": DNI que esperan en silencio su prueba (ver ESPERA_PRUEBA_EN_CAMINO_MS), por DNI. */
  private dniEsperandoPrueba = new Map<string, { persona: Persona; dto: IngresoDto; en: number }>();
  /** "Facial primero": tarjeta de contingencia pasada antes de que llegara el aviso de la prueba (como dniEsperandoPrueba). */
  private tarjetaEsperandoPrueba: { tarjeta: TarjetaContingencia; dto: TarjetaLeidaDto; en: number } | null = null;
  /** Salida sin DNI elegida en el Panel, esperando la tarjeta (una a la vez). */
  private salidaSinDni: (SalidaSinDni & { usuarioId: number }) | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly verificacionManual: VerificacionManualService,
    private readonly auditoria: AuditoriaService,
    private readonly modoIngreso: ModoIngresoService,
    private readonly tarjetas: TarjetasContingenciaService,
    private readonly controlador: ControladorGateway,
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

  /**
   * Antipassback: ¿la persona figura dentro? Sí si su último movimiento
   * autorizado es un ingreso (por el molinete o por corrección manual).
   */
  async figuraDentro(personaId: number): Promise<boolean> {
    const ultimo = await this.prisma.eventoAcceso.findFirst({
      where: { personaId, resultado: 'autorizado' },
      orderBy: [{ fechaHora: 'desc' }, { id: 'desc' }],
      select: { tipoMovimiento: true },
    });
    return ultimo?.tipoMovimiento === 'ingreso';
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

    // Con la verificación manual activa, decide el vigilante: ni el G4 Pro ni el orden "facial primero".
    const manual = await this.verificacionManual.activa();
    if (!manual && (await leerModoAsistencia(this.prisma))) {
      return this.enSerie(() => this.registrarIngresoAsistencia(persona, dto));
    }
    if (await this.facialPrimeroVigente()) {
      return this.enSerie(() => this.registrarDniAlFinal(persona, dto));
    }

    const denegado = await this.denegarSiNoCorresponde(persona, dto);
    if (denegado) return denegado;

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

  /**
   * Revisiones del DNI antes de dejarlo ingresar: dado de baja, ya figura
   * dentro (antipassback estricto: no puede volver a ingresar sin haber
   * registrado su salida), sin documentos o con alguno vencido. Devuelve el
   * ingreso denegado, o null si está en regla.
   */
  private async denegarSiNoCorresponde(persona: Persona, dto: IngresoDto) {
    if (persona.estado !== 'activo') return this.registrarIngresoDenegadoInmediato(persona, dto, { denegadoPorBaja: true });
    if (await this.figuraDentro(persona.id)) return this.registrarIngresoDenegadoInmediato(persona, dto, { denegadoYaDentro: true });
    const documentos = await this.getDocumentosActuales(persona.id);
    const documentosVencidos = documentos.filter((d) => !d.vigente).map((d) => d.nombre);
    if (documentos.length === 0 || documentosVencidos.length > 0) {
      return this.registrarIngresoDenegadoInmediato(persona, dto, {
        denegadoSinDocumentos: documentos.length === 0,
        denegadoPorDocumentos: documentosVencidos.length > 0,
        documentosVencidos,
      });
    }
    return null;
  }

  /** ¿Rige el orden "facial primero"? (con la verificación manual activa, no). */
  private async facialPrimeroVigente(): Promise<boolean> {
    return (await this.modoIngreso.facialPrimero()) && !(await this.verificacionManual.activa());
  }

  /** Las aprobaciones que esperan su DNI y siguen dentro de su plazo. */
  private aprobacionesVigentes(ahora = Date.now()): AprobacionSinDni[] {
    return this.aprobaciones.filter((a) => ahora <= a.vence);
  }

  /**
   * Monitor del G4 Pro (Sistema y APIs): anota qué hizo el sistema con la
   * prueba y/o el ingreso en que terminó, y avisa a las pantallas abiertas.
   */
  private async anotarPrueba(verificacionId: number, datos: { decision?: string; eventoAccesoId?: number }) {
    await this.prisma.verificacionDispositivo.update({ where: { id: verificacionId }, data: datos });
    this.eventEmitter.emit('g4.marcacion', { id: verificacionId });
  }

  /** Quita una aprobación (usada, vencida o repetida) de la espera y del Panel. */
  private soltarAprobacion(aprobacion: AprobacionSinDni) {
    if (!this.aprobaciones.includes(aprobacion)) return;
    this.aprobaciones = this.aprobaciones.filter((a) => a !== aprobacion);
    this.eventEmitter.emit('ingreso.espera-terminada', { id: aprobacion.id });
  }

  /**
   * Orden "facial primero": la aprobación que usa este DNI. Primero se espera
   * (a lo sumo ESPERA_QUIEN_APROBO_MS) a saber quién sopló en cada una.
   * - La de **esta persona**: se usa (confirmada).
   * - Si no hay ninguna suya y **una sola** no se sabe de quién es: se usa sin
   *   confirmar (el equipo no lo dijo a tiempo; como antes).
   * - Si todas son de **otras personas**: "No es quien sopló" (no se gasta
   *   ninguna: siguen esperando a sus dueños).
   * - Si hay varias sin saber de quién son: no se puede elegir (sin aprobación).
   */
  private async aprobacionPara(pin: string | null): Promise<
    | { tipo: 'usar'; aprobacion: AprobacionSinDni; quien: PaseExitoso | null }
    | { tipo: 'otra-persona'; quien: PaseExitoso }
    | { tipo: 'ninguna' }
  > {
    const vigentes = this.aprobacionesVigentes();
    if (vigentes.length === 0) return { tipo: 'ninguna' };
    await this.esperarQuienAprobo(vigentes);
    const propias = vigentes.filter((a) => a.quienSabido && a.quienSabido.pin === pin);
    if (propias.length > 0) {
      const aprobacion = propias[propias.length - 1];
      return { tipo: 'usar', aprobacion, quien: aprobacion.quienSabido! };
    }
    const desconocidas = vigentes.filter((a) => !a.quienSabido);
    if (desconocidas.length === 1) return { tipo: 'usar', aprobacion: desconocidas[0], quien: null };
    if (desconocidas.length === 0) return { tipo: 'otra-persona', quien: vigentes[vigentes.length - 1].quienSabido! };
    this.logger.warn(`Facial primero: ${desconocidas.length} aprobaciones sin saber de quién son; no se puede elegir`);
    return { tipo: 'ninguna' };
  }

  /**
   * Orden "facial primero" (pedido de TMAM, 17/10/2026): todo el personal
   * activo tiene permiso fijo en el G4 Pro, así que hace rostro y alcohol sin
   * pasar antes el DNI. El DNI llega al final y usa la aprobación de los
   * últimos 20 s. El `rtlog` no dice quién aprobó, pero el G4 Pro lo anota en
   * su archivo de rastreo: cada aprobación queda ligada a quien sopló, así
   * que varias personas pueden estar esperando a la vez (aprobacionPara). Si
   * sopló otra persona se deniega ("No es quien sopló"). Baja, antipassback y
   * documentos se revisan aquí, con el DNI.
   */
  private async registrarDniAlFinal(persona: Persona, dto: IngresoDto) {
    const eleccion = await this.aprobacionPara(pinDeDocumento(persona.numeroDocumento));
    // La aprobación de esta persona se usa con su DNI, entre o no: no queda para otro.
    if (eleccion.tipo === 'usar') this.soltarAprobacion(eleccion.aprobacion);

    const denegado = await this.denegarSiNoCorresponde(persona, dto);
    if (denegado) return denegado;
    if (eleccion.tipo === 'ninguna') return this.registrarIngresoDenegadoInmediato(persona, dto, { denegadoSinFacial: true });
    if (eleccion.tipo === 'otra-persona') {
      const { quien } = eleccion;
      this.logger.warn(`Facial primero: sopló el DNI ${quien.pin} (${quien.nombre}) y pasó el DNI ${persona.numeroDocumento}; se deniega`);
      return this.registrarIngresoDenegadoInmediato(persona, dto, { denegadoNoEsQuienSoplo: true, dniQueSoplo: quien.pin });
    }
    const { aprobacion: aprobada, quien } = eleccion;
    if (!quien) this.logger.warn(`Facial primero: el G4 Pro no dijo a tiempo quién sopló; DNI ${persona.numeroDocumento} sin confirmar`);
    return this.autorizarConAprobacion(persona, dto, aprobada, quien);
  }

  /** Rostro y alcohol aprobados antes del DNI (ya revisado): ingreso autorizado y se abre el molinete. */
  private async autorizarConAprobacion(persona: Persona, dto: IngresoDto, aprobada: AprobacionSinDni, quien: PaseExitoso | null) {
    const evento = await this.prisma.eventoAcceso.create({
      data: {
        personaId: persona.id,
        tipoDocumentoIdentidad: persona.tipoDocumentoIdentidad,
        numeroDocumento: persona.numeroDocumento,
        tipoMovimiento: 'ingreso',
        resultado: 'autorizado',
        facialPrimero: true,
        dniQueSoplo: quien?.pin ?? null,
        torniqueteId: dto.torniqueteId,
        tarjetaContingenciaId: dto.tarjetaContingenciaId,
        sinLector: dto.sinLector ?? false,
      },
    });
    await this.anotarPrueba(aprobada.verificacionId, { eventoAccesoId: evento.id });
    this.eventEmitter.emit('molinete.abrir', { torniqueteId: dto.torniqueteId, eventoId: evento.id, tipoMovimiento: 'ingreso' } satisfies AbrirMolineteEvent);
    const respuesta = {
      eventoId: evento.id,
      tipoMovimiento: evento.tipoMovimiento,
      resultado: evento.resultado,
      fechaHora: evento.fechaHora.toISOString(),
      persona: { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos },
      numeroDocumento: persona.numeroDocumento,
      motivos: {},
      // El Panel muestra su foto para que el vigilante la compare con quien pasa el molinete.
      facialPrimero: true,
      dniQueSoplo: evento.dniQueSoplo,
      tieneFoto: !!persona.fotoUrl,
      fotoVersion: versionFoto(persona.fotoUrl),
    };
    this.eventEmitter.emit('evento-acceso.registrado', respuesta);
    return respuesta;
  }

  /**
   * G4 Pro en asistencia (desde el 19/10/2026, ver protocolo-g4.ts): el
   * equipo dice quién hizo rostro y alcohol, cuánto dio y a qué hora
   * (`ATTLOG`), así que el DNI y la prueba se juntan por persona y con varias
   * personas a la vez (no hace falta habilitar a una sola). El orden lo manda
   * el ajuste "Orden del ingreso":
   * - **Normal**: vale solo la prueba hecha después del DNI. Queda en espera
   *   (su minuto) hasta que llegue (resultadoAsistencia).
   * - **Facial primero**: vale solo la prueba hecha antes del DNI, con el DNI
   *   en los 20 s siguientes. Si aprobó, se autoriza; si dio alcohol alto, se
   *   le responde con ese rechazo; si no hay prueba suya, espera en silencio
   *   (sin cuenta regresiva, pedido de TMAM) ESPERA_PRUEBA_EN_CAMINO_MS a que
   *   llegue (el aviso llega ~1 s después del "correcto"): si es de antes del DNI y aprobó,
   *   entra; si no, "DNI antes del facial".
   */
  private async registrarIngresoAsistencia(persona: Persona, dto: IngresoDto) {
    const facialPrimero = await this.modoIngreso.facialPrimero();
    const pin = pinDeDocumento(persona.numeroDocumento);
    const aprobacion = facialPrimero
      ? this.aprobacionesVigentes()
          .filter((a) => a.quienSabido?.pin === pin)
          .pop()
      : undefined;
    if (aprobacion) this.soltarAprobacion(aprobacion);

    const denegado = await this.denegarSiNoCorresponde(persona, dto);
    if (denegado) {
      // Su prueba aprobada se usó con este DNI, que se denegó (p. ej. ya figura dentro).
      if (aprobacion) await this.anotarPrueba(aprobacion.verificacionId, { eventoAccesoId: denegado.eventoId });
      return denegado;
    }
    if (aprobacion) return this.autorizarConAprobacion(persona, dto, aprobacion, aprobacion.quienSabido ?? null);

    const rechazo = facialPrimero && pin ? this.rechazosAlcohol.get(pin) : undefined;
    if (rechazo && Date.now() - rechazo.en <= RECHAZO_ALCOHOL_RECIENTE_MS) {
      // El rechazo ya quedó registrado (y sonó el aviso) al llegar la prueba: no se repite.
      this.rechazosAlcohol.delete(pin!);
      return {
        eventoId: rechazo.eventoId,
        tipoMovimiento: 'ingreso' as const,
        resultado: 'denegado' as const,
        persona: { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos },
        numeroDocumento: persona.numeroDocumento,
        motivos: { alcohol: true },
      };
    }

    if (facialPrimero) {
      // La prueba puede venir en camino: se la espera en silencio (resultadoAsistencia o cerrarVencidos deciden).
      if (pin) this.dniEsperandoPrueba.set(pin, { persona, dto, en: Date.now() });
      return {
        estado: 'pendiente_verificacion' as const,
        persona: { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos },
        numeroDocumento: persona.numeroDocumento,
        mensaje: 'Verificando la prueba de rostro y alcohol del equipo facial.',
      };
    }

    // Si ya está esperando (volvió a pasar el DNI), sigue la misma espera.
    const abierta = await this.esperaAbiertaDe(persona.id);
    if (!abierta) {
      const pendiente = await this.prisma.ingresoPendiente.create({
        data: { personaId: persona.id, torniqueteId: dto.torniqueteId, manual: false, habilitadoEn: new Date() },
        include: CON_PERSONA,
      });
      this.eventEmitter.emit('ingreso.en-espera', aEnEspera(pendiente));
    }
    return {
      estado: 'pendiente_verificacion' as const,
      persona: { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos },
      numeroDocumento: persona.numeroDocumento,
      mensaje: 'Documentos en regla. Esperando el resultado del equipo (rostro + alcoholímetro).',
    };
  }

  /**
   * ¿La prueba vale para esta espera (orden normal)? Debe ser de después del
   * DNI y de dentro de su minuto (soplada a tiempo; el aviso puede llegar
   * después, ver GRACIA_AVISO_G4_MS). Sin la hora del equipo, vale.
   */
  private pruebaValePara(espera: { habilitadoEn: Date | null }, horaPrueba: Date | null): boolean {
    if (!horaPrueba || !espera.habilitadoEn) return true;
    const desdeDni = horaPrueba.getTime() - espera.habilitadoEn.getTime();
    return desdeDni >= -TOLERANCIA_RELOJ_MS && desdeDni <= VENTANA_INGRESO_PENDIENTE_MS;
  }

  /** La prueba es de después del minuto de esa espera (sopló tarde). */
  private pruebaTarde(espera: { habilitadoEn: Date | null }, horaPrueba: Date | null): boolean {
    return !!horaPrueba && !!espera.habilitadoEn && horaPrueba.getTime() - espera.habilitadoEn.getTime() > VENTANA_INGRESO_PENDIENTE_MS;
  }

  /** La espera de esta persona que sigue abierta (G4 Pro en asistencia: cada una tiene la suya). */
  private async esperaAbiertaDe(personaId: number) {
    const abiertas = await this.prisma.ingresoPendiente.findMany({
      where: { personaId, consumidoEn: null, manual: false, ...this.filtroAbiertos() },
      include: { persona: true },
    });
    return abiertas.find((p) => p.habilitadoEn && this.sigueAbierta(p)) ?? null;
  }

  /**
   * G4 Pro en asistencia: llegó la prueba de una persona (`ATTLOG`: su DNI,
   * el grado de alcohol y la hora). El equipo marca todas igual (estado 255):
   * aprueba si el grado está bajo el umbral (alcoholConforme).
   * - Si su DNI la está esperando y la prueba vale en ese orden
   *   (pruebaValePara): se cierra la espera (ingresa, o se deniega por alcohol).
   * - Si no: con alcohol alto, ingreso denegado con su nombre (en los dos
   *   órdenes). Si aprobó: en "facial primero" la aprobación espera su DNI
   *   20 s; en el normal no vale (hace falta pasar antes el DNI): solo se anota.
   * Con la verificación manual activa decide el vigilante: solo se anota.
   */
  @OnEvent('dispositivo.attlog')
  async resultadoAsistencia(evento: AttlogRecibidoEvent): Promise<void> {
    await this.enSerie(async () => {
      this.asistenciaG4 = true;
      const aprobado = alcoholConforme(evento.alcohol);
      const anotar = (decision: string) => this.anotarPrueba(evento.verificacionId, { decision });
      if (await this.verificacionManual.activa()) {
        this.logger.warn(`G4 Pro: prueba del DNI ${evento.pin} (${evento.alcohol ?? 'sin grado'}) durante la verificación manual; no se usa`);
        await anotar('Verificación manual activa: decide el vigilante, la prueba no se usa');
        return;
      }
      const persona = await this.prisma.persona.findFirst({ where: { numeroDocumento: evento.pin } });
      if (!persona) {
        this.logger.warn(`G4 Pro: prueba del DNI ${evento.pin}, que no está en el sistema; no se usa`);
        await anotar('DNI que no está en el sistema: no se usa');
        return;
      }
      // Vale solo la primera marcación del pase: si vuelve a soplar enseguida, se ignora. Se anota la
      // que cuenta (cierra una espera, da alcohol alto o aprueba); una que no vale (orden normal, sin
      // DNI antes) no inicia un pase.
      const hora = (evento.horaDispositivo ?? new Date()).getTime();
      const primera = this.primerasMarcaciones.get(evento.pin);
      if (primera !== undefined && hora >= primera && hora - primera <= MISMO_PASE_MS) {
        this.logger.warn(`G4 Pro: el DNI ${evento.pin} volvió a soplar (${evento.alcohol ?? 'sin grado'}); vale la primera marcación, esta se ignora`);
        await anotar('Volvió a soplar en el mismo pase: vale la primera prueba, esta se ignora');
        return;
      }
      const cuenta = () => this.primerasMarcaciones.set(evento.pin, hora);
      this.logger.log(`G4 Pro: DNI ${evento.pin} ${aprobado ? 'aprobó' : 'NO aprobó'} rostro y alcohol (${evento.alcohol ?? 'sin grado'})`);
      const fechaHora = evento.horaDispositivo ?? undefined;

      const espera = await this.esperaAbiertaDe(persona.id);
      if (espera && this.pruebaValePara(espera, evento.horaDispositivo)) {
        cuenta();
        await anotar(aprobado ? 'Prueba después de su DNI: cierra su espera' : 'Alcohol alto después de su DNI: cierra su espera');
        await this.cerrarEspera(espera, { autorizado: aprobado, denegadoPorAlcohol: !aprobado, fechaHora }, evento.verificacionId);
        return;
      }
      const tarde = !!espera && this.pruebaTarde(espera, evento.horaDispositivo);
      if (espera) {
        this.logger.warn(
          `G4 Pro: la prueba del DNI ${evento.pin} es de ${tarde ? 'después de su minuto' : 'antes de pasar su DNI'} (orden normal); no cierra su espera`,
        );
      }
      if (!aprobado) {
        cuenta();
        await anotar('Alcohol alto: denegado con su nombre');
        // Un intento nuevo con alcohol anula lo que haya aprobado antes.
        for (const anterior of this.aprobaciones.filter((a) => a.quienSabido?.pin === evento.pin)) this.soltarAprobacion(anterior);
        const eventoId = await this.registrarSinPersona({ denegadoPorAlcohol: true, dniQueSoplo: evento.pin, fechaHora }, evento.verificacionId);
        this.rechazosAlcohol.set(evento.pin, { en: Date.now(), eventoId });
        // Si su DNI esperaba esta prueba, el rechazo por alcohol ya lo dice (sonó el aviso): no se repite.
        this.dniEsperandoPrueba.delete(evento.pin);
        // Igual con la tarjeta de contingencia que la esperaba: queda anotada como no usada.
        const tarjeta = this.tarjetaEsperandoPrueba;
        if (tarjeta && tarjeta.en >= hora - TOLERANCIA_RELOJ_MS) {
          this.tarjetaEsperandoPrueba = null;
          await this.tarjetas.anotarUso({ tarjetaId: tarjeta.tarjeta.id, tipoMovimiento: 'ingreso', aceptada: false, detalle: `No pasó el alcohol (${persona.nombres} ${persona.apellidos})` });
          this.eventEmitter.emit('tarjeta-contingencia.uso', {});
        }
        return;
      }
      this.rechazosAlcohol.delete(evento.pin);
      if (!(await this.modoIngreso.facialPrimero())) {
        this.logger.warn(`G4 Pro: el DNI ${evento.pin} hizo rostro y alcohol sin pasar antes su DNI (orden normal); no vale`);
        await anotar(
          tarde
            ? 'Orden normal: sopló después de su minuto, no vale'
            : espera
              ? 'Orden normal: prueba de antes de pasar su DNI, no vale (su espera sigue)'
              : 'Orden normal: sopló sin pasar antes su DNI, no vale',
        );
        return;
      }
      cuenta();
      const quien: PaseExitoso = { hora: evento.horaDispositivo ?? new Date(), pin: evento.pin, nombre: `${persona.nombres} ${persona.apellidos}` };
      // Volvió a aprobar en otro intento: vale solo la última.
      for (const anterior of this.aprobaciones.filter((a) => a.quienSabido?.pin === evento.pin)) this.soltarAprobacion(anterior);
      const aprobacion: AprobacionSinDni = {
        id: -evento.verificacionId,
        en: Date.now(),
        // PLAZO_DNI_DESDE_AVISO_MS desde que llega el aviso (cuando aparece "pase su DNI" en el Panel).
        vence: Date.now() + PLAZO_DNI_DESDE_AVISO_MS,
        verificacionId: evento.verificacionId,
        quien: Promise.resolve(quien),
        quienSabido: quien,
        persona: { id: persona.id, tieneFoto: !!persona.fotoUrl, fotoVersion: versionFoto(persona.fotoUrl) },
      };
      // Su DNI ya está esperando (lo pasó antes de que llegara el aviso): si lo pasó después del
      // "correcto" y dentro del plazo, entra ya.
      const dni = this.dniEsperandoPrueba.get(evento.pin);
      if (dni && dni.en >= hora - TOLERANCIA_RELOJ_MS && dni.en <= aprobacion.vence) {
        this.dniEsperandoPrueba.delete(evento.pin);
        await anotar('Aprobó; su DNI ya estaba pasado y esperando');
        const denegado = await this.denegarSiNoCorresponde(dni.persona, dni.dto);
        if (denegado) await this.anotarPrueba(evento.verificacionId, { eventoAccesoId: denegado.eventoId });
        else await this.autorizarConAprobacion(dni.persona, dni.dto, aprobacion, quien);
        return;
      }
      // La tarjeta de contingencia ya se pasó (después de la prueba) y la esperaba: se usa ya.
      const tarjeta = this.tarjetaEsperandoPrueba;
      if (tarjeta && tarjeta.en >= hora - TOLERANCIA_RELOJ_MS && tarjeta.en <= aprobacion.vence) {
        this.tarjetaEsperandoPrueba = null;
        await anotar('Aprobó; la tarjeta de contingencia ya estaba pasada y esperando');
        this.aprobaciones.push(aprobacion);
        this.eventEmitter.emit('ingreso.en-espera', aprobacionEnEspera(aprobacion));
        await this.usarTarjeta(tarjeta.tarjeta, tarjeta.dto);
        return;
      }
      // Lector de DNI de ingreso sin conexión (contingencia "sin lector"): entra con su rostro, sin esperar el DNI.
      if (this.controlador.sinLector().ingreso) {
        await anotar('Aprobó; lector de DNI de ingreso sin conexión: entra identificado por rostro');
        await this.ingresoSinLector(persona, aprobacion, quien);
        return;
      }
      await anotar(`Aprobó: "pase su DNI" (${PLAZO_DNI_DESDE_AVISO_MS / 1000} s)`);
      this.aprobaciones.push(aprobacion);
      this.eventEmitter.emit('ingreso.en-espera', aprobacionEnEspera(aprobacion));
    });
  }

  /**
   * Orden "facial primero": resultado del G4 Pro sin nadie habilitado por su
   * DNI. `event=0`: alguien aprobó; queda esperando su DNI 20 s, junto a las
   * de otras personas (se averigua quién sopló en cada una). Si la misma
   * persona vuelve a aprobar, queda solo la última. Otro código: no pasó el
   * alcohol (no se sabe quién: queda sin persona). `event=23` (sin permiso fijo, p. ej. recién registrado) y
   * `event=27` (rostro no registrado) solo se anotan.
   */
  private async resultadoFacialPrimero(evento: RtlogRecibidoEvent) {
    const codigo = evento.eventCode ?? '';
    if (codigo === '23' || codigo === '27') {
      this.logger.warn(
        codigo === '23'
          ? `Facial primero: el G4 Pro rechazó al DNI ${evento.pin} (no tiene permiso fijo: ¿de baja o recién registrado?)`
          : 'Facial primero: rostro no registrado en el G4 Pro',
      );
      return;
    }
    if (codigo === '0') {
      const aprobacion: AprobacionSinDni = {
        id: -evento.verificacionId,
        en: Date.now(),
        vence: Date.now() + VENTANA_DNI_FACIAL_PRIMERO_MS,
        verificacionId: evento.verificacionId,
        quien: this.preguntarQuienAprobo(evento),
      };
      this.aprobaciones.push(aprobacion);
      this.eventEmitter.emit('ingreso.en-espera', aprobacionEnEspera(aprobacion));
      this.logger.log('Facial primero: rostro y alcohol aprobados; esperando el DNI (20 s)');
      // Sin esperar (no se detiene a los demás): al saberse, el Panel muestra quién sopló.
      void aprobacion.quien.then((quien) => {
        aprobacion.quienSabido = quien;
        if (!quien || !this.aprobaciones.includes(aprobacion)) return;
        this.logger.log(`Facial primero: aprobó el DNI ${quien.pin} (${quien.nombre})`);
        // La misma persona volvió a soplar: vale solo la última aprobación.
        for (const anterior of this.aprobaciones.filter((a) => a !== aprobacion && a.quienSabido?.pin === quien.pin)) {
          this.soltarAprobacion(anterior);
        }
        this.eventEmitter.emit('ingreso.en-espera', aprobacionEnEspera(aprobacion));
      });
      // La tarjeta de contingencia ya se pasó y la esperaba: se usa ya (usarTarjeta espera a saber quién sopló).
      const tarjeta = this.tarjetaEsperandoPrueba;
      if (tarjeta) {
        this.tarjetaEsperandoPrueba = null;
        await this.usarTarjeta(tarjeta.tarjeta, tarjeta.dto);
      }
      return;
    }
    if (codigo !== '1') this.logger.warn(`G4 Pro: código desconocido event=${codigo}; se deniega por alcohol`);
    await this.registrarSinPersona({ denegadoPorAlcohol: true, fechaHora: evento.horaDispositivo ?? undefined }, evento.verificacionId);
  }

  /** Le pregunta a la integración del G4 Pro quién aprobó (null si no se puede saber; nunca falla). */
  private async preguntarQuienAprobo(evento: RtlogRecibidoEvent): Promise<PaseExitoso | null> {
    if (!evento.horaDispositivo) return null;
    try {
      const respuestas: unknown[] = await this.eventEmitter.emitAsync('g4pro.quien-aprobo', {
        serialNumber: evento.serialNumber,
        horaDispositivo: evento.horaDispositivo,
      } satisfies QuienAproboEvent);
      return (respuestas.find((r) => r) as PaseExitoso | undefined) ?? null;
    } catch (error) {
      this.logger.error(`Facial primero: no se pudo preguntar quién aprobó: ${(error as Error).message}`);
      return null;
    }
  }

  /** Espera a saber quién sopló en estas aprobaciones, a lo sumo ESPERA_QUIEN_APROBO_MS (las que no, quedan sin saber). */
  private async esperarQuienAprobo(aprobaciones: AprobacionSinDni[]): Promise<void> {
    const pendientes = aprobaciones.filter((a) => a.quienSabido === undefined);
    if (pendientes.length === 0) return;
    let limite: NodeJS.Timeout | undefined;
    const tarde = new Promise<void>((r) => (limite = setTimeout(r, ESPERA_QUIEN_APROBO_MS)));
    try {
      await Promise.race([Promise.all(pendientes.map((a) => a.quien)), tarde]);
      // Deja correr el .then que anota quienSabido en cada una.
      await Promise.resolve();
    } finally {
      clearTimeout(limite);
    }
  }

  /** Orden "facial primero": denegado sin DNI (no pasó el alcohol, o nadie pasó su DNI a tiempo). Devuelve el id del evento. */
  private async registrarSinPersona(
    motivos: { denegadoPorAlcohol?: boolean; denegadoSinDni?: boolean; fechaHora?: Date; dniQueSoplo?: string },
    verificacionId?: number,
  ): Promise<number> {
    // Si el G4 Pro dijo quién sopló (y no pasó su DNI a tiempo), el rechazo queda con su nombre.
    const persona = motivos.dniQueSoplo ? await this.findPersonaPorDocumento('DNI', motivos.dniQueSoplo) : null;
    const evento = await this.prisma.eventoAcceso.create({
      data: {
        tipoMovimiento: 'ingreso',
        resultado: 'denegado',
        denegadoPorAlcohol: motivos.denegadoPorAlcohol ?? false,
        denegadoSinDni: motivos.denegadoSinDni ?? false,
        facialPrimero: true,
        ...(motivos.dniQueSoplo ? { dniQueSoplo: motivos.dniQueSoplo } : {}),
        ...(persona
          ? { personaId: persona.id, tipoDocumentoIdentidad: persona.tipoDocumentoIdentidad, numeroDocumento: persona.numeroDocumento }
          : {}),
        ...(motivos.fechaHora ? { fechaHora: motivos.fechaHora } : {}),
      },
    });
    if (verificacionId) await this.anotarPrueba(verificacionId, { eventoAccesoId: evento.id });
    this.eventEmitter.emit('evento-acceso.registrado', {
      eventoId: evento.id,
      tipoMovimiento: evento.tipoMovimiento,
      resultado: evento.resultado,
      fechaHora: evento.fechaHora.toISOString(),
      persona: persona ? { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos } : null,
      numeroDocumento: persona?.numeroDocumento ?? null,
      motivos: { alcohol: !!motivos.denegadoPorAlcohol, sinDni: !!motivos.denegadoSinDni },
      facialPrimero: true,
    });
    return evento.id;
  }

  /** Dado de baja, ya figura dentro, sin documentos, con alguno vencido o (facial primero) sin aprobación: se deniega aquí mismo. */
  private async registrarIngresoDenegadoInmediato(
    persona: Persona,
    dto: IngresoDto,
    motivos: {
      denegadoPorBaja?: boolean;
      denegadoYaDentro?: boolean;
      denegadoSinDocumentos?: boolean;
      denegadoPorDocumentos?: boolean;
      documentosVencidos?: string[];
      denegadoSinFacial?: boolean;
      /** Facial primero: el G4 Pro dice que sopló otra persona (su DNI). */
      denegadoNoEsQuienSoplo?: boolean;
      dniQueSoplo?: string;
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
        denegadoYaDentro: motivos.denegadoYaDentro ?? false,
        denegadoSinDocumentos: motivos.denegadoSinDocumentos ?? false,
        denegadoPorDocumentos: motivos.denegadoPorDocumentos ?? false,
        denegadoSinFacial: motivos.denegadoSinFacial ?? false,
        denegadoNoEsQuienSoplo: motivos.denegadoNoEsQuienSoplo ?? false,
        ...(motivos.denegadoNoEsQuienSoplo ? { facialPrimero: true, dniQueSoplo: motivos.dniQueSoplo ?? null } : {}),
        torniqueteId: dto.torniqueteId,
        tarjetaContingenciaId: dto.tarjetaContingenciaId,
        sinLector: dto.sinLector ?? false,
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
        yaDentro: motivos.denegadoYaDentro ?? false,
        sinDocumentos: motivos.denegadoSinDocumentos ?? false,
        documentos: motivos.denegadoPorDocumentos ?? false,
        documentosVencidos: motivos.documentosVencidos ?? [],
        sinFacial: motivos.denegadoSinFacial ?? false,
        noEsQuienSoplo: motivos.denegadoNoEsQuienSoplo ?? false,
      },
      ...(motivos.denegadoNoEsQuienSoplo ? { dniQueSoplo: motivos.dniQueSoplo ?? null } : {}),
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
    // En asistencia, la espera del G4 sigue abierta un poco más: llega el aviso de quien sopló a tiempo.
    const gracia = !p.manual && this.asistenciaG4 ? GRACIA_AVISO_G4_MS : 0;
    return p.habilitadoEn
      ? p.habilitadoEn.getTime() >= ahora - ventanaDe(p) - gracia
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
    if (verificacionId) this.eventEmitter.emit('g4.marcacion', { id: verificacionId });
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
   *
   * En el orden "facial primero", sin nadie habilitado por su DNI, el
   * resultado lo atiende resultadoFacialPrimero.
   */
  @OnEvent('dispositivo.rtlog')
  async correlacionarVerificacionDispositivo(evento: RtlogRecibidoEvent): Promise<void> {
    await this.enSerie(async () => {
      const enTurno = await this.enTurno();
      // En la verificación manual decide el vigilante: lo que mande el G4 Pro no cierra la espera.
      const activo = enTurno && !enTurno.manual ? enTurno : null;
      const codigo = evento.eventCode ?? '';

      if (!enTurno && (await this.facialPrimeroVigente())) {
        await this.resultadoFacialPrimero(evento);
        return;
      }

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
    this.asistenciaG4 = await leerModoAsistencia(this.prisma);
    const ahora = Date.now();
    for (const [pin, hora] of this.primerasMarcaciones) if (ahora - hora > 2 * MISMO_PASE_MS) this.primerasMarcaciones.delete(pin);
    // Facial primero (G4 Pro en asistencia): DNI cuya prueba no llegó en ESPERA_PRUEBA_EN_CAMINO_MS.
    for (const [pin, dni] of this.dniEsperandoPrueba) {
      if (ahora - dni.en < ESPERA_PRUEBA_EN_CAMINO_MS) continue;
      this.dniEsperandoPrueba.delete(pin);
      this.logger.log(`Facial primero: el DNI ${pin} pasó su DNI sin haber hecho antes rostro y alcohol`);
      await this.registrarIngresoDenegadoInmediato(dni.persona, dni.dto, { denegadoSinFacial: true });
    }
    // Tarjeta de contingencia pasada sin que nadie aprobara rostro y alcohol antes.
    const tarjeta = this.tarjetaEsperandoPrueba;
    if (tarjeta && ahora - tarjeta.en >= ESPERA_PRUEBA_EN_CAMINO_MS) {
      this.tarjetaEsperandoPrueba = null;
      await this.rechazarTarjeta(tarjeta.tarjeta.id, 'ingreso', 'Nadie aprobó rostro y alcohol antes de pasar la tarjeta');
    }
    // Salida sin DNI elegida en el Panel a la que no le pasaron la tarjeta a tiempo.
    if (this.salidaSinDni && Date.parse(this.salidaSinDni.hasta) < ahora) {
      this.logger.log(`Salida sin DNI de ${this.salidaSinDni.numeroDocumento}: no se pasó la tarjeta a tiempo`);
      this.cambiarSalidaSinDni(null);
    }
    // Facial primero: aprobaciones cuyo dueño no pasó su DNI en 20 s.
    const vigentes = this.aprobacionesVigentes(ahora);
    for (const vencida of this.aprobaciones.filter((a) => !vigentes.includes(a))) {
      this.soltarAprobacion(vencida);
      const quien = vencida.quienSabido ?? null;
      this.logger.log(`Facial primero: ${quien ? `el DNI ${quien.pin}` : 'nadie'} no pasó su DNI en 20 s después de aprobar`);
      await this.registrarSinPersona({ denegadoSinDni: true, dniQueSoplo: quien?.pin }, vencida.verificacionId);
    }
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
    const aprobaciones = this.aprobacionesVigentes().reverse().map(aprobacionEnEspera);
    return [...aprobaciones, ...pendientes.filter((p) => this.sigueAbierta(p)).map(aEnEspera)];
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
   * Salida: con un documento registrado (aunque esté de baja) y un ingreso
   * registrado antes (antipassback estricto), se autoriza y abre el molinete.
   * Sin ingreso registrado se deniega: el vigilante lo corrige con un ingreso
   * manual (ver registrarCorreccion). Con `sinConexion`, el controlador ya la
   * dejó pasar sin internet (no puede saber quién está dentro): se registra con
   * su hora, como autorizada, y no se abre.
   */
  async registrarSalida(dto: SalidaDto) {
    const fechaHora = dto.sinConexion ? fechaSinConexion(dto.fechaHora) : undefined;
    const persona = await this.findPersonaPorDocumento(dto.tipoDocumentoIdentidad, dto.numeroDocumento);
    if (!persona) {
      return this.registrarNoRegistrada(dto, 'salida');
    }

    // Antipassback estricto: no sale sin un ingreso registrado (no se abre).
    if (!dto.sinConexion && !(await this.figuraDentro(persona.id))) {
      const denegado = await this.prisma.eventoAcceso.create({
        data: {
          personaId: persona.id,
          tipoDocumentoIdentidad: persona.tipoDocumentoIdentidad,
          numeroDocumento: persona.numeroDocumento,
          tipoMovimiento: 'salida',
          resultado: 'denegado',
          denegadoSinIngreso: true,
          torniqueteId: dto.torniqueteId,
          tarjetaContingenciaId: dto.tarjetaContingenciaId,
          verificadoPorId: dto.verificadoPorId,
          sinLector: dto.sinLector ?? false,
        },
      });
      const respuesta = {
        eventoId: denegado.id,
        tipoMovimiento: denegado.tipoMovimiento,
        resultado: denegado.resultado,
        fechaHora: denegado.fechaHora.toISOString(),
        persona: { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos },
        numeroDocumento: persona.numeroDocumento,
        motivos: { sinIngreso: true },
      };
      this.eventEmitter.emit('evento-acceso.registrado', respuesta);
      return respuesta;
    }

    const evento = await this.prisma.eventoAcceso.create({
      data: {
        personaId: persona.id,
        tipoDocumentoIdentidad: persona.tipoDocumentoIdentidad,
        numeroDocumento: persona.numeroDocumento,
        tipoMovimiento: 'salida',
        resultado: 'autorizado',
        torniqueteId: dto.torniqueteId,
        tarjetaContingenciaId: dto.tarjetaContingenciaId,
        verificadoPorId: dto.verificadoPorId,
        sinLector: dto.sinLector ?? false,
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
   * Tarjeta de contingencia pasada por un lector en lugar del DNI (el
   * trabajador lo olvidó o el lector no lo reconoce). Sola no abre:
   * - **Ingreso** ("facial primero"): usa la aprobación de rostro y alcohol
   *   que espera su DNI, y entra quien aprobó (usarTarjeta). Si la aprobación
   *   todavía no llegó (el aviso del G4 tarda unos segundos), la espera como
   *   un DNI (ESPERA_PRUEBA_EN_CAMINO_MS).
   * - **Salida**: sale el trabajador que eligió el vigilante en el Panel
   *   ("Salida sin DNI").
   * Cada vez queda anotada en los usos de la tarjeta, aceptada o no.
   */
  async registrarTarjeta(dto: TarjetaLeidaDto) {
    const revisada = await this.tarjetas.revisar(dto.codigo);
    if ('rechazo' in revisada) return this.rechazarTarjeta(revisada.tarjetaId, dto.tipoMovimiento, revisada.rechazo);
    const { tarjeta } = revisada;
    return dto.tipoMovimiento === 'ingreso'
      ? this.enSerie(() => this.ingresoConTarjeta(tarjeta, dto))
      : this.enSerie(() => this.salidaConTarjeta(tarjeta, dto));
  }

  /** La tarjeta no sirvió: se anota, suena el aviso de denegado de esa puerta y no se abre. */
  private async rechazarTarjeta(tarjetaId: number | null, tipoMovimiento: 'ingreso' | 'salida', detalle: string) {
    this.logger.warn(`Tarjeta de contingencia en ${tipoMovimiento}: ${detalle}`);
    await this.tarjetas.anotarUso({ tarjetaId, tipoMovimiento, aceptada: false, detalle });
    this.eventEmitter.emit('aviso.denegado', { tipoMovimiento });
    this.eventEmitter.emit('tarjeta-contingencia.uso', {});
    return { resultado: 'denegado' as const, mensaje: detalle };
  }

  private async ingresoConTarjeta(tarjeta: TarjetaContingencia, dto: TarjetaLeidaDto) {
    if (await this.verificacionManual.activa()) {
      return this.rechazarTarjeta(tarjeta.id, 'ingreso', 'Verificación manual activa: el ingreso lo decide el vigilante en el Panel');
    }
    if (!(await this.modoIngreso.facialPrimero())) {
      return this.rechazarTarjeta(tarjeta.id, 'ingreso', 'La tarjeta solo es válida con el orden "facial primero"');
    }
    if (this.aprobacionesVigentes().length === 0) {
      this.tarjetaEsperandoPrueba = { tarjeta, dto, en: Date.now() };
      return { estado: 'pendiente_verificacion' as const, mensaje: 'Verificando la prueba de rostro y alcohol del equipo facial.' };
    }
    return this.usarTarjeta(tarjeta, dto);
  }

  /**
   * Ingreso con tarjeta: entra quien aprobó rostro y alcohol (la aprobación
   * que espera su DNI). Debe haber **una sola** esperando: con varias no se
   * sabe a quién dejar pasar. Baja, antipassback y documentos se revisan como
   * con el DNI.
   */
  private async usarTarjeta(tarjeta: TarjetaContingencia, dto: TarjetaLeidaDto) {
    const vigentes = this.aprobacionesVigentes();
    if (vigentes.length === 0) return this.rechazarTarjeta(tarjeta.id, 'ingreso', 'Nadie aprobó rostro y alcohol antes de pasar la tarjeta');
    if (vigentes.length > 1) {
      return this.rechazarTarjeta(tarjeta.id, 'ingreso', 'Varias personas aprobaron rostro y alcohol a la vez: no se sabe a quién dejar pasar');
    }
    const [aprobacion] = vigentes;
    await this.esperarQuienAprobo(vigentes);
    const quien = aprobacion.quienSabido ?? null;
    if (!quien) return this.rechazarTarjeta(tarjeta.id, 'ingreso', 'El equipo facial no dijo quién aprobó rostro y alcohol');
    const persona = aprobacion.persona
      ? await this.prisma.persona.findUnique({ where: { id: aprobacion.persona.id } })
      : await this.prisma.persona.findFirst({ where: { numeroDocumento: quien.pin } });
    if (!persona) return this.rechazarTarjeta(tarjeta.id, 'ingreso', `Quien aprobó (${quien.pin}) no está en el sistema`);
    this.soltarAprobacion(aprobacion);

    const ingreso: IngresoDto = {
      tipoDocumentoIdentidad: persona.tipoDocumentoIdentidad,
      numeroDocumento: persona.numeroDocumento,
      torniqueteId: dto.torniqueteId,
      tarjetaContingenciaId: tarjeta.id,
    };
    this.logger.log(`Tarjeta de contingencia ${tarjeta.numero}: ingreso de ${persona.numeroDocumento} (aprobó rostro y alcohol)`);
    const denegado = await this.denegarSiNoCorresponde(persona, ingreso);
    const respuesta = denegado ?? (await this.autorizarConAprobacion(persona, ingreso, aprobacion, quien));
    if (denegado) await this.anotarPrueba(aprobacion.verificacionId, { eventoAccesoId: denegado.eventoId });
    await this.tarjetas.anotarUso({
      tarjetaId: tarjeta.id,
      tipoMovimiento: 'ingreso',
      aceptada: true,
      detalle: denegado ? 'Ingreso denegado (ver el motivo en el Panel)' : 'Ingreso',
      eventoAccesoId: respuesta.eventoId,
    });
    this.eventEmitter.emit('tarjeta-contingencia.uso', {});
    return respuesta;
  }

  private async salidaConTarjeta(tarjeta: TarjetaContingencia, dto: TarjetaLeidaDto) {
    const preparada = this.salidaSinDni;
    if (!preparada || Date.parse(preparada.hasta) < Date.now()) {
      return this.rechazarTarjeta(tarjeta.id, 'salida', 'Nadie eligió al personal en el Panel ("Salida sin DNI")');
    }
    this.cambiarSalidaSinDni(null);
    const persona = await this.prisma.persona.findUnique({ where: { id: preparada.personaId } });
    if (!persona) return this.rechazarTarjeta(tarjeta.id, 'salida', 'El personal elegido ya no está en el sistema');
    this.logger.log(`Tarjeta de contingencia ${tarjeta.numero}: salida de ${persona.numeroDocumento} (eligió ${preparada.preparadaPor})`);
    const respuesta = await this.registrarSalida({
      tipoDocumentoIdentidad: persona.tipoDocumentoIdentidad,
      numeroDocumento: persona.numeroDocumento,
      torniqueteId: dto.torniqueteId,
      tarjetaContingenciaId: tarjeta.id,
      verificadoPorId: preparada.usuarioId,
    });
    await this.tarjetas.anotarUso({
      tarjetaId: tarjeta.id,
      tipoMovimiento: 'salida',
      aceptada: true,
      detalle: respuesta.resultado === 'autorizado' ? 'Salida' : 'Salida denegada (ver el motivo en el Panel)',
      eventoAccesoId: respuesta.eventoId,
    });
    this.eventEmitter.emit('tarjeta-contingencia.uso', {});
    return respuesta;
  }

  /**
   * Contingencia "sin lector", ingreso: con el lector de DNI de ingreso
   * desconectado, quien aprobó rostro y alcohol entra sin pasar el DNI
   * (identificado por rostro). Baja, antipassback y documentos se revisan igual.
   */
  private async ingresoSinLector(persona: Persona, aprobacion: AprobacionSinDni, quien: PaseExitoso) {
    const ingreso: IngresoDto = {
      tipoDocumentoIdentidad: persona.tipoDocumentoIdentidad,
      numeroDocumento: persona.numeroDocumento,
      sinLector: true,
    };
    this.logger.log(`Sin lector de DNI de ingreso: ingreso de ${persona.numeroDocumento} (identificado por rostro)`);
    const denegado = await this.denegarSiNoCorresponde(persona, ingreso);
    if (denegado) await this.anotarPrueba(aprobacion.verificacionId, { eventoAccesoId: denegado.eventoId });
    else await this.autorizarConAprobacion(persona, ingreso, aprobacion, quien);
  }

  /** Puertas con el lector de DNI desconectado (contingencia "sin lector"), para el Panel. */
  sinLector() {
    return this.controlador.sinLector();
  }

  /**
   * Contingencia "sin lector", salida: con el lector de DNI de salida
   * desconectado, el vigilante abre desde "Presentes ahora" la salida de quien
   * figura dentro. Queda a su nombre y con quién la abrió.
   */
  async salidaSinLector(personaId: number, usuario: AuthenticatedUser) {
    if (!this.controlador.sinLector().salida) throw new BadRequestException('El lector de salida ya está conectado: la persona pasa su DNI');
    const persona = await this.prisma.persona.findUnique({ where: { id: personaId } });
    if (!persona) throw new NotFoundException('Persona no encontrada');
    return this.enSerie(async () => {
      if (!(await this.figuraDentro(persona.id))) throw new BadRequestException('Esa persona figura fuera: no tiene una salida pendiente');
      this.logger.log(`Salida sin lector: ${persona.numeroDocumento} (abrió ${usuario.correo})`);
      const respuesta = await this.registrarSalida({
        tipoDocumentoIdentidad: persona.tipoDocumentoIdentidad,
        numeroDocumento: persona.numeroDocumento,
        verificadoPorId: usuario.id,
        sinLector: true,
      });
      // Abre el molinete sin DNI: también en la Auditoría.
      await this.auditoria.registrar({
        usuarioId: usuario.id,
        tablaAfectada: 'molinete',
        registroId: respuesta.eventoId,
        accion: 'apertura',
        detalle: `Salida sin lector: ${persona.nombres} ${persona.apellidos} (DNI ${persona.numeroDocumento})`.slice(0, 200),
      });
      return respuesta;
    });
  }

  /** Salida sin DNI esperando la tarjeta, para el Panel (null: ninguna). */
  salidaSinDniPreparada(): SalidaSinDni | null {
    if (!this.salidaSinDni || Date.parse(this.salidaSinDni.hasta) < Date.now()) return null;
    const { usuarioId: _usuario, ...salida } = this.salidaSinDni;
    return salida;
  }

  private cambiarSalidaSinDni(salida: (SalidaSinDni & { usuarioId: number }) | null) {
    this.salidaSinDni = salida;
    this.eventEmitter.emit('salida-sin-dni.cambio', this.salidaSinDniPreparada());
  }

  /**
   * Salida sin DNI: el vigilante elige en el Panel al trabajador (debe figurar
   * dentro) y tiene VENTANA_SALIDA_SIN_DNI_MS para pasar la tarjeta por el
   * lector de salida. Una a la vez: elegir otro reemplaza al anterior.
   */
  async prepararSalidaSinDni(personaId: number, usuario: AuthenticatedUser): Promise<SalidaSinDni> {
    const persona = await this.prisma.persona.findUnique({ where: { id: personaId } });
    if (!persona) throw new NotFoundException('Persona no encontrada');
    if (!(await this.figuraDentro(persona.id))) throw new BadRequestException('Esa persona figura fuera: no tiene una salida pendiente');
    this.cambiarSalidaSinDni({
      personaId: persona.id,
      nombres: persona.nombres,
      apellidos: persona.apellidos,
      numeroDocumento: persona.numeroDocumento,
      hasta: new Date(Date.now() + VENTANA_SALIDA_SIN_DNI_MS).toISOString(),
      preparadaPor: usuario.correo,
      usuarioId: usuario.id,
    });
    await this.auditoria.registrar({
      usuarioId: usuario.id,
      tablaAfectada: 'salida_sin_dni',
      registroId: persona.id,
      accion: 'crear',
      detalle: `Eligió a ${persona.nombres} ${persona.apellidos} (DNI ${persona.numeroDocumento}) para salir con la tarjeta`.slice(0, 200),
    });
    return this.salidaSinDniPreparada()!;
  }

  /** Salida sin DNI: quienes figuran dentro y coinciden con la búsqueda (nombre o documento), para elegir. */
  async buscarDentro(busqueda: string | undefined) {
    const buscadas = palabras(busqueda);
    if (buscadas.length === 0) return [];
    const personas = await this.prisma.persona.findMany({
      where: {
        AND: buscadas.map((palabra) => ({
          OR: [
            { numeroDocumento: { contains: palabra, mode: 'insensitive' as const } },
            { nombres: { contains: palabra, mode: 'insensitive' as const } },
            { apellidos: { contains: palabra, mode: 'insensitive' as const } },
          ],
        })),
      },
      include: { empresa: { select: { razonSocial: true } } },
      orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
      take: 20,
    });
    const dentro = await Promise.all(personas.map((p) => this.figuraDentro(p.id)));
    return personas
      .filter((_, i) => dentro[i])
      .map((p) => ({
        id: p.id,
        nombres: p.nombres,
        apellidos: p.apellidos,
        numeroDocumento: p.numeroDocumento,
        empresa: p.empresa?.razonSocial ?? null,
        tieneFoto: !!p.fotoUrl,
        fotoVersion: versionFoto(p.fotoUrl),
      }));
  }

  async cancelarSalidaSinDni(usuario?: AuthenticatedUser): Promise<{ ok: true }> {
    const cancelada = this.salidaSinDni;
    if (cancelada) {
      this.cambiarSalidaSinDni(null);
      await this.auditoria.registrar({
        usuarioId: usuario?.id ?? null,
        tablaAfectada: 'salida_sin_dni',
        registroId: cancelada.personaId,
        accion: 'eliminar',
        detalle: `Canceló la salida sin DNI de ${cancelada.nombres} ${cancelada.apellidos} (DNI ${cancelada.numeroDocumento})`.slice(0, 200),
      });
    }
    return { ok: true };
  }

  /**
   * Corrección manual del antipassback (vigilante o administrador): registra
   * la salida de quien figura dentro (p. ej. salió en una emergencia con los
   * brazos del molinete liberados) o el ingreso de quien figura fuera (entró
   * sin marcar). No abre el molinete: después la persona pasa su DNI como
   * siempre. Queda con el motivo, quién la hizo y en la auditoría; no suma
   * horas-hombre (no pasó por el molinete).
   */
  async registrarCorreccion(dto: CorreccionAntipassbackDto, usuario: AuthenticatedUser) {
    const persona = await this.prisma.persona.findUnique({ where: { id: dto.personaId } });
    if (!persona) throw new NotFoundException('Persona no encontrada');
    const dentro = await this.figuraDentro(persona.id);
    if (dto.tipoMovimiento === 'salida' && !dentro) {
      throw new BadRequestException('Esa persona ya figura fuera: no hace falta registrar su salida');
    }
    if (dto.tipoMovimiento === 'ingreso' && dentro) {
      throw new BadRequestException('Esa persona ya figura dentro: no hace falta registrar su ingreso');
    }
    const evento = await this.prisma.eventoAcceso.create({
      data: {
        personaId: persona.id,
        tipoDocumentoIdentidad: persona.tipoDocumentoIdentidad,
        numeroDocumento: persona.numeroDocumento,
        tipoMovimiento: dto.tipoMovimiento,
        resultado: 'autorizado',
        correccionManual: true,
        motivoCorreccion: dto.motivo,
        verificadoPorId: usuario.id,
      },
    });
    await this.auditoria.registrar({ usuarioId: usuario.id, tablaAfectada: 'evento_acceso', registroId: evento.id, accion: 'crear' });
    const respuesta = {
      eventoId: evento.id,
      tipoMovimiento: evento.tipoMovimiento,
      resultado: evento.resultado,
      fechaHora: evento.fechaHora.toISOString(),
      persona: { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos },
      numeroDocumento: persona.numeroDocumento,
      motivos: {},
      correccionManual: true,
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
    const [filas, total] = await Promise.all([
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
              perfil: true,
              fotoUrl: true,
            },
          },
          verificadoPor: { select: { id: true, correo: true } },
          tarjetaContingencia: { select: { numero: true } },
        },
        orderBy: [{ fechaHora: 'desc' }, { id: 'desc' }],
        skip,
        take,
      }),
      this.prisma.eventoAcceso.count({ where }),
    ]);
    // La miniatura del Panel: solo si tiene foto, sin mandar la ruta del archivo.
    const conFoto = filas.map(({ persona, ...evento }) => ({
      ...evento,
      persona: persona && (({ fotoUrl, ...p }) => ({ ...p, tieneFoto: !!fotoUrl, fotoVersion: versionFoto(fotoUrl) }))(persona),
    }));
    return { datos: conFoto, total, pagina, porPagina } satisfies Paginado<(typeof conFoto)[number]>;
  }
}
