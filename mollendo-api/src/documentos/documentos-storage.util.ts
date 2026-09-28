import { opcionesArchivo } from '../common/archivos-persona.util.js';

const TIPOS_PERMITIDOS = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const DOCUMENTO_TAMANO_MAXIMO = 20 * 1024 * 1024; // 20 MB

/** Archivo de un documento: PDF, imagen (JPG, PNG, WEBP) o Word, hasta 20 MB. */
export const documentosMulterOptions = opcionesArchivo(
  TIPOS_PERMITIDOS,
  DOCUMENTO_TAMANO_MAXIMO,
  'El documento debe ser PDF, imagen (JPG, PNG o WEBP) o Word',
);
