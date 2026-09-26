export declare class CreatePersonaDto {
    empresaId: number;
    puestoId?: number;
    tipoDocumentoIdentidad: 'DNI' | 'CE' | 'PASAPORTE';
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    area?: string;
}
