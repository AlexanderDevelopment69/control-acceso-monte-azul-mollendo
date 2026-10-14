import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export interface ResumenRespaldo {
  archivo: string;
  fecha: string;
  tamanoBytes: number;
}

export interface EstadoRespaldos {
  /** false si la carpeta de respaldos no está disponible (p. ej. en desarrollo). */
  disponible: boolean;
  /** Último respaldo diario automático (mollendo-*). */
  ultimoAutomatico: ResumenRespaldo | null;
  /** Último respaldo previo a una actualización (antes-de-actualizar-*). */
  ultimoPrevioActualizacion: ResumenRespaldo | null;
  cantidad: number;
  /** Hora del respaldo diario (HH:MM, hora de Lima) y días que se guardan, según la configuración. */
  hora: string;
  dias: number;
}

const RESPALDO = /^(mollendo|antes-de-actualizar)-\d{8}-\d{4}\.(tar\.gz|sql\.gz)$/;

/**
 * Lee la carpeta de respaldos (RESPALDOS_PATH, montada en solo lectura en el
 * contenedor del backend) para mostrar en "Sistema y APIs" cuándo fue el último.
 */
export function estadoRespaldos(carpeta = process.env.RESPALDOS_PATH): EstadoRespaldos {
  const config = configuracionRespaldos();
  const sinCarpeta = { disponible: false, ultimoAutomatico: null, ultimoPrevioActualizacion: null, cantidad: 0, ...config };
  if (!carpeta) return sinCarpeta;
  let archivos: ResumenRespaldo[];
  try {
    archivos = readdirSync(carpeta)
      .filter((nombre) => RESPALDO.test(nombre))
      .map((nombre) => {
        const info = statSync(join(carpeta, nombre));
        return { archivo: nombre, fecha: info.mtime.toISOString(), tamanoBytes: info.size };
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  } catch {
    return sinCarpeta;
  }
  return {
    disponible: true,
    ultimoAutomatico: archivos.find((a) => a.archivo.startsWith('mollendo-')) ?? null,
    ultimoPrevioActualizacion: archivos.find((a) => a.archivo.startsWith('antes-de-actualizar-')) ?? null,
    cantidad: archivos.length,
    ...config,
  };
}

/**
 * Hora y días de los respaldos, con los mismos valores por defecto que
 * deploy/comun/respaldo.sh (00:00 y 14; un número de días no válido cuenta como 14).
 */
export function configuracionRespaldos(env: NodeJS.ProcessEnv = process.env): { hora: string; dias: number } {
  const hora = /^\d{1,2}:\d{2}$/.test(env.HORA_RESPALDO ?? '') ? env.HORA_RESPALDO! : '00:00';
  const dias = /^\d+$/.test(env.DIAS_RESPALDO ?? '') && Number(env.DIAS_RESPALDO) > 0 ? Number(env.DIAS_RESPALDO) : 14;
  return { hora, dias };
}
