/**
 * IP del equipo en su red, del cuerpo de /iclock/registry: el G4 Pro envía sus
 * datos separados por comas ("~DeviceName=G4 Pro,MAC=…,IPAddress=172.20.20.198,…").
 * Solo el campo IPAddress exacto (no GATEWAYIPAddress ni otros que terminan igual).
 */
export function ipLocalDeRegistro(cuerpo: unknown): string | null {
  if (typeof cuerpo !== 'string') return null;
  const ip = /(?:^|[,~\s])IPAddress=(\d{1,3}(?:\.\d{1,3}){3})(?=[,\s]|$)/.exec(cuerpo)?.[1];
  return ip ?? null;
}
