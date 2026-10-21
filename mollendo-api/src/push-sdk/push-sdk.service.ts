import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomBytes, randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import type { EstadoComando } from '../generated/prisma/enums.js';
import { convertirFotoParaG4Pro } from './foto-g4pro.util.js';
import {
  comandosBorrarPersona,
  comandoDeshabilitar,
  comandoFoto,
  comandoHabilitar,
  comandosPersona,
  conteoDeRespuesta,
  esPermisoDePaso,
  loteDeComandos,
  MAX_COMANDOS_POR_ENTREGA,
  pinDeDocumento,
  pinsDeRespuestaUsuarios,
  planDeSincronizacion,
  type PersonaParaEquipo,
  usuariosConDatosDistintos,
} from './comandos-acceso.util.js';
import { comandoBorrarPersonaAsistencia, comandoPersonaAsistencia, leerRegistroAsistencia, usuarioComoControlDeAcceso } from './asistencia.util.js';
import { guardarModoAsistencia, leerModoAsistencia } from './protocolo-g4.js';
import { leerSnapshot } from './attphoto.util.js';
import { COMANDO_VERIFY_SUCCESS, leerVerifySuccess, paseDelRtlog, type PaseExitoso } from './verify-success.util.js';

/**
 * Emitido cuando llega un registro de asistencia (`table=ATTLOG`) reciente:
 * quién se verificó y cuánto alcohol dio (ver EventosAccesoService).
 */
export interface AttlogRecibidoEvent {
  verificacionId: number;
  serialNumber: string;
  /** DNI (número de usuario en el equipo). */
  pin: string;
  horaDispositivo: Date | null;
  /** Grado de alcohol como lo envía el equipo ("0.000951g/L"), o null. */
  alcohol: string | null;
}

/**
 * Un registro de asistencia más viejo que esto (el equipo los reenvía al
 * volver la conexión) se guarda, pero no decide ningún ingreso: la persona ya
 * no está frente al molinete. Normalmente llega a los 10-15 s.
 */
const ATTLOG_RECIENTE_MS = 2 * 60 * 1000;

/** Emitido cuando llega un table=rtlog real del equipo (ver EventosAccesoService). */
export interface RtlogRecibidoEvent {
  verificacionId: number;
  serialNumber: string;
  horaDispositivo: Date | null;
  eventCode: string | null;
  concentracion: string | null;
  /** Número de usuario (DNI) que reconoció el equipo; llega en "0" en los ingresos exitosos. */
  pin: string | null;
}

export interface EstadoDispositivo {
  serialNumber: string;
  enLinea: boolean;
  ultimaActividad: string | null;
  ipAddress: string | null;
  /** IP en la red de la garita (la que informa el equipo al registrarse). */
  ipLocal: string | null;
}

/**
 * El equipo llama a /iclock/getrequest cada ~2 segundos mientras está
 * conectado (confirmado con el equipo real); si no se ha visto en este
 * tiempo, se considera desconectado. Mismo criterio (2 minutos) que usa por
 * defecto la librería de referencia con la que se probó el protocolo.
 */
const UMBRAL_EN_LINEA_MS = 2 * 60 * 1000;

/**
 * Umbral más corto SOLO para el estado que muestra el portal (Sistema y APIs):
 * como el equipo llama cada ~2 s, con 20 s (≈10 llamadas) se ve "Desconectado"
 * pronto si se apaga, sin falsas alarmas por un microcorte. La sincronización
 * sigue usando el de 2 min (no conviene descartar un equipo apenas se atrasa).
 */
const UMBRAL_EN_LINEA_PORTAL_MS = 20 * 1000;

/**
 * Protocolo ADMS/PUSH real del equipo ZKTeco G4 Pro, implementado a partir de
 * lo validado contra el equipo físico HSR3263100192 (ver
 * Analisis_Control_Acceso_Mollendo.md sección 6.1 y docs/g4pro/Historial_Integracion_G4Pro.md).
 *
 * Dos piezas no están documentadas por el fabricante y son indispensables para
 * que el equipo mande datos reales:
 * - /iclock/registry debe responder "RegistryCode=<algo>" (nunca "OK"), con el
 *   mismo código en cada llamada del mismo equipo.
 * - /iclock/push debe existir y responder con una sesión (SessionID, etc).
 * Sin esto, el equipo se queda conectado (sigue llamando /iclock/getrequest)
 * pero nunca sube table=rtlog/rtstate ni ningún dato real.
 */
