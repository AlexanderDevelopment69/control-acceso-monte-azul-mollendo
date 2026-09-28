// Formatos y tamaño aceptados para el archivo de un documento (igual que el backend).
const TIPOS_DOCUMENTO = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const DOCUMENTO_TAMANO_MAXIMO = 20 * 1024 * 1024;

/** Para el atributo `accept` del selector de archivo. */
export const ACEPTA_DOCUMENTO = TIPOS_DOCUMENTO.join(",");

export const AYUDA_ARCHIVO_DOCUMENTO = "PDF, imagen (JPG, PNG o WEBP) o Word, hasta 20 MB.";

/** Valida el archivo antes de subirlo; devuelve el mensaje de error o null. */
export function validarArchivoDocumento(archivo: File): string | null {
  if (!TIPOS_DOCUMENTO.includes(archivo.type)) return "El archivo debe ser PDF, imagen (JPG, PNG o WEBP) o Word";
  if (archivo.size > DOCUMENTO_TAMANO_MAXIMO) return "El archivo no puede pesar más de 20 MB";
  return null;
}

/** El DNI peruano tiene 8 dígitos (igual que el backend). */
export function validarNumeroDocumento(tipo: string, numero: string): string | null {
  if (tipo === "DNI" && !/^\d{8}$/.test(numero)) return "El DNI debe tener 8 dígitos";
  if (!/^[A-Za-z0-9]+$/.test(numero)) return "El número de documento solo puede tener letras y números";
  return null;
}
