import { Module } from '@nestjs/common';
import { EventosAccesoModule } from '../eventos-acceso/eventos-acceso.module.js';
import { EventosAccesoService } from '../eventos-acceso/eventos-acceso.service.js';
import { LectoresDniService } from './lectores-dni.service.js';
import { RegistroLecturas } from './registro-lecturas.js';

@Module({
  imports: [EventosAccesoModule],
  // En el servidor, los DNI leídos se registran directo en la base de datos.
  providers: [LectoresDniService, { provide: RegistroLecturas, useExisting: EventosAccesoService }],
  exports: [LectoresDniService],
})
export class LectoresDniModule {}