@Injectable()
export class PushSdkService {
  private readonly logger = new Logger(PushSdkService.name);
  /** Equipos a los que ya se les pidió "INFO" desde que arrancó la API (una vez por equipo). */
  private readonly infoPedida = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /** Busca o crea el dispositivo, generando su RegistryCode la primera vez. */
  async obtenerOCrearDispositivo(serialNumber: string, ipAddress?: string, ipLocal?: string | null) {
    const existente = await this.prisma.dispositivoAcceso.findUnique({ where: { serialNumber } });
    if (existente) {
      return this.prisma.dispositivoAcceso.update({
        where: { id: existente.id },
        data: { ultimaActividad: new Date(), ipAddress: ipAddress ?? existente.ipAddress, ...(ipLocal ? { ipLocal } : {}) },
      });
    }
    const registryCode = randomBytes(5).toString('hex');
    this.logger.log(`Nuevo equipo registrado: ${serialNumber} (RegistryCode=${registryCode})`);
    return this.prisma.dispositivoAcceso.create({
      data: { serialNumber, registryCode, ipAddress, ipLocal: ipLocal ?? null, ultimaActividad: new Date() },
    });
  }

  /**
   * Pide al equipo sus datos (comando INFO) la primera vez que se conecta
   * desde que arrancó la API: responde por /iclock/devicecmd con su IP en la
   * garita, entre otros datos. Así la IP está aunque el equipo no se haya
   * vuelto a registrar (solo lo hace al encenderse o tras un corte).
   */
  async pedirInfoUnaVez(serialNumber: string) {
    if (this.infoPedida.has(serialNumber)) return;
    this.infoPedida.add(serialNumber);
    try {
      await this.encolarComando(serialNumber, 'INFO');
    } catch {
      this.infoPedida.delete(serialNumber); // todavía no registrado: se intenta en la próxima llamada
    }
  }

  /** IP en la garita que informó el equipo (en el registro o en la respuesta a INFO). */
  async guardarIpLocal(serialNumber: string, ipLocal: string) {
    await this.prisma.dispositivoAcceso.updateMany({ where: { serialNumber }, data: { ipLocal } });
  }

  async tocarActividad(serialNumber: string, ipAddress?: string) {
    await this.prisma.dispositivoAcceso.updateMany({
      where: { serialNumber },
      data: { ultimaActividad: new Date(), ...(ipAddress ? { ipAddress } : {}) },
    });
  }

  /** ¿El G4 Pro está en la variante de asistencia? (ver protocolo-g4.ts). */
  modoAsistencia(): Promise<boolean> {
    return leerModoAsistencia(this.prisma);
  }

  /** El equipo anunció su variante (al pedir sus opciones o al enviar un ATTLOG). */
  async anotarVariante(serialNumber: string, asistencia: boolean) {
    if (await guardarModoAsistencia(this.prisma, asistencia)) {
      this.logger.warn(`G4 Pro ${serialNumber}: ahora está en la variante de ${asistencia ? 'asistencia (ATT)' : 'control de acceso (ACC)'}`);
    }
  }

  respuestaPush(): string {
    const sessionId = randomUUID().replace(/-/g, '');
    return [
      'ServerVersion=3.0.1',
      'ServerName=ADMS',
      'PushVersion=3.0.1',
      'ErrorDelay=60',
      'RequestDelay=2',
      'TransTimes=00:00;14:00',
      'TransInterval=1',
      'TransTables=User\tTransaction',
      'Realtime=1',
      `SessionID=${sessionId}`,
      'TimeoutSec=10',
    ].join('\n');
  }

  /** Estado de conexión de cada equipo conocido, para el panel "Sistema y APIs". */
  async listarEstadoDispositivos(): Promise<EstadoDispositivo[]> {
    const dispositivos = await this.prisma.dispositivoAcceso.findMany({ orderBy: { id: 'asc' } });
    const ahora = Date.now();
    return dispositivos.map((d) => ({
      serialNumber: d.serialNumber,
      enLinea: !!d.ultimaActividad && ahora - d.ultimaActividad.getTime() < UMBRAL_EN_LINEA_PORTAL_MS,
      ultimaActividad: d.ultimaActividad?.toISOString() ?? null,
      ipAddress: d.ipAddress,
      ipLocal: d.ipLocal,
    }));
  }

  /** Encola un comando crudo (formato ADMS, ej. "DATA UPDATE USERINFO PIN=1\tName=...") para el equipo. */
  async encolarComando(serialNumber: string, comando: string) {
    const dispositivo = await this.prisma.dispositivoAcceso.findUnique({ where: { serialNumber } });
    if (!dispositivo) {
      throw new Error(`Equipo ${serialNumber} no registrado todavía (no ha llamado a /iclock/registry)`);
    }
    return this.prisma.comandoDispositivo.create({
      data: { dispositivoId: dispositivo.id, comando },
    });
  }

