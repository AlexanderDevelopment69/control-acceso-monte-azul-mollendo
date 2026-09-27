import { EventosAccesoService, type AbrirMolineteEvent } from '../eventos-acceso/eventos-acceso.service.js';
import type { TorniqueteComandoDto } from './dto/torniquete-comando.dto.js';
import type { ZkbioWebhookDto } from './dto/zkbio-webhook.dto.js';
export declare class IntegracionesService {
    private readonly eventosAccesoService;
    private readonly logger;
    constructor(eventosAccesoService: EventosAccesoService);
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
            sinDocumentos: boolean;
            alcohol: boolean;
            documentos: boolean;
            documentosVencidos: string[];
        };
    }>;
    abrirMolinete(evento: AbrirMolineteEvent): Promise<void>;
    enrolarRostro(evento: {
        personaId: number;
        tipoDocumentoIdentidad: string;
        numeroDocumento: string;
        rutaFoto: string;
    }): void;
    enviarComandoTorniquete(dto: TorniqueteComandoDto): Promise<{
        enviado: boolean;
    }>;
}
