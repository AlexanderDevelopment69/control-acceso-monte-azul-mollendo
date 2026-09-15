// Motor de validación de acceso — lógica más crítica del sistema (spec, sección 10).
// Función pura, sin I/O, para poder probarla exhaustivamente con tests unitarios.

export interface DocumentoRequerido {
  tipoDocumentoId: number;
  nombre: string;
}

export interface EvaluarIngresoInput {
  personaActiva: boolean;
  alcoholConforme: boolean;
  documentosRequeridos: DocumentoRequerido[];
  /** IDs de tipo_documento con un documento aprobado y vigente (última versión). */
  documentosVigentesAprobados: Set<number>;
}

export interface ResultadoValidacionIngreso {
  autorizado: boolean;
  denegadoPorBaja: boolean;
  denegadoPorAlcohol: boolean;
  denegadoPorDocumentos: boolean;
  documentosFaltantes: string[];
}

export function evaluarIngreso(input: EvaluarIngresoInput): ResultadoValidacionIngreso {
  // Dado de baja: deniega de inmediato, sin evaluar alcohol ni documentos
  // (spec, sección 3.1 — motivo de denegación independiente y con prioridad).
  if (!input.personaActiva) {
    return {
      autorizado: false,
      denegadoPorBaja: true,
      denegadoPorAlcohol: false,
      denegadoPorDocumentos: false,
      documentosFaltantes: [],
    };
  }

  const documentosFaltantes = input.documentosRequeridos
    .filter((doc) => !input.documentosVigentesAprobados.has(doc.tipoDocumentoId))
    .map((doc) => doc.nombre);

  const denegadoPorAlcohol = !input.alcoholConforme;
  const denegadoPorDocumentos = documentosFaltantes.length > 0;

  // Ambos motivos pueden coincidir a la vez (spec, sección 4.3.5).
  return {
    autorizado: !denegadoPorAlcohol && !denegadoPorDocumentos,
    denegadoPorBaja: false,
    denegadoPorAlcohol,
    denegadoPorDocumentos,
    documentosFaltantes,
  };
}

export interface ResultadoValidacionSalida {
  autorizado: boolean;
  denegadoSinIngresoPrevio: boolean;
}

/**
 * Anti-passback: solo se permite la salida si el último movimiento
 * AUTORIZADO de la persona fue un ingreso. Un ingreso denegado no cuenta
 * como ingreso previo, porque la persona nunca llegó a pasar.
 */
export function evaluarSalida(
  ultimoMovimientoAutorizado: 'ingreso' | 'salida' | null,
): ResultadoValidacionSalida {
  const autorizado = ultimoMovimientoAutorizado === 'ingreso';
  return { autorizado, denegadoSinIngresoPrevio: !autorizado };
}
