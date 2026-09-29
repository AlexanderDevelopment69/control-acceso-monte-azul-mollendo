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
}

const RESPALDO = /^(mollendo|antes-de-actualizar)-\d{8}-\d{4}\.(tar\.gz|sql\.gz)$/;

/**
 * Lee la carpeta de respaldos (RESPALDOS_PATH, montada en solo lectura en el
 * contenedor del backend) para mostrar en "Sistema y APIs" cuándo fue el último.
 */
export function estadoRespaldos(carpeta = process.env.RESPALDOS_PATH): EstadoRespaldos {
  if (!carpeta) return { disponible: false, ultimoAutomatico: null, ultimoPrevioActualizacion: null, cantidad: 0 };
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
    return { disponible: false, ultimoAutomatico: null, ultimoPrevioActualizacion: null, cantidad: 0 };
  }
  return {
    disponible: true,
    ultimoAutomatico: archivos.find((a) => a.archivo.startsWith('mollendo-')) ?? null,
    ultimoPrevioActualizacion: archivos.find((a) => a.archivo.startsWith('antes-de-actualizar-')) ?? null,
    cantidad: archivos.length,
  };
}
