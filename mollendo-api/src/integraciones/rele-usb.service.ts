import { Injectable, Logger } from '@nestjs/common';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const ejecutar = promisify(execFile);

/** Identificación de los módulos DCTTECH "USBRelay" en /sys/class/hidraw/*\/device/uevent. */
const HID_ID_RELE = '000016C0:000005DF';

type Molinete = 'ingreso' | 'salida';

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

export type EstadoReleUsb = Record<Molinete, EstadoReleMolinete>;

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
  };
  private readonly ultimoPulso: Record<Molinete, string | null> = { ingreso: null, salida: null };
  private readonly ultimoError: Record<Molinete, string | null> = { ingreso: null, salida: null };

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
   * El módulo asignado al molinete: por número de serie, o el único conectado
   * que no esté asignado al otro molinete (así el ingreso no usa el módulo de
   * la salida mientras el suyo no esté conectado).
   */
  private async moduloDe(molinete: Molinete): Promise<ModuloEncontrado | null> {
    const { serie } = this.config[molinete];
    const serieDelOtro = this.config[molinete === 'ingreso' ? 'salida' : 'ingreso'].serie;
    const modulos = (await this.modulos()).filter((m) => !serieDelOtro || m.serie !== serieDelOtro);
    if (serie) return modulos.find((m) => m.serie === serie) ?? null;
    return modulos.length === 1 ? modulos[0] : null;
  }

  /** Pulso en el relé del molinete indicado. Nunca lanza: los errores quedan en el registro y en el estado. */
  async pulso(molinete: Molinete): Promise<boolean> {
    const modulo = await this.moduloDe(molinete);
    const { canal, serie } = this.config[molinete];
    if (!modulo) {
      this.logger.warn(
        `Abrir molinete de ${molinete}: módulo de relés ${serie ? `${serie} ` : ''}no conectado (orden solo registrada)`,
      );
      return false;
    }
    try {
      await ejecutar(this.programa, [modulo.dispositivo, String(canal), 'on']);
      await new Promise((r) => setTimeout(r, this.pulsoMs));
      this.ultimoPulso[molinete] = new Date().toISOString();
      this.ultimoError[molinete] = null;
      this.logger.log(`Molinete de ${molinete} abierto: pulso de ${this.pulsoMs} ms en el relé ${canal} del módulo ${modulo.serie}`);
      return true;
    } catch (error) {
      this.ultimoError[molinete] = (error as Error).message;
      this.logger.error(`No se pudo activar el relé ${canal} (molinete de ${molinete}): ${this.ultimoError[molinete]}`);
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
    return { ingreso: await de('ingreso'), salida: await de('salida') };
  }
}
