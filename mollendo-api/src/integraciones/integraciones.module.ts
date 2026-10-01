import { Module } from '@nestjs/common';
import { IntegracionesController } from './integraciones.controller.js';
import { IntegracionesService } from './integraciones.service.js';
import { PushSdkModule } from '../push-sdk/push-sdk.module.js';

@Module({
  imports: [PushSdkModule],
  controllers: [IntegracionesController],
  providers: [IntegracionesService],
})
export class IntegracionesModule {}
