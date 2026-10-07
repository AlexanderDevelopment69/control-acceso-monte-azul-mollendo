/**
 * Ingresos y salidas del Dashboard agrupados según el largo del periodo: una
 * barra por día hasta 2 meses, por semana hasta un año y por mes si es más.
 * Con una barra por día, un año son ~1 100 barras: el navegador se congela
 * ~2 s al dibujarlas y no se distingue nada.
 */
export type PuntoTendencia = { dia: string; ingresos: number; denegados: number; salidas: number };
export type Agrupacion = "dia" | "semana" | "mes";

const MAX_DIAS_POR_DIA = 62;
const MAX_DIAS_POR_SEMANA = 366;

export function agrupacionPara(dias: number): Agrupacion {
  if (dias <= MAX_DIAS_POR_DIA) return "dia";
  return dias <= MAX_DIAS_POR_SEMANA ? "semana" : "mes";
}

/** "2026-09-30" → "30/09". */
const diaCorto = (dia: string) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Lunes de la semana del día (las semanas empiezan el lunes). */
function lunesDe(dia: string): string {
  const fecha = new Date(`${dia}T00:00:00Z`);
  const desdeLunes = (fecha.getUTCDay() + 6) % 7;
  fecha.setUTCDate(fecha.getUTCDate() - desdeLunes);
  return fecha.toISOString().slice(0, 10);
}

/**
 * Agrupa los días y devuelve una etiqueta por barra: el día ("30/09"), el
 * inicio de la semana dentro del periodo ("Sem. 28/09") o el mes ("sep 2026").
 */
export function agruparTendencia(tendencia: PuntoTendencia[]) {
  const agrupacion = agrupacionPara(tendencia.length);
  if (agrupacion === "dia") {
    return { agrupacion, puntos: tendencia.map((t) => ({ ...t, etiqueta: diaCorto(t.dia) })) };
  }
  const grupos = new Map<string, PuntoTendencia & { etiqueta: string }>();
  for (const t of tendencia) {
    const clave = agrupacion === "semana" ? lunesDe(t.dia) : t.dia.slice(0, 7);
    const grupo = grupos.get(clave);
    if (grupo) {
      grupo.ingresos += t.ingresos;
      grupo.denegados += t.denegados;
      grupo.salidas += t.salidas;
    } else {
      // La primera semana puede empezar a mitad de semana: se rotula con su primer día dentro del periodo.
      const etiqueta = agrupacion === "semana" ? `Sem. ${diaCorto(t.dia)}` : `${MESES[Number(t.dia.slice(5, 7)) - 1]} ${t.dia.slice(0, 4)}`;
      grupos.set(clave, { ...t, etiqueta });
    }
  }
  return { agrupacion, puntos: [...grupos.values()] };
}
