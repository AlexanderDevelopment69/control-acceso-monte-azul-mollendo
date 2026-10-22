// Motor de validación de acceso — lógica más crítica del sistema.
// Función pura, sin I/O, para poder probarla exhaustivamente con tests unitarios.
//
// Alcance base, sin perfiles ni puestos: una persona puede ingresar si no está
// dada de baja, está dentro de su período de autorización (si tiene uno), tiene
// al menos un documento cargado, ninguno de sus documentos está vencido (se
// mira la última versión de cada uno) y la prueba de alcohol es conforme.

export interface DocumentoCargado {
  id: number;
  tipoDocumentoId: number;
  version: number;
  fechaVencimiento: Date | null;
}

/** Documento en su última versión, con su nombre para informar el motivo. */
export interface DocumentoActual {
  tipoDocumentoId: number;
  nombre: string;
  vigente: boolean;
}

export interface EvaluarIngresoInput {
  personaActiva: boolean;
  /** Hoy está fuera de su período de autorización (ver fueraDelPeriodo). */
  fueraDePeriodo?: boolean;
  alcoholConforme: boolean;
  /** Última versión de cada tipo de documento cargado (ver documentosActuales). */
  documentos: DocumentoActual[];
}

export interface ResultadoValidacionIngreso {
  autorizado: boolean;
  denegadoPorBaja: boolean;
  denegadoSinDocumentos: boolean;
  denegadoPorAlcohol: boolean;
  denegadoPorDocumentos: boolean;
  denegadoFueraPeriodo: boolean;
  documentosVencidos: string[];
}

export function evaluarIngreso(input: EvaluarIngresoInput): ResultadoValidacionIngreso {
  // Dado de baja: deniega de inmediato, sin evaluar nada más (prioridad sobre todo).
  if (!input.personaActiva) {
    return {
      autorizado: false,
      denegadoPorBaja: true,
      denegadoSinDocumentos: false,
      denegadoPorAlcohol: false,
      denegadoPorDocumentos: false,
      denegadoFueraPeriodo: false,
      documentosVencidos: [],
    };
  }

  const denegadoSinDocumentos = input.documentos.length === 0;
  const documentosVencidos = input.documentos.filter((d) => !d.vigente).map((d) => d.nombre);
  const denegadoPorDocumentos = documentosVencidos.length > 0;
  const denegadoPorAlcohol = !input.alcoholConforme;
  const denegadoFueraPeriodo = !!input.fueraDePeriodo;

  // Los motivos se informan todos a la vez.
  return {
    autorizado: !denegadoSinDocumentos && !denegadoPorDocumentos && !denegadoPorAlcohol && !denegadoFueraPeriodo,
    denegadoPorBaja: false,
    denegadoSinDocumentos,
    denegadoPorAlcohol,
    denegadoPorDocumentos,
    denegadoFueraPeriodo,
    documentosVencidos,
  };
}

/** Última versión de cada tipo de documento (las anteriores quedan solo como historial). */
export function ultimasVersiones<T extends DocumentoCargado>(documentos: T[]): Map<number, T> {
  const ultimas = new Map<number, T>();
  for (const doc of documentos) {
    const actual = ultimas.get(doc.tipoDocumentoId);
    if (!actual || doc.version > actual.version) {
      ultimas.set(doc.tipoDocumentoId, doc);
    }
  }
  return ultimas;
}

/** Documentos actuales de una persona (última versión de cada tipo) con su vigencia a hoy. */
export function documentosActuales(
  documentos: (DocumentoCargado & { tipoDocumento: { nombre: string } })[],
  hoy: Date,
): DocumentoActual[] {
  return [...ultimasVersiones(documentos).values()]
    .map((doc) => ({
      tipoDocumentoId: doc.tipoDocumentoId,
      nombre: doc.tipoDocumento.nombre,
      vigente: esDocumentoVigente(doc.fechaVencimiento, hoy),
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

/**
 * Un documento está vigente si no tiene fecha de vencimiento o si vence hoy o
 * después. Se compara por fecha (sin hora): la columna es DATE, así que un
 * documento que vence hoy sigue siendo válido todo el día.
 */
export function esDocumentoVigente(fechaVencimiento: Date | null, hoy: Date): boolean {
  if (!fechaVencimiento) {
    return true;
  }
  const inicioDeHoy = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return fechaVencimiento.getTime() >= inicioDeHoy;
}

/**
 * ¿Hoy está fuera de su período de autorización? Sin período (las dos fechas
 * vacías), nunca. Las dos fechas cuentan (desde el primer día hasta el último,
 * incluido). Se compara por fecha, como los documentos: las columnas son DATE.
 */
export function fueraDelPeriodo(desde: Date | null, hasta: Date | null, hoy: Date): boolean {
  const inicioDeHoy = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  if (desde && desde.getTime() > inicioDeHoy) return true;
  if (hasta && hasta.getTime() < inicioDeHoy) return true;
  return false;
}
