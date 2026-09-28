import type { RolUsuario } from '../../generated/prisma/enums.js';

export interface AuthenticatedUser {
  id: number;
  empresaId: number;
  rol: RolUsuario;
  correo: string;
}

export interface JwtPayload {
  sub: number;
  empresaId: number;
  rol: RolUsuario;
  correo: string;
  /** Emitido en (segundos); lo agrega jsonwebtoken al firmar. */
  iat?: number;
}
