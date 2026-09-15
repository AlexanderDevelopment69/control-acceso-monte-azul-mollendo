import { Module } from '@nestjs/common';
import { SolicitudesVisitaController } from './solicitudes-visita.controller.js';
import { SolicitudesVisitaService } from './solicitudes-visita.service.js';

@Module({
  controllers: [SolicitudesVisitaController],
  providers: [SolicitudesVisitaService],
  exports: [SolicitudesVisitaService],
})
export class SolicitudesVisitaModule {}
