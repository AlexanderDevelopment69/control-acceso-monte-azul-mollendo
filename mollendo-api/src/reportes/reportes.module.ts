import { Module } from '@nestjs/common';
import { PanelModule } from '../panel/panel.module.js';
import { ReportesController } from './reportes.controller.js';
import { ReportesService } from './reportes.service.js';

@Module({
  imports: [PanelModule],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
