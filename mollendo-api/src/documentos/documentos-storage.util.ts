import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import { diskStorage } from 'multer';

const storageRoot = process.env.DOCUMENTOS_STORAGE_PATH ?? './storage/documentos';

export const documentosMulterStorage = diskStorage({
  destination: (req, _file, callback) => {
    const personaId = req.params['personaId'];
    const dir = `${storageRoot}/persona-${personaId}`;
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    callback(null, dir);
  },
  filename: (_req, file, callback) => {
    callback(null, `${randomUUID()}${extname(file.originalname)}`);
  },
});
