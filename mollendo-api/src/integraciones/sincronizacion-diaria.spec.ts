import fs from 'node:fs';
import path from 'node:path';
import { guardarHoraDiaria, horaDeTexto, leerHoraDiaria } from './sincronizacion-diaria.js';

const archivo = path.join(path.dirname(process.env.DOCUMENTOS_STORAGE_PATH!), 'sincronizacion-diaria.json');

describe('hora de la sincronización diaria', () => {
  const envAntes = process.env.G4PRO_HORA_SINCRONIZACION;
  beforeEach(() => fs.rmSync(archivo, { force: true }));
  afterAll(() => {
    fs.rmSync(archivo, { force: true });
    process.env.G4PRO_HORA_SINCRONIZACION = envAntes;
  });

  it('lee el .env mientras no se elija en el portal', () => {
    process.env.G4PRO_HORA_SINCRONIZACION = 'off';
    expect(leerHoraDiaria()).toBeNull();
    process.env.G4PRO_HORA_SINCRONIZACION = '3';
    expect(leerHoraDiaria()).toBe(3);
  });

  it('lo elegido en el portal manda sobre el .env, también desactivarla', () => {
    process.env.G4PRO_HORA_SINCRONIZACION = '0';
    guardarHoraDiaria(5);
    expect(leerHoraDiaria()).toBe(5);
    guardarHoraDiaria(null);
    expect(leerHoraDiaria()).toBeNull();
  });

  it('solo acepta horas de 0 a 23', () => {
    expect(horaDeTexto('23')).toBe(23);
    expect(horaDeTexto('24')).toBeNull();
    expect(horaDeTexto('off')).toBeNull();
  });
});
