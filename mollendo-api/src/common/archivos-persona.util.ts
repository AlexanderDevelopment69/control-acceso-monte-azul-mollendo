import { randomUUID } from 'node:crypto';
import { extname, join } from 'node:path';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { BadRequestException, Logger } from '@nestjs/common';
import { memoryStorage } from 'multer';
import type { Express } from 'express';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';

const storageRoot = process.env.DOCUMENTOS_STORAGE_PATH ?? './storage/documentos';
const logger = new Logger('ArchivosPersona');

/**
 * Opciones de multer para archivos de una persona (documentos y foto). El
 * archivo queda en memoria y solo se escribe en disco con guardarArchivo(),
 * después de validar la petición: así una subida rechazada (persona o
 * documento inexistente, datos inválidos) no deja archivos sueltos, y la ruta
 * se arma con el id ya validado, nunca con el texto crudo de la URL.
 */
export function opcionesArchivo(tiposPermitidos: string[], tamanoMaximo: number, mensajeTipo: string): MulterOptions {
  return {
    storage: memoryStorage(),
    limits: { fileSize: tamanoMaximo },
    fileFilter: (_req, file, callback) => {
      if (!tiposPermitidos.includes(file.mimetype)) {
        callback(new BadRequestException(mensajeTipo), false);
        return;
      }
      callback(null, true);
    },
  };
}

/** Escribe el archivo en `persona-{id}/` y devuelve su ruta. */
export function guardarArchivo(personaId: number, archivo: Express.Multer.File, prefijo = ''): string {
  const dir = join(storageRoot, `persona-${personaId}`);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const extension = extname(archivo.originalname).toLowerCase();
  const extensionSegura = /^\.[a-z0-9]{1,5}$/.test(extension) ? extension : '';
  const ruta = join(dir, `${prefijo}${randomUUID()}${extensionSegura}`);
  writeFileSync(ruta, archivo.buffer);
  return ruta;
}

/** Borra un archivo si existe; si falla, solo lo deja en el log. */
export function borrarArchivo(ruta: string | null | undefined): void {
  if (!ruta || !existsSync(ruta)) return;
  try {
    unlinkSync(ruta);
  } catch (error) {
    logger.warn(`No se pudo borrar el archivo ${ruta}: ${String(error)}`);
  }
}
