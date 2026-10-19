import { leerSnapshot, pinDeNombreSnapshot } from './attphoto.util.js';

describe('pinDeNombreSnapshot', () => {
  it('saca el DNI del nombre <fecha>-<dni>.jpg', () => {
    expect(pinDeNombreSnapshot('20181003143617-22.jpg')).toBe('22');
    expect(pinDeNombreSnapshot('20261019093012-48058719.jpg')).toBe('48058719');
  });

  it('con varios trozos, devuelve el último (el usuario)', () => {
    expect(pinDeNombreSnapshot('20160615093758-0-1457-210218199011304365.jpg')).toBe('210218199011304365');
  });

  it('es null si el id es 0 (el equipo no identificó a nadie)', () => {
    expect(pinDeNombreSnapshot('20261019093012-0.jpg')).toBeNull();
  });

  it('es null si el nombre no empieza con una marca de tiempo de 14 dígitos', () => {
    expect(pinDeNombreSnapshot('foto.jpg')).toBeNull();
    expect(pinDeNombreSnapshot('abc-22.jpg')).toBeNull();
  });
});

describe('leerSnapshot', () => {
  it('lee el registro ATTPHOTO e ignora la foto', () => {
    const r = leerSnapshot('pin=20181003143617-22.jpg\tsn=1809140006\tsize=22701\tphoto=/9j/4AAQSkZJRg==');
    expect(r).toEqual({ nombreArchivo: '20181003143617-22.jpg', serie: '1809140006', tamano: '22701', pinDerivado: '22' });
  });

  it('sin nombre de archivo, es null', () => {
    expect(leerSnapshot('sn=1809140006\tsize=10')).toBeNull();
    expect(leerSnapshot('')).toBeNull();
  });
});
