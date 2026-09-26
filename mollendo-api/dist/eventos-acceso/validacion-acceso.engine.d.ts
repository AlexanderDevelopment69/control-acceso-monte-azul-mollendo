export interface DocumentoRequerido {
    tipoDocumentoId: number;
    nombre: string;
}
export interface EvaluarIngresoInput {
    personaActiva: boolean;
    tienePuesto: boolean;
    alcoholConforme: boolean;
    documentosRequeridos: DocumentoRequerido[];
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
export declare function evaluarIngreso(input: EvaluarIngresoInput): ResultadoValidacionIngreso;
export interface DocumentoCargado {
    id: number;
    tipoDocumentoId: number;
    version: number;
    fechaVencimiento: Date | null;
}
export declare function ultimasVersiones<T extends DocumentoCargado>(documentos: T[]): Map<number, T>;
export declare function tiposDocumentoVigentes(documentos: DocumentoCargado[], hoy: Date): Set<number>;
export declare function esDocumentoVigente(fechaVencimiento: Date | null, hoy: Date): boolean;
