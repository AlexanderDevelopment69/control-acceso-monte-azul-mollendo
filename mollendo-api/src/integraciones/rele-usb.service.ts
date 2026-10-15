import { Injectable, Logger } from '@nestjs/common';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const ejecutar = promisify(execFile);

/** Identificación de los módulos DCTTECH "USBRelay" en /sys/class/hidraw/*\/device/uevent. */
const HID_ID_RELE = '000016C0:000005DF';

/** Molinete de ingreso o de salida, o un relé de aviso (contacto seco) de ingreso o de salida denegados. */
export type Rele = 'ingreso' | 'salida' | 'avisoIngreso' | 'avisoSalida';
type Molinete = Rele;

/** Relé de aviso de cada puerta. */
export const AVISO_DE = { ingreso: 'avisoIngreso', salida: 'avisoSalida' } as const;

type Aviso = 'avisoIngreso' | 'avisoSalida';
const esAviso = (rele: Rele): rele is Aviso => rele === 'avisoIngreso' || rele === 'avisoSalida';

/**
 * Cómo responde lo que está conectado al relé de aviso:
 * - `pulso`: suena mientras el contacto está cerrado (una luz o una sirena común).
 * - `alterno`: un contacto lo prende y el siguiente lo apaga (el pitido de los
 *   torniquetes de la garita, 15/10/2026): se dan dos pulsos, separados por
 *   `RELE_AVISO_ALTERNO_MS`.
 */
type ModoAviso = 'pulso' | 'alterno';
const modoAviso = (valor: string | undefined): ModoAviso => (valor?.trim().toLowerCase() === 'alterno' ? 'alterno' : 'pulso');

/** Intentos para callar un aviso alterno si el pulso de apagado falla (relé desconectado, por ejemplo). */
const INTENTOS_APAGADO = 3;
const NOMBRE: Record<Rele, string> = {
  ingreso: 'molinete de ingreso',
  salida: 'molinete de salida',
  avisoIngreso: 'aviso de ingreso denegado',
  avisoSalida: 'aviso de salida denegada',
};

interface ModuloEncontrado {
  dispositivo: string;
  modelo: string;
  serie: string;
}

export interface EstadoReleMolinete {
  conectado: boolean;
  /** Número de serie del módulo asignado (RELE_*_SERIE); null = el único módulo conectado. */
  serie: string | null;
  canal: number;
  ultimoPulso: string | null;
  error: string | null;
}

export type EstadoReleUsb = Record<'ingreso' | 'salida', EstadoReleMolinete> & {
  /** Relés de aviso de ingreso y de salida denegados (solo los configurados: RELE_AVISO_*_SERIE). */
  avisoIngreso?: EstadoReleMolinete;
  avisoSalida?: EstadoReleMolinete;
};

/**
 * Módulos de relés USB DCTTECH "USBRelay" conectados a la mini PC, que abren
 * los molinetes con un pulso de `RELE_PULSO_MS` (1000 por defecto).
 *
 * Cada molinete se asigna a un módulo por su número de serie
 * (`RELE_INGRESO_SERIE` / `RELE_SALIDA_SERIE`) y a un relé de ese módulo
 * (`RELE_INGRESO_CANAL` / `RELE_SALIDA_CANAL`, 1 por defecto). Sin número de
 * serie se usa el único módulo conectado (si hay uno solo). Los módulos se
 * buscan en cada orden (por su identificación USB en /sys/class/hidraw), así
 * se encuentran aunque se desconecten y se vuelvan a conectar. Los comandos HID
 * los envía `rele-usb` (tools/rele-usb.c, compilado en la imagen): Node no
 * puede hacer ese ioctl. Sin módulo (por ejemplo en AWS), la orden solo queda
 * en el registro.
 *
 * Dos módulos opcionales de **aviso** dan un contacto seco (para una luz, una
 * sirena o un tablero de garita): uno cada vez que se deniega un ingreso
 * (`RELE_AVISO_INGRESO_SERIE`, o `RELE_AVISO_SERIE`) y otro cada vez que se
 * deniega una salida (`RELE_AVISO_SALIDA_SERIE`), con su `…_CANAL` y la
 * duración `RELE_AVISO_PULSO_MS`. Sin número de serie no se usan. Con
 * `RELE_AVISO_INGRESO_MODO` / `RELE_AVISO_SALIDA_MODO` = `alterno`, el aviso da
 * dos pulsos (prende y apaga) separados por `RELE_AVISO_ALTERNO_MS` (3000 por
 * defecto): ver `ModoAviso`.
 */
