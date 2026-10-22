import { describe, expect, it } from 'vitest';
import { documentosActuales, esDocumentoVigente, evaluarIngreso, fueraDelPeriodo } from './validacion-acceso.engine.js';

const SCTR_VIGENTE = { tipoDocumentoId: 1, nombre: 'SCTR', vigente: true };
const SCTR_VENCIDO = { tipoDocumentoId: 1, nombre: 'SCTR', vigente: false };
const INDUCCION_VIGENTE = { tipoDocumentoId: 2, nombre: 'Inducción', vigente: true };

describe('evaluarIngreso', () => {
  it('autoriza cuando la persona está activa, pasa alcohol y todos sus documentos están vigentes', () => {
    const resultado = evaluarIngreso({
      personaActiva: true,
      alcoholConforme: true,
      documentos: [SCTR_VIGENTE, INDUCCION_VIGENTE],
    });

    expect(resultado).toEqual({
      autorizado: true,
      denegadoPorBaja: false,
      denegadoSinDocumentos: false,
      denegadoPorAlcohol: false,
      denegadoPorDocumentos: false,
      denegadoFueraPeriodo: false,
      documentosVencidos: [],
    });
  });

  it('deniega de inmediato por baja, sin evaluar documentos ni alcohol', () => {
    const resultado = evaluarIngreso({ personaActiva: false, alcoholConforme: false, documentos: [] });

    expect(resultado).toEqual({
      autorizado: false,
      denegadoPorBaja: true,
      denegadoSinDocumentos: false,
      denegadoPorAlcohol: false,
      denegadoPorDocumentos: false,
      denegadoFueraPeriodo: false,
      documentosVencidos: [],
    });
  });

  it('deniega a una persona sin ningún documento cargado', () => {
    const resultado = evaluarIngreso({ personaActiva: true, alcoholConforme: true, documentos: [] });

    expect(resultado.autorizado).toBe(false);
    expect(resultado.denegadoSinDocumentos).toBe(true);
    expect(resultado.denegadoPorDocumentos).toBe(false);
  });

  it('deniega si alguno de sus documentos está vencido e indica cuál', () => {
    const resultado = evaluarIngreso({
      personaActiva: true,
      alcoholConforme: true,
      documentos: [SCTR_VENCIDO, INDUCCION_VIGENTE],
    });

    expect(resultado.autorizado).toBe(false);
    expect(resultado.denegadoPorDocumentos).toBe(true);
    expect(resultado.documentosVencidos).toEqual(['SCTR']);
  });

  it('deniega solo por alcohol cuando los documentos están vigentes', () => {
    const resultado = evaluarIngreso({ personaActiva: true, alcoholConforme: false, documentos: [SCTR_VIGENTE] });

    expect(resultado.autorizado).toBe(false);
    expect(resultado.denegadoPorAlcohol).toBe(true);
    expect(resultado.denegadoPorDocumentos).toBe(false);
  });

  it('informa todos los motivos a la vez: documento vencido y alcohol', () => {
    const resultado = evaluarIngreso({ personaActiva: true, alcoholConforme: false, documentos: [SCTR_VENCIDO] });

    expect(resultado.denegadoPorAlcohol).toBe(true);
    expect(resultado.denegadoPorDocumentos).toBe(true);
  });
});

describe('documentosActuales', () => {
  const fecha = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
  const hoy = new Date(2026, 8, 26, 10, 0);

  it('solo cuenta la última versión de cada tipo de documento', () => {
    const actuales = documentosActuales(
      [
        // SCTR: la v1 vencida fue renovada por una v2 vigente → vigente
        { id: 1, tipoDocumentoId: 1, version: 1, fechaVencimiento: fecha('2026-01-01'), tipoDocumento: { nombre: 'SCTR' } },
        { id: 2, tipoDocumentoId: 1, version: 2, fechaVencimiento: fecha('2027-01-01'), tipoDocumento: { nombre: 'SCTR' } },
        // CAMO: la v2 (la última) está vencida aunque la v1 no → vencido
        { id: 3, tipoDocumentoId: 2, version: 2, fechaVencimiento: fecha('2026-09-01'), tipoDocumento: { nombre: 'CAMO' } },
        { id: 4, tipoDocumentoId: 2, version: 1, fechaVencimiento: fecha('2030-01-01'), tipoDocumento: { nombre: 'CAMO' } },
      ],
      hoy,
    );

    expect(actuales).toEqual([
      { tipoDocumentoId: 2, nombre: 'CAMO', vigente: false },
      { tipoDocumentoId: 1, nombre: 'SCTR', vigente: true },
    ]);
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

describe('período de autorización', () => {
  const fecha = (texto: string) => new Date(`${texto}T00:00:00.000Z`);
  // "Hoy" en la zona del servidor: el 22/10/2026 a media tarde.
  const hoy = new Date(2026, 9, 22, 15, 30);

  it('sin período, nunca está fuera', () => {
    expect(fueraDelPeriodo(null, null, hoy)).toBe(false);
  });

  it('las dos fechas cuentan: el primer día y el último puede ingresar', () => {
    expect(fueraDelPeriodo(fecha('2026-10-22'), fecha('2026-10-31'), hoy)).toBe(false);
    expect(fueraDelPeriodo(fecha('2026-10-01'), fecha('2026-10-22'), hoy)).toBe(false);
  });

  it('antes de la fecha de ingreso o después de la de finalización, está fuera', () => {
    expect(fueraDelPeriodo(fecha('2026-10-23'), fecha('2026-10-31'), hoy)).toBe(true);
    expect(fueraDelPeriodo(fecha('2026-10-01'), fecha('2026-10-21'), hoy)).toBe(true);
  });

  it('fuera del período se deniega aunque tenga sus documentos al día, junto con los otros motivos', () => {
    const r = evaluarIngreso({ personaActiva: true, fueraDePeriodo: true, alcoholConforme: true, documentos: [SCTR_VENCIDO] });
    expect(r).toMatchObject({ autorizado: false, denegadoFueraPeriodo: true, denegadoPorDocumentos: true });
    expect(evaluarIngreso({ personaActiva: true, fueraDePeriodo: true, alcoholConforme: true, documentos: [SCTR_VIGENTE] })).toMatchObject({
      autorizado: false,
      denegadoFueraPeriodo: true,
    });
  });
});
