import { leerRegistroAsistencia, opcionesAsistencia } from './asistencia.util.js';

describe('opcionesAsistencia', () => {
  it('pide los registros de asistencia (TransFlag con AttLog) al instante', () => {
    const o = opcionesAsistencia('HSR3263100192');
    expect(o.split('\n')[0]).toBe('GET OPTION FROM: HSR3263100192');
    expect(o).toContain('TransFlag=TransData AttLog');
    expect(o).toContain('AttPhoto');
    expect(o).toContain('Realtime=1');
    expect(o).toContain('ATTLOGStamp=0');
  });
});

describe('leerRegistroAsistencia', () => {
  it('lee el registro del PushDemo del proveedor: DNI, hora, estado, verificación y alcohol', () => {
    expect(leerRegistroAsistencia('44943297\t2026-09-28 13:03:31\t255\t15\t\t0\t0\t0.00g/L\t-')).toEqual({
      pin: '44943297',
      hora: '2026-09-28 13:03:31',
      estado: '255',
      verificacion: '15',
      alcohol: '0.00g/L',
    });
  });

  it('sin el grado de alcohol, alcohol es null', () => {
    expect(leerRegistroAsistencia('48058719\t2026-10-17 16:20:16\t0\t15')).toMatchObject({ pin: '48058719', alcohol: null });
  });

  it('descarta lo que no es un registro', () => {
    expect(leerRegistroAsistencia('')).toBeNull();
    expect(leerRegistroAsistencia('OK')).toBeNull();
    expect(leerRegistroAsistencia('48058719\tayer')).toBeNull();
    expect(leerRegistroAsistencia('~DeviceName=G4 Pro,MAC=00:17:61:13:17:da')).toBeNull();
  });
});
