/**
 * Período de autorización del personal (22/10/2026): opcional; si se pone, van
 * las dos fechas (las dos incluidas) y el motivo. Las mismas reglas y mensajes
 * que la API (mollendo-api/src/personas/periodo-autorizacion.ts).
 */
import type { Persona } from "@/lib/api/types";

export interface Periodo {
  /** "AAAA-MM-DD" o "". */
  desde: string;
  hasta: string;
  motivo: string;
}

export const PERIODO_VACIO: Periodo = { desde: "", hasta: "", motivo: "" };

/** El período tal como se guardó (las fechas llegan como medianoche UTC). */
export function periodoDePersona(persona: Pick<Persona, "autorizadoDesde" | "autorizadoHasta" | "motivoAutorizacion">): Periodo {
  return {
    desde: persona.autorizadoDesde?.slice(0, 10) ?? "",
    hasta: persona.autorizadoHasta?.slice(0, 10) ?? "",
    motivo: persona.motivoAutorizacion ?? "",
  };
}

const vacio = (p: Periodo) => !p.desde && !p.hasta && !p.motivo.trim();

/** Qué falta o está mal; null si está bien (o vacío: sin período). */
export function problemaPeriodo(p: Periodo): string | null {
  if (vacio(p)) return null;
  if (!p.desde || !p.hasta || p.motivo.trim().length < 3) {
    return "Complete el período de autorización: fecha de ingreso, fecha de finalización y motivo";
  }
  if (p.hasta < p.desde) return "La fecha de finalización no puede ser anterior a la fecha de ingreso";
  return null;
}

/** Para la API: los tres campos, o los tres en null (sin período). */
export function periodoParaApi(p: Periodo) {
  return vacio(p)
    ? { autorizadoDesde: null, autorizadoHasta: null, motivoAutorizacion: null }
    : { autorizadoDesde: p.desde, autorizadoHasta: p.hasta, motivoAutorizacion: p.motivo.replace(/\s+/g, " ").trim() };
}

/** "22/10/2026" a partir de "2026-10-22…". */
function fechaCorta(fecha: string): string {
  const [a, m, d] = fecha.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

/** "del 22/10/2026 al 31/10/2026" (vacío si no tiene período). */
export function textoPeriodo(persona: Pick<Persona, "autorizadoDesde" | "autorizadoHasta">): string {
  return persona.autorizadoDesde && persona.autorizadoHasta
    ? `del ${fechaCorta(persona.autorizadoDesde)} al ${fechaCorta(persona.autorizadoHasta)}`
    : "";
}
