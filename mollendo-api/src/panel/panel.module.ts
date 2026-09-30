import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PanelController } from './panel.controller.js';
import { PanelService } from './panel.service.js';
import { DashboardService } from './dashboard.service.js';
import { EventosGateway } from './eventos.gateway.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [PanelController],
  providers: [PanelService, DashboardService, EventosGateway],
})
export class PanelModule {}
