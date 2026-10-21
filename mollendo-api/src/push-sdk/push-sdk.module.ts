import { Module } from '@nestjs/common';
import { PushSdkController } from './push-sdk.controller.js';
import { PushSdkService } from './push-sdk.service.js';
import { AlcoholimetroService } from './alcoholimetro.service.js';

@Module({
  controllers: [PushSdkController],
  providers: [PushSdkService, AlcoholimetroService],
  exports: [PushSdkService, AlcoholimetroService],
})
export class PushSdkModule {}
