import type { TorniqueteComandoDto } from './dto/torniquete-comando.dto.js';
export declare class IntegracionesService {
    private readonly logger;
    recibirWebhookAlcoholimetro(payload: unknown): Promise<{
        recibido: boolean;
    }>;
    enviarComandoTorniquete(dto: TorniqueteComandoDto): Promise<{
        enviado: boolean;
    }>;
}
