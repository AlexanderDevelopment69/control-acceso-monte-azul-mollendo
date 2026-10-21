import { Module } from '@nestjs/common';
import { IntegracionesController } from './integraciones.controller.js';
import { IntegracionesService } from './integraciones.service.js';
import { PushSdkModule } from '../push-sdk/push-sdk.module.js';
import { ReleUsbService } from './rele-usb.service.js';
import { LimpiezaRegistrosService } from './limpieza-registros.service.js';
import { MonitorG4Service } from './monitor-g4.service.js';
import { ControladorRemotoModule } from '../controlador-remoto/controlador-remoto.module.js';

@Module({
  imports: [PushSdkModule, ControladorRemotoModule],
  controllers: [IntegracionesController],
  providers: [IntegracionesService, ReleUsbService, LimpiezaRegistrosService, MonitorG4Service],
  exports: [ReleUsbService, IntegracionesService],
})
export class IntegracionesModule {}
