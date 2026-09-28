import { randomUUID } from 'node:crypto';
import { extname, join } from 'node:path';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { BadRequestException, Logger } from '@nestjs/common';
import { memoryStorage } from 'multer';
const storageRoot = process.env.DOCUMENTOS_STORAGE_PATH ?? './storage/documentos';
const logger = new Logger('ArchivosPersona');
export function opcionesArchivo(tiposPermitidos, tamanoMaximo, mensajeTipo) {
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
export function guardarArchivo(personaId, archivo, prefijo = '') {
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
export function borrarArchivo(ruta) {
    if (!ruta || !existsSync(ruta))
        return;
    try {
        unlinkSync(ruta);
    }
    catch (error) {
        logger.warn(`No se pudo borrar el archivo ${ruta}: ${String(error)}`);
    }
}
//# sourceMappingURL=archivos-persona.util.js.map