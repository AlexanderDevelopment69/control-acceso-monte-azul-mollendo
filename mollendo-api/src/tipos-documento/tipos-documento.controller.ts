import { Body, Controller, Get, Post } from '@nestjs/common';
import { TiposDocumentoService } from './tipos-documento.service.js';
import { CreateTipoDocumentoDto } from './dto/create-tipo-documento.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';

@Controller('tipos-documento')
export class TiposDocumentoController {
  constructor(private readonly tiposDocumentoService: TiposDocumentoService) {}

  @Get()
  findAll() {
    return this.tiposDocumentoService.findAll();
  }

  @Post()
  @Roles('administrador')
  create(@Body() dto: CreateTipoDocumentoDto, @CurrentUser() user: AuthenticatedUser) {
    return this.tiposDocumentoService.create(dto, user.id);
  }
}