@Injectable()
export class ReleUsbService {
  private readonly logger = new Logger(ReleUsbService.name);
  private readonly programa = process.env.RELE_USB_PROGRAMA?.trim() || '/app/rele-usb';
  private readonly devServidor = process.env.LECTOR_DNI_DEV_SERVIDOR?.trim() || '/dev';
  private readonly pulsoMs = Number(process.env.RELE_PULSO_MS) || 1000;
  private readonly config: Record<Molinete, { serie: string | null; canal: number }> = {
    ingreso: { serie: process.env.RELE_INGRESO_SERIE?.trim() || null, canal: Number(process.env.RELE_INGRESO_CANAL) || 1 },
    salida: { serie: process.env.RELE_SALIDA_SERIE?.trim() || null, canal: Number(process.env.RELE_SALIDA_CANAL) || 1 },
    avisoIngreso: {
      serie: (process.env.RELE_AVISO_INGRESO_SERIE || process.env.RELE_AVISO_SERIE)?.trim() || null,
      canal: Number(process.env.RELE_AVISO_INGRESO_CANAL || process.env.RELE_AVISO_CANAL) || 1,
    },
    avisoSalida: { serie: process.env.RELE_AVISO_SALIDA_SERIE?.trim() || null, canal: Number(process.env.RELE_AVISO_SALIDA_CANAL) || 1 },
  };
  /** El aviso puede durar distinto que la apertura del molinete (por ejemplo, una sirena de 2 s). */
  private readonly pulsoAvisoMs = Number(process.env.RELE_AVISO_PULSO_MS) || this.pulsoMs;
  private readonly ultimoPulso: Record<Molinete, string | null> = { ingreso: null, salida: null, avisoIngreso: null, avisoSalida: null };
  private readonly ultimoError: Record<Molinete, string | null> = { ingreso: null, salida: null, avisoIngreso: null, avisoSalida: null };
  private readonly modo: Record<Aviso, ModoAviso> = {
    avisoIngreso: modoAviso(process.env.RELE_AVISO_INGRESO_MODO),
    avisoSalida: modoAviso(process.env.RELE_AVISO_SALIDA_MODO),
  };
  /** Cuánto suena un aviso alterno: desde que termina el pulso que lo prende hasta el que lo apaga. */
  private readonly alternoMs = Number(process.env.RELE_AVISO_ALTERNO_MS) || 3000;
  /**
   * Aviso alterno sonando: el apagado programado. El sistema no puede leer si
   * el torniquete pita; lo sabe por los pulsos que dio. Por eso cada aviso se
   * maneja en orden (`colaAviso`) y nunca se da un pulso de más.
   */
  private readonly apagado: Partial<Record<Aviso, ReturnType<typeof setTimeout>>> = {};
  private readonly colaAviso: Record<Aviso, Promise<unknown>> = { avisoIngreso: Promise.resolve(), avisoSalida: Promise.resolve() };

  /** ¿Está configurado ese relé de aviso? Sin número de serie no se usa (no se adivina cuál es). */
  avisoConfigurado(aviso: 'avisoIngreso' | 'avisoSalida'): boolean {
    return !!this.config[aviso].serie;
  }

  /** Todos los módulos conectados, con su número de serie. */
  async modulos(): Promise<ModuloEncontrado[]> {
    let entradas: string[];
    try {
      entradas = fs.readdirSync('/sys/class/hidraw');
    } catch {
      return [];
    }
    const encontrados: ModuloEncontrado[] = [];
    for (const nombre of entradas) {
      try {
        const uevent = fs.readFileSync(`/sys/class/hidraw/${nombre}/device/uevent`, 'utf8');
        if (!uevent.toUpperCase().includes(HID_ID_RELE)) continue;
        const dispositivo = path.posix.join(this.devServidor, nombre);
        const { stdout } = await ejecutar(this.programa, [dispositivo, 'estado']);
        encontrados.push({
          dispositivo,
          modelo: /HID_NAME=(.*)/.exec(uevent)?.[1]?.trim() ?? 'USBRelay',
          serie: stdout.trim().split(/\s+/)[0] ?? '',
        });
      } catch {
        // dispositivo que se fue mientras se leía, o sin permiso
      }
    }
    return encontrados;
  }

  /**
   * El módulo asignado: por número de serie, o el único conectado que no esté
   * asignado a otro relé (así el ingreso no usa el módulo de la salida o del
   * aviso mientras el suyo no esté conectado). Los avisos exigen número de serie.
   */
  private async moduloDe(molinete: Molinete): Promise<ModuloEncontrado | null> {
    const { serie } = this.config[molinete];
    if (esAviso(molinete) && !serie) return null;
    const seriesDeOtros = (Object.keys(this.config) as Molinete[])
      .filter((otro) => otro !== molinete)
      .map((otro) => this.config[otro].serie)
      .filter((s): s is string => !!s);
    const modulos = (await this.modulos()).filter((m) => !seriesDeOtros.includes(m.serie));
    if (serie) return modulos.find((m) => m.serie === serie) ?? null;
    return modulos.length === 1 ? modulos[0] : null;
  }

  /**
   * Pulso en el relé del molinete indicado (o el aviso, según su modo). Nunca
   * lanza: los errores quedan en el registro y en el estado. En un aviso
   * alterno vuelve tras prenderlo; el apagado queda programado.
   */
  async pulso(molinete: Molinete): Promise<boolean> {
    if (esAviso(molinete) && this.modo[molinete] === 'alterno') return this.enOrden(molinete, () => this.prenderAlterno(molinete));
    return this.pulsoSimple(molinete);
  }

