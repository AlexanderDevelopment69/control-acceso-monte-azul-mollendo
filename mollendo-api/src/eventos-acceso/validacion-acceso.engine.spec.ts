import { describe, expect, it } from 'vitest';
import { evaluarIngreso, evaluarSalida } from './validacion-acceso.engine.js';

describe('evaluarIngreso', () => {
  it('autoriza cuando la persona está activa, pasa alcohol y tiene todos los documentos', () => {
    const resultado = evaluarIngreso({
      personaActiva: true,
      alcoholConforme: true,
      documentosRequeridos: [{ tipoDocumentoId: 1, nombre: 'SCTR' }],
      documentosVigentesAprobados: new Set([1]),
    });

    expect(resultado).toEqual({
      autorizado: true,
      denegadoPorBaja: false,
      denegadoPorAlcohol: false,
      denegadoPorDocumentos: false,
      documentosFaltantes: [],
    });
  });

  it('deniega de inmediato por baja, sin evaluar alcohol ni documentos', () => {
    const resultado = evaluarIngreso({
      personaActiva: false,
      alcoholConforme: false,
      documentosRequeridos: [{ tipoDocumentoId: 1, nombre: 'SCTR' }],
      documentosVigentesAprobados: new Set(),
    });

    expect(resultado).toEqual({
      autorizado: false,
      denegadoPorBaja: true,
      denegadoPorAlcohol: false,
      denegadoPorDocumentos: false,
      documentosFaltantes: [],
    });
  });

  it('deniega solo por alcohol cuando los documentos están completos', () => {
    const resultado = evaluarIngreso({
      personaActiva: true,
      alcoholConforme: false,
      documentosRequeridos: [{ tipoDocumentoId: 1, nombre: 'SCTR' }],
      documentosVigentesAprobados: new Set([1]),
    });

    expect(resultado.autorizado).toBe(false);
    expect(resultado.denegadoPorAlcohol).toBe(true);
    expect(resultado.denegadoPorDocumentos).toBe(false);
  });

  it('deniega solo por documentos faltantes cuando el alcohol es conforme', () => {
    const resultado = evaluarIngreso({
      personaActiva: true,
      alcoholConforme: true,
      documentosRequeridos: [
        { tipoDocumentoId: 1, nombre: 'SCTR' },
        { tipoDocumentoId: 2, nombre: 'CAMO' },
      ],
      documentosVigentesAprobados: new Set([1]),
    });

    expect(resultado.autorizado).toBe(false);
    expect(resultado.denegadoPorAlcohol).toBe(false);
    expect(resultado.denegadoPorDocumentos).toBe(true);
    expect(resultado.documentosFaltantes).toEqual(['CAMO']);
  });

  it('deniega por ambos motivos a la vez cuando coinciden alcohol y documentos', () => {
    const resultado = evaluarIngreso({
      personaActiva: true,
      alcoholConforme: false,
      documentosRequeridos: [{ tipoDocumentoId: 1, nombre: 'SCTR' }],
      documentosVigentesAprobados: new Set(),
    });

    expect(resultado.autorizado).toBe(false);
    expect(resultado.denegadoPorAlcohol).toBe(true);
    expect(resultado.denegadoPorDocumentos).toBe(true);
    expect(resultado.documentosFaltantes).toEqual(['SCTR']);
  });

  it('autoriza cuando no hay documentos requeridos (puesto sin catálogo asignado aún)', () => {
    const resultado = evaluarIngreso({
      personaActiva: true,
      alcoholConforme: true,
      documentosRequeridos: [],
      documentosVigentesAprobados: new Set(),
    });

    expect(resultado.autorizado).toBe(true);
  });
});

describe('evaluarSalida', () => {
  it('autoriza la salida cuando el último movimiento autorizado fue un ingreso', () => {
    expect(evaluarSalida('ingreso')).toEqual({ autorizado: true, denegadoSinIngresoPrevio: false });
  });

  it('deniega la salida cuando el último movimiento autorizado ya fue una salida', () => {
    expect(evaluarSalida('salida')).toEqual({ autorizado: false, denegadoSinIngresoPrevio: true });
  });

  it('deniega la salida cuando no hay ningún ingreso previo registrado', () => {
    expect(evaluarSalida(null)).toEqual({ autorizado: false, denegadoSinIngresoPrevio: true });
  });
});
