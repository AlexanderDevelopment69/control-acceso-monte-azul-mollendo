/**
 * Período de autorización del personal (22/10/2026): opcional; si se pone, van
 * las dos fechas (ingreso y finalización, las dos incluidas) y el motivo. Lo
 * usan el formulario (PersonasService) y la carga masiva, con los mismos
 * mensajes.
 */
export interface PeriodoAutorizacion {
  autorizadoDesde: Date | null;
  autorizadoHasta: Date | null;
  motivoAutorizacion: string | null;
}

export const SIN_PERIODO: PeriodoAutorizacion = { autorizadoDesde: null, autorizadoHasta: null, motivoAutorizacion: null };

export const PERIODO_INCOMPLETO = 'Complete el período de autorización: fecha de ingreso, fecha de finalización y motivo';
export const PERIODO_AL_REVES = 'La fecha de finalización no puede ser anterior a la fecha de ingreso';

/** "2026-10-22" → fecha (medianoche UTC, como guarda Prisma una columna DATE); null si no es una fecha real. */
export function fechaDeTexto(texto: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto.trim());
  if (!m) return null;
  const fecha = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return fecha.getUTCDate() === Number(m[3]) && fecha.getUTCMonth() === Number(m[2]) - 1 ? fecha : null;
}

/** Fecha guardada (DATE) → "2026-10-22". */
export function textoDeFecha(fecha: Date | null): string | null {
  return fecha ? fecha.toISOString().slice(0, 10) : null;
}

/** Fecha guardada (DATE) → "22/10/2026". */
export function fechaCorta(fecha: Date): string {
  const [a, m, d] = fecha.toISOString().slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

/**
 * Valida y normaliza el período: todo vacío = sin período; si hay algo, las dos
 * fechas (AAAA-MM-DD) y el motivo (3 a 300 caracteres), y la finalización no
 * antes del ingreso. Devuelve el período o el mensaje de error.
 */
export function normalizarPeriodo(entrada: {
  desde?: string | null;
  hasta?: string | null;
  motivo?: string | null;
}): PeriodoAutorizacion | string {
  const desdeTexto = entrada.desde?.trim() ?? '';
  const hastaTexto = entrada.hasta?.trim() ?? '';
  const motivo = entrada.motivo?.replace(/\s+/g, ' ').trim() ?? '';
  if (!desdeTexto && !hastaTexto && !motivo) return SIN_PERIODO;
  if (!desdeTexto || !hastaTexto || motivo.length < 3) return PERIODO_INCOMPLETO;
  const desde = fechaDeTexto(desdeTexto);
  const hasta = fechaDeTexto(hastaTexto);
  if (!desde) return 'La fecha de ingreso no es válida';
  if (!hasta) return 'La fecha de finalización no es válida';
  if (hasta.getTime() < desde.getTime()) return PERIODO_AL_REVES;
  if (motivo.length > 300) return 'El motivo de la autorización puede tener hasta 300 caracteres';
  return { autorizadoDesde: desde, autorizadoHasta: hasta, motivoAutorizacion: motivo };
}

/** "del 22/10/2026 al 31/10/2026". */
export function textoPeriodo(p: { autorizadoDesde: Date | null; autorizadoHasta: Date | null }): string {
  return p.autorizadoDesde && p.autorizadoHasta ? `del ${fechaCorta(p.autorizadoDesde)} al ${fechaCorta(p.autorizadoHasta)}` : '';
}