  private enOrden<T>(aviso: Aviso, tarea: () => Promise<T>): Promise<T> {
    const resultado = this.colaAviso[aviso].then(tarea, tarea);
    this.colaAviso[aviso] = resultado.catch(() => undefined);
    return resultado;
  }

  /** Denegado con un aviso alterno: si ya suena, solo se alarga; si no, se prende y se programa el apagado. */
  private async prenderAlterno(aviso: Aviso): Promise<boolean> {
    const programado = this.apagado[aviso];
    if (programado) {
      clearTimeout(programado);
      this.programarApagado(aviso, 1);
      this.logger.log(`Contacto de ${NOMBRE[aviso]}: ya estaba sonando; se alarga ${this.alternoMs} ms`);
      return true;
    }
    if (!(await this.pulsoSimple(aviso))) return false; // no se prendió: no hay nada que apagar
    this.programarApagado(aviso, 1);
    return true;
  }

  private programarApagado(aviso: Aviso, intento: number) {
    this.apagado[aviso] = setTimeout(() => void this.enOrden(aviso, () => this.apagarAlterno(aviso, intento)), this.alternoMs);
  }

  /** Segundo pulso: lo apaga. Si falla, sigue sonando y se reintenta (y queda el error a la vista en "Sistema y APIs"). */
  private async apagarAlterno(aviso: Aviso, intento: number) {
    delete this.apagado[aviso];
    if (await this.pulsoSimple(aviso)) {
      this.logger.log(`Contacto de ${NOMBRE[aviso]}: segundo pulso, apagado`);
      return;
    }
    this.ultimoError[aviso] = `No se pudo apagar el aviso (intento ${intento} de ${INTENTOS_APAGADO}): puede seguir sonando`;
    this.logger.error(`${NOMBRE[aviso]}: ${this.ultimoError[aviso]}`);
    if (intento < INTENTOS_APAGADO) this.programarApagado(aviso, intento + 1);
  }

  /** Un pulso (prender, esperar, apagar el relé). Protegido para poder simularlo en las pruebas. */
  protected async pulsoSimple(molinete: Molinete): Promise<boolean> {
    const modulo = await this.moduloDe(molinete);
    const { canal, serie } = this.config[molinete];
    const que = esAviso(molinete) ? NOMBRE[molinete] : `abrir ${NOMBRE[molinete]}`;
    if (!modulo) {
      if (esAviso(molinete) && !serie) return false; // sin relé de aviso configurado: no se usa
      this.logger.warn(`${que}: módulo de relés ${serie ? `${serie} ` : ''}no conectado (orden solo registrada)`);
      return false;
    }
    const pulsoMs = esAviso(molinete) ? this.pulsoAvisoMs : this.pulsoMs;
    try {
      await ejecutar(this.programa, [modulo.dispositivo, String(canal), 'on']);
      await new Promise((r) => setTimeout(r, pulsoMs));
      this.ultimoPulso[molinete] = new Date().toISOString();
      this.ultimoError[molinete] = null;
      this.logger.log(
        esAviso(molinete)
          ? `Contacto de ${NOMBRE[molinete]}: pulso de ${pulsoMs} ms en el relé ${canal} del módulo ${modulo.serie}`
          : `Molinete de ${molinete} abierto: pulso de ${pulsoMs} ms en el relé ${canal} del módulo ${modulo.serie}`,
      );
      return true;
    } catch (error) {
      this.ultimoError[molinete] = (error as Error).message;
      this.logger.error(`No se pudo activar el relé ${canal} (${NOMBRE[molinete]}): ${this.ultimoError[molinete]}`);
      return false;
    } finally {
      // Siempre se intenta apagar, para que el molinete no quede liberado.
      await ejecutar(this.programa, [modulo.dispositivo, String(canal), 'off']).catch((error: Error) =>
        this.logger.error(`No se pudo apagar el relé ${canal} del módulo ${modulo.serie}: ${error.message}`),
      );
    }
  }

  async estado(): Promise<EstadoReleUsb> {
    const de = async (molinete: Molinete): Promise<EstadoReleMolinete> => {
      const modulo = await this.moduloDe(molinete);
      return {
        conectado: !!modulo,
        serie: this.config[molinete].serie ?? modulo?.serie ?? null,
        canal: this.config[molinete].canal,
        ultimoPulso: this.ultimoPulso[molinete],
        error: this.ultimoError[molinete],
      };
    };
    return {
      ingreso: await de('ingreso'),
      salida: await de('salida'),
      ...(this.avisoConfigurado('avisoIngreso') && { avisoIngreso: await de('avisoIngreso') }),
      ...(this.avisoConfigurado('avisoSalida') && { avisoSalida: await de('avisoSalida') }),
    };
  }
}
