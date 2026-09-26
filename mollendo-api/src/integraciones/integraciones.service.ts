import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventosAccesoService, type AbrirMolineteEvent } from '../eventos-acceso/eventos-acceso.service.js';
import type { TorniqueteComandoDto } from './dto/torniquete-comando.dto.js';
import type { ZkbioWebhookDto } from './dto/zkbio-webhook.dto.js';

/**
 * Adaptadores de los equipos físicos (spec base, sección 5.3):
 * - ZKBio CVSecurity → backend: webhook con identificación + alcohol.
 * - Backend → molinete: orden de apertura.
 *
 * Ambos siguen siendo PROVISIONALES: falta la documentación/SDK de ZKBio y la
 * marca/modelo del molinete (spec base, sección 12). El molinete solo se
 * registra en el log hasta tener su SDK real.
 */
@Injectable()
export class IntegracionesService {
  private readonly logger = new Logger(IntegracionesService.name);

  constructor(private readonly eventosAccesoService: EventosAccesoService) {}

  async recibirWebhookZkbio(dto: ZkbioWebhookDto) {
    this.logger.log(`Webhook ZKBio recibido: ${JSON.stringify(dto)}`);
    return this.eventosAccesoService.registrarIngreso({
      tipoDocumentoIdentidad: dto.tipoDocumentoIdentidad ?? 'DNI',
      numeroDocumento: dto.numeroDocumento,
      alcoholConforme: dto.resultadoAlcohol === 'conforme',
      torniqueteId: dto.torniqueteId,
    });
  }

  @OnEvent('molinete.abrir')
  async abrirMolinete(evento: AbrirMolineteEvent): Promise<void> {
    await this.enviarComandoTorniquete({ torniqueteId: evento.torniqueteId ?? 'T1', comando: 'abrir' });
  }

  async enviarComandoTorniquete(dto: TorniqueteComandoDto): Promise<{ enviado: boolean }> {
    this.logger.log(`Comando molinete ${dto.torniqueteId}: ${dto.comando} (mock, sin SDK real todavía)`);
    return { enviado: true };
  }
}
