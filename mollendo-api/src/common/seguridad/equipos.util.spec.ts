import { afterEach, describe, expect, it } from 'vitest';
import {
  atendidoPorPuertoDirecto,
  claveEquiposValida,
  ipEquipoAutorizada,
  ipsEquipoPermitidas,
  serieAutorizada,
  seriesPermitidas,
} from './equipos.util.js';

const original = { ...process.env };
afterEach(() => {
  process.env.DEVICE_API_KEY = original.DEVICE_API_KEY;
  process.env.G4PRO_SN_PERMITIDOS = original.G4PRO_SN_PERMITIDOS;
  if (original.DEVICE_API_KEY === undefined) delete process.env.DEVICE_API_KEY;
  if (original.G4PRO_SN_PERMITIDOS === undefined) delete process.env.G4PRO_SN_PERMITIDOS;
  process.env.G4PRO_IPS_PERMITIDAS = original.G4PRO_IPS_PERMITIDAS;
  if (original.G4PRO_IPS_PERMITIDAS === undefined) delete process.env.G4PRO_IPS_PERMITIDAS;
});

describe('claveEquiposValida', () => {
  it('acepta solo la clave exacta', () => {
    process.env.DEVICE_API_KEY = 'clave-de-prueba-123';
    expect(claveEquiposValida('clave-de-prueba-123')).toBe(true);
    expect(claveEquiposValida('clave-de-prueba-12')).toBe(false);
    expect(claveEquiposValida('otra')).toBe(false);
    expect(claveEquiposValida(undefined)).toBe(false);
    expect(claveEquiposValida(['clave-de-prueba-123'])).toBe(false);
  });

  it('rechaza todo si el servidor no tiene clave', () => {
    delete process.env.DEVICE_API_KEY;
    expect(claveEquiposValida('')).toBe(false);
    expect(claveEquiposValida('cualquiera')).toBe(false);
  });
});

describe('serieAutorizada', () => {
  it('sin lista acepta cualquier terminal', () => {
    delete process.env.G4PRO_SN_PERMITIDOS;
    expect(seriesPermitidas()).toEqual([]);
    expect(serieAutorizada('CUALQUIERA')).toBe(true);
  });

  it('con lista acepta solo esos números de serie (sin importar mayúsculas ni espacios)', () => {
    process.env.G4PRO_SN_PERMITIDOS = ' HSR3263100192 , abc123 ';
    expect(seriesPermitidas()).toEqual(['HSR3263100192', 'ABC123']);
    expect(serieAutorizada('HSR3263100192')).toBe(true);
    expect(serieAutorizada('hsr3263100192')).toBe(true);
    expect(serieAutorizada('ABC123')).toBe(true);
    expect(serieAutorizada('FALSO999')).toBe(false);
    expect(serieAutorizada(undefined)).toBe(false);
    expect(serieAutorizada(['HSR3263100192'])).toBe(false);
  });
});

describe('ipEquipoAutorizada', () => {
  it('sin lista acepta cualquier IP', () => {
    delete process.env.G4PRO_IPS_PERMITIDAS;
    expect(ipsEquipoPermitidas()).toEqual([]);
    expect(ipEquipoAutorizada('8.8.8.8')).toBe(true);
  });

  it('con lista acepta solo esas IP (también escritas como IPv6 "::ffff:")', () => {
    process.env.G4PRO_IPS_PERMITIDAS = ' 190.119.170.73 , 10.0.0.5 ';
    expect(ipEquipoAutorizada('190.119.170.73')).toBe(true);
    expect(ipEquipoAutorizada('::ffff:190.119.170.73')).toBe(true);
    expect(ipEquipoAutorizada('10.0.0.5')).toBe(true);
    expect(ipEquipoAutorizada('190.119.170.74')).toBe(false);
    expect(ipEquipoAutorizada(undefined)).toBe(false);
  });
});

describe('atendidoPorPuertoDirecto', () => {
  it('las rutas del G4 Pro se atienden desde cualquier IP (las protege la serie y la IP del equipo)', () => {
    expect(atendidoPorPuertoDirecto('/iclock/getrequest', '190.119.170.73')).toBe(true);
    expect(atendidoPorPuertoDirecto('/iclock', '8.8.8.8')).toBe(true);
  });

  it('el resto, solo desde la red interna (proxy HTTPS, portal, la propia máquina, la red local)', () => {
    for (const ip of ['172.18.0.5', '::ffff:172.18.0.5', '127.0.0.1', '::1', '192.168.1.20', '10.0.0.8']) {
      expect(atendidoPorPuertoDirecto('/api/v1/auth/login', ip)).toBe(true);
    }
  });

  it('desde internet, sin pasar por HTTPS, se rechaza (no se puede iniciar sesión ni leer datos sin cifrar)', () => {
    expect(atendidoPorPuertoDirecto('/api/v1/auth/login', '190.119.170.73')).toBe(false);
    expect(atendidoPorPuertoDirecto('/api/v1/personas', '::ffff:38.226.245.106')).toBe(false);
    expect(atendidoPorPuertoDirecto('/iclockx', '8.8.8.8')).toBe(false);
    expect(atendidoPorPuertoDirecto('/api/v1/health', undefined)).toBe(false);
  });
});
