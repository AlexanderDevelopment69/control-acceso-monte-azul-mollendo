/**
 * Lectura de los lectores de DNI (Syble XB-7705H por RS232): el lector lee el
 * código de barras del reverso del DNI y envía el número seguido de CR LF
 * (`48058719\r\n`, confirmado con el equipo real a 115200 baudios). Funciones
 * puras, sin acceso al puerto, para poder probarlas.
 */

export type DocumentoLeido = { tipoDocumentoIdentidad: 'DNI'; numeroDocumento: string };

/**
 * Número de DNI de una línea leída, ignorando espacios y caracteres de control:
 * - el código de barras simple del reverso: los 8 dígitos;
 * - el código 2D (PDF417) del reverso: 2 dígitos, los 8 del DNI y los
 *   apellidos y nombres en mayúsculas (`0146534518GUERRERO   CHUQUILIN ...`,
 *   visto con el equipo real el 17/10/2026). Después llega otra línea con la
 *   firma en binario, que se descarta (ver esBinario).
 * Cualquier otra cosa (un código que no sea de un DNI, ruido del cable al
 * encender el lector) devuelve null.
 */
export function extraerDocumento(linea: string): DocumentoLeido | null {
  const limpio = linea.replace(/[^\x21-\x7E]/g, '');
  if (/^\d{8}$/.test(limpio)) return { tipoDocumentoIdentidad: 'DNI', numeroDocumento: limpio };
  const codigo2d = /^\d{2}(\d{8})[A-ZÑ]/.exec(linea.trimStart());
  return codigo2d ? { tipoDocumentoIdentidad: 'DNI', numeroDocumento: codigo2d[1] } : null;
}

/**
 * ¿Es la parte binaria de un código 2D (la firma)? Tiene muchos caracteres que
 * no son texto; no vale la pena anotarla como "lectura que no es un DNI".
 */
export function esBinario(linea: string): boolean {
  const raros = linea.replace(/[\x20-\x7E]/g, '').length;
  return linea.length > 20 && raros / linea.length > 0.1;
}

/**
 * Junta lo que llega del puerto en pedazos y lo separa en líneas completas
 * (por CR, LF o ambos). Lo que queda sin fin de línea espera al siguiente
 * pedazo; si se acumula demasiado sin fin de línea (ruido), se descarta.
 */
export class SeparadorLineas {
  private pendiente = '';

  constructor(private readonly maximo = 256) {}

  agregar(pedazo: string): string[] {
    this.pendiente += pedazo;
    const partes = this.pendiente.split(/\r\n|\r|\n/);
    this.pendiente = partes.pop() ?? '';
    if (this.pendiente.length > this.maximo) this.pendiente = '';
    return partes.map((p) => p.trim()).filter((p) => p.length > 0);
  }
}

/**
 * Evita registrar dos veces la misma lectura: el lector puede leer el mismo
 * DNI más de una vez mientras sigue frente a la ventana. Una lectura del mismo
 * número dentro de `ventanaMs` se ignora.
 */
export class FiltroRepetidos {
  private ultimo: { numero: string; en: number } | null = null;

  constructor(private readonly ventanaMs = 3000) {}

  esRepetido(numero: string, ahora = Date.now()): boolean {
    const repetido = this.ultimo !== null && this.ultimo.numero === numero && ahora - this.ultimo.en < this.ventanaMs;
    if (!repetido) this.ultimo = { numero, en: ahora };
    return repetido;
  }
}
