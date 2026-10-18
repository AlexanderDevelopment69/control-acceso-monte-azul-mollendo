import { describe, expect, it } from 'vitest';
import { esIpInterna, sinDatosDeIngreso } from './limite-intentos.js';

describe('esIpInterna', () => {
  it('reconoce la propia máquina y las redes privadas (lo que se ve por el portal)', () => {
    for (const ip of ['::1', '127.0.0.1', '::ffff:127.0.0.1', '10.0.0.5', '192.168.0.165', '172.18.0.3', '::ffff:172.18.0.3', 'fd12:3456::1', undefined, '']) {
      expect(esIpInterna(ip)).toBe(true);
    }
  });

  it('una IP pública es real', () => {
    for (const ip of ['38.226.245.106', '::ffff:38.226.245.106', '172.32.0.1', '172.15.0.1', '8.8.8.8', '2800:200::1']) {
      expect(esIpInterna(ip)).toBe(false);
    }
  });
});

describe('sinDatosDeIngreso', () => {
  it('sin correo o sin contraseña no cuenta como intento', () => {
    expect(sinDatosDeIngreso({})).toBe(true);
    expect(sinDatosDeIngreso(undefined)).toBe(true);
    expect(sinDatosDeIngreso({ correo: '', password: '' })).toBe(true);
    expect(sinDatosDeIngreso({ correo: '   ', password: 'x' })).toBe(true);
    expect(sinDatosDeIngreso({ correo: 'a@b.pe', password: '' })).toBe(true);
    expect(sinDatosDeIngreso({ correo: 'a@b.pe', password: 123 })).toBe(true);
  });

  it('con correo y contraseña sí cuenta (aunque la contraseña sea incorrecta)', () => {
    expect(sinDatosDeIngreso({ correo: 'a@b.pe', password: 'mala' })).toBe(false);
  });
});
