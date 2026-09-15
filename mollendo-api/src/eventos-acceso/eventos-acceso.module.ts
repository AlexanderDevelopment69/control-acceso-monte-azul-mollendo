import { Module } from '@nestjs/common';
import { EventosAccesoController } from './eventos-acceso.controller.js';
import { EventosAccesoService } from './eventos-acceso.service.js';

@Module({
  controllers: [EventosAccesoController],
  providers: [EventosAccesoService],
  exports: [EventosAccesoService],
})
export class EventosAccesoModule {}
