import { IntegracionesService } from './integraciones.service.js';
import { TorniqueteComandoDto } from './dto/torniquete-comando.dto.js';
import { ZkbioWebhookDto } from './dto/zkbio-webhook.dto.js';
export declare class IntegracionesController {
    private readonly integracionesService;
    constructor(integracionesService: IntegracionesService);
    recibirWebhookZkbio(dto: ZkbioWebhookDto): Promise<{
        eventoId: null;
        tipoMovimiento: "ingreso" | "salida";
        resultado: "denegado";
        fechaHora: string;
        persona: null;
        numeroDocumento: string;
        motivos: {
            personaNoRegistrada: boolean;
        };
    } | {
        eventoId: number;
        tipoMovimiento: import("../generated/prisma/enums.js").TipoMovimiento;
        resultado: import("../generated/prisma/enums.js").ResultadoAcceso;
        fechaHora: string;
        persona: {
            id: number;
            nombres: string;
            apellidos: string;
        };
        numeroDocumento: string;
        motivos: {
            dadoDeBaja: boolean;
            sinPuesto: boolean;
            alcohol: boolean;
            documentos: boolean;
            documentosFaltantes: string[];
        };
    }>;
    enviarComandoTorniquete(dto: TorniqueteComandoDto): Promise<{
        enviado: boolean;
    }>;
}
