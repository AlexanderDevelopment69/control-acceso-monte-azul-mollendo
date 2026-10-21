import fs from 'node:fs';
import path from 'node:path';
import { ConsoleLogger, type LogLevel } from '@nestjs/common';

/** Tamaño de cada archivo del registro y cuántos se guardan (el actual y los anteriores). */
const MAX_BYTES = 5 * 1024 * 1024;
const ARCHIVOS = 5;

/**
 * Registro del controlador (mini PC) también en un archivo de su carpeta de
 * datos, además de la consola: el de Docker se pierde cada vez que se
 * reinstala el contenedor, y así se puede revisar qué pasó días atrás. Al
 * pasar de MAX_BYTES se renombra a .1 (y así hasta ARCHIVOS): ocupa a lo sumo
 * unos 25 MB.
 */
export class RegistroArchivoLogger extends ConsoleLogger {
  constructor(private readonly archivo: string) {
    super();
    try {
      fs.mkdirSync(path.dirname(archivo), { recursive: true });
    } catch {
      // Sin disco: queda solo la consola.
    }
  }

  protected printMessages(
    messages: unknown[],
    context = '',
    logLevel: LogLevel = 'log',
    writeStreamType?: 'stdout' | 'stderr',
    errorStack?: unknown,
    params?: Record<string, unknown>,
  ): void {
    super.printMessages(messages, context, logLevel, writeStreamType, errorStack, params);
    try {
      this.rotarSiHaceFalta();
      // Hora de Lima (el proceso corre con esa zona; ver zona-horaria.ts): "2026-10-21 09:48:31".
      const hora = new Date().toLocaleString('sv-SE');
      const lineas = messages.map((m) => `${hora} ${logLevel.toUpperCase()} [${context}] ${typeof m === 'string' ? m : JSON.stringify(m)}`);
      if (errorStack) lineas.push(String(errorStack));
      fs.appendFileSync(this.archivo, lineas.join('\n') + '\n');
    } catch {
      // Sin disco o sin permiso: queda solo la consola.
    }
  }

  private rotarSiHaceFalta() {
    if (!fs.existsSync(this.archivo) || fs.statSync(this.archivo).size < MAX_BYTES) return;
    for (let i = ARCHIVOS - 1; i >= 1; i--) {
      const de = i === 1 ? this.archivo : `${this.archivo}.${i - 1}`;
      if (fs.existsSync(de)) fs.renameSync(de, `${this.archivo}.${i}`);
    }
  }
}
