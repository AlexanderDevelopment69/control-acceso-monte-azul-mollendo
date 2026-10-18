import { duracionMs, leerCookie } from './cookies-sesion.js';

describe('duracionMs', () => {
  it('entiende las duraciones de JWT_EXPIRES_IN', () => {
    expect(duracionMs('1h', '1h')).toBe(3_600_000);
    expect(duracionMs('7d', '1h')).toBe(7 * 86_400_000);
    expect(duracionMs('30m', '1h')).toBe(1_800_000);
    expect(duracionMs('45', '1h')).toBe(45_000);
  });

  it('sin valor o con uno que no entiende, usa el de por defecto', () => {
    expect(duracionMs(undefined, '1h')).toBe(3_600_000);
    expect(duracionMs('una hora', '7d')).toBe(7 * 86_400_000);
  });
});

describe('leerCookie', () => {
  it('lee la cookie pedida entre varias', () => {
    expect(leerCookie('a=1; mollendo_sesion=abc.def; b=2', 'mollendo_sesion')).toBe('abc.def');
    expect(leerCookie('mollendo_sesion=x%3Dy', 'mollendo_sesion')).toBe('x=y');
  });

  it('sin la cookie, null', () => {
    expect(leerCookie(undefined, 'mollendo_sesion')).toBeNull();
    expect(leerCookie('otra=1', 'mollendo_sesion')).toBeNull();
    expect(leerCookie('mollendo_sesion=', 'mollendo_sesion')).toBeNull();
  });
});
