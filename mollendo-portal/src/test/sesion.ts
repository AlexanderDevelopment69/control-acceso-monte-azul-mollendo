import type { RolUsuario } from "@/lib/api/types";

/** Token con el payload dado (la firma no importa: el portal no la valida). */
export function tokenDePrueba(payload: object): string {
  const b64 = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `cabecera.${b64}.firma`;
}

/** Token de sesión del rol dado, vigente por una hora (o ya vencido). */
export function tokenDeRol(rol: RolUsuario, { vencido = false } = {}): string {
  const exp = Math.floor(Date.now() / 1000) + (vencido ? -60 : 3600);
  return tokenDePrueba({ sub: 1, empresaId: 1, rol, correo: `${rol}@mollendo.pe`, exp });
}
