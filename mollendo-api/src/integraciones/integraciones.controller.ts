import { Body, Controller, Post, Put, Query } from '@nestjs/common';
import { IntegracionesService } from './integraciones.service.js';
import { TorniqueteComandoDto } from './dto/torniquete-comando.dto.js';
import { SincronizacionDiariaDto } from './dto/sincronizacion-diaria.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';

@Controller('integraciones')
export class IntegracionesController {
  constructor(private readonly integracionesService: IntegracionesService) {}

  @Post('torniquete/comando')
  @Roles('administrador', 'vigilancia')
  enviarComandoTorniquete(@Body() dto: TorniqueteComandoDto) {
    return this.integracionesService.enviarComandoTorniquete(dto);
  }

  /** Registra a todo el personal (con foto) en los G4 Pro; por ejemplo, al instalar un equipo nuevo. */
  @Post('g4pro/sincronizar')
  @Roles('administrador')
  sincronizarG4Pro(@Query('simular') simular?: string) {
    return this.integracionesService.sincronizarTodas(simular === 'true');
  }

  /** Activa (hora 0..23) o desactiva (null) la sincronización diaria; se guarda en el servidor. */
  @Put('g4pro/sincronizacion-diaria')
  @Roles('administrador')
  cambiarSincronizacionDiaria(@Body() dto: SincronizacionDiariaDto) {
    return this.integracionesService.cambiarDiaria(dto.hora ?? null);
  }
}
