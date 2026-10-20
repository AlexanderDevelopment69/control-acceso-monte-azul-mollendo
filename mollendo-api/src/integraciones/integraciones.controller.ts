import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { IntegracionesService } from './integraciones.service.js';
import { MonitorG4Service } from './monitor-g4.service.js';
import { TorniqueteComandoDto } from './dto/torniquete-comando.dto.js';
import { SincronizacionDiariaDto } from './dto/sincronizacion-diaria.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';

@Controller('integraciones')
export class IntegracionesController {
  constructor(
    private readonly integracionesService: IntegracionesService,
    private readonly monitorG4: MonitorG4Service,
  ) {}

  /** Monitor del G4 Pro: las últimas pruebas de rostro y alcohol y qué hizo el sistema con cada una. */
  @Get('g4pro/marcaciones')
  @Roles('administrador')
  marcacionesG4Pro() {
    return this.monitorG4.ultimas();
  }

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
