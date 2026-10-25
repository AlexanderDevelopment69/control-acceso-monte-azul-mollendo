import type os from 'node:os';
import { ipLocalDelEquipo } from './ip-local.util.js';

const ip = (address: string, family: 'IPv4' | 'IPv6' = 'IPv4', internal = false) =>
  ({ address, family, internal, netmask: '', mac: '', cidr: null }) as os.NetworkInterfaceInfo;

describe('IP del Controlador (PC) en la garita', () => {
  it('la de la tarjeta de red, sin las de Docker, Tailscale ni loopback', () => {
    expect(
      ipLocalDelEquipo({
        lo: [ip('127.0.0.1', 'IPv4', true)],
        docker0: [ip('172.17.0.1')],
        'br-ab484dd9e58f': [ip('10.250.0.1')],
        tailscale0: [ip('100.78.153.33')],
        enp86s0: [ip('fe80::1', 'IPv6'), ip('172.20.20.197')],
      }),
    ).toBe('172.20.20.197');
  });

  it('sin red: null', () => {
    expect(ipLocalDelEquipo({ lo: [ip('127.0.0.1', 'IPv4', true)] })).toBeNull();
  });
});