  /** Encola los mismos comandos para todos los equipos conocidos. */
  private async encolarEnTodos(comandos: string[]): Promise<number> {
    const dispositivos = await this.prisma.dispositivoAcceso.findMany();
    if (dispositivos.length > 0 && comandos.length > 0) {
      await this.prisma.comandoDispositivo.createMany({
        data: dispositivos.flatMap((d) => comandos.map((comando) => ({ dispositivoId: d.id, comando }))),
      });
    }
    return dispositivos.length;
  }

  /**
   * Registra (o actualiza) a la persona en los G4 Pro: su número de documento
   * como Pin, su nombre y, si se indica, su foto (el equipo la convierte en el
   * rostro que reconoce). Con el formato de la variante del equipo: control de
   * acceso (`user`, probado el 04/oct/2026) o asistencia (`USERINFO`, probado
   * el 19/10/2026). En control de acceso **no le da permiso de paso**: eso se
   * hace solo mientras espera su ingreso (habilitar/deshabilitar). Si cambió
   * su número de documento, se borra el usuario anterior del equipo.
   */
  async sincronizarPersona(
    persona: { numeroDocumento: string; nombres: string; apellidos: string; fotoUrl: string | null },
    opciones: { conFoto?: boolean; numeroAnterior?: string } = {},
  ): Promise<void> {
    const pin = pinDeDocumento(persona.numeroDocumento);
    if (!pin) {
      this.logger.warn(`No se registra en el G4 Pro el documento ${persona.numeroDocumento}: solo se admiten números (DNI)`);
      return;
    }
    const asistencia = await this.modoAsistencia();
    const comandos: string[] = [];
    const pinAnterior = opciones.numeroAnterior ? pinDeDocumento(opciones.numeroAnterior) : null;
    if (pinAnterior && pinAnterior !== pin) {
      comandos.push(...(asistencia ? [comandoBorrarPersonaAsistencia(pinAnterior)] : comandosBorrarPersona(pinAnterior)));
    }
    const datos = { pin, nombres: persona.nombres, apellidos: persona.apellidos };
    comandos.push(...(asistencia ? [comandoPersonaAsistencia(datos)] : comandosPersona(datos)));
    // Con número nuevo hay que volver a mandar la foto (el usuario anterior se borró con su rostro).
    const mandarFoto = (opciones.conFoto || (pinAnterior !== null && pinAnterior !== pin)) && !!persona.fotoUrl;
    if (mandarFoto) {
      try {
        comandos.push(comandoFoto(pin, await convertirFotoParaG4Pro(persona.fotoUrl!)));
      } catch (error) {
        this.logger.error(`No se pudo preparar la foto de ${pin} para el G4 Pro: ${(error as Error).message}`);
      }
    }
    const equipos = await this.encolarEnTodos(comandos);
    if (equipos === 0) {
      this.logger.warn(`No hay equipos G4 Pro registrados todavía; ${pin} se registrará al sincronizar`);
    } else {
      this.logger.log(`Persona ${pin} encolada para ${equipos} equipo(s)${mandarFoto ? ', con foto' : ''}`);
    }
  }

  /** Borra a la persona de los G4 Pro (con su rostro y sus permisos). */
  async borrarPersonaDeEquipos(numeroDocumento: string): Promise<void> {
    const pin = pinDeDocumento(numeroDocumento);
    if (!pin) return;
    await this.encolarEnTodos((await this.modoAsistencia()) ? [comandoBorrarPersonaAsistencia(pin)] : comandosBorrarPersona(pin));
  }

  /**
   * Permiso de paso en los G4 Pro (habilitar) o su retiro (deshabilitar). En
   * la variante de asistencia no existe (el equipo verifica a todo su personal
   * y el sistema decide con el DNI que envía): no se hace nada.
   */
  async habilitarEnEquipos(numeroDocumento: string, habilitar: boolean): Promise<boolean> {
    const pin = pinDeDocumento(numeroDocumento);
    if (!pin || (await this.modoAsistencia())) return false;
    return (await this.encolarEnTodos([habilitar ? comandoHabilitar(pin) : comandoDeshabilitar(pin)])) > 0;
  }

  /** Permiso de paso de varias personas a la vez (orden "facial primero"): una sola carga de comandos. */
  async permisosEnEquipos(documentos: string[], habilitar: boolean): Promise<number> {
    const pins = documentos.map((d) => pinDeDocumento(d)).filter((pin): pin is string => !!pin);
    if (pins.length === 0 || (await this.modoAsistencia())) return 0;
    await this.encolarEnTodos(pins.map((pin) => (habilitar ? comandoHabilitar(pin) : comandoDeshabilitar(pin))));
    return pins.length;
  }

