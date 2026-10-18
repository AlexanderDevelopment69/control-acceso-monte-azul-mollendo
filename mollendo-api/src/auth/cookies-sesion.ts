import type { CookieOptions, Request, Response } from 'express';

/**
 * La sesión del portal viaja en cookies que el navegador guarda pero el código
 * de la página no puede leer (httpOnly): si alguien lograra ejecutar código en
 * el portal, no podría robar la sesión. SameSite=Strict: el navegador no las
 * manda desde otros sitios. Secure cuando la conexión es HTTPS (en la nube; en
 * una instalación local por HTTP no se podrían usar).
 */
export const COOKIE_ACCESO = 'mollendo_sesion';
export const COOKIE_RENOVACION = 'mollendo_renovacion';

/** La de acceso viaja con toda la API; la de renovación, solo con /auth (donde se renueva o se cierra). */
const RUTA_ACCESO = '/api/v1';
const RUTA_RENOVACION = '/api/v1/auth';

/** "1h", "7d", "30m", "45s" o segundos → milisegundos (los mismos valores que JWT_EXPIRES_IN). */
export function duracionMs(texto: string | undefined, porDefecto: string): number {
  const valor = (texto ?? porDefecto).trim();
  const m = /^(\d+)\s*([smhd]?)$/.exec(valor);
  if (!m) return duracionMs(porDefecto, porDefecto);
  const n = Number(m[1]);
  const factor = { '': 1000, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[m[2] as '' | 's' | 'm' | 'h' | 'd'];
  return n * factor;
}

function opciones(req: Request, path: string, maxAge?: number): CookieOptions {
  return { httpOnly: true, secure: req.secure, sameSite: 'strict', path, ...(maxAge !== undefined ? { maxAge } : {}) };
}

/** Guarda la sesión en las cookies (al iniciar sesión, renovarla o cambiar la contraseña). */
export function guardarSesion(req: Request, res: Response, tokens: { accessToken: string; refreshToken: string }): void {
  res.cookie(COOKIE_ACCESO, tokens.accessToken, opciones(req, RUTA_ACCESO, duracionMs(process.env.JWT_EXPIRES_IN, '1h')));
  res.cookie(COOKIE_RENOVACION, tokens.refreshToken, opciones(req, RUTA_RENOVACION, duracionMs(process.env.JWT_REFRESH_EXPIRES_IN, '7d')));
}

/** Borra las cookies de la sesión (al cerrarla). */
export function borrarSesion(req: Request, res: Response): void {
  res.clearCookie(COOKIE_ACCESO, opciones(req, RUTA_ACCESO));
  res.clearCookie(COOKIE_RENOVACION, opciones(req, RUTA_RENOVACION));
}

/** Valor de una cookie del encabezado "Cookie", o null. */
export function leerCookie(encabezado: string | undefined, nombre: string): string | null {
  for (const parte of (encabezado ?? '').split(';')) {
    const igual = parte.indexOf('=');
    if (igual > 0 && parte.slice(0, igual).trim() === nombre) {
      const valor = parte.slice(igual + 1).trim();
      try {
        return decodeURIComponent(valor) || null;
      } catch {
        return valor || null;
      }
    }
  }
  return null;
}
