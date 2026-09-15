import { Module } from '@nestjs/common';
import { PuestosController } from './puestos.controller.js';
import { PuestosService } from './puestos.service.js';

@Module({
  controllers: [PuestosController],
  providers: [PuestosService],
  exports: [PuestosService],
})
export class PuestosModule {}
