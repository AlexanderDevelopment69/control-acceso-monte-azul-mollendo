export declare class ZkbioWebhookDto {
    tipoDocumentoIdentidad?: 'DNI' | 'CE' | 'PASAPORTE';
    numeroDocumento: string;
    resultadoAlcohol: 'conforme' | 'no_conforme';
    torniqueteId?: string;
}
