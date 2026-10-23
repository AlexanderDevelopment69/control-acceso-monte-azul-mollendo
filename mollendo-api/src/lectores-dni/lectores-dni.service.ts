import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import tty from 'node:tty';
import { promisify } from 'node:util';
import { RegistroLecturas } from './registro-lecturas.js';
import { esBinario, extraerDocumento, FiltroRepetidos, momentoRegistroKernel, SeparadorLineas, ttyConErrorUsb } from './lector-dni.util.js';
import { extraerTarjeta } from '../tarjetas-contingencia/tarjeta-contingencia.util.js';

const ejecutar = promisify(execFile);

/** Espera antes de volver a abrir un lector que se desconectó o no se pudo abrir. */
const REINTENTO_MS = 5000;
/**
 * Adaptador USB trabado (error -71 en el registro del kernel): se lo da por
 * caído y se vuelve a probar cada minuto; vuelve a contar como conectado tras
 * 2 minutos sin errores (cada reapertura de un adaptador trabado da otro -71).
 */
const FALLA_USB_MS = 2 * 60 * 1000;
const REINTENTO_FALLA_USB_MS = 60 * 1000;
export const MOTIVO_FALLA_USB = 'El adaptador USB no responde (error -71): desconéctelo y vuelva a conectarlo';
/**
 * Cada cuánto se pregunta a cada adaptador si responde (tools/sondeo-serie.c).
 * Un adaptador trabado puede no dejar ningún -71 en el registro del kernel
 * mientras nadie le hable (22/10/2026: figuró conectado un día entero sin
 * enviar lecturas); el sondeo lo obliga a contestar.
 */
const SONDEO_MS = 30 * 1000;

type Movimiento = 'ingreso' | 'salida';

export interface EstadoLectorDni {
  configurado: boolean;
  conectado: boolean;
  ultimaLectura: string | null;
  error: string | null;
  /** El puerto está abierto pero el adaptador USB no responde (error -71 del kernel). */
  adaptadorSinRespuesta?: boolean;
}

interface Lector {
  movimiento: Movimiento;
  puerto: string;
  molinete: string;
  separador: SeparadorLineas;
  repetidos: FiltroRepetidos;
  stream: tty.ReadStream | null;
  reintento: NodeJS.Timeout | null;
  ultimaLectura: Date | null;
  error: string | null;
  /** El ttyUSBn al que apunta el puerto (se resuelve en cada apertura). */
  tty: string | null;
  /** Último error -71 del adaptador en el registro del kernel. */
  fallaUsb: Date | null;
}

/**
 * Lee los lectores de DNI (Syble XB-7705H en modo RS232) conectados a la
 * mini PC y registra cada lectura como ingreso o salida, igual que
 * `POST /eventos-acceso/ingreso|salida` (en el servidor, directo en la base de
 * datos; en el controlador, mandándola al servidor: ver RegistroLecturas).
 *
 * Cada lector se configura con `LECTOR_DNI_INGRESO_PUERTO` /
 * `LECTOR_DNI_SALIDA_PUERTO` (la ruta fija del adaptador en el servidor,
 * `/dev/serial/by-id/...`; en Docker se lee dentro de `LECTOR_DNI_DEV_SERVIDOR`,
 * el /dev del servidor montado, y se vuelve a resolver en cada reintento, así
 * se recupera aunque el adaptador cambie de ttyUSB0 a ttyUSB1) y
 * `LECTOR_DNI_BAUDIOS` (115200 por defecto, la velocidad de fábrica del
 * lector en RS232). El puerto se configura con `stty` (viene en la imagen
 * Alpine) y se lee con `tty.ReadStream`, sin dependencias nativas. Si el
 * lector se desconecta o no se puede abrir, se reintenta cada 5 s.
 */
