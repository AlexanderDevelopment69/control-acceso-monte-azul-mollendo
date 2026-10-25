import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { IntegracionesService } from './integraciones.service.js';
import { MonitorG4Service } from './monitor-g4.service.js';
import { TorniqueteComandoDto } from './dto/torniquete-comando.dto.js';
import { SincronizacionDiariaDto } from './dto/sincronizacion-diaria.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ListaPaginadaDto } from '../common/paginacion.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';

@Controller('integraciones')
export class IntegracionesController {
  constructor(
    private readonly integracionesService: IntegracionesService,
    private readonly monitorG4: MonitorG4Service,
  ) {}

  /** Monitor del G4 Pro: las pruebas de rostro y alcohol y qué hizo el sistema con cada una (por día, búsqueda y página). */
  @Get('g4pro/marcaciones')
  @Roles('administrador', 'soporte')
  marcacionesG4Pro(@Query() query: ListaPaginadaDto) {
    return this.monitorG4.listar(query);
  }

  // Abre sin DNI (queda en la Auditoría): solo el administrador, para una emergencia o para probar un molinete.
  @Post('torniquete/comando')
  @Roles('administrador', 'soporte')
  enviarComandoTorniquete(@Body() dto: TorniqueteComandoDto, @CurrentUser() usuario: AuthenticatedUser) {
    return this.integracionesService.enviarComandoTorniquete(dto, usuario.id);
  }

  /** Registra a todo el personal (con foto) en los G4 Pro; por ejemplo, al instalar un equipo nuevo. */
  @Post('g4pro/sincronizar')
  @Roles('administrador', 'soporte')
  sincronizarG4Pro(@Query('simular') simular?: string, @CurrentUser() usuario?: AuthenticatedUser) {
    return this.integracionesService.sincronizarTodas(simular === 'true', 'manual', usuario?.id);
  }

  /** Activa (hora 0..23) o desactiva (null) la sincronización diaria; se guarda en el servidor. */
  @Put('g4pro/sincronizacion-diaria')
  @Roles('administrador', 'soporte')
  cambiarSincronizacionDiaria(@Body() dto: SincronizacionDiariaDto, @CurrentUser() usuario: AuthenticatedUser) {
    return this.integracionesService.cambiarDiaria(dto.hora ?? null, usuario.correo, usuario.id);
  }
}
