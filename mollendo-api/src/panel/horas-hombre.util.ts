/**
 * Horas-hombre: tiempo que cada persona estuvo dentro del terminal (de cada
 * ingreso autorizado a su salida autorizada), sumado por persona y por empresa.
 * Decidido con el cliente (15 y 16/10/2026):
 * - Solo cuentan las visitas completas: ingreso y salida por el molinete. Quien
 *   sigue dentro todavía no suma; sus horas cuentan cuando marca la salida.
 * - Una visita que cruza el periodo suma solo las horas que caen dentro de él.
 * - Una visita con un ingreso o una salida registrados a mano (corrección del
 *   antipassback) no suma: no pasó por el molinete y su hora no es la real.
 * Funciones puras: el servicio lee los movimientos y arma la respuesta.
 */

export interface MovimientoAutorizado {
  personaId: number;
  tipoMovimiento: 'ingreso' | 'salida';
  fechaHora: Date;
  /** Registrado a mano por el vigilante (no pasó por el molinete). */
  correccionManual?: boolean;
}

export interface VisitaConHoras {
  personaId: number;
  ingreso: Date;
  salida: Date;
  /** Milisegundos dentro del periodo (la visita recortada a sus límites). */
  ms: number;
}

/**
 * Empareja cada ingreso con la siguiente salida de la misma persona.
 * `movimientos`: autorizados, de cualquier persona, en cualquier orden.
 * Periodo [inicio, fin): solo cuentan las visitas que se cruzan con él, con sus
 * horas recortadas. Un ingreso sin salida después no forma visita.
 */
export function calcularHorasHombre(movimientos: MovimientoAutorizado[], inicio: Date, fin: Date) {
  const porPersona = new Map<number, MovimientoAutorizado[]>();
  for (const m of movimientos) porPersona.set(m.personaId, [...(porPersona.get(m.personaId) ?? []), m]);

  const visitas: VisitaConHoras[] = [];
  for (const [personaId, propios] of porPersona) {
    propios.sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime());
    let abierto: Date | null = null;
    let abiertoAMano = false;
    for (const m of propios) {
      if (m.tipoMovimiento === 'ingreso') {
        // Dos ingresos seguidos (antes del antipassback): cuenta desde el último.
        abierto = m.fechaHora;
        abiertoAMano = !!m.correccionManual;
      } else if (abierto) {
        const ms = Math.min(m.fechaHora.getTime(), fin.getTime()) - Math.max(abierto.getTime(), inicio.getTime());
        if (ms > 0 && !abiertoAMano && !m.correccionManual) visitas.push({ personaId, ingreso: abierto, salida: m.fechaHora, ms });
        abierto = null;
      }
      // Una salida sin ingreso antes (por ejemplo, entró antes de que se instalara el sistema) no suma.
    }
  }
  return visitas;
}

/** Horas con un decimal, para el gráfico del Dashboard: 8.5. */
export const horasDecimales = (ms: number) => Math.round(ms / 360_000) / 10;
