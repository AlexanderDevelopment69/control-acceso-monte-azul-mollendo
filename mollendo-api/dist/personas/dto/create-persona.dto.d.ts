export declare class CreatePersonaDto {
    empresaId: number;
    tipoDocumentoIdentidad: 'DNI' | 'CE' | 'PASAPORTE';
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
}
