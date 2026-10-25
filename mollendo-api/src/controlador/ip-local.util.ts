import os from 'node:os';

/**
 * IP del Controlador (PC) en la red de la garita, para "Sistema y APIs". El
 * controlador usa la red del Controlador (PC) (network_mode: host), así que ve sus
 * interfaces reales; se descartan las internas (Docker, Tailscale, loopback).
 */
export function ipLocalDelEquipo(interfaces = os.networkInterfaces()): string | null {
  const internas = /^(lo|docker|br-|veth|tailscale|virbr|wl)/;
  for (const [nombre, direcciones] of Object.entries(interfaces)) {
    if (internas.test(nombre)) continue;
    const ipv4 = direcciones?.find((d) => d.family === 'IPv4' && !d.internal);
    if (ipv4) return ipv4.address;
  }
  return null;
}
