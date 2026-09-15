import type { RolUsuario } from "@/lib/api/types";

export interface JwtPayload {
  sub: number;
  empresaId: number;
  rol: RolUsuario;
  correo: string;
  exp: number;
}

/** Decodifica el payload del JWT en el cliente — solo lectura, no valida la firma (eso lo hace el backend). */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payloadB64 = token.split(".")[1];
    const json = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(payload: JwtPayload): boolean {
  return payload.exp * 1000 < Date.now();
}
