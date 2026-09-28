import { opcionesArchivo } from '../common/archivos-persona.util.js';
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
export const FOTO_TAMANO_MAXIMO = 5 * 1024 * 1024;
export const fotosMulterOptions = opcionesArchivo(TIPOS_PERMITIDOS, FOTO_TAMANO_MAXIMO, 'La foto debe ser una imagen JPG, PNG o WEBP');
//# sourceMappingURL=fotos-storage.util.js.map