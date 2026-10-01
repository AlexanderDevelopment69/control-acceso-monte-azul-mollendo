import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomBytes, randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import type { EstadoComando } from '../generated/prisma/enums.js';
import { convertirFotoParaG4Pro } from './foto-g4pro.util.js';

/** Emitido cuando llega un table=rtlog real del equipo (ver EventosAccesoService). */
export interface RtlogRecibidoEvent {
  verificacionId: number;
  serialNumber: string;
  horaDispositivo: Date | null;
  eventCode: string | null;
  concentracion: string | null;
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

  /**
   * Registra a una persona en todos los equipos conocidos, mandando su rostro
   * (DATA UPDATE BIOPHOTO). Se usa el ID de la persona como PIN del equipo.
   * El equipo crea el usuario solo, a partir de este comando -- no hace falta
   * mandar el nombre por separado (ver nota de DATA UPDATE USERINFO abajo).
   *
   * El formato es el "simple" de 4 campos (PIN, Type, Size, Content), no el
   * de 7 campos que trae el protocolo oficial (que además incluye No, Index,
   * Format): se confirmó con el equipo real, dos veces, que la variante de 7
   * campos se queda colgada sin ninguna confirmación, mientras que esta de 4
   * campos sí funciona (`return=0`) -- es el mismo formato que usa el SDK
   * Java del propio proveedor (`Constants.DEV_CMD_DATA_UPDATE_BIOPHOTO` en
   * `pushdemo`). `Type=9` (rostro de luz visible) funciona igual que `Type=2`
   * (infrarrojo, el que usa el SDK del proveedor por defecto) -- se deja 9
   * porque es el que corresponde a este equipo según el protocolo oficial.
   *
   * No se manda `DATA UPDATE USERINFO` (el nombre): confirmado con el equipo
   * real, en seis pruebas independientes (incluido el ejemplo textual exacto
   * del manual del fabricante), que este comando siempre se rechaza
   * (`return=-629`, un código que no existe en la tabla oficial de errores) —
   * incluso después de que el usuario ya existe por haberle mandado la foto.
   * No es necesario para el reconocimiento facial, solo para que el equipo
   * muestre un nombre en su propia pantalla. Ver
   * Estado_Implementacion_Integracion_G4Pro.md sección 2.4/2.5 para el
   * detalle completo de las pruebas.
   */
  async sincronizarPersona(personaId: number, rutaFoto: string | null) {
    const dispositivos = await this.prisma.dispositivoAcceso.findMany();
    if (dispositivos.length === 0) {
      this.logger.warn(`No hay equipos registrados todavía; no se pudo sincronizar a la persona ${personaId}`);
      return;
    }
    if (!rutaFoto) {
      this.logger.warn(`Persona ${personaId} sin foto todavía; no hay nada que encolar`);
      return;
    }

    const base64 = await convertirFotoParaG4Pro(rutaFoto);

    for (const dispositivo of dispositivos) {
      await this.prisma.comandoDispositivo.create({
        data: {
          dispositivoId: dispositivo.id,
          comando: `DATA UPDATE BIOPHOTO PIN=${personaId}\tType=9\tSize=${base64.length}\tContent=${base64}`,
        },
      });
    }
    this.logger.log(`Persona ${personaId} encolada para ${dispositivos.length} equipo(s)`);
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
      } satisfies RtlogRecibidoEvent);
    }
  }
}
