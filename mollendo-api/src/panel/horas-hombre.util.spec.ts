import { calcularHorasHombre, horasDecimales, type MovimientoAutorizado } from './horas-hombre.util.js';

const h = (dia: number, hora: number, min = 0) => new Date(2026, 9, dia, hora, min);
const ingreso = (personaId: number, fechaHora: Date): MovimientoAutorizado => ({ personaId, tipoMovimiento: 'ingreso', fechaHora });
const salida = (personaId: number, fechaHora: Date): MovimientoAutorizado => ({ personaId, tipoMovimiento: 'salida', fechaHora });
// Semana del 13 al 19/10 (fin exclusivo: el 20 a las 00:00).
const INICIO = h(13, 0);
const FIN = h(20, 0);
const horas = (ms: number) => ms / 3_600_000;

describe('calcularHorasHombre', () => {
  it('empareja cada ingreso con su salida y suma las horas', () => {
    const visitas = calcularHorasHombre(
      [
        ingreso(1, h(13, 7)),
        salida(1, h(13, 15, 30)),
        ingreso(1, h(14, 7, 10)),
        salida(1, h(14, 16, 10)),
        ingreso(2, h(13, 8)),
        salida(2, h(13, 12)),
      ],
      INICIO,
      FIN,
    );
    expect(visitas.map((v) => [v.personaId, horas(v.ms)])).toEqual([
      [1, 8.5],
      [1, 9],
      [2, 4],
    ]);
  });

  it('el orden de llegada no importa', () => {
    const visitas = calcularHorasHombre([salida(1, h(13, 15)), ingreso(1, h(13, 7))], INICIO, FIN);
    expect(visitas.map((v) => horas(v.ms))).toEqual([8]);
  });

  it('solo cuentan las visitas con ingreso y salida (quien sigue dentro no suma)', () => {
    const visitas = calcularHorasHombre(
      [ingreso(1, h(13, 7)), ingreso(1, h(14, 7)), salida(1, h(14, 15)), ingreso(2, h(15, 8))],
      INICIO,
      FIN,
    );
    expect(visitas.map((v) => [v.personaId, horas(v.ms)])).toEqual([[1, 8]]);
  });

  it('una visita que cruza el periodo suma solo las horas dentro de él', () => {
    // Entró el domingo 12 a las 22:00 y salió el lunes 13 a las 06:00: 6 h en la semana.
    // Entró el domingo 19 a las 20:00 y salió el lunes 20 a las 04:00: 4 h en la semana.
    const visitas = calcularHorasHombre(
      [ingreso(1, h(12, 22)), salida(1, h(13, 6)), ingreso(2, h(19, 20)), salida(2, h(20, 4))],
      INICIO,
      FIN,
    );
    expect(visitas.map((v) => [v.personaId, horas(v.ms)])).toEqual([
      [1, 6],
      [2, 4],
    ]);
  });

  it('visitas fuera del periodo y salidas sin ingreso no cuentan', () => {
    const visitas = calcularHorasHombre(
      [ingreso(1, h(10, 7)), salida(1, h(10, 15)), salida(2, h(13, 9)), ingreso(3, h(10, 7))],
      INICIO,
      FIN,
    );
    expect(visitas).toEqual([]);
  });
});

describe('horas del gráfico', () => {
  it('con un decimal', () => {
    expect(horasDecimales(8.5 * 3_600_000)).toBe(8.5);
    expect(horasDecimales(20 * 60_000)).toBe(0.3);
  });
});
