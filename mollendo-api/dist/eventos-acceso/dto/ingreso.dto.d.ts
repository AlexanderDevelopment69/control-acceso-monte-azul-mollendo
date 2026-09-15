export declare class IngresoDto {
    tipoDocumentoIdentidad: 'DNI' | 'CE' | 'PASAPORTE';
    numeroDocumento: string;
    alcoholConforme: boolean;
    torniqueteId?: string;
}