  /** Comandos pendientes para el equipo, marcándolos como entregados. */
  async entregarComandosPendientes(serialNumber: string): Promise<string[]> {
    const dispositivo = await this.prisma.dispositivoAcceso.findUnique({ where: { serialNumber } });
    if (!dispositivo) {
      return [];
    }
    // De a un lote (ver loteDeComandos): el equipo descarta lo que pase de 256.
    // Los permisos de paso pendientes van primero aunque haya una cola grande.
    const pendiente = { dispositivoId: dispositivo.id, estado: 'pendiente' as EstadoComando };
    const [permisos, resto] = await Promise.all([
      this.prisma.comandoDispositivo.findMany({
        where: { ...pendiente, comando: { startsWith: 'DATA ', contains: ' userauthorize ' } },
        orderBy: { id: 'asc' },
        take: MAX_COMANDOS_POR_ENTREGA,
      }),
      this.prisma.comandoDispositivo.findMany({ where: pendiente, orderBy: { id: 'asc' }, take: MAX_COMANDOS_POR_ENTREGA }),
    ]);
    const vistos = new Set<number>();
    const pendientes = loteDeComandos(
      [...permisos.filter((c) => esPermisoDePaso(c.comando)), ...resto].filter((c) => !vistos.has(c.id) && vistos.add(c.id)),
    );
    if (pendientes.length === 0) {
      return [];
    }
    await this.prisma.comandoDispositivo.updateMany({
      where: { id: { in: pendientes.map((c) => c.id) } },
      data: { estado: 'entregado' as EstadoComando, entregadoEn: new Date() },
    });
    return pendientes.map((c) => `C:${c.id}:${c.comando}`);
  }

  /** Resultado de un comando ejecutado, reportado por el equipo vía /iclock/devicecmd. */
  /**
   * Respuestas a consultas (por id de comando). Las grandes llegan en varias
   * partes (`packcnt`/`packidx`): se juntan hasta tenerlas todas.
   */
  /** Consultas que no se anotan en el registro (las periódicas, p. ej. el alcoholímetro cada 10 s). */
  private readonly consultasSilenciosas = new Set<number>();
  private readonly respuestasConsulta = new Map<
    number,
    { serialNumber: string; tipo: string; tabla: string; partes: Map<number, string>; total: number; recibidoEn: Date }
  >();

  /** Respuesta a `DATA COUNT` / `DATA QUERY` (protocolo de control de acceso, ver `/iclock/querydata`). */
  guardarRespuestaConsulta(
    serialNumber: string,
    comandoId: number,
    tipo: string,
    tabla: string,
    datos: string,
    parte: { indice?: number; total?: number } = {},
  ) {
    if (Number.isFinite(comandoId)) {
      const total = parte.total && parte.total > 0 ? parte.total : 1;
      const indice = parte.indice && parte.indice > 0 ? parte.indice : 1;
      const respuesta = this.respuestasConsulta.get(comandoId) ?? {
        serialNumber,
        tipo,
        tabla,
        partes: new Map<number, string>(),
        total,
        recibidoEn: new Date(),
      };
      respuesta.partes.set(indice, datos);
      this.respuestasConsulta.set(comandoId, respuesta);
      if (this.respuestasConsulta.size > 200) this.respuestasConsulta.delete(this.respuestasConsulta.keys().next().value!);
    }
    if (this.consultasSilenciosas.has(comandoId)) return;
    const resumen = datos.replace(/\t/g, ' | ').replace(/\r?\n/g, ' // ').slice(0, 1000);
    const deParte = parte.total && parte.total > 1 ? ` [parte ${parte.indice}/${parte.total}]` : '';
    this.logger.log(`Respuesta de ${serialNumber} al comando ${comandoId} (${tipo} ${tabla})${deParte}: ${resumen || '(vacía)'}`);
  }

  /** La respuesta completa (todas sus partes, en orden), o null si todavía falta. */
  respuestaConsulta(comandoId: number): string | null {
    const r = this.respuestasConsulta.get(comandoId);
    if (!r || r.partes.size < r.total) return null;
    return [...r.partes.entries()].sort(([a], [b]) => a - b).map(([, d]) => d).join('\n');
  }

