import { extraerTarjeta, generarCodigoTarjeta, tarjetaVencida } from './tarjeta-contingencia.util.js';
import { extraerDocumento } from '../lectores-dni/lector-dni.util.js';

describe('código de la tarjeta de contingencia', () => {
  it('es TMAM-CONT- y 20 letras y números al azar, distinto cada vez', () => {
    const codigos = new Set(Array.from({ length: 50 }, generarCodigoTarjeta));
    expect(codigos.size).toBe(50);
    for (const codigo of codigos) expect(codigo).toMatch(/^TMAM-CONT-[A-Z2-7]{20}$/);
  });

  it('el lector lo reconoce (con espacios o caracteres de control alrededor) y no lo confunde con un DNI', () => {
    const codigo = generarCodigoTarjeta();
    expect(extraerTarjeta(codigo)).toBe(codigo);
    expect(extraerTarjeta(` ${codigo}\r`)).toBe(codigo);
    expect(extraerDocumento(codigo)).toBeNull();
  });

  it('descarta lo que no es una tarjeta: un DNI, otro QR o un código incompleto', () => {
    expect(extraerTarjeta('48058719')).toBeNull();
    expect(extraerTarjeta('TMAM-PRUEBA-123')).toBeNull();
    expect(extraerTarjeta('TMAM-CONT-ABC')).toBeNull();
    expect(extraerTarjeta('TMAM-CONT-abcdefghijklmnopqrst')).toBeNull();
  });
});

describe('tarjetaVencida', () => {
  const ahora = new Date(2026, 9, 20, 23, 30); // 20/10 a las 23:30 (hora local)

  it('sirve hasta el final de su último día; sin fecha, no vence', () => {
    expect(tarjetaVencida(null, ahora)).toBe(false);
    expect(tarjetaVencida(new Date('2026-10-20T00:00:00Z'), ahora)).toBe(false);
    expect(tarjetaVencida(new Date('2026-10-19T00:00:00Z'), ahora)).toBe(true);
  });
});
