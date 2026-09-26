import { describe, expect, it } from 'vitest';
import { esDocumentoVigente, evaluarIngreso, tiposDocumentoVigentes } from './validacion-acceso.engine.js';

const SCTR = { tipoDocumentoId: 1, nombre: 'SCTR' };
const CAMO = { tipoDocumentoId: 2, nombre: 'CAMO' };

describe('evaluarIngreso', () => {
  it('autoriza cuando la persona está activa, tiene puesto, pasa alcohol y tiene todos los documentos', () => {
    const resultado = evaluarIngreso({
      personaActiva: true,
      tienePuesto: true,
      alcoholConforme: true,
      documentosRequeridos: [SCTR],
      documentosVigentes: new Set([1]),
    });

    expect(resultado).toEqual({
      autorizado: true,
      denegadoPorBaja: false,
      denegadoSinPuesto: false,
      denegadoPorAlcohol: false,
      denegadoPorDocumentos: false,
      documentosFaltantes: [],
    });
  });

  it('deniega de inmediato por baja, sin evaluar puesto, alcohol ni documentos', () => {
    const resultado = evaluarIngreso({
      personaActiva: false,
      tienePuesto: false,
      alcoholConforme: false,
      documentosRequeridos: [SCTR],
      documentosVigentes: new Set(),
    });

    expect(resultado).toEqual({
      autorizado: false,
      denegadoPorBaja: true,
      denegadoSinPuesto: false,
      denegadoPorAlcohol: false,
      denegadoPorDocumentos: false,
      documentosFaltantes: [],
    });
  });

  it('deniega a una persona sin puesto asignado aunque no haya documentos requeridos', () => {
    const resultado = evaluarIngreso({
      personaActiva: true,
      tienePuesto: false,
      alcoholConforme: true,
      documentosRequeridos: [],
      documentosVigentes: new Set(),
    });

    expect(resultado.autorizado).toBe(false);
    expect(resultado.denegadoSinPuesto).toBe(true);
    expect(resultado.denegadoPorAlcohol).toBe(false);
  });

  it('sin puesto y con alcohol no conforme informa ambos motivos', () => {
    const resultado = evaluarIngreso({
      personaActiva: true,
      tienePuesto: false,
      alcoholConforme: false,
      documentosRequeridos: [],
      documentosVigentes: new Set(),
    });

    expect(resultado.denegadoSinPuesto).toBe(true);
    expect(resultado.denegadoPorAlcohol).toBe(true);
  });

  it('autoriza a una persona con puesto que no exige documentos', () => {
    const resultado = evaluarIngreso({
      personaActiva: true,
      tienePuesto: true,
      alcoholConforme: true,
      documentosRequeridos: [],
      documentosVigentes: new Set(),
    });

    expect(resultado.autorizado).toBe(true);
  });

  it('deniega solo por alcohol cuando los documentos están completos', () => {
    const resultado = evaluarIngreso({
      personaActiva: true,
      tienePuesto: true,
      alcoholConforme: false,
      documentosRequeridos: [SCTR],
      documentosVigentes: new Set([1]),
    });

    expect(resultado.autorizado).toBe(false);
    expect(resultado.denegadoPorAlcohol).toBe(true);
    expect(resultado.denegadoPorDocumentos).toBe(false);
  });

  it('deniega solo por documentos faltantes o vencidos cuando el alcohol es conforme', () => {
    const resultado = evaluarIngreso({
      personaActiva: true,
      tienePuesto: true,
      alcoholConforme: true,
      documentosRequeridos: [SCTR, CAMO],
      documentosVigentes: new Set([1]),
    });

    expect(resultado.autorizado).toBe(false);
    expect(resultado.denegadoPorAlcohol).toBe(false);
    expect(resultado.denegadoPorDocumentos).toBe(true);
    expect(resultado.documentosFaltantes).toEqual(['CAMO']);
  });

  it('deniega por ambos motivos a la vez cuando coinciden alcohol y documentos', () => {
    const resultado = evaluarIngreso({
      personaActiva: true,
      tienePuesto: true,
      alcoholConforme: false,
      documentosRequeridos: [SCTR],
      documentosVigentes: new Set(),
    });

    expect(resultado.autorizado).toBe(false);
    expect(resultado.denegadoPorAlcohol).toBe(true);
    expect(resultado.denegadoPorDocumentos).toBe(true);
    expect(resultado.documentosFaltantes).toEqual(['SCTR']);
  });
});

describe('tiposDocumentoVigentes', () => {
  const fecha = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
  const hoy = new Date(2026, 8, 26, 10, 0);

  it('solo cuenta la última versión de cada tipo', () => {
    const vigentes = tiposDocumentoVigentes(
      [
        // SCTR: la v1 vencida fue renovada por una v2 vigente → vigente
        { id: 1, tipoDocumentoId: 1, version: 1, fechaVencimiento: fecha('2026-01-01') },
        { id: 2, tipoDocumentoId: 1, version: 2, fechaVencimiento: fecha('2027-01-01') },
        // CAMO: la v2 (la última) está vencida aunque la v1 no → no vigente
        { id: 3, tipoDocumentoId: 2, version: 2, fechaVencimiento: fecha('2026-09-01') },
        { id: 4, tipoDocumentoId: 2, version: 1, fechaVencimiento: fecha('2030-01-01') },
      ],
      hoy,
    );

    expect([...vigentes]).toEqual([1]);
  });
});

describe('esDocumentoVigente', () => {
  // Las columnas DATE llegan de Prisma como medianoche UTC.
  const fecha = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
  const hoy = new Date(2026, 8, 26, 15, 30); // 26/09/2026 15:30 hora local

  it('un documento sin fecha de vencimiento siempre está vigente', () => {
    expect(esDocumentoVigente(null, hoy)).toBe(true);
  });

  it('un documento que vence hoy sigue vigente todo el día', () => {
    expect(esDocumentoVigente(fecha('2026-09-26'), hoy)).toBe(true);
  });

  it('un documento que venció ayer ya no está vigente', () => {
    expect(esDocumentoVigente(fecha('2026-09-25'), hoy)).toBe(false);
  });

  it('un documento que vence en el futuro está vigente', () => {
    expect(esDocumentoVigente(fecha('2027-01-01'), hoy)).toBe(true);
  });
});
