import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { EventosAccesoService } from './eventos-acceso.service.js';
import { VerificacionManualService } from './verificacion-manual.service.js';
import { ModoIngresoService } from './modo-ingreso.service.js';
import { IngresoDto } from './dto/ingreso.dto.js';
import { SalidaDto } from './dto/salida.dto.js';
import { QueryEventosAccesoDto } from './dto/query-eventos-acceso.dto.js';
import { ActivarVerificacionManualDto, CambiarModoIngresoDto, DecisionManualDto } from './dto/verificacion-manual.dto.js';
import { CorreccionAntipassbackDto } from './dto/correccion-antipassback.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ApiKeyGuard } from '../common/guards/api-key.guard.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';

@Controller('eventos-acceso')
export class EventosAccesoController {
  constructor(
    private readonly eventosAccesoService: EventosAccesoService,
    private readonly verificacionManual: VerificacionManualService,
    private readonly modoIngreso: ModoIngresoService,
  ) {}

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

  /** DNI en regla esperando el rostro y el alcohol del G4 Pro, o al vigilante (Panel de vigilancia). */
  @Get('en-espera')
  @Roles('administrador', 'vigilancia')
  enEspera() {
    return this.eventosAccesoService.ingresosEnEspera();
  }

  /** Verificación manual vigente (contingencia por falla del equipo facial). */
  @Get('verificacion-manual')
  @Roles('administrador', 'vigilancia')
  verificacionManualEstado() {
    return this.verificacionManual.estado();
  }

  @Post('verificacion-manual')
  @Roles('administrador', 'vigilancia')
  activarVerificacionManual(@Body() dto: ActivarVerificacionManualDto, @CurrentUser() usuario: AuthenticatedUser) {
    return this.verificacionManual.activar(dto.motivo, usuario);
  }

  @Delete('verificacion-manual')
  @Roles('administrador', 'vigilancia')
  terminarVerificacionManual(@CurrentUser() usuario: AuthenticatedUser) {
    return this.verificacionManual.terminar(usuario);
  }

  /** Orden del ingreso: primero el DNI (normal) o primero rostro y alcohol (en prueba). */
  @Get('modo-ingreso')
  @Roles('administrador', 'vigilancia')
  modoIngresoEstado() {
    return this.modoIngreso.estado();
  }

  @Put('modo-ingreso')
  @Roles('administrador')
  cambiarModoIngreso(@Body() dto: CambiarModoIngresoDto, @CurrentUser() usuario: AuthenticatedUser) {
    return this.modoIngreso.cambiar(dto.facialPrimero, usuario);
  }

  /** El vigilante decide sobre la persona en su turno: "apto", "alcohol" o "no-es-la-persona". */
  @Post('en-espera/:id/decision')
  @Roles('administrador', 'vigilancia')
  decidir(@Param('id', ParseIntPipe) id: number, @Body() dto: DecisionManualDto, @CurrentUser() usuario: AuthenticatedUser) {
    return this.eventosAccesoService.decidirManual(id, dto.decision, usuario);
  }

  /**
   * Corrección manual del antipassback: salida de quien figura dentro o
   * ingreso de quien figura fuera, con motivo. No abre el molinete.
   */
  @Post('correccion')
  @Roles('administrador', 'vigilancia')
  corregir(@Body() dto: CorreccionAntipassbackDto, @CurrentUser() usuario: AuthenticatedUser) {
    return this.eventosAccesoService.registrarCorreccion(dto, usuario);
  }

  @Get()
  @Roles('administrador', 'vigilancia')
  findAll(@Query() query: QueryEventosAccesoDto) {
    return this.eventosAccesoService.findAll(query);
  }
}
