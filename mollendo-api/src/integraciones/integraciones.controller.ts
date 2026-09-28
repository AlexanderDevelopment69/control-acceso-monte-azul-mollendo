import { Body, Controller, Post } from '@nestjs/common';
import { IntegracionesService } from './integraciones.service.js';
import { TorniqueteComandoDto } from './dto/torniquete-comando.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';

@Controller('integraciones')
export class IntegracionesController {
  constructor(private readonly integracionesService: IntegracionesService) {}

  @Post('torniquete/comando')
  @Roles('administrador', 'vigilancia')
  enviarComandoTorniquete(@Body() dto: TorniqueteComandoDto) {
    return this.integracionesService.enviarComandoTorniquete(dto);
  }
}
