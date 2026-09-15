export interface DocumentoRequerido {
    tipoDocumentoId: number;
    nombre: string;
}
export interface EvaluarIngresoInput {
    personaActiva: boolean;
    alcoholConforme: boolean;
    documentosRequeridos: DocumentoRequerido[];
    documentosVigentesAprobados: Set<number>;
}
export interface ResultadoValidacionIngreso {
    autorizado: boolean;
    denegadoPorBaja: boolean;
    denegadoPorAlcohol: boolean;
    denegadoPorDocumentos: boolean;
    documentosFaltantes: string[];
}
export declare function evaluarIngreso(input: EvaluarIngresoInput): ResultadoValidacionIngreso;
export interface ResultadoValidacionSalida {
    autorizado: boolean;
    denegadoSinIngresoPrevio: boolean;
}
export declare function evaluarSalida(ultimoMovimientoAutorizado: 'ingreso' | 'salida' | null): ResultadoValidacionSalida;
