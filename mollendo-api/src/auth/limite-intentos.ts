import type { ThrottlerModuleOptions } from '@nestjs/throttler';

/** Ventana de los límites de intentos de inicio de sesión. */
export const VENTANA_INTENTOS_MS = 60_000;
/** Intentos por minuto con un mismo correo desde una misma dirección IP. */
export const INTENTOS_POR_CUENTA = 5;
/** Intentos por minuto desde una misma IP, sumando todos los correos. */
export const INTENTOS_POR_IP = 20;

const correoDe = (req: Record<string, any>) =>
  typeof req.body?.correo === 'string' ? req.body.correo.trim().toLowerCase() : '';

/**
 * ¿Le falta el correo o la contraseña? Ese envío no puede adivinar ninguna
 * contraseña (se rechaza por datos incompletos), así que no cuenta como
 * intento: tocar "Ingresar" con el formulario vacío no bloquea a nadie.
 */
export function sinDatosDeIngreso(body: unknown): boolean {
  const b = (body ?? {}) as { correo?: unknown; password?: unknown };
  return typeof b.correo !== 'string' || !b.correo.trim() || typeof b.password !== 'string' || !b.password;
}

const sinDatos = (context: { switchToHttp: () => { getRequest: <T>() => T } }) =>
  sinDatosDeIngreso(context.switchToHttp().getRequest<{ body?: unknown }>().body);

/**
 * ¿La IP es de la propia máquina o de una red privada? Es lo que se ve cuando
 * el pedido llega reenviado por el portal (Next no manda la IP del usuario):
 * esa IP es la misma para todos, así que no sirve para limitar por IP.
 */
export function esIpInterna(ip: string | undefined): boolean {
  const limpia = (ip ?? '').replace(/^::ffff:/, '');
  return (
    limpia === '' ||
    limpia === '::1' ||
    /^127\./.test(limpia) ||
    /^10\./.test(limpia) ||
    /^192\.168\./.test(limpia) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(limpia) ||
    /^f[cd][0-9a-f]{2}:/i.test(limpia)
  );
}

/**
 * Límite de intentos del login, contra quien prueba contraseñas: 5 por minuto
 * por correo e IP (no bloquea a los demás usuarios de la misma oficina) y 20
 * por minuto por IP (quien prueba con muchos correos). Al pasarse, responde 429
 * hasta que termine el minuto. Se aplica solo en POST /auth/login.
 *
 * Por el portal la API no ve la IP del usuario (todos llegan con la del
 * portal): ahí rige el límite por correo y el de IP se omite, para que los
 * intentos de uno no bloqueen a todos. Con un proxy HTTPS que mande
 * X-Forwarded-For (trust proxy en main.ts), los dos límites usan la IP real.
 */
export const opcionesLimiteIntentos: ThrottlerModuleOptions = {
  errorMessage: 'Demasiados intentos de inicio de sesión. Espere un minuto y vuelva a intentarlo.',
  throttlers: [
    {
      name: 'cuenta',
      ttl: VENTANA_INTENTOS_MS,
      limit: INTENTOS_POR_CUENTA,
      getTracker: (req) => `${req.ip ?? ''}|${correoDe(req)}`,
      skipIf: sinDatos,
    },
    {
      name: 'ip',
      ttl: VENTANA_INTENTOS_MS,
      limit: INTENTOS_POR_IP,
      getTracker: (req) => String(req.ip ?? ''),
      skipIf: (context) => sinDatos(context) || esIpInterna(context.switchToHttp().getRequest<{ ip?: string }>().ip),
    },
  ],
};
