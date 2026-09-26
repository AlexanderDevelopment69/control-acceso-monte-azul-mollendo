import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IntegracionesService } from './integraciones.service.js';
import { TorniqueteComandoDto } from './dto/torniquete-comando.dto.js';
import { ZkbioWebhookDto } from './dto/zkbio-webhook.dto.js';
import { Public } from '../common/decorators/public.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ApiKeyGuard } from '../common/guards/api-key.guard.js';

@Controller('integraciones')
export class IntegracionesController {
  constructor(private readonly integracionesService: IntegracionesService) {}

  // ZKBio CVSecurity avisa la identificación + prueba de alcohol y se ejecuta el ingreso.
  @Post('zkbio/webhook')
  @Public()
  @UseGuards(ApiKeyGuard)
  recibirWebhookZkbio(@Body() dto: ZkbioWebhookDto) {
    return this.integracionesService.recibirWebhookZkbio(dto);
  }

  @Post('torniquete/comando')
  @Roles('administrador', 'vigilancia')
  enviarComandoTorniquete(@Body() dto: TorniqueteComandoDto) {
    return this.integracionesService.enviarComandoTorniquete(dto);
  }
}
