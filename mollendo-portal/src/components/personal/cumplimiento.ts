import type { Cumplimiento } from "@/lib/api/types";

/** Las columnas DATE llegan como medianoche UTC: se muestran en UTC para no correrse un día. */
export function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-PE", { timeZone: "UTC" });
}

/** Por qué no puede ingresar; si está de baja, con su motivo (si se registró). */
export function motivosCumplimiento(c: Cumplimiento, motivoBaja?: string | null): string[] {
  if (c.dadoDeBaja) return [motivoBaja ? `Dado de baja: ${motivoBaja}` : "Dado de baja"];
  const motivos: string[] = [];
  if (c.sinDocumentos) motivos.push("Sin documentos cargados");
  if (c.documentosVencidos.length > 0) motivos.push(`Vencido: ${c.documentosVencidos.join(", ")}`);
  return motivos;
}

/** Días enteros desde una fecha DATE (medianoche UTC) hasta hoy (hora local). */
export function diasDesde(fecha: string): number {
  const hoy = new Date();
  const inicioDeHoy = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.round((inicioDeHoy - new Date(fecha).getTime()) / 86_400_000);
}