  /**
   * Envía una consulta al equipo y espera su respuesta (el equipo recoge los
   * comandos cada ~2 s y responde por `/iclock/querydata`). null si no
   * responde a tiempo.
   */
  async consultar(
    dispositivoId: number,
    comando: string,
    esperaMs = 60_000,
    opciones: {
      /** Sin anotar la respuesta en el registro. */
      silencioso?: boolean;
      /** Se borra de la cola al terminar (consultas periódicas: no llenan la tabla). */
      temporal?: boolean;
    } = {},
  ): Promise<string | null> {
    const { id } = await this.prisma.comandoDispositivo.create({ data: { dispositivoId, comando } });
    if (opciones.silencioso) this.consultasSilenciosas.add(id);
    const hasta = Date.now() + esperaMs;
    let respuesta: string | null = null;
    while (Date.now() < hasta) {
      respuesta = this.respuestaConsulta(id);
      if (respuesta !== null) break;
      await new Promise((r) => setTimeout(r, 1000));
    }
    if (respuesta === null && !opciones.silencioso) this.logger.warn(`El equipo no respondió a "${comando}" en ${esperaMs / 1000} s`);
    this.consultasSilenciosas.delete(id);
    if (opciones.temporal) {
      this.respuestasConsulta.delete(id);
      await this.prisma.comandoDispositivo.deleteMany({ where: { id } }).catch(() => undefined);
    }
    return respuesta;
  }

  /**
   * Quién aprobó rostro y alcohol en el `rtlog` de la hora indicada (que llega
   * con `pin=0`): se lee del archivo de rastreo del equipo (ver
   * verify-success.util.ts). La línea se escribe ~1 s después del rtlog, así
   * que se reintenta unas veces. null si no se pudo saber (equipo sin
   * responder, sin la línea o con dos personas en el mismo momento).
   */
  async quienAprobo(serialNumber: string, horaRtlog: Date, intentos = 3): Promise<PaseExitoso | null> {
    const dispositivo = await this.prisma.dispositivoAcceso.findUnique({ where: { serialNumber } });
    if (!dispositivo) return null;
    for (let intento = 1; intento <= intentos; intento++) {
      const salida = await this.consultar(dispositivo.id, COMANDO_VERIFY_SUCCESS, 6_000);
      const pase = salida === null ? null : paseDelRtlog(leerVerifySuccess(salida), horaRtlog);
      if (pase) return pase;
      if (intento < intentos) await new Promise((r) => setTimeout(r, 1_000));
    }
    this.logger.warn(`No se pudo saber quién aprobó el rtlog de las ${horaRtlog.toISOString()} (${serialNumber})`);
    return null;
  }

