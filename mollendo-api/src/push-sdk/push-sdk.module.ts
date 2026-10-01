import { Module } from '@nestjs/common';
import { PushSdkController } from './push-sdk.controller.js';
import { PushSdkService } from './push-sdk.service.js';

@Module({
  controllers: [PushSdkController],
  providers: [PushSdkService],
  exports: [PushSdkService],
})
export class PushSdkModule {}
