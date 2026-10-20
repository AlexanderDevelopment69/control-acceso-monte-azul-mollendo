import {
  alcoholConforme,
  comandoBorrarPersonaAsistencia,
  comandoPersonaAsistencia,
  gradoAlcohol,
  leerRegistroAsistencia,
  opcionesAsistencia,
  usuarioComoControlDeAcceso,
} from './asistencia.util.js';
import { pinsDeRespuestaUsuarios, usuariosConDatosDistintos } from './comandos-acceso.util.js';

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
      numero: null,
    });
  });

  it('lee el número de la marcación del G4 Pro real (campo 11)', () => {
    const linea = ['71988749', '2026-10-19 18:27:00', '255', '15', '0', '0', '0', '255', '0', '0', '28', '0.00g/L', '-', '-', '-'].join('\t');
    expect(leerRegistroAsistencia(linea)).toEqual({
      pin: '71988749',
      hora: '2026-10-19 18:27:00',
      estado: '255',
      verificacion: '15',
      alcohol: '0.00g/L',
      numero: 28,
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

describe('grado de alcohol (registros reales del G4 Pro, 19/10/2026)', () => {
  it('lee el grado y decide con el umbral del equipo (0.0001 g/L)', () => {
    expect(gradoAlcohol('0.00g/L')).toBe(0);
    expect(gradoAlcohol('0.000951g/L')).toBe(0.000951);
    expect(alcoholConforme('0.00g/L', 0.0001)).toBe(true);
    expect(alcoholConforme('0.000951g/L', 0.0001)).toBe(false);
    expect(alcoholConforme('1.229g/L', 0.0001)).toBe(false);
  });

  it('sin grado o ilegible: no aprueba', () => {
    expect(gradoAlcohol(null)).toBeNull();
    expect(gradoAlcohol('-')).toBeNull();
    expect(alcoholConforme(null, 0.0001)).toBe(false);
    expect(alcoholConforme('abc', 0.0001)).toBe(false);
  });
});

describe('comandos de usuario en asistencia', () => {
  it('USERINFO como se probó con el equipo (Return=0), sin contraseña ni tarjeta', () => {
    expect(comandoPersonaAsistencia({ pin: '48058719', nombres: 'Amiel', apellidos: 'Bautista' })).toBe(
      'DATA UPDATE USERINFO PIN=48058719\tName=Amiel Bautista\tPri=0\tPasswd=\tCard=\tGrp=1\tTZ=0000000100000000\tVerify=-1\tViceCard=',
    );
    expect(comandoBorrarPersonaAsistencia('48058719')).toBe('DATA DELETE USERINFO PIN=48058719');
  });

  it('el registro real del alcohol alto se lee completo', () => {
    const linea = '48058719\t2026-10-19 14:25:28\t255\t15\t0\t0\t0\t255\t0\t0\t3\t0.000951g/L\t-\t-\t-';
    expect(leerRegistroAsistencia(linea)).toMatchObject({ pin: '48058719', estado: '255', verificacion: '15', alcohol: '0.000951g/L' });
  });
});

describe('usuarios del equipo en asistencia (respuesta a DATA QUERY USERINFO)', () => {
  it('se leen como en control de acceso: el registrado a mano sobra, el del sistema está bien', () => {
    const respuesta = [
      usuarioComoControlDeAcceso('PIN=1\tName=\tPri=14\tPasswd=\tCard=\tGrp=1\tTZ=0000000100000000\tVerify=-1\tViceCard=\tStartDatetime=0\tEndDatetime=0'),
      usuarioComoControlDeAcceso(
        'PIN=71988749\tName=Amiel Bautista\tPri=0\tPasswd=\tCard=\tGrp=1\tTZ=0000000100000000\tVerify=-1\tViceCard=\tStartDatetime=0\tEndDatetime=0',
      ),
    ].join('\n');
    expect(pinsDeRespuestaUsuarios(respuesta)).toEqual(['1', '71988749']);
    const esperadas = new Map([['71988749', { pin: '71988749', nombres: 'Amiel', apellidos: 'Bautista' }]]);
    expect(usuariosConDatosDistintos(respuesta, esperadas)).toEqual([]);
    expect(
      usuariosConDatosDistintos(usuarioComoControlDeAcceso('PIN=71988749\tName=Amiel Bautista\tPri=14\tPasswd=123'), esperadas),
    ).toEqual(['71988749']);
  });
});
