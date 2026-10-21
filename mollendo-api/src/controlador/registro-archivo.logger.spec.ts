import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { RegistroArchivoLogger } from './registro-archivo.logger.js';

describe('Registro del controlador en archivo', () => {
  it('escribe cada mensaje con hora, nivel y contexto, y rota al pasar de 5 MB', () => {
    const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'registro-'));
    const archivo = path.join(carpeta, 'registro', 'controlador.log');
    const logger = new RegistroArchivoLogger(archivo);
    // Sin escribir en la consola de las pruebas.
    const salida = process.stdout.write;
    const errores = process.stderr.write;
    process.stdout.write = (() => true) as typeof process.stdout.write;
    process.stderr.write = (() => true) as typeof process.stderr.write;
    try {
      logger.warn('Lector de DNI de salida desconectado', 'LectoresDniService');
      expect(fs.readFileSync(archivo, 'utf8')).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} WARN \[LectoresDniService\] Lector de DNI de salida desconectado\n$/);
      fs.writeFileSync(archivo, 'x'.repeat(5 * 1024 * 1024));
      logger.log('después de rotar', 'Controlador');
      expect(fs.statSync(`${archivo}.1`).size).toBe(5 * 1024 * 1024);
      expect(fs.readFileSync(archivo, 'utf8')).toContain('después de rotar');
    } finally {
      process.stdout.write = salida;
      process.stderr.write = errores;
      fs.rmSync(carpeta, { recursive: true, force: true });
    }
  });
});
