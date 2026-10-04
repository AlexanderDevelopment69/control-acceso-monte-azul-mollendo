import { Module } from '@nestjs/common';
import { EventosAccesoModule } from '../eventos-acceso/eventos-acceso.module.js';
import { LectoresDniService } from './lectores-dni.service.js';

@Module({
  imports: [EventosAccesoModule],
  providers: [LectoresDniService],
  exports: [LectoresDniService],
})
export class LectoresDniModule {}
