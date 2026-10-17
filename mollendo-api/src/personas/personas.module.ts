import { Module } from '@nestjs/common';
import { PersonasController } from './personas.controller.js';
import { PersonasService } from './personas.service.js';
import { CargaMasivaService } from './carga-masiva/carga-masiva.service.js';

@Module({
  controllers: [PersonasController],
  providers: [PersonasService, CargaMasivaService],
  exports: [PersonasService],
})
export class PersonasModule {}
