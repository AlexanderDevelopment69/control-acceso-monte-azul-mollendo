import { Module } from '@nestjs/common';
import { EventosAccesoController } from './eventos-acceso.controller.js';
import { EventosAccesoService } from './eventos-acceso.service.js';
import { VerificacionManualService } from './verificacion-manual.service.js';
import { ModoIngresoService } from './modo-ingreso.service.js';
import { TarjetasContingenciaModule } from '../tarjetas-contingencia/tarjetas-contingencia.module.js';

@Module({
  imports: [TarjetasContingenciaModule],
  controllers: [EventosAccesoController],
  providers: [EventosAccesoService, VerificacionManualService, ModoIngresoService],
  exports: [EventosAccesoService, VerificacionManualService, ModoIngresoService],
})
export class EventosAccesoModule {}
