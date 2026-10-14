import { mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { configuracionRespaldos, estadoRespaldos } from './respaldos.util.js';

describe('estadoRespaldos', () => {
  let carpeta: string;

  beforeEach(() => {
    carpeta = mkdtempSync(join(tmpdir(), 'respaldos-'));
  });

  afterEach(() => {
    rmSync(carpeta, { recursive: true, force: true });
  });

  function crear(nombre: string, fecha: Date, contenido = 'x') {
    const ruta = join(carpeta, nombre);
    writeFileSync(ruta, contenido);
    utimesSync(ruta, fecha, fecha);
  }

  it('sin carpeta configurada no está disponible', () => {
    expect(estadoRespaldos(undefined)).toMatchObject({ disponible: false, ultimoAutomatico: null });
  });

  it('una carpeta que no existe no está disponible', () => {
    expect(estadoRespaldos(join(carpeta, 'no-existe')).disponible).toBe(false);
  });

  it('devuelve el último automático y el último previo a una actualización', () => {
    crear('mollendo-20260927-0000.tar.gz', new Date('2026-09-27T05:00:00Z'));
    crear('mollendo-20260928-0000.tar.gz', new Date('2026-09-28T05:00:00Z'), 'contenido');
    crear('mollendo-20260926-1354.sql.gz', new Date('2026-09-26T18:54:00Z'));
    crear('antes-de-actualizar-20260928-1723.sql.gz', new Date('2026-09-28T22:23:00Z'));
    crear('mollendo-20260929-0000.tar.gz.parcial', new Date('2026-09-29T05:00:00Z')); // a medias: se ignora
    crear('otro-archivo.txt', new Date('2026-09-29T05:00:00Z'));

    const estado = estadoRespaldos(carpeta);
    expect(estado.disponible).toBe(true);
    expect(estado.cantidad).toBe(4);
    expect(estado.ultimoAutomatico).toMatchObject({ archivo: 'mollendo-20260928-0000.tar.gz', tamanoBytes: 9 });
    expect(estado.ultimoPrevioActualizacion?.archivo).toBe('antes-de-actualizar-20260928-1723.sql.gz');
  });
});

describe('configuracionRespaldos', () => {
  it('sin configurar: a las 00:00 y 14 días (lo mismo que respaldo.sh)', () => {
    expect(configuracionRespaldos({})).toEqual({ hora: '00:00', dias: 14 });
  });

  it('usa HORA_RESPALDO y DIAS_RESPALDO', () => {
    expect(configuracionRespaldos({ HORA_RESPALDO: '04:00', DIAS_RESPALDO: '30' })).toEqual({ hora: '04:00', dias: 30 });
  });

  it('valores no válidos vuelven a los de por defecto', () => {
    expect(configuracionRespaldos({ HORA_RESPALDO: 'tarde', DIAS_RESPALDO: 'abc' })).toEqual({ hora: '00:00', dias: 14 });
    expect(configuracionRespaldos({ DIAS_RESPALDO: '0' }).dias).toBe(14);
  });
});
