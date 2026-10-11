import { afterEach, describe, expect, it } from 'vitest';
import { claveEquiposValida, serieAutorizada, seriesPermitidas } from './equipos.util.js';

const original = { ...process.env };
afterEach(() => {
  process.env.DEVICE_API_KEY = original.DEVICE_API_KEY;
  process.env.G4PRO_SN_PERMITIDOS = original.G4PRO_SN_PERMITIDOS;
  if (original.DEVICE_API_KEY === undefined) delete process.env.DEVICE_API_KEY;
  if (original.G4PRO_SN_PERMITIDOS === undefined) delete process.env.G4PRO_SN_PERMITIDOS;
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