  /**
   * Deja cada G4 Pro con exactamente el personal del sistema: borra los
   * usuarios que el sistema no conoce (por ejemplo, registrados a mano en el
   * equipo, que tienen paso permanente) y deja los permisos de paso como
   * deben estar: normalmente solo la persona en su turno; en el orden
   * "facial primero", todo el personal activo (`pinsConPermiso`). A quien
   * está en el equipo con datos cambiados a mano (contraseña, administrador,
   * tarjeta, nombre…) se le vuelven a poner los del sistema (`datosEsperados`:
   * el personal activo; no toca su rostro). Devuelve los pins que faltan en
   * algún equipo, para registrarlos con foto.
   */
  async limpiarEquipos(
    pinsSistema: Set<string>,
    pinsActivos: Set<string>,
    pinsConPermiso: Set<string>,
    aplicar = true,
    datosEsperados: Map<string, PersonaParaEquipo> = new Map(),
  ) {
    const resultado = {
      equipos: 0,
      sinRespuesta: 0,
      borrados: 0,
      permisosQuitados: 0,
      /** Personas con datos cambiados a mano en el equipo, a las que se les vuelven a poner los del sistema. */
      corregidos: new Set<string>(),
      faltantes: new Set<string>(),
      sobrantes: new Set<string>(),
      /** Por equipo: usuarios y rostros que tenía al consultarlo (antes de los cambios). */
      porEquipo: [] as { serialNumber: string; usuarios: number; conRostro: number; sinRostro: string[] }[],
    };
    const ahora = Date.now();
    for (const dispositivo of await this.prisma.dispositivoAcceso.findMany()) {
      // Desconectado (sin consultar al servidor en 2 min, como en "Sistema y APIs"): no va a
      // responder, así que no se le espera 60 s; se cuenta como "no respondió" al instante.
      if (!dispositivo.ultimaActividad || ahora - dispositivo.ultimaActividad.getTime() >= UMBRAL_EN_LINEA_MS) {
        resultado.sinRespuesta++;
        continue;
      }
      const asistencia = await this.modoAsistencia();
      const deAsistencia = asistencia ? await this.consultarUsuariosAsistencia(dispositivo) : null;
      const usuarios = asistencia
        ? (deAsistencia?.usuarios ?? null)
        : await this.consultar(dispositivo.id, 'DATA QUERY tablename=user,fielddesc=*,filter=*');
      if (usuarios === null) {
        resultado.sinRespuesta++;
        continue;
      }
      resultado.equipos++;
      const pinsEquipo = pinsDeRespuestaUsuarios(usuarios);
      // Rostros: se listan (el DATA COUNT biodata de este firmware da 0 aunque existan).
      const rostros = new Set(
        pinsDeRespuestaUsuarios(
          (asistencia
            ? deAsistencia?.rostros
            : await this.consultar(dispositivo.id, 'DATA QUERY tablename=biodata,fielddesc=*,filter=*')) ?? '',
        ),
      );
      const plan = planDeSincronizacion(pinsEquipo, pinsSistema, pinsActivos);
      // Cómo queda el equipo: sin los que se borran (los que faltan se cuentan en la próxima revisión).
      const quedan = aplicar ? pinsEquipo.filter((pin) => !plan.sobrantes.includes(pin)) : pinsEquipo;
      resultado.porEquipo.push({
        serialNumber: dispositivo.serialNumber,
        usuarios: quedan.length,
        conRostro: quedan.filter((pin) => rostros.has(pin)).length,
        sinRostro: quedan.filter((pin) => !rostros.has(pin)),
      });
      const comandos = plan.sobrantes.flatMap((pin) => (asistencia ? [comandoBorrarPersonaAsistencia(pin)] : comandosBorrarPersona(pin)));
      plan.faltantes.forEach((pin) => resultado.faltantes.add(pin));
      resultado.borrados += plan.sobrantes.length;
      plan.sobrantes.forEach((pin) => resultado.sobrantes.add(pin));
      const aCorregir = usuariosConDatosDistintos(usuarios, datosEsperados);
      comandos.push(
        ...aCorregir.flatMap((pin) =>
          asistencia ? [comandoPersonaAsistencia(datosEsperados.get(pin)!)] : comandosPersona(datosEsperados.get(pin)!),
        ),
      );
      aCorregir.forEach((pin) => resultado.corregidos.add(pin));
      if (aCorregir.length > 0) {
        this.logger.warn(`${dispositivo.serialNumber}: datos cambiados a mano en el equipo; se corrigen: ${aCorregir.join(', ')}`);
      }

      // En asistencia no hay permisos de paso.
      const permisos = asistencia
        ? null
        : conteoDeRespuesta((await this.consultar(dispositivo.id, 'DATA COUNT userauthorize')) ?? '', 'userauthorize');
      const conPermiso = pinsEquipo.filter((pin) => pinsConPermiso.has(pin));
      const esperados = conPermiso.length;
      if (permisos !== null && permisos > esperados) {
        const aQuitar = pinsEquipo.filter((pin) => !pinsConPermiso.has(pin) && !plan.sobrantes.includes(pin));
        comandos.push(...aQuitar.map((pin) => comandoDeshabilitar(pin)));
        resultado.permisosQuitados += aQuitar.length;
        this.logger.warn(`${dispositivo.serialNumber}: ${permisos} permisos de paso (se esperaba ${esperados}); se quitan`);
      }
      // Facial primero: si faltan permisos fijos, se vuelven a dar.
      if (permisos !== null && permisos < esperados) {
        comandos.push(...conPermiso.map((pin) => comandoHabilitar(pin)));
        this.logger.warn(`${dispositivo.serialNumber}: ${permisos} permisos de paso (se esperaban ${esperados}); se vuelven a dar`);
      }
      if (aplicar && comandos.length > 0) {
        await this.prisma.comandoDispositivo.createMany({ data: comandos.map((comando) => ({ dispositivoId: dispositivo.id, comando })) });
      }
      if (plan.sobrantes.length > 0) {
        this.logger.warn(`${dispositivo.serialNumber}: se borran usuarios que el sistema no conoce: ${plan.sobrantes.join(', ')}`);
      }
    }
    return resultado;
  }

  /**
   * Variante de asistencia: lo que el equipo envía mientras responde a
   * `DATA QUERY USERINFO` (por `table=OPERLOG`: una línea `USER PIN=…` por
   * usuario, `BIODATA Pin=…` por plantilla y `BIOPHOTO` con las fotos;
   * confirmado el 19/10/2026). Solo se juntan los números de usuario y sus
   * datos; las plantillas y las fotos se descartan.
   */
  private readonly consultasUsuarios = new Map<string, { usuarios: string[]; rostros: string[] }>();

