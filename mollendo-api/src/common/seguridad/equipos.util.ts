import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * ¿La clave recibida es la clave de equipos (DEVICE_API_KEY)? Comparación en
 * tiempo constante: no deja adivinar la clave midiendo cuánto tarda la respuesta.
 * Se comparan los hash para que los dos lados tengan el mismo largo.
 */
export function claveEquiposValida(recibida: unknown): boolean {
  const esperada = process.env.DEVICE_API_KEY;
  if (!esperada || typeof recibida !== 'string') return false;
  const hash = (texto: string) => createHash('sha256').update(texto).digest();
  return timingSafeEqual(hash(recibida), hash(esperada));
}

/**
 * Números de serie de los terminales faciales autorizados (G4PRO_SN_PERMITIDOS,
 * separados por coma). Vacío = se acepta cualquiera (solo para pruebas: en
 * producción hay que fijarlo, porque las rutas /iclock no llevan clave).
 */
export function seriesPermitidas(): string[] {
  return (process.env.G4PRO_SN_PERMITIDOS ?? '')
    .split(',')
    .map((sn) => sn.trim().toUpperCase())
    .filter(Boolean);
}

/** ¿Puede comunicarse este terminal? Sin lista configurada, cualquiera. */
export function serieAutorizada(sn: unknown): boolean {
  const permitidas = seriesPermitidas();
  if (permitidas.length === 0) return true;
  return typeof sn === 'string' && permitidas.includes(sn.trim().toUpperCase());
}
