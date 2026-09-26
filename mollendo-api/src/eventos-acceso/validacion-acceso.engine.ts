// Motor de validación de acceso — lógica más crítica del sistema.
// Función pura, sin I/O, para poder probarla exhaustivamente con tests unitarios.
// Reglas del alcance base: Especificacion_Desarrollo_Control_Acceso_Mollendo_base.md, sección 7.

export interface DocumentoRequerido {
  tipoDocumentoId: number;
  nombre: string;
}

export interface EvaluarIngresoInput {
  personaActiva: boolean;
  tienePuesto: boolean;
  alcoholConforme: boolean;
  documentosRequeridos: DocumentoRequerido[];
  /** IDs de tipo_documento cuya última versión está vigente. */
  documentosVigentes: Set<number>;
}

export interface ResultadoValidacionIngreso {
  autorizado: boolean;
  denegadoPorBaja: boolean;
  denegadoSinPuesto: boolean;
  denegadoPorAlcohol: boolean;
  denegadoPorDocumentos: boolean;
  documentosFaltantes: string[];
}

export function evaluarIngreso(input: EvaluarIngresoInput): ResultadoValidacionIngreso {
  // Dado de baja: deniega de inmediato, sin evaluar nada más (prioridad sobre todo).
  if (!input.personaActiva) {
    return {
      autorizado: false,
      denegadoPorBaja: true,
      denegadoSinPuesto: false,
      denegadoPorAlcohol: false,
      denegadoPorDocumentos: false,
      documentosFaltantes: [],
    };
  }

  // Sin puesto no hay requisitos contra los cuales validar: se deniega. El
  // alcohol se sigue evaluando para informar todos los motivos a la vez.
  const denegadoSinPuesto = !input.tienePuesto;

  const documentosFaltantes = input.documentosRequeridos
    .filter((doc) => !input.documentosVigentes.has(doc.tipoDocumentoId))
    .map((doc) => doc.nombre);

  const denegadoPorAlcohol = !input.alcoholConforme;
  const denegadoPorDocumentos = documentosFaltantes.length > 0;

  return {
    autorizado: !denegadoSinPuesto && !denegadoPorAlcohol && !denegadoPorDocumentos,
    denegadoPorBaja: false,
    denegadoSinPuesto,
    denegadoPorAlcohol,
    denegadoPorDocumentos,
    documentosFaltantes,
  };
}

export interface DocumentoCargado {
  id: number;
  tipoDocumentoId: number;
  version: number;
  fechaVencimiento: Date | null;
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

/** IDs de tipo de documento cuya última versión está vigente hoy. */
export function tiposDocumentoVigentes(documentos: DocumentoCargado[], hoy: Date): Set<number> {
  const vigentes = new Set<number>();
  for (const [tipoDocumentoId, doc] of ultimasVersiones(documentos)) {
    if (esDocumentoVigente(doc.fechaVencimiento, hoy)) {
      vigentes.add(tipoDocumentoId);
    }
  }
  return vigentes;
}

/**
 * Un documento está vigente si no tiene fecha de vencimiento (tipo "si_no")
 * o si vence hoy o después. Se compara por fecha (sin hora): la columna es
 * DATE, así que un documento que vence hoy sigue siendo válido todo el día.
 */
export function esDocumentoVigente(fechaVencimiento: Date | null, hoy: Date): boolean {
  if (!fechaVencimiento) {
    return true;
  }
  const inicioDeHoy = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return fechaVencimiento.getTime() >= inicioDeHoy;
}
