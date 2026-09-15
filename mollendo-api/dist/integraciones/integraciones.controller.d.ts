import { IntegracionesService } from './integraciones.service.js';
import { TorniqueteComandoDto } from './dto/torniquete-comando.dto.js';
export declare class IntegracionesController {
    private readonly integracionesService;
    constructor(integracionesService: IntegracionesService);
    recibirWebhookAlcoholimetro(payload: unknown): Promise<{
        recibido: boolean;
    }>;
    enviarComandoTorniquete(dto: TorniqueteComandoDto): Promise<{
        enviado: boolean;
    }>;
}
