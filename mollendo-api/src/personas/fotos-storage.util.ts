import { opcionesArchivo } from '../common/archivos-persona.util.js';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
export const FOTO_TAMANO_MAXIMO = 5 * 1024 * 1024; // 5 MB

/**
 * Foto del trabajador para el reconocimiento facial: se guarda junto a sus
 * documentos, en `persona-{id}/foto-{uuid}.{ext}`. Solo imágenes JPG, PNG o WEBP.
 */
export const fotosMulterOptions = opcionesArchivo(
  TIPOS_PERMITIDOS,
  FOTO_TAMANO_MAXIMO,
  'La foto debe ser una imagen JPG, PNG o WEBP',
);
