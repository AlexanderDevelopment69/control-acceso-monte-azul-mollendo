import { esDocumentoVigente } from '../eventos-acceso/validacion-acceso.engine.js';

/**
 * Cálculos del dashboard (indicadores y gráficos). Son funciones puras sobre
 * los datos ya leídos de la base: el servicio solo consulta y arma la respuesta.
 * Los días se cuentan en la hora local del servidor (Lima, ver zona-horaria.ts).
 * Cada ingreso autorizado de una persona cuenta en el Dashboard como un
 * ingreso (en el código, "visita": el cliente lo llamaba así hasta el 16/10/2026,
 * cuando "Visita" pasó a ser un perfil de persona).
 */

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/**
 * "Permanencia larga": presentes que ingresaron hace más de estas horas (Dashboard
 * y reporte de personal presente). 12 h desde el 15/10/2026 (antes 24 h), a pedido del cliente.
 */
export const HORAS_PERMANENCIA_LARGA = 12;
export const MS_PERMANENCIA_LARGA = HORAS_PERMANENCIA_LARGA * 60 * 60 * 1000;

/** Día local AAAA-MM-DD de una fecha. */
export function claveDia(fecha: Date): string {
  const a = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${a}-${m}-${d}`;
}

/** Todos los días del rango, ambos incluidos (AAAA-MM-DD). */
export function diasDelRango(desde: string, hasta: string): string[] {
  const [a, m, d] = desde.split('-').map(Number);
  const dia = new Date(a, m - 1, d);
  const dias: string[] = [];
  while (claveDia(dia) <= hasta) {
    dias.push(claveDia(dia));
    dia.setDate(dia.getDate() + 1);
  }
  return dias;
}

// ---------------------------------------------------------------------------
// Presencia: quién está dentro ahora
// ---------------------------------------------------------------------------

export interface UltimoMovimiento {
  personaId: number;
  tipoMovimiento: 'ingreso' | 'salida';
  fechaHora: Date;
}

/**
 * Presentes = personas cuyo último movimiento autorizado es un ingreso.
 * Permanencia mayor a 12 horas = presentes que ingresaron hace más de 12 h (HORAS_PERMANENCIA_LARGA).
 */
export function calcularPresencia(ultimos: UltimoMovimiento[], ahora: Date) {
  const dentro = ultimos
    .filter((u) => u.tipoMovimiento === 'ingreso')
    .sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime());
  const limite = ahora.getTime() - MS_PERMANENCIA_LARGA;
  const masDe12h = dentro
    .filter((u) => u.fechaHora.getTime() < limite)
    .sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime());
  return { presentes: dentro.length, dentro, masDe12h };
}

// ---------------------------------------------------------------------------
// Ingresos y salidas del periodo
// ---------------------------------------------------------------------------

/**
 * Movimientos del periodo ya contados en la base de datos: cuántos hubo por
 * día, tipo y resultado, y cuántos de ellos tienen cada motivo de denegación.
 */
export interface GrupoMovimientos {
  /** Día local, AAAA-MM-DD. */
  dia: string;
  tipoMovimiento: 'ingreso' | 'salida';
  resultado: 'autorizado' | 'denegado';
  cantidad: number;
  noRegistrado: number;
  dadoDeBaja: number;
  sinDocumentos: number;
  documentos: number;
  alcohol: number;
  /** No completó rostro y alcohol (también, en "facial primero", sin rostro y alcohol o sin DNI a tiempo). */
  sinVerificacion: number;
  /** Rostro no coincide (también, en "facial primero", sopló otra persona que la del DNI). */
  rostroNoCoincide: number;
  yaDentro: number;
  sinIngreso: number;
}

const MOTIVOS = [
  'noRegistrado',
  'dadoDeBaja',
  'sinDocumentos',
  'documentos',
  'alcohol',
  'sinVerificacion',
  'rostroNoCoincide',
  'yaDentro',
  'sinIngreso',
] as const;

/** Totales, motivos de denegación y serie diaria de los movimientos del periodo. */
export function resumirMovimientos(grupos: GrupoMovimientos[], dias: string[]) {
  const porDia = new Map(dias.map((dia) => [dia, { dia, ingresos: 0, denegados: 0, salidas: 0 }]));
  const totales = { ingresosAutorizados: 0, ingresosDenegados: 0, salidasAutorizadas: 0, salidasDenegadas: 0 };
  const motivos = Object.fromEntries(MOTIVOS.map((m) => [m, 0])) as Record<(typeof MOTIVOS)[number], number>;

  for (const g of grupos) {
    const fila = porDia.get(g.dia);
    const autorizado = g.resultado === 'autorizado';
    if (g.tipoMovimiento === 'ingreso') {
      if (autorizado) totales.ingresosAutorizados += g.cantidad;
      else totales.ingresosDenegados += g.cantidad;
    } else if (autorizado) totales.salidasAutorizadas += g.cantidad;
    else totales.salidasDenegadas += g.cantidad;

    if (fila) {
      if (!autorizado) fila.denegados += g.cantidad;
      else if (g.tipoMovimiento === 'ingreso') fila.ingresos += g.cantidad;
      else fila.salidas += g.cantidad;
    }
    if (!autorizado) for (const m of MOTIVOS) motivos[m] += g[m];
  }
  return { totales, motivos, tendencia: [...porDia.values()] };
}

// ---------------------------------------------------------------------------
// Documentos del personal activo
// ---------------------------------------------------------------------------

/**
 * Vigentes, por vencer (vigentes que vencen dentro de `diasAviso` días) y
 * vencidos, con la misma regla que el molinete (vence hoy = vigente). Recibe
 * solo la última versión de cada documento.
 */
export function clasificarDocumentos(vencimientos: (Date | null)[], hoy: Date, diasAviso = 30) {
  const inicioDeHoy = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const limiteAviso = inicioDeHoy + diasAviso * MS_POR_DIA;
  let vigentes = 0;
  let porVencer = 0;
  let vencidos = 0;
  for (const vence of vencimientos) {
    if (!esDocumentoVigente(vence, hoy)) vencidos++;
    else if (vence && vence.getTime() <= limiteAviso) porVencer++;
    else vigentes++;
  }
  return { vigentes, porVencer, vencidos, diasAviso };
}
