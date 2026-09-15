import { Injectable, Logger } from '@nestjs/common';
import type { TorniqueteComandoDto } from './dto/torniquete-comando.dto.js';

/**
 * Contrato provisional (spec, sección 9.8): el proveedor del alcoholímetro
 * y la marca/SDK del torniquete todavía no están definidos (sección 12,
 * puntos pendientes de confirmar con el cliente). Estos endpoints solo
 * registran el payload recibido/enviado para poder programar el resto del
 * flujo contra un mock mientras se define el proveedor real.
 */
@Injectable()
export class IntegracionesService {
  private readonly logger = new Logger(IntegracionesService.name);

  async recibirWebhookAlcoholimetro(payload: unknown): Promise<{ recibido: boolean }> {
    this.logger.log(`Webhook alcoholímetro recibido: ${JSON.stringify(payload)}`);
    return { recibido: true };
  }

  async enviarComandoTorniquete(dto: TorniqueteComandoDto): Promise<{ enviado: boolean }> {
    this.logger.log(`Comando torniquete ${dto.torniqueteId}: ${dto.comando} (mock, sin SDK real todavía)`);
    return { enviado: true };
  }
}
