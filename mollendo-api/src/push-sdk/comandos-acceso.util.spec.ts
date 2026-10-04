import {
  comandoBorrarPersona,
  comandoDeshabilitar,
  comandoFoto,
  comandoHabilitar,
  comandosPersona,
  pinDeDocumento,
  textoCampo,
} from './comandos-acceso.util.js';

describe('comandos del protocolo de control de acceso (G4 Pro)', () => {
  it('usa el DNI como Pin; los documentos no numéricos no se registran', () => {
    expect(pinDeDocumento('48058719')).toBe('48058719');
    expect(pinDeDocumento(' 48058719 ')).toBe('48058719');
    expect(pinDeDocumento('AB123456')).toBeNull();
    expect(pinDeDocumento('1234567890')).toBeNull();
  });

  it('limpia los textos: sin tabuladores, saltos ni "=", y acotados', () => {
    expect(textoCampo('Amiel\tBautista\n')).toBe('Amiel Bautista');
    expect(textoCampo('A=B')).toBe('A B');
    expect(textoCampo('x'.repeat(40))).toHaveLength(24);
  });

  it('alta de la persona: user y extuser con el formato probado en el equipo', () => {
    const [user, extuser] = comandosPersona({ pin: '48058719', nombres: 'Amiel', apellidos: 'Bautista' });
    expect(user).toBe(
      'DATA UPDATE user CardNo=\tPin=48058719\tPassword=\tGroup=0\tStartTime=0\tEndTime=0\tName=Amiel Bautista\tPrivilege=0',
    );
    expect(extuser).toBe('DATA UPDATE extuser Pin=48058719\tFunSwitch=0\tFirstName=Amiel\tLastName=Bautista\tPersonalVs=0');
  });

  it('foto, borrado y permisos', () => {
    expect(comandoFoto('1', 'QUJD')).toBe('DATA UPDATE biophoto PIN=1\tType=9\tSize=4\tContent=QUJD\tFormat=0\tUrl=\tPostBackTmpFlag=0');
    expect(comandoBorrarPersona('1')).toBe('DATA DELETE user Pin=1');
    expect(comandoHabilitar('1')).toBe('DATA UPDATE userauthorize Pin=1\tAuthorizeTimezoneId=1\tAuthorizeDoorId=1');
    expect(comandoDeshabilitar('1')).toBe('DATA DELETE userauthorize Pin=1\tAuthorizeDoorId=1');
  });
});
