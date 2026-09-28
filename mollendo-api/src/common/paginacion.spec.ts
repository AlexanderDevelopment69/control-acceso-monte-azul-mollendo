import { palabras, paginacion, rangoDeDias } from './paginacion.js';

describe('paginacion', () => {
  it('usa página 1 y el tamaño por defecto', () => {
    expect(paginacion({})).toEqual({ pagina: 1, porPagina: 20, skip: 0, take: 20 });
  });

  it('calcula el desplazamiento de la página', () => {
    expect(paginacion({ pagina: 3, porPagina: 15 })).toEqual({ pagina: 3, porPagina: 15, skip: 30, take: 15 });
  });
});

describe('rangoDeDias', () => {
  it('sin fechas no filtra', () => {
    expect(rangoDeDias()).toBeUndefined();
  });

  it('incluye el día completo de "hasta" (hasta el inicio del día siguiente)', () => {
    const rango = rangoDeDias('2026-09-28', '2026-09-28')!;
    expect(rango.gte).toEqual(new Date(2026, 8, 28));
    expect(rango.lt).toEqual(new Date(2026, 8, 29));
  });

  it('pasa bien de fin de mes', () => {
    expect(rangoDeDias(undefined, '2026-09-30')!.lt).toEqual(new Date(2026, 9, 1));
  });
});

describe('palabras', () => {
  it('separa por espacios y descarta los vacíos', () => {
    expect(palabras('  Juan   Pérez ')).toEqual(['Juan', 'Pérez']);
    expect(palabras(undefined)).toEqual([]);
  });
});
