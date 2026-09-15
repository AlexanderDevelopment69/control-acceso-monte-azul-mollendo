import { Module } from '@nestjs/common';
import { TiposDocumentoController } from './tipos-documento.controller.js';
import { TiposDocumentoService } from './tipos-documento.service.js';

@Module({
  controllers: [TiposDocumentoController],
  providers: [TiposDocumentoService],
  exports: [TiposDocumentoService],
})
export class TiposDocumentoModule {}
