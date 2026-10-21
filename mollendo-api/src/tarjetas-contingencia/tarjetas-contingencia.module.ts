import { Module } from '@nestjs/common';
import { TarjetasContingenciaController } from './tarjetas-contingencia.controller.js';
import { TarjetasContingenciaService } from './tarjetas-contingencia.service.js';

@Module({
  controllers: [TarjetasContingenciaController],
  providers: [TarjetasContingenciaService],
  exports: [TarjetasContingenciaService],
})
export class TarjetasContingenciaModule {}
