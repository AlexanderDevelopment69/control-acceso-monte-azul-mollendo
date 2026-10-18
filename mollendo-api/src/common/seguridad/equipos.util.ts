import { createHash, timingSafeEqual } from 'node:crypto';
import { esIpInterna } from '../../auth/limite-intentos.js';

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

/**
 * Direcciones IP desde donde se conectan los terminales faciales
 * (G4PRO_IPS_PERMITIDAS, separadas por coma): la IP pública de la sede. Vacío =
 * cualquiera. El número de serie solo no basta: viaja sin cifrar (el G4 usa
 * HTTP) y quien lo conozca podría hacerse pasar por el equipo.
 */
export function ipsEquipoPermitidas(): string[] {
  return (process.env.G4PRO_IPS_PERMITIDAS ?? '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);
}

/** La IP tal como la escribe una persona (sin el prefijo IPv6 de las IPv4: "::ffff:"). */
export function limpiarIp(ip: string | undefined): string {
  return (ip ?? '').replace(/^::ffff:/, '');
}

/** ¿Llega el terminal desde una IP permitida? Sin lista configurada, desde cualquiera. */
export function ipEquipoAutorizada(ip: string | undefined): boolean {
  const permitidas = ipsEquipoPermitidas();
  if (permitidas.length === 0) return true;
  return permitidas.includes(limpiarIp(ip));
}

/**
 * ¿Se atiende este pedido que llegó directo al puerto de la API? El puerto da a
 * internet solo para el G4 Pro (/iclock, que no sabe usar HTTPS). Lo demás
 * (inicio de sesión, datos) entra por el proxy HTTPS o desde la red interna
 * (el proxy, el portal, la propia máquina o la red local de la mini PC): así
 * nadie puede iniciar sesión ni leer datos sin cifrar.
 */
export function atendidoPorPuertoDirecto(ruta: string, ipConexion: string | undefined): boolean {
  if (ruta === '/iclock' || ruta.startsWith('/iclock/')) return true;
  return !!ipConexion && esIpInterna(ipConexion);
}

/**
 * A quien abre el puerto directo en el navegador (por error, con la IP en vez
 * del dominio) se le manda al portal seguro: el primer origen https de
 * CORS_ORIGIN. null = no es un navegador abriendo una página, o no hay portal
 * con HTTPS configurado: se responde "No encontrado".
 */
export function portalParaNavegador(metodo: string, accept: string | undefined, origenes = process.env.CORS_ORIGIN): string | null {
  if (metodo !== 'GET' && metodo !== 'HEAD') return null;
  if (!(accept ?? '').includes('text/html')) return null;
  const portal = (origenes ?? '')
    .split(',')
    .map((origen) => origen.trim())
    .find((origen) => origen.startsWith('https://'));
  return portal ? `${portal.replace(/\/+$/, '')}/` : null;
}

/** ¿Puede comunicarse este terminal? Sin lista configurada, cualquiera. */
export function serieAutorizada(sn: unknown): boolean {
  const permitidas = seriesPermitidas();
  if (permitidas.length === 0) return true;
  return typeof sn === 'string' && permitidas.includes(sn.trim().toUpperCase());
}
