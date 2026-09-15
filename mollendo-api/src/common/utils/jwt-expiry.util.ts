import type { SignOptions } from 'jsonwebtoken';

// jsonwebtoken tipa `expiresIn` con un literal restringido (StringValue) en vez
// de `string` — las duraciones vienen de variables de entorno, así que se
// castea en este único punto en vez de repetir `as any` en cada llamada.
export function asJwtExpiry(value: string): SignOptions['expiresIn'] {
  return value as SignOptions['expiresIn'];
}
