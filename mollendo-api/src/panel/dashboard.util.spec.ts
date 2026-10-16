import {
  calcularPresencia,
  calcularVisitas,
  clasificarDocumentos,
  diasDelRango,
  resumirMovimientos,
  type EventoPeriodo,
} from './dashboard.util.js';

const hora = (dia: number, h: number) => new Date(2026, 8, dia, h);

describe('diasDelRango', () => {
  it('incluye ambos extremos y cruza de mes', () => {
    expect(diasDelRango('2026-09-29', '2026-10-02')).toEqual(['2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02']);
  });

  it('un solo día', () => {
    expect(diasDelRango('2026-09-30', '2026-09-30')).toEqual(['2026-09-30']);
  });
});

describe('calcularPresencia', () => {
  it('cuenta como presentes solo a quienes su último movimiento es un ingreso', () => {
    const ahora = hora(30, 12);
    const r = calcularPresencia(
      [
        { personaId: 1, tipoMovimiento: 'ingreso', fechaHora: hora(30, 8) },
        { personaId: 2, tipoMovimiento: 'ingreso', fechaHora: hora(29, 9) },
        { personaId: 3, tipoMovimiento: 'salida', fechaHora: hora(30, 10) },
        { personaId: 4, tipoMovimiento: 'ingreso', fechaHora: hora(28, 7) },
      ],
      ahora,
    );
    expect(r.presentes).toBe(3);
    // Más de 12 h dentro: la persona 2 (desde el 29 a las 9) y la 4; la más antigua primero.
    expect(r.masDe12h.map((p) => p.personaId)).toEqual([4, 2]);
  });

  it('permanencia larga desde las 12 horas (antes 24)', () => {
    const ahora = hora(30, 12);
    const r = calcularPresencia(
      [
        { personaId: 1, tipoMovimiento: 'ingreso', fechaHora: hora(29, 23) }, // 13 h: sí
        { personaId: 2, tipoMovimiento: 'ingreso', fechaHora: hora(30, 1) }, // 11 h: no
      ],
      ahora,
    );
    expect(r.masDe12h.map((p) => p.personaId)).toEqual([1]);
  });
});

describe('calcularVisitas', () => {
  it('una visita está finalizada si hay una salida después de su ingreso', () => {
    const r = calcularVisitas(
      [
        { personaId: 1, fechaHora: hora(30, 8) },
        { personaId: 2, fechaHora: hora(30, 9) },
        { personaId: 1, fechaHora: hora(30, 14) },
      ],
      [
        { personaId: 1, fechaHora: hora(30, 12) },
        { personaId: 2, fechaHora: hora(30, 7) }, // anterior al ingreso: no la finaliza
      ],
    );
    expect(r).toEqual({ total: 3, finalizadas: 1, presentes: 2 });
  });
});

describe('resumirMovimientos', () => {
  const evento = (e: Partial<EventoPeriodo>): EventoPeriodo => ({
    tipoMovimiento: 'ingreso',
    resultado: 'autorizado',
    fechaHora: hora(30, 8),
    denegadoNoRegistrado: false,
    denegadoPorBaja: false,
    denegadoSinDocumentos: false,
    denegadoPorDocumentos: false,
    denegadoPorAlcohol: false,
    denegadoSinVerificacion: false,
    ...e,
  });

  it('suma totales, motivos y la serie por día', () => {
    const r = resumirMovimientos(
      [
        evento({}),
        evento({ fechaHora: hora(29, 8) }),
        evento({ resultado: 'denegado', denegadoPorAlcohol: true, denegadoPorDocumentos: true }),
        evento({ resultado: 'denegado', denegadoNoRegistrado: true }),
        evento({ tipoMovimiento: 'salida', fechaHora: hora(30, 18) }),
      ],
      ['2026-09-29', '2026-09-30'],
    );
    expect(r.totales).toEqual({ ingresosAutorizados: 2, ingresosDenegados: 2, salidasAutorizadas: 1, salidasDenegadas: 0 });
    expect(r.motivos).toEqual({ noRegistrado: 1, dadoDeBaja: 0, sinDocumentos: 0, documentos: 1, alcohol: 1, sinVerificacion: 0, rostroNoCoincide: 0 });
    expect(r.tendencia).toEqual([
      { dia: '2026-09-29', ingresos: 1, denegados: 0, salidas: 0 },
      { dia: '2026-09-30', ingresos: 1, denegados: 2, salidas: 1 },
    ]);
  });
});

describe('clasificarDocumentos', () => {
  it('separa vigentes, por vencer (30 días) y vencidos; vence hoy = vigente', () => {
    const hoy = new Date(2026, 8, 30, 15);
    const utc = (a: number, m: number, d: number) => new Date(Date.UTC(a, m, d));
    const r = clasificarDocumentos(
      [null, utc(2027, 0, 1), utc(2026, 8, 30), utc(2026, 9, 30), utc(2026, 9, 31), utc(2026, 8, 29)],
      hoy,
    );
    // null y 01/01/2027: vigentes; vence hoy y 30/10: por vencer; 31/10: vigente; 29/09: vencido.
    expect(r).toEqual({ vigentes: 3, porVencer: 2, vencidos: 1, diasAviso: 30 });
  });
});
