import { randomBytes } from 'node:crypto';

/**
 * Tarjeta de contingencia: el QR lleva `TMAM-CONT-` y 20 letras y números al
 * azar (base 32: 100 bits, no se puede adivinar). No lleva el DNI ni el
 * nombre de nadie. Funciones puras, también las usa el lector de DNI en el
 * controlador (sin base de datos).
 */
export const PREFIJO_TARJETA = 'TMAM-CONT-';

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const LARGO = 20;
const PATRON = new RegExp(`^${PREFIJO_TARJETA}[${ALFABETO}]{${LARGO}}$`);

export function generarCodigoTarjeta(): string {
  const bytes = randomBytes(LARGO);
  let codigo = PREFIJO_TARJETA;
  for (const b of bytes) codigo += ALFABETO[b % ALFABETO.length];
  return codigo;
}

/** El código de una tarjeta en lo que leyó el lector (ignorando espacios y caracteres de control), o null. */
export function extraerTarjeta(linea: string): string | null {
  const limpio = linea.replace(/[^\x21-\x7E]/g, '');
  return PATRON.test(limpio) ? limpio : null;
}

/** Día local (AAAA-MM-DD) de una fecha. El proceso corre en la hora de Lima (ver zona-horaria.ts). */
export function diaLocal(fecha: Date): string {
  return fecha.toLocaleDateString('en-CA');
}

/** ¿Ya venció? `venceEl` es el último día en que sirve (columna DATE: llega a medianoche UTC). */
export function tarjetaVencida(venceEl: Date | null, ahora = new Date()): boolean {
  return !!venceEl && venceEl.toISOString().slice(0, 10) < diaLocal(ahora);
}
