/**
 * Un reporte es una tabla con título y filtros: los generadores de Excel y PDF
 * (reporte-excel.ts, reporte-pdf.ts) la dibujan igual para todos los reportes.
 */

/**
 * Cómo se muestra una columna. `fecha` = columna DATE (medianoche UTC); `fechaHora` = instante;
 * `horas` = milisegundos, mostrados como "61:01" (horas:minutos) (en Excel, una duración que se puede sumar).
 */
export type TipoColumna = 'texto' | 'numero' | 'fecha' | 'fechaHora' | 'horas';

export interface Columna {
  titulo: string;
  tipo?: TipoColumna;
  /** Qué significa la columna: va en la hoja "Leyenda" del Excel y al final del PDF. */
  descripcion: string;
  /** Ancho en Excel (caracteres). En el PDF se reparte el ancho de la página en proporción. */
  ancho: number;
}

/** Celda con enlace (en el ZIP de documentos, al archivo dentro del mismo ZIP). */
export interface Enlace {
  texto: string;
  enlace: string;
}

export type Celda = string | number | Date | Enlace | null;

export interface Reporte {
  titulo: string;
  /** Nombre del archivo, sin extensión. */
  archivo: string;
  /** Filtros aplicados, para el encabezado ("Periodo: …", "Empresa: …"). */
  filtros: string[];
  columnas: Columna[];
  filas: Celda[][];
  /** Totales para el pie ("Total: 38", "Finalizadas: 13"…). */
  resumen: string[];
  /**
   * Tablas adicionales, después de la principal (en Excel, cada una en su hoja;
   * en el PDF, una debajo de otra). Por ejemplo, el detalle por persona de las horas-hombre.
   */
  secciones?: SeccionReporte[];
}

export interface SeccionReporte {
  titulo: string;
  /** Una línea que explica la tabla (debajo del título). */
  nota?: string;
  columnas: Columna[];
  filas: Celda[][];
}

const dos = (n: number) => String(n).padStart(2, '0');

/** Instante en la hora local del servidor (Lima): 30/09/2026 14:05. */
export function textoFechaHora(fecha: Date): string {
  return `${dos(fecha.getDate())}/${dos(fecha.getMonth() + 1)}/${fecha.getFullYear()} ${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`;
}

/** Columna DATE (llega como medianoche UTC): 30/09/2026, sin correrse un día. */
export function textoFecha(fecha: Date): string {
  return `${dos(fecha.getUTCDate())}/${dos(fecha.getUTCMonth() + 1)}/${fecha.getUTCFullYear()}`;
}

/** "2026-09-30" → "30/09/2026". */
export function textoDia(dia: string): string {
  const [a, m, d] = dia.split('-');
  return `${d}/${m}/${a}`;
}

/**
 * Leyenda del reporte: cada columna (de todas sus tablas, sin repetir) con lo
 * que significa.
 */
export function leyenda(reporte: Reporte): [string, string][] {
  const vistas = new Map<string, string>();
  for (const c of [reporte.columnas, ...(reporte.secciones ?? []).map((s) => s.columnas)].flat()) {
    if (!vistas.has(c.titulo)) vistas.set(c.titulo, c.descripcion);
  }
  return [...vistas];
}

/** Horas:minutos exactas al minuto, sin pasar a días: "61:01". */
export function textoHoras(ms: number): string {
  const minutos = Math.round(ms / 60_000);
  return `${Math.floor(minutos / 60)}:${dos(minutos % 60)}`;
}

/** Duración legible: "2 h 05 min", "3 días 4 h". */
export function textoDuracion(ms: number): string {
  const minutos = Math.max(0, Math.floor(ms / 60_000));
  const horas = Math.floor(minutos / 60);
  if (horas >= 48) return `${Math.floor(horas / 24)} días ${horas % 24} h`;
  return `${horas} h ${dos(minutos % 60)} min`;
}
