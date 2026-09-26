import { Module } from '@nestjs/common';
import { IntegracionesController } from './integraciones.controller.js';
import { IntegracionesService } from './integraciones.service.js';
import { EventosAccesoModule } from '../eventos-acceso/eventos-acceso.module.js';

@Module({
  imports: [EventosAccesoModule],
  controllers: [IntegracionesController],
  providers: [IntegracionesService],
})
export class IntegracionesModule {}
