import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { EventosAccesoService } from './eventos-acceso.service.js';
import { IngresoDto } from './dto/ingreso.dto.js';
import { SalidaDto } from './dto/salida.dto.js';
import { QueryEventosAccesoDto } from './dto/query-eventos-acceso.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { ApiKeyGuard } from '../common/guards/api-key.guard.js';

@Controller('eventos-acceso')
export class EventosAccesoController {
  constructor(private readonly eventosAccesoService: EventosAccesoService) {}

  @Post('ingreso')
  @Public()
  @UseGuards(ApiKeyGuard)
  registrarIngreso(@Body() dto: IngresoDto) {
    return this.eventosAccesoService.registrarIngreso(dto);
  }

  @Post('salida')
  @Public()
  @UseGuards(ApiKeyGuard)
  registrarSalida(@Body() dto: SalidaDto) {
    return this.eventosAccesoService.registrarSalida(dto);
  }

  @Get()
  @Roles('administracion', 'vigilancia')
  findAll(@Query() query: QueryEventosAccesoDto) {
    return this.eventosAccesoService.findAll(query);
  }
}
