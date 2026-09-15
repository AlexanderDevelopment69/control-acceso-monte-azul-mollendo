import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PanelController } from './panel.controller.js';
import { PanelService } from './panel.service.js';
import { EventosGateway } from './eventos.gateway.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [PanelController],
  providers: [PanelService, EventosGateway],
})
export class PanelModule {}
