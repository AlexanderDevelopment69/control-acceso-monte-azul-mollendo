/**
 * Número de documento sin espacios y en mayúsculas, para que el que escribe el
 * administrador coincida con el que envían los equipos (lector de DNI, terminal).
 * Para usar con @Transform de class-transformer.
 */
export const normalizarNumeroDocumento = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.replace(/\s+/g, '').toUpperCase() : value;

/** Texto sin espacios al inicio ni al final. Para usar con @Transform. */
export const recortar = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