@Injectable()
export class LectoresDniService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LectoresDniService.name);
  private readonly lectores: Lector[] = [];
  private cerrando = false;
  private kernel: fs.ReadStream | null = null;
  private sinKernelAvisado = false;
  private sondeo: NodeJS.Timeout | null = null;
  private readonly programaSondeo = process.env.SONDEO_SERIE_PROGRAMA?.trim() || '/app/sondeo-serie';

  constructor(private readonly registro: RegistroLecturas) {}

  onModuleInit() {
    for (const movimiento of ['ingreso', 'salida'] as const) {
      const clave = movimiento.toUpperCase();
      const configurado = process.env[`LECTOR_DNI_${clave}_PUERTO`]?.trim();
      if (!configurado) continue;
      const devServidor = process.env.LECTOR_DNI_DEV_SERVIDOR?.trim();
      const puerto =
        devServidor && configurado.startsWith('/dev/') ? path.posix.join(devServidor, configurado.slice('/dev/'.length)) : configurado;
      const lector: Lector = {
        movimiento,
        puerto,
        molinete: process.env[`LECTOR_DNI_${clave}_MOLINETE`]?.trim() || (movimiento === 'ingreso' ? 'Ingreso' : 'Salida'),
        separador: new SeparadorLineas(),
        repetidos: new FiltroRepetidos(),
        stream: null,
        reintento: null,
        ultimaLectura: null,
        error: null,
        tty: null,
        fallaUsb: null,
      };
      this.lectores.push(lector);
      void this.abrir(lector);
    }
    if (this.lectores.length > 0) {
      this.vigilarKernel();
      this.sondeo = setInterval(() => void this.sondear(), SONDEO_MS);
      this.sondeo.unref();
    }
  }

  onModuleDestroy() {
    this.cerrando = true;
    for (const lector of this.lectores) {
      if (lector.reintento) clearTimeout(lector.reintento);
      lector.stream?.destroy();
    }
    this.kernel?.destroy();
    if (this.sondeo) clearInterval(this.sondeo);
  }

  /** Estado de cada lector para "Sistema y APIs". */
  estado(): Record<Movimiento, EstadoLectorDni> {
    const de = (movimiento: Movimiento): EstadoLectorDni => {
      const lector = this.lectores.find((l) => l.movimiento === movimiento);
      const sinRespuesta = !!lector && this.enFallaUsb(lector);
      return {
        configurado: !!lector,
        conectado: !!lector?.stream && !sinRespuesta,
        ultimaLectura: lector?.ultimaLectura?.toISOString() ?? null,
        error: sinRespuesta ? MOTIVO_FALLA_USB : (lector?.error ?? null),
        adaptadorSinRespuesta: sinRespuesta,
      };
    };
    return { ingreso: de('ingreso'), salida: de('salida') };
  }

  private async abrir(lector: Lector) {
    lector.reintento = null;
    if (this.cerrando) return;
    const baudios = process.env.LECTOR_DNI_BAUDIOS?.trim() || '115200';
    try {
      await ejecutar('stty', ['-F', lector.puerto, baudios, 'raw', '-echo', 'clocal', 'cs8', '-cstopb', '-parenb', '-crtscts']);
      const fd = fs.openSync(lector.puerto, fs.constants.O_RDONLY | fs.constants.O_NOCTTY | fs.constants.O_NONBLOCK);
      const stream = new tty.ReadStream(fd);
      stream.on('data', (pedazo: Buffer) => this.recibir(lector, pedazo));
      stream.on('error', (error) => this.desconectado(lector, error.message));
      stream.on('close', () => this.desconectado(lector, 'el puerto se cerró'));
      lector.stream = stream;
      try {
        lector.tty = path.basename(fs.realpathSync(lector.puerto));
      } catch {
        lector.tty = null;
      }
      // Reapertura de un adaptador trabado: sin anotar "conectado" cada minuto.
      if (!this.enFallaUsb(lector)) {
        lector.error = null;
        this.logger.log(`Lector de DNI de ${lector.movimiento} conectado en ${lector.puerto} (${baudios} baudios)`);
      }
    } catch (error) {
      this.desconectado(lector, (error as Error).message);
    }
  }

  private desconectado(lector: Lector, motivo: string) {
    if (lector.stream) {
      lector.stream.removeAllListeners();
      lector.stream.destroy();
      lector.stream = null;
    }
    if (lector.error !== motivo) {
      this.logger.warn(`Lector de DNI de ${lector.movimiento} (${lector.puerto}) desconectado: ${motivo}. Se reintenta cada ${REINTENTO_MS / 1000} s.`);
    }
    lector.error = motivo;
    const espera = this.enFallaUsb(lector) ? REINTENTO_FALLA_USB_MS : REINTENTO_MS;
    if (!this.cerrando && !lector.reintento) lector.reintento = setTimeout(() => void this.abrir(lector), espera);
  }

  /**
   * Pregunta a cada adaptador abierto si responde. Si no (o no contesta en 10 s),
   * se lo da por trabado igual que con un -71 del kernel: "Sistema y APIs" lo
   * muestra sin respuesta, se activa la contingencia sin lector y se vuelve a
   * probar cada minuto. Sin el programa (fuera de Docker) no se sondea.
   */
  private async sondear() {
    if (!fs.existsSync(this.programaSondeo)) return;
    for (const lector of this.lectores) {
      if (!lector.stream || this.cerrando) continue;
      try {
        await ejecutar(this.programaSondeo, [lector.puerto], { timeout: 10_000 });
      } catch (error) {
        // El puerto pudo cerrarse mientras tanto (se reintenta por su cuenta).
        if (!lector.stream) continue;
        const salida = (error as { stdout?: string }).stdout?.trim() || (error as Error).message;
        if (!this.enFallaUsb(lector)) {
          this.logger.warn(`Lector de DNI de ${lector.movimiento}: el adaptador USB no responde al sondeo (${salida})`);
        }
        lector.fallaUsb = new Date();
        this.desconectado(lector, MOTIVO_FALLA_USB);
      }
    }
  }

  private enFallaUsb(lector: Lector, ahora = Date.now()): boolean {
    return !!lector.fallaUsb && ahora - lector.fallaUsb.getTime() < FALLA_USB_MS;
  }

  /**
   * Lee el registro del kernel (/dev/kmsg; en Docker, el del servidor montado y
   * con el permiso SYSLOG) para ver si el adaptador USB de un lector quedó
   * trabado: el puerto se abre sin error, pero el kernel informa -71 y no llega
   * ninguna lectura. Se descartan los mensajes de antes de arrancar. Sin acceso
   * al registro, solo se avisa una vez (los lectores siguen funcionando).
   */
  private vigilarKernel() {
    const devServidor = process.env.LECTOR_DNI_DEV_SERVIDOR?.trim();
    const ruta = process.env.LECTOR_DNI_KMSG?.trim() || (devServidor ? path.posix.join(devServidor, 'kmsg') : '/dev/kmsg');
    let desde = 0;
    try {
      desde = Number(fs.readFileSync('/proc/uptime', 'utf8').split(' ')[0]) * 1e6;
    } catch {
      // Sin /proc/uptime se leen todos (los viejos ya no tienen el puerto abierto).
    }
    const stream = fs.createReadStream(ruta, { encoding: 'utf8' });
    stream.on('data', (registros: string | Buffer) => {
      for (const registro of String(registros).split('\n')) {
        const tty = ttyConErrorUsb(registro);
        if (!tty || (momentoRegistroKernel(registro) ?? Infinity) < desde) continue;
        const lector = this.lectores.find((l) => l.tty === tty);
        if (!lector) continue;
        if (!this.enFallaUsb(lector)) {
          this.logger.warn(`Lector de DNI de ${lector.movimiento}: el adaptador USB (${tty}) no responde (error -71 del kernel)`);
        }
        lector.fallaUsb = new Date();
        if (lector.stream) this.desconectado(lector, MOTIVO_FALLA_USB);
      }
    });
    stream.on('error', (error) => {
      // Sin permiso (falta SYSLOG) o se cortó la lectura: se avisa una vez y se reintenta cada minuto.
      if (!this.sinKernelAvisado) {
        this.logger.warn(`Sin acceso al registro del kernel (${ruta}: ${error.message}): no se detecta un adaptador USB trabado`);
        this.sinKernelAvisado = true;
      }
      this.kernel = null;
      if (!this.cerrando) setTimeout(() => this.vigilarKernel(), REINTENTO_FALLA_USB_MS).unref();
    });
    this.kernel = stream;
  }

  private recibir(lector: Lector, pedazo: Buffer) {
    for (const linea of lector.separador.agregar(pedazo.toString('latin1'))) {
      // Tarjeta de contingencia (QR): la pasa el vigilante en lugar del DNI.
      const tarjeta = extraerTarjeta(linea);
      if (tarjeta) {
        if (lector.repetidos.esRepetido(tarjeta)) continue;
        lector.ultimaLectura = new Date();
        void this.registrarTarjeta(lector, tarjeta);
        continue;
      }
      const documento = extraerDocumento(linea);
      if (!documento) {
        // La firma binaria que sigue a un código 2D del DNI: no es un error.
        if (esBinario(linea)) continue;
        // Se anota lo que envió (acotado y sin caracteres de control) para poder adaptar
        // la lectura a otros documentos, como el carné de extranjería (pendiente de probar).
        const contenido = linea.replace(/[^\x20-\x7E]/g, '?').slice(0, 120);
        this.logger.warn(`Lector de DNI de ${lector.movimiento}: se ignoró una lectura que no es un DNI (${linea.length} caracteres): "${contenido}"`);
        continue;
      }
      if (lector.repetidos.esRepetido(documento.numeroDocumento)) continue;
      lector.ultimaLectura = new Date();
      void this.registrar(lector, documento);
    }
  }

  private async registrarTarjeta(lector: Lector, codigo: string) {
    try {
      const resultado = await this.registro.registrarTarjeta({ codigo, tipoMovimiento: lector.movimiento, torniqueteId: lector.molinete });
      this.logger.log(`Tarjeta de contingencia leída en ${lector.movimiento}: ${resultado.estado ?? resultado.resultado}`);
    } catch (error) {
      this.logger.error(`No se pudo registrar la tarjeta de contingencia leída en ${lector.movimiento}: ${(error as Error).message}`);
    }
  }

  private async registrar(lector: Lector, documento: NonNullable<ReturnType<typeof extraerDocumento>>) {
    const dto = { ...documento, torniqueteId: lector.molinete };
    try {
      const resultado =
        lector.movimiento === 'ingreso' ? await this.registro.registrarIngreso(dto) : await this.registro.registrarSalida(dto);
      const estado = resultado.estado ?? resultado.resultado;
      this.logger.log(`DNI leído en ${lector.movimiento}: ${estado}`);
    } catch (error) {
      this.logger.error(`No se pudo registrar el DNI leído en ${lector.movimiento}: ${(error as Error).message}`);
    }
  }
}
