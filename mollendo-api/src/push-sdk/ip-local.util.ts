/**
 * IP del equipo en su red, de los datos que envía el G4 Pro: en /iclock/registry
 * separados por comas ("~DeviceName=G4 Pro,MAC=…,IPAddress=172.20.20.198,…") y en
 * la respuesta al comando INFO uno por línea. Solo el campo IPAddress exacto (no
 * GATEWAYIPAddress ni otros que terminan igual).
 */
export function ipLocalDeRegistro(cuerpo: unknown): string | null {
  if (typeof cuerpo !== 'string') return null;
  const ip = /(?:^|[,~\s])IPAddress=(\d{1,3}(?:\.\d{1,3}){3})(?=[,\s]|$)/.exec(cuerpo)?.[1];
  return ip ?? null;
}
