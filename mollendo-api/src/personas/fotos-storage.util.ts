import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';

const storageRoot = process.env.DOCUMENTOS_STORAGE_PATH ?? './storage/documentos';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
export const FOTO_TAMANO_MAXIMO = 5 * 1024 * 1024; // 5 MB

/**
 * Foto del trabajador para el reconocimiento facial: se guarda junto a sus
 * documentos, en `persona-{id}/foto-{uuid}.{ext}`. Solo imágenes JPG, PNG o WEBP.
 */
export const fotosMulterOptions: MulterOptions = {
  storage: diskStorage({
    destination: (req, _file, callback) => {
      const dir = `${storageRoot}/persona-${req.params['id']}`;
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      callback(null, dir);
    },
    filename: (_req, file, callback) => {
      callback(null, `foto-${randomUUID()}${extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: { fileSize: FOTO_TAMANO_MAXIMO },
  fileFilter: (_req, file, callback) => {
    if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
      callback(new BadRequestException('La foto debe ser una imagen JPG, PNG o WEBP'), false);
      return;
    }
    callback(null, true);
  },
};
