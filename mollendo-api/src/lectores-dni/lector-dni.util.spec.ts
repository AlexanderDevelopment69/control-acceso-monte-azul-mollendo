import { extraerDocumento, FiltroRepetidos, SeparadorLineas } from './lector-dni.util.js';

describe('extraerDocumento', () => {
  it('toma el número de 8 dígitos que envía el lector', () => {
    expect(extraerDocumento('48058719')).toEqual({ tipoDocumentoIdentidad: 'DNI', numeroDocumento: '48058719' });
    expect(extraerDocumento(' 48058719\u0000')).toEqual({ tipoDocumentoIdentidad: 'DNI', numeroDocumento: '48058719' });
  });

  it('descarta lo que no es un DNI', () => {
    expect(extraerDocumento('')).toBeNull();
    expect(extraerDocumento('ü')).toBeNull();
    expect(extraerDocumento('1234567')).toBeNull();
    expect(extraerDocumento('123456789')).toBeNull();
    expect(extraerDocumento('https://ejemplo.com')).toBeNull();
  });
});

describe('SeparadorLineas', () => {
  it('arma las líneas aunque lleguen en pedazos', () => {
    const s = new SeparadorLineas();
    expect(s.agregar('4805')).toEqual([]);
    expect(s.agregar('8719\r')).toEqual(['48058719']);
    expect(s.agregar('\n12345678\r\n87654321\n')).toEqual(['12345678', '87654321']);
  });

  it('descarta el ruido acumulado sin fin de línea', () => {
    const s = new SeparadorLineas(10);
    expect(s.agregar('\u0000'.repeat(20))).toEqual([]);
    expect(s.agregar('48058719\r\n')).toEqual(['48058719']);
  });
});

describe('FiltroRepetidos', () => {
  it('ignora el mismo número dentro de la ventana, no otro número ni después', () => {
    const f = new FiltroRepetidos(3000);
    expect(f.esRepetido('48058719', 0)).toBe(false);
    expect(f.esRepetido('48058719', 1000)).toBe(true);
    expect(f.esRepetido('12345678', 1500)).toBe(false);
    expect(f.esRepetido('48058719', 2000)).toBe(false);
    expect(f.esRepetido('48058719', 6000)).toBe(false);
  });
});
