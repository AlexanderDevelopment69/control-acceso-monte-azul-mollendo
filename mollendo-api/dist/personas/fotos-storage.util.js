import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
const storageRoot = process.env.DOCUMENTOS_STORAGE_PATH ?? './storage/documentos';
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
export const FOTO_TAMANO_MAXIMO = 5 * 1024 * 1024;
export const fotosMulterOptions = {
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
//# sourceMappingURL=fotos-storage.util.js.map