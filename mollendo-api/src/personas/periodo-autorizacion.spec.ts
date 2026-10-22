import { PERIODO_AL_REVES, PERIODO_INCOMPLETO, SIN_PERIODO, normalizarPeriodo, textoPeriodo } from './periodo-autorizacion.js';

describe('Período de autorización: validación', () => {
  it('todo vacío es sin período', () => {
    expect(normalizarPeriodo({})).toEqual(SIN_PERIODO);
    expect(normalizarPeriodo({ desde: '', hasta: null, motivo: '  ' })).toEqual(SIN_PERIODO);
  });

  it('si hay algo, van las dos fechas y el motivo', () => {
    expect(normalizarPeriodo({ desde: '2026-10-22' })).toBe(PERIODO_INCOMPLETO);
    expect(normalizarPeriodo({ desde: '2026-10-22', hasta: '2026-10-31' })).toBe(PERIODO_INCOMPLETO);
    expect(normalizarPeriodo({ motivo: 'Visita técnica' })).toBe(PERIODO_INCOMPLETO);
  });

  it('fechas reales y la finalización no antes del ingreso', () => {
    expect(normalizarPeriodo({ desde: '2026-02-30', hasta: '2026-03-31', motivo: 'Obra' })).toBe('La fecha de ingreso no es válida');
    expect(normalizarPeriodo({ desde: '2026-10-31', hasta: '2026-10-22', motivo: 'Obra' })).toBe(PERIODO_AL_REVES);
  });

  it('período correcto: fechas DATE y motivo sin espacios de más (un solo día también vale)', () => {
    const p = normalizarPeriodo({ desde: '2026-10-22', hasta: '2026-10-22', motivo: '  Visita   técnica ' });
    expect(p).toEqual({
      autorizadoDesde: new Date('2026-10-22T00:00:00.000Z'),
      autorizadoHasta: new Date('2026-10-22T00:00:00.000Z'),
      motivoAutorizacion: 'Visita técnica',
    });
    expect(textoPeriodo(p as never)).toBe('del 22/10/2026 al 22/10/2026');
  });
});
