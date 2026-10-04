/**
 * Lectura de los lectores de DNI (Syble XB-7705H por RS232): el lector lee el
 * código de barras del reverso del DNI y envía el número seguido de CR LF
 * (`48058719\r\n`, confirmado con el equipo real a 115200 baudios). Funciones
 * puras, sin acceso al puerto, para poder probarlas.
 */

export type DocumentoLeido = { tipoDocumentoIdentidad: 'DNI'; numeroDocumento: string };

/**
 * Número de DNI de una línea leída: 8 dígitos, ignorando espacios y
 * caracteres de control. Cualquier otra cosa (un código de barras que no sea
 * un DNI, ruido del cable al encender el lector) devuelve null.
 */
export function extraerDocumento(linea: string): DocumentoLeido | null {
  const limpio = linea.replace(/[^\x21-\x7E]/g, '');
  return /^\d{8}$/.test(limpio) ? { tipoDocumentoIdentidad: 'DNI', numeroDocumento: limpio } : null;
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
