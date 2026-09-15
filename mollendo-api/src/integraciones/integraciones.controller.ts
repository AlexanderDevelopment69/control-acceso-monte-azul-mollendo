import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IntegracionesService } from './integraciones.service.js';
import { TorniqueteComandoDto } from './dto/torniquete-comando.dto.js';
import { Public } from '../common/decorators/public.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ApiKeyGuard } from '../common/guards/api-key.guard.js';

@Controller('integraciones')
export class IntegracionesController {
  constructor(private readonly integracionesService: IntegracionesService) {}

  @Post('alcoholimetro/webhook')
  @Public()
  @UseGuards(ApiKeyGuard)
  recibirWebhookAlcoholimetro(@Body() payload: unknown) {
    return this.integracionesService.recibirWebhookAlcoholimetro(payload);
  }

  @Post('torniquete/comando')
  @Roles('administracion', 'vigilancia')
  enviarComandoTorniquete(@Body() dto: TorniqueteComandoDto) {
    return this.integracionesService.enviarComandoTorniquete(dto);
  }
}
