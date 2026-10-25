import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { EventosAccesoService } from './eventos-acceso.service.js';
import { VerificacionManualService } from './verificacion-manual.service.js';
import { ModoIngresoService } from './modo-ingreso.service.js';
import { IngresoDto } from './dto/ingreso.dto.js';
import { SalidaDto } from './dto/salida.dto.js';
import { QueryEventosAccesoDto } from './dto/query-eventos-acceso.dto.js';
import { ActivarVerificacionManualDto, CambiarModoIngresoDto, DecisionManualDto } from './dto/verificacion-manual.dto.js';
import { CorreccionAntipassbackDto } from './dto/correccion-antipassback.dto.js';
import { SalidaSinDniDto, TarjetaLeidaDto } from './dto/tarjeta-leida.dto.js';
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

  /** Tarjeta de contingencia pasada por un lector de DNI (en lugar del DNI). */
  @Post('tarjeta')
  @Public()
  @UseGuards(ApiKeyGuard)
  registrarTarjeta(@Body() dto: TarjetaLeidaDto) {
    return this.eventosAccesoService.registrarTarjeta(dto);
  }

  /** Puertas con el lector de DNI desconectado (contingencia "sin lector"). */
  @Get('sin-lector')
  @Roles('administrador', 'vigilancia', 'soporte')
  sinLector() {
    return this.eventosAccesoService.sinLector();
  }

  /** Salida sin lector: el vigilante abre desde "Presentes ahora" la salida de quien figura dentro. */
  @Post('salida-sin-lector')
  @Roles('administrador', 'vigilancia')
  salidaSinLector(@Body() dto: SalidaSinDniDto, @CurrentUser() usuario: AuthenticatedUser) {
    return this.eventosAccesoService.salidaSinLector(dto.personaId, usuario);
  }

  /** Salida sin DNI elegida en el Panel que espera la tarjeta (null: ninguna). */
  @Get('salida-sin-dni')
  @Roles('administrador', 'vigilancia', 'soporte')
  salidaSinDni() {
    return this.eventosAccesoService.salidaSinDniPreparada();
  }

  /** Salida sin DNI: quienes figuran dentro y coinciden con la búsqueda. */
  @Get('salida-sin-dni/candidatos')
  @Roles('administrador', 'vigilancia')
  candidatosSalidaSinDni(@Query('busqueda') busqueda?: string) {
    return this.eventosAccesoService.buscarDentro(busqueda?.slice(0, 100));
  }

  /** El vigilante elige al trabajador que sale sin DNI; después pasa la tarjeta por el lector de salida. */
  @Post('salida-sin-dni')
  @Roles('administrador', 'vigilancia')
  prepararSalidaSinDni(@Body() dto: SalidaSinDniDto, @CurrentUser() usuario: AuthenticatedUser) {
    return this.eventosAccesoService.prepararSalidaSinDni(dto.personaId, usuario);
  }

  @Delete('salida-sin-dni')
  @Roles('administrador', 'vigilancia')
  cancelarSalidaSinDni(@CurrentUser() usuario: AuthenticatedUser) {
    return this.eventosAccesoService.cancelarSalidaSinDni(usuario);
  }

  /** DNI en regla esperando el rostro y el alcohol del G4 Pro, o al vigilante (Panel de vigilancia). */
  @Get('en-espera')
  @Roles('administrador', 'vigilancia', 'soporte')
  enEspera() {
    return this.eventosAccesoService.ingresosEnEspera();
  }

  /** Verificación manual vigente (contingencia por falla del equipo facial). */
  @Get('verificacion-manual')
  @Roles('administrador', 'vigilancia', 'soporte')
  verificacionManualEstado() {
    return this.verificacionManual.estado();
  }

  @Post('verificacion-manual')
  @Roles('administrador', 'vigilancia')
  activarVerificacionManual(@Body() dto: ActivarVerificacionManualDto, @CurrentUser() usuario: AuthenticatedUser) {
    return this.verificacionManual.activar(dto.motivo, usuario, dto.causa);
  }

  @Delete('verificacion-manual')
  @Roles('administrador', 'vigilancia')
  terminarVerificacionManual(@CurrentUser() usuario: AuthenticatedUser) {
    return this.verificacionManual.terminar(usuario);
  }

  /** Orden del ingreso: DNI → Facial + Alcohol o Facial + Alcohol → DNI. */
  @Get('modo-ingreso')
  @Roles('administrador', 'vigilancia', 'soporte')
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
    return this.eventosAccesoService.decidirManual(id, dto.decision, usuario, dto.grado);
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
  @Roles('administrador', 'vigilancia', 'soporte')
  findAll(@Query() query: QueryEventosAccesoDto) {
    return this.eventosAccesoService.findAll(query);
  }
}
