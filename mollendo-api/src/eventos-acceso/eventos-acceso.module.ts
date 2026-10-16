import { Module } from '@nestjs/common';
import { EventosAccesoController } from './eventos-acceso.controller.js';
import { EventosAccesoService } from './eventos-acceso.service.js';
import { VerificacionManualService } from './verificacion-manual.service.js';

@Module({
  controllers: [EventosAccesoController],
  providers: [EventosAccesoService, VerificacionManualService],
  exports: [EventosAccesoService, VerificacionManualService],
})
export class EventosAccesoModule {}
