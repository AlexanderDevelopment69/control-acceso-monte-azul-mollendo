export interface DocumentoCargado {
    id: number;
    tipoDocumentoId: number;
    version: number;
    fechaVencimiento: Date | null;
}
export interface DocumentoActual {
    tipoDocumentoId: number;
    nombre: string;
    vigente: boolean;
}
export interface EvaluarIngresoInput {
    personaActiva: boolean;
    alcoholConforme: boolean;
    documentos: DocumentoActual[];
}
export interface ResultadoValidacionIngreso {
    autorizado: boolean;
    denegadoPorBaja: boolean;
    denegadoSinDocumentos: boolean;
    denegadoPorAlcohol: boolean;
    denegadoPorDocumentos: boolean;
    documentosVencidos: string[];
}
export declare function evaluarIngreso(input: EvaluarIngresoInput): ResultadoValidacionIngreso;
export declare function ultimasVersiones<T extends DocumentoCargado>(documentos: T[]): Map<number, T>;
export declare function documentosActuales(documentos: (DocumentoCargado & {
    tipoDocumento: {
        nombre: string;
    };
})[], hoy: Date): DocumentoActual[];
export declare function esDocumentoVigente(fechaVencimiento: Date | null, hoy: Date): boolean;
