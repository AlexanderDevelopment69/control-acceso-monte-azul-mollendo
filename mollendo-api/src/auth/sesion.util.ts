/**
 * ¿El token se emitió antes del último cambio de contraseña? Entonces ya no
 * vale: así, al cambiar la contraseña se cierran las sesiones abiertas en
 * otros equipos. `iat` está en segundos; el cambio se guarda redondeado al
 * segundo, para que los tokens nuevos emitidos en ese mismo segundo sí valgan.
 */
export function emitidoAntesDelCambio(iat: number | undefined, passwordCambiadoEn: Date | null): boolean {
  if (!passwordCambiadoEn) return false;
  return (iat ?? 0) < Math.floor(passwordCambiadoEn.getTime() / 1000);
}

/**
 * Evento interno: se cerraron las sesiones de un usuario (dado de baja o con
 * contraseña nueva). El canal en vivo del panel corta sus conexiones abiertas.
 */
export const SESIONES_CERRADAS = 'usuario.sesiones-cerradas';
export interface SesionesCerradasEvent {
  usuarioId: number;
}

/** Momento del cambio de contraseña, redondeado al segundo (ver emitidoAntesDelCambio). */
export function momentoCambioPassword(): Date {
  return new Date(Math.floor(Date.now() / 1000) * 1000);
}
