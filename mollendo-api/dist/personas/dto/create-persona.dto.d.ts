export declare class CreatePersonaDto {
    puestoId?: number;
    tipoDocumentoIdentidad: 'DNI' | 'CE' | 'PASAPORTE';
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    area?: string;
}