  guardarOperlog(serialNumber: string, cuerpo: string) {
    const consulta = this.consultasUsuarios.get(serialNumber);
    if (!consulta) return;
    for (const linea of cuerpo.split(/\r?\n/)) {
      const usuario = /^USER\s+(.*)$/i.exec(linea);
      if (usuario) consulta.usuarios.push(usuarioComoControlDeAcceso(usuario[1]));
      const rostro = /^BIODATA\s+Pin=([^\t]+)\t.*\bType=9\b/i.exec(linea);
      if (rostro) consulta.rostros.push(`pin=${rostro[1]}`);
    }
  }

  /**
   * Usuarios y rostros del equipo en la variante de asistencia, en el mismo
   * formato que las respuestas del control de acceso (para usar las mismas
   * funciones de comandos-acceso.util.ts). null si no responde a tiempo.
   */
  private async consultarUsuariosAsistencia(dispositivo: { id: number; serialNumber: string }, esperaMs = 60_000) {
    const consulta = { usuarios: [] as string[], rostros: [] as string[] };
    this.consultasUsuarios.set(dispositivo.serialNumber, consulta);
    try {
      const { id } = await this.prisma.comandoDispositivo.create({ data: { dispositivoId: dispositivo.id, comando: 'DATA QUERY USERINFO' } });
      const hasta = Date.now() + esperaMs;
      while (Date.now() < hasta) {
        // Los usuarios llegan antes de que el equipo confirme el comando.
        if ((await this.prisma.comandoDispositivo.findUnique({ where: { id }, select: { estado: true } }))?.estado === 'confirmado') {
          return { usuarios: consulta.usuarios.join('\n'), rostros: consulta.rostros.join('\n') };
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
      this.logger.warn(`${dispositivo.serialNumber} no respondió a "DATA QUERY USERINFO" en ${esperaMs / 1000} s`);
      return null;
    } finally {
      this.consultasUsuarios.delete(dispositivo.serialNumber);
    }
  }

  async confirmarComando(serialNumber: string, comandoId: number, returnCode: number) {
    const dispositivo = await this.prisma.dispositivoAcceso.findUnique({ where: { serialNumber } });
    if (!dispositivo) {
      return;
    }
    await this.prisma.comandoDispositivo.updateMany({
      where: { id: comandoId, dispositivoId: dispositivo.id },
      data: { estado: 'confirmado' as EstadoComando, returnCode, confirmadoEn: new Date() },
    });
  }

  /**
   * Parsea una línea tab-separada "clave=valor" (formato de table=rtlog y
   * table=rtstate, descubierto reversando tráfico real -- no documentado por
   * ZKTeco). Las claves se devuelven en minúscula.
   */
  parseLineaClaveValor(linea: string): Record<string, string> {
    const campos: Record<string, string> = {};
    for (const token of linea.split('\t')) {
      const igual = token.indexOf('=');
      if (igual > 0) {
        campos[token.slice(0, igual).trim().toLowerCase()] = token.slice(igual + 1).trim();
      }
    }
    return campos;
  }

  /**
   * Variante de asistencia: guarda un registro del equipo (`table=ATTLOG`),
   * que trae el DNI y el grado de alcohol, y emite 'dispositivo.attlog' para
   * que EventosAccesoService decida el ingreso. Uno repetido (el equipo
   * reenvía si no recibió la respuesta) se ignora; uno viejo solo se guarda.
   */
  async guardarRegistroAsistencia(serialNumber: string, linea: string) {
    const registro = leerRegistroAsistencia(linea);
    if (!registro) {
      this.logger.warn(`ATTLOG de ${serialNumber} que no se entiende: "${linea.slice(0, 120)}"`);
      return;
    }
    const dispositivo = await this.obtenerOCrearDispositivo(serialNumber);
    await this.anotarVariante(serialNumber, true);
    const repetido = await this.prisma.verificacionDispositivo.findFirst({
      where: { dispositivoId: dispositivo.id, tabla: 'attlog', crudo: linea },
      select: { id: true },
    });
    if (repetido) {
      this.logger.log(`ATTLOG repetido de ${serialNumber} (DNI ${registro.pin} ${registro.hora}); se ignora`);
      return;
    }
    const hora = new Date(registro.hora.replace(' ', 'T') + '-05:00');
    const horaValida = Number.isNaN(hora.getTime()) ? null : hora;
    const verificacion = await this.prisma.verificacionDispositivo.create({
      data: {
        dispositivoId: dispositivo.id,
        tabla: 'attlog',
        horaDispositivo: horaValida ?? undefined,
        eventCode: registro.estado?.slice(0, 10),
        verifyType: registro.verificacion?.slice(0, 10),
        concentracion: registro.alcohol?.slice(0, 20),
        crudo: linea,
      },
    });
    this.logger.log(
      `ATTLOG recibido: sn=${serialNumber} DNI ${registro.pin} ${registro.hora} estado=${registro.estado ?? '-'} verificación=${registro.verificacion ?? '-'} alcohol=${registro.alcohol ?? '-'}`,
    );
    if (horaValida && Date.now() - horaValida.getTime() > ATTLOG_RECIENTE_MS) {
      this.logger.warn(`ATTLOG atrasado (DNI ${registro.pin} ${registro.hora}): se guarda, pero no decide ningún ingreso`);
      await this.prisma.verificacionDispositivo.update({
        where: { id: verificacion.id },
        data: { decision: 'Llegó con más de 2 min de atraso: solo se guarda' },
      });
      this.eventEmitter.emit('g4.marcacion', { id: verificacion.id });
      return;
    }
    this.eventEmitter.emit('g4.marcacion', { id: verificacion.id });
    this.eventEmitter.emit('dispositivo.attlog', {
      verificacionId: verificacion.id,
      serialNumber,
      pin: registro.pin,
      horaDispositivo: horaValida,
      alcohol: registro.alcohol,
    } satisfies AttlogRecibidoEvent);
  }

  /**
   * Guarda un evento crudo de table=rtlog o table=rtstate. Para rtlog (el
   * resultado facial+alcoholímetro), emite 'dispositivo.rtlog' para que
   * EventosAccesoService lo correlacione con un DNI pendiente -- el "pin"
   * que manda el equipo en este evento no sirve para identificar a la
   * persona (llega en 0 incluso con un usuario real enrolado, confirmado con
   * el equipo real), así que la correlación no puede hacerse acá.
   */
  async guardarVerificacion(serialNumber: string, tabla: string, linea: string) {
    const dispositivo = await this.obtenerOCrearDispositivo(serialNumber);
    const campos = this.parseLineaClaveValor(linea);
    const horaDispositivo = campos.time ? new Date(campos.time) : undefined;
    const horaValida = horaDispositivo && !Number.isNaN(horaDispositivo.getTime()) ? horaDispositivo : undefined;
    const verificacion = await this.prisma.verificacionDispositivo.create({
      data: {
        dispositivoId: dispositivo.id,
        tabla,
        horaDispositivo: horaValida,
        eventCode: campos.event,
        verifyType: campos.verifytype,
        concentracion: campos.concentration,
        crudo: linea,
      },
    });
    this.logger.log(`Verificación guardada: sn=${serialNumber} tabla=${tabla} concentration=${campos.concentration ?? ''}`);

    if (tabla === 'rtlog') {
      this.eventEmitter.emit('dispositivo.rtlog', {
        verificacionId: verificacion.id,
        serialNumber,
        horaDispositivo: horaValida ?? null,
        eventCode: campos.event ?? null,
        concentracion: campos.concentration ?? null,
        pin: campos.pin ?? null,
      } satisfies RtlogRecibidoEvent);
    }
  }

  /**
   * Guarda la captura (`snapshot`) que el equipo de luz visible sube en cada
   * verificación (`table=tabledata&tablename=ATTPHOTO`, ver `attphoto.util.ts`).
   * **No guarda la foto** (biométrico): solo el nombre del archivo, la serie y
   * el tamaño, y el DNI que viene en el nombre (`<fecha>-<dni>.jpg`). Sirve para
   * ver si la captura del éxito trae el número de la persona, que el `rtlog`
   * manda en 0. Devuelve si pudo leer el registro.
   */
  async guardarSnapshot(serialNumber: string, linea: string): Promise<boolean> {
    const snap = leerSnapshot(linea);
    if (!snap) return false;
    const dispositivo = await this.obtenerOCrearDispositivo(serialNumber);
    const meta = `pin=${snap.nombreArchivo}\tsn=${snap.serie ?? ''}\tsize=${snap.tamano ?? ''}\tdniDerivado=${snap.pinDerivado ?? ''}`;
    await this.prisma.verificacionDispositivo.create({
      data: { dispositivoId: dispositivo.id, tabla: 'attphoto', crudo: meta },
    });
    this.logger.log(
      `Captura (ATTPHOTO) recibida: sn=${serialNumber} archivo=${snap.nombreArchivo} dniDerivado=${snap.pinDerivado ?? '(no identificado)'} size=${snap.tamano ?? ''}`,
    );
    return true;
  }
}
