import { esBinario, extraerDocumento, FiltroRepetidos, momentoRegistroKernel, SeparadorLineas, ttyConErrorUsb } from './lector-dni.util.js';

describe('extraerDocumento', () => {
  it('toma el número de 8 dígitos que envía el lector', () => {
    expect(extraerDocumento('48058719')).toEqual({ tipoDocumentoIdentidad: 'DNI', numeroDocumento: '48058719' });
    expect(extraerDocumento(' 48058719\u0000')).toEqual({ tipoDocumentoIdentidad: 'DNI', numeroDocumento: '48058719' });
  });

  it('toma el DNI del código 2D del reverso (2 dígitos, el DNI y los apellidos y nombres)', () => {
    const linea = '0146534518GUERRERO' + ' '.repeat(32) + 'CHUQUILIN' + ' '.repeat(31) + 'CECY NOEMI' + ' '.repeat(20);
    expect(extraerDocumento(linea)).toEqual({ tipoDocumentoIdentidad: 'DNI', numeroDocumento: '46534518' });
    expect(extraerDocumento('0148058719BAUTISTA')).toEqual({ tipoDocumentoIdentidad: 'DNI', numeroDocumento: '48058719' });
  });

  it('toma el DNI del otro código 2D: los 8 dígitos, un espacio y el nombre', () => {
    expect(extraerDocumento('72892338 JAIR VALENTIN')).toEqual({ tipoDocumentoIdentidad: 'DNI', numeroDocumento: '72892338' });
    expect(extraerDocumento('48058719  ÑAHUI')).toEqual({ tipoDocumentoIdentidad: 'DNI', numeroDocumento: '48058719' });
    expect(extraerDocumento('123456789 JAIR')).toBeNull();
    expect(extraerDocumento('1234567 JAIR')).toBeNull();
  });

  it('descarta lo que no es un DNI', () => {
    expect(extraerDocumento('')).toBeNull();
    expect(extraerDocumento('ü')).toBeNull();
    expect(extraerDocumento('1234567')).toBeNull();
    expect(extraerDocumento('123456789')).toBeNull();
    expect(extraerDocumento('https://ejemplo.com')).toBeNull();
    // Otro código de la garita (visto el 17/10/2026): números y letras, sin apellidos.
    expect(extraerDocumento('2436074906xA16C742F6160F734B9BF2C1CD71F973D6A3')).toBeNull();
  });
});

describe('esBinario', () => {
  it('reconoce la firma binaria del código 2D, no el texto', () => {
    expect(esBinario('x\u0090\u0091\u0092-\u0093^-Vskb\u0094\u0095sm\u0096' + ' '.repeat(10) + '07q\u0097&.')).toBe(true);
    expect(esBinario('0146534518GUERRERO                    CHUQUILIN')).toBe(false);
    expect(esBinario('ü')).toBe(false);
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

describe('registro del kernel: adaptador USB trabado', () => {
  it('reconoce el -71 del pl2303 con su ttyUSB, no otros mensajes', () => {
    expect(ttyConErrorUsb('3,1180,4458700,-;pl2303 ttyUSB1: pl2303_set_line_request - failed: -71')).toBe('ttyUSB1');
    expect(ttyConErrorUsb('3,1181,4458710,-;pl2303 ttyUSB3: error sending break = -71')).toBe('ttyUSB3');
    // Desenchufado (-19) o mensajes normales: no es un adaptador trabado.
    expect(ttyConErrorUsb('3,1182,4458720,-;pl2303 ttyUSB0: error sending break = -19')).toBeNull();
    expect(ttyConErrorUsb('6,1068,4458685,-;usb 3-9: pl2303 converter now attached to ttyUSB1')).toBeNull();
    expect(ttyConErrorUsb('3,1183,4458730,-;pl2303 3-9:1.0: pl2303_vendor_read - failed to read [000a]: -71')).toBeNull();
  });

  it('lee el momento del mensaje (microsegundos desde el arranque)', () => {
    expect(momentoRegistroKernel('6,1068,4458685,-;usb 3-9: algo')).toBe(4458685);
    expect(momentoRegistroKernel('cualquier cosa')).toBeNull();
  });
});
