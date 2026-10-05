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
  pinDeDocumento,
  pinsDeRespuestaUsuarios,
  planDeSincronizacion,
} from './comandos-acceso.util.js';

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
}

/**
 * El equipo llama a /iclock/getrequest cada ~2 segundos mientras está
 * conectado (confirmado con el equipo real); si no se ha visto en este
 * tiempo, se considera desconectado. Mismo criterio (2 minutos) que usa por
 * defecto la librería de referencia con la que se probó el protocolo.
 */
const UMBRAL_EN_LINEA_MS = 2 * 60 * 1000;

/**
 * Protocolo ADMS/PUSH real del equipo ZKTeco G4 Pro, implementado a partir de
 * lo validado contra el equipo físico HSR3263100192 (ver
 * Analisis_Control_Acceso_Mollendo.md sección 6.1 y Opciones_Integracion_G4Pro.md).
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

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /** Busca o crea el dispositivo, generando su RegistryCode la primera vez. */
  async obtenerOCrearDispositivo(serialNumber: string, ipAddress?: string) {
    const existente = await this.prisma.dispositivoAcceso.findUnique({ where: { serialNumber } });
    if (existente) {
      return this.prisma.dispositivoAcceso.update({
        where: { id: existente.id },
        data: { ultimaActividad: new Date(), ipAddress: ipAddress ?? existente.ipAddress },
      });
    }
    const registryCode = randomBytes(5).toString('hex');
    this.logger.log(`Nuevo equipo registrado: ${serialNumber} (RegistryCode=${registryCode})`);
    return this.prisma.dispositivoAcceso.create({
      data: { serialNumber, registryCode, ipAddress, ultimaActividad: new Date() },
    });
  }

  async tocarActividad(serialNumber: string, ipAddress?: string) {
    await this.prisma.dispositivoAcceso.updateMany({
      where: { serialNumber },
      data: { ultimaActividad: new Date(), ...(ipAddress ? { ipAddress } : {}) },
    });
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
      enLinea: !!d.ultimaActividad && ahora - d.ultimaActividad.getTime() < UMBRAL_EN_LINEA_MS,
      ultimaActividad: d.ultimaActividad?.toISOString() ?? null,
      ipAddress: d.ipAddress,
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
   * Registra (o actualiza) a la persona en los G4 Pro con el protocolo de
   * control de acceso: su número de documento como Pin, su nombre y, si se
   * indica, su foto (el equipo la convierte en el rostro que reconoce).
   * **No le da permiso de paso**: eso se hace solo mientras espera su ingreso
   * (habilitar/deshabilitar). Si cambió su número de documento, se borra el
   * usuario anterior del equipo. Probado con el equipo real (04/oct/2026).
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
    const comandos: string[] = [];
    const pinAnterior = opciones.numeroAnterior ? pinDeDocumento(opciones.numeroAnterior) : null;
    if (pinAnterior && pinAnterior !== pin) comandos.push(...comandosBorrarPersona(pinAnterior));
    comandos.push(...comandosPersona({ pin, nombres: persona.nombres, apellidos: persona.apellidos }));
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
    if (pin) await this.encolarEnTodos(comandosBorrarPersona(pin));
  }

  /** Permiso de paso en los G4 Pro (habilitar) o su retiro (deshabilitar). */
  async habilitarEnEquipos(numeroDocumento: string, habilitar: boolean): Promise<boolean> {
    const pin = pinDeDocumento(numeroDocumento);
    if (!pin) return false;
    return (await this.encolarEnTodos([habilitar ? comandoHabilitar(pin) : comandoDeshabilitar(pin)])) > 0;
  }

  /** Comandos pendientes para el equipo, marcándolos como entregados. */
  async entregarComandosPendientes(serialNumber: string): Promise<string[]> {
    const dispositivo = await this.prisma.dispositivoAcceso.findUnique({ where: { serialNumber } });
    if (!dispositivo) {
      return [];
    }
    const pendientes = await this.prisma.comandoDispositivo.findMany({
      where: { dispositivoId: dispositivo.id, estado: 'pendiente' as EstadoComando },
      orderBy: { id: 'asc' },
    });
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
  async consultar(dispositivoId: number, comando: string, esperaMs = 60_000): Promise<string | null> {
    const { id } = await this.prisma.comandoDispositivo.create({ data: { dispositivoId, comando } });
    const hasta = Date.now() + esperaMs;
    while (Date.now() < hasta) {
      const respuesta = this.respuestaConsulta(id);
      if (respuesta !== null) return respuesta;
      await new Promise((r) => setTimeout(r, 1000));
    }
    this.logger.warn(`El equipo no respondió a "${comando}" en ${esperaMs / 1000} s`);
    return null;
  }

  /**
   * Deja cada G4 Pro con exactamente el personal del sistema: borra los
   * usuarios que el sistema no conoce (por ejemplo, registrados a mano en el
   * equipo, que tienen paso permanente) y, si quedaron permisos de paso
   * sueltos, se los quita a todos salvo a la persona que está en su turno.
   * Devuelve los pins que faltan en algún equipo, para registrarlos con foto.
   */
  async limpiarEquipos(pinsSistema: Set<string>, pinsActivos: Set<string>, pinEnTurno: string | null, aplicar = true) {
    const resultado = {
      equipos: 0,
      sinRespuesta: 0,
      borrados: 0,
      permisosQuitados: 0,
      faltantes: new Set<string>(),
      sobrantes: new Set<string>(),
    };
    for (const dispositivo of await this.prisma.dispositivoAcceso.findMany()) {
      const usuarios = await this.consultar(dispositivo.id, 'DATA QUERY tablename=user,fielddesc=*,filter=*');
      if (usuarios === null) {
        resultado.sinRespuesta++;
        continue;
      }
      resultado.equipos++;
      const pinsEquipo = pinsDeRespuestaUsuarios(usuarios);
      const plan = planDeSincronizacion(pinsEquipo, pinsSistema, pinsActivos);
      const comandos = plan.sobrantes.flatMap((pin) => comandosBorrarPersona(pin));
      plan.faltantes.forEach((pin) => resultado.faltantes.add(pin));
      resultado.borrados += plan.sobrantes.length;
      plan.sobrantes.forEach((pin) => resultado.sobrantes.add(pin));

      const permisos = conteoDeRespuesta((await this.consultar(dispositivo.id, 'DATA COUNT userauthorize')) ?? '', 'userauthorize');
      const esperados = pinEnTurno && pinsEquipo.includes(pinEnTurno) ? 1 : 0;
      if (permisos !== null && permisos > esperados) {
        const aQuitar = pinsEquipo.filter((pin) => pin !== pinEnTurno && !plan.sobrantes.includes(pin));
        comandos.push(...aQuitar.map((pin) => comandoDeshabilitar(pin)));
        resultado.permisosQuitados += aQuitar.length;
        this.logger.warn(`${dispositivo.serialNumber}: ${permisos} permisos de paso (se esperaba ${esperados}); se quitan`);
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
}
