import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PanelController } from './panel.controller.js';
import { PanelService } from './panel.service.js';
import { DashboardService } from './dashboard.service.js';
import { EventosGateway } from './eventos.gateway.js';
import { EstadoSistemaService } from './estado-sistema.service.js';
import { BitacoraEquiposService } from './bitacora-equipos.service.js';
import { PushSdkModule } from '../push-sdk/push-sdk.module.js';
import { LectoresDniModule } from '../lectores-dni/lectores-dni.module.js';
import { IntegracionesModule } from '../integraciones/integraciones.module.js';
import { ControladorRemotoModule } from '../controlador-remoto/controlador-remoto.module.js';

@Module({
  imports: [JwtModule.register({}), PushSdkModule, LectoresDniModule, IntegracionesModule, ControladorRemotoModule],
  controllers: [PanelController],
  providers: [PanelService, DashboardService, EventosGateway, EstadoSistemaService, BitacoraEquiposService],
  exports: [DashboardService],
})
export class PanelModule {}
