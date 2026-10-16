import { ipLocalDeRegistro } from './ip-local.util.js';

describe('IP del G4 en la red de la garita', () => {
  it('toma el campo IPAddress del registro', () => {
    const cuerpo = '~DeviceName=G4 Pro,MAC=00:17:61:12:b0:f0,UserCount=2,Language=101,IPAddress=172.20.20.198,~Platform=ZIM200';
    expect(ipLocalDeRegistro(cuerpo)).toBe('172.20.20.198');
  });

  it('no confunde otros campos que terminan en IPAddress', () => {
    expect(ipLocalDeRegistro('GATEWAYIPAddress=172.20.20.129,IPAddress=172.20.20.198')).toBe('172.20.20.198');
    expect(ipLocalDeRegistro('GATEWAYIPAddress=172.20.20.129')).toBeNull();
  });

  it('sin cuerpo o sin IP: null', () => {
    expect(ipLocalDeRegistro(undefined)).toBeNull();
    expect(ipLocalDeRegistro('')).toBeNull();
    expect(ipLocalDeRegistro('IPAddress=no-es-ip')).toBeNull();
  });
});
