import {
  comandosBorrarPersona,
  comandoDeshabilitar,
  comandoFoto,
  comandoHabilitar,
  comandosPersona,
  conteoDeRespuesta,
  esPermisoDePaso,
  loteDeComandos,
  pinDeDocumento,
  pinsDeRespuestaUsuarios,
  planDeSincronizacion,
  textoCampo,
  usuariosConDatosDistintos,
} from './comandos-acceso.util.js';

describe('comandos del protocolo de control de acceso (G4 Pro)', () => {
  it('usa el número de documento como Pin: DNI, carné de extranjería o pasaporte (hasta 24)', () => {
    expect(pinDeDocumento('48058719')).toBe('48058719');
    expect(pinDeDocumento(' 48058719 ')).toBe('48058719');
    expect(pinDeDocumento('99ce00451')).toBe('99CE00451');
    expect(pinDeDocumento('ABCDEFGHIJ1234567890KLMN')).toBe('ABCDEFGHIJ1234567890KLMN');
    expect(pinDeDocumento('ABCDEFGHIJ1234567890KLMNO')).toBeNull();
    expect(pinDeDocumento('AB-123')).toBeNull();
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
    expect(comandosBorrarPersona('1')).toEqual(['DATA DELETE userauthorize Pin=1', 'DATA DELETE extuser Pin=1', 'DATA DELETE user Pin=1']);
    expect(comandoHabilitar('1')).toBe('DATA UPDATE userauthorize Pin=1\tAuthorizeTimezoneId=1\tAuthorizeDoorId=1');
    expect(comandoDeshabilitar('1')).toBe('DATA DELETE userauthorize Pin=1\tAuthorizeDoorId=1');
  });
});

describe('sincronización con lo que tiene el equipo', () => {
  it('lee los pins de la lista de usuarios', () => {
    const datos =
      'user uid=20\tcardno=\tpin=48058719\tpassword=\tname=Amiel Bautista\tprivilege=0\r\n' +
      'user uid=22\tcardno=1262852599\tpin=4\tpassword=12345678\tname=\tprivilege=14\n';
    expect(pinsDeRespuestaUsuarios(datos)).toEqual(['48058719', '4']);
    expect(pinsDeRespuestaUsuarios('')).toEqual([]);
  });

  it('lee los conteos', () => {
    expect(conteoDeRespuesta('userauthorize=50', 'userauthorize')).toBe(50);
    expect(conteoDeRespuesta('user=0\n', 'user')).toBe(0);
    expect(conteoDeRespuesta('', 'user')).toBeNull();
  });

  it('borra los que el sistema no conoce y agrega los activos que faltan', () => {
    const plan = planDeSincronizacion(['48058719', '4', '11111111'], new Set(['48058719', '11111111', '22222222', '33333333']), new Set(['48058719', '22222222']));
    expect(plan.sobrantes).toEqual(['4']);
    expect(plan.faltantes).toEqual(['22222222']);
  });
});

describe('entrega de comandos al equipo, por lotes', () => {
  const cmd = (id: number, comando = `DATA DELETE user Pin=${id}`) => ({ id, comando });

  it('de a 100 como mucho: el G4 Pro descarta lo que pase de 256 por consulta', () => {
    const pendientes = Array.from({ length: 300 }, (_, i) => cmd(i + 1));
    expect(loteDeComandos(pendientes).map((c) => c.id)).toEqual(Array.from({ length: 100 }, (_, i) => i + 1));
  });

  it('con fotos pesadas corta por tamaño, pero siempre entrega al menos uno', () => {
    const foto = (id: number) => cmd(id, `DATA UPDATE biophoto PIN=${id}	Content=${'x'.repeat(200 * 1024)}`);
    expect(loteDeComandos([foto(1), foto(2), foto(3), foto(4)]).map((c) => c.id)).toEqual([1, 2]);
    expect(loteDeComandos([cmd(1, 'x'.repeat(900 * 1024))]).map((c) => c.id)).toEqual([1]);
  });

  it('los permisos de paso van primero, sin cambiar el orden dentro de cada grupo', () => {
    const lote = loteDeComandos([cmd(1), cmd(2), cmd(3, comandoHabilitar('48058719')), cmd(4), cmd(5, comandoDeshabilitar('15724705'))]);
    expect(lote.map((c) => c.id)).toEqual([3, 5, 1, 2, 4]);
    expect(esPermisoDePaso(comandoHabilitar('48058719'))).toBe(true);
    expect(esPermisoDePaso('DATA UPDATE user CardNo=	Pin=1')).toBe(false);
  });
});


describe('usuariosConDatosDistintos (sincronización: datos cambiados a mano en el equipo)', () => {
  const T = '\t';
  const linea = (campos: Record<string, string>) =>
    'user ' + Object.entries({ uid: '2', cardno: '', pin: '48058719', password: '', group: '0', starttime: '0', endtime: '0', name: 'Amiel Bautista', privilege: '0', disable: '0', verify: '0', ...campos }).map(([k, v]) => `${k}=${v}`).join(T);
  const esperadas = new Map([
    ['48058719', { pin: '48058719', nombres: 'Amiel', apellidos: 'Bautista' }],
    ['15724705', { pin: '15724705', nombres: 'Fernando', apellidos: 'Herrera Broncales' }],
  ]);

  it('respuesta real del equipo (18/10): Amiel con contraseña 1234; Fernando correcto (nombre cortado a 24 por el equipo)', () => {
    const respuesta = [
      `user uid=2${T}cardno=${T}pin=48058719${T}password=1234${T}group=0${T}starttime=0${T}endtime=0${T}name=Amiel Bautista${T}privilege=0${T}disable=0${T}verify=0`,
      `user uid=3${T}cardno=${T}pin=15724705${T}password=${T}group=0${T}starttime=0${T}endtime=0${T}name=Fernando Herrera Broncal${T}privilege=0${T}disable=0${T}verify=0`,
    ].join('\n');
    expect(usuariosConDatosDistintos(respuesta, esperadas)).toEqual(['48058719']);
  });

  it('detecta privilegio de administrador, tarjeta, deshabilitado, vigencia y nombre cambiados', () => {
    const cambios: Record<string, string>[] = [{ privilege: '14' }, { cardno: '123456' }, { disable: '1' }, { starttime: '20261001' }, { endtime: '20261231' }, { name: 'Otro Nombre' }];
    for (const cambio of cambios) {
      expect(usuariosConDatosDistintos(linea(cambio), esperadas)).toEqual(['48058719']);
    }
  });

  it('con los datos que pone el sistema, no hay nada que corregir (tarjeta vacía o 0 da igual)', () => {
    expect(usuariosConDatosDistintos(linea({}), esperadas)).toEqual([]);
    expect(usuariosConDatosDistintos(linea({ cardno: '0' }), esperadas)).toEqual([]);
  });

  it('solo compara a las personas esperadas (las que no son del sistema las borra el plan)', () => {
    expect(usuariosConDatosDistintos(linea({ pin: '777', password: '1' }), esperadas)).toEqual([]);
  });
});
