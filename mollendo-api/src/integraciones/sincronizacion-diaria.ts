import fs from 'node:fs';
import path from 'node:path';

// Hora de la sincronización diaria con los G4 Pro. Se cambia desde "Sistema y
// APIs" y se guarda en el volumen de documentos (sobrevive a los reinicios);
// mientras nadie la cambie, vale G4PRO_HORA_SINCRONIZACION del .env.

const archivo = () =>
  path.join(path.dirname(process.env.DOCUMENTOS_STORAGE_PATH ?? './storage/documentos'), 'sincronizacion-diaria.json');

/** "0".."23" = esa hora (hora de Lima); "off" o cualquier otro valor = desactivada. */
export function horaDeTexto(valor: string): number | null {
  const v = valor.trim();
  return /^\d{1,2}$/.test(v) && Number(v) < 24 ? Number(v) : null;
}

/** La hora elegida en el portal; si nunca se eligió, la del .env (0 por defecto). */
export function leerHoraDiaria(): number | null {
  try {
    const { hora } = JSON.parse(fs.readFileSync(archivo(), 'utf8')) as { hora: number | null };
    return typeof hora === 'number' && hora >= 0 && hora < 24 ? hora : null;
  } catch {
    return horaDeTexto(process.env.G4PRO_HORA_SINCRONIZACION ?? '0');
  }
}

/** Cuándo y quién la cambió por última vez en el portal (null si nunca se cambió, o antes del 20/10/2026). */
export function leerCambioDiaria(): { desde: string | null; cambiadoPor: string | null } {
  try {
    const { desde, cambiadoPor } = JSON.parse(fs.readFileSync(archivo(), 'utf8')) as { desde?: string; cambiadoPor?: string };
    return { desde: desde ?? null, cambiadoPor: cambiadoPor ?? null };
  } catch {
    return { desde: null, cambiadoPor: null };
  }
}

export function guardarHoraDiaria(hora: number | null, cambiadoPor?: string): void {
  fs.mkdirSync(path.dirname(archivo()), { recursive: true });
  fs.writeFileSync(archivo(), JSON.stringify({ hora, desde: new Date().toISOString(), cambiadoPor: cambiadoPor ?? null }));
}
