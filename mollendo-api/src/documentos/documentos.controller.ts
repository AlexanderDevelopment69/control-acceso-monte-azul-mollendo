import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express, Response } from 'express';
import { DocumentosService } from './documentos.service.js';
import { CreateDocumentoDto } from './dto/create-documento.dto.js';
import { documentosMulterOptions } from './documentos-storage.util.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';

@Controller()
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post('personas/:personaId/documentos')
  @Roles('administrador')
  @UseInterceptors(FileInterceptor('archivo', documentosMulterOptions))
  subirDocumento(
    @Param('personaId', ParseIntPipe) personaId: number,
    @Body() dto: CreateDocumentoDto,
    @UploadedFile() archivo: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!archivo) {
      throw new BadRequestException('El archivo del documento es obligatorio');
    }
    return this.documentosService.subirDocumento(personaId, dto, archivo, user);
  }

  @Get('personas/:personaId/documentos')
  @Roles('administrador', 'vigilancia')
  findHistorial(@Param('personaId', ParseIntPipe) personaId: number) {
    return this.documentosService.findHistorial(personaId);
  }

  // Archivo de una versión del documento: PDF e imágenes se abren en el
  // navegador; Word se descarga.
  @Get('personas/:personaId/documentos/:documentoId/archivo')
  @Roles('administrador', 'vigilancia')
  async verArchivo(
    @Param('personaId', ParseIntPipe) personaId: number,
    @Param('documentoId', ParseIntPipe) documentoId: number,
    @Res() res: Response,
  ) {
    const archivo = await this.documentosService.archivo(personaId, documentoId);
    res.setHeader('Content-Type', archivo.tipo);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', `${archivo.enLinea ? 'inline' : 'attachment'}; filename="${archivo.nombre}"`);
    res.sendFile(archivo.ruta);
  }

  // Elimina el documento completo (todas sus versiones y archivos) de la persona.
  @Delete('personas/:personaId/documentos/:tipoDocumentoId')
  @Roles('administrador')
  eliminarDocumento(
    @Param('personaId', ParseIntPipe) personaId: number,
    @Param('tipoDocumentoId', ParseIntPipe) tipoDocumentoId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.documentosService.eliminarDocumento(personaId, tipoDocumentoId, user);
  }
}
