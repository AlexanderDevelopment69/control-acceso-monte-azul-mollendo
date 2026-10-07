import { Module } from '@nestjs/common';
import { ControladorGateway } from './controlador.gateway.js';
import { ControladorRemotoController } from './controlador-remoto.controller.js';

/** Lado del servidor del controlador de garita (ver ControladorGateway). */
@Module({
  controllers: [ControladorRemotoController],
  providers: [ControladorGateway],
  exports: [ControladorGateway],
})
export class ControladorRemotoModule {}
