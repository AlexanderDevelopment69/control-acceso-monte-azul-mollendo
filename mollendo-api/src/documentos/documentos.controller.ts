import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { DocumentosService } from './documentos.service.js';
import { CreateDocumentoDto } from './dto/create-documento.dto.js';
import { UpdateEstadoDocumentoDto } from './dto/update-estado-documento.dto.js';
import { documentosMulterStorage } from './documentos-storage.util.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';

@Controller()
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post('personas/:personaId/documentos')
  @Roles('empresa')
  @UseInterceptors(FileInterceptor('archivo', { storage: documentosMulterStorage }))
  subirDocumento(
    @Param('personaId', ParseIntPipe) personaId: number,
    @Body() dto: CreateDocumentoDto,
    @UploadedFile() archivo: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!archivo) {
      throw new BadRequestException('El archivo del documento es obligatorio');
    }
    return this.documentosService.subirDocumento(personaId, dto, archivo.path, user);
  }

  @Get('personas/:personaId/documentos')
  @Roles('administracion', 'empresa', 'vigilancia')
  findHistorial(@Param('personaId', ParseIntPipe) personaId: number, @CurrentUser() user: AuthenticatedUser) {
    return this.documentosService.findHistorial(personaId, user);
  }

  @Patch('documentos/:id')
  @Roles('empresa')
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoDocumentoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.documentosService.updateEstado(id, dto, user);
  }
}
