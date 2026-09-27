import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express, Response } from 'express';
import { fotosMulterOptions } from './fotos-storage.util.js';
import { PersonasService } from './personas.service.js';
import { CreatePersonaDto } from './dto/create-persona.dto.js';
import { UpdatePersonaDto } from './dto/update-persona.dto.js';
import { UpdateEstadoPersonaDto } from './dto/update-estado-persona.dto.js';
import { QueryPersonasDto } from './dto/query-personas.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';

@Controller('personas')
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Post()
  @Roles('administrador')
  create(@Body() dto: CreatePersonaDto, @CurrentUser() user: AuthenticatedUser) {
    return this.personasService.create(dto, user);
  }

  @Get()
  @Roles('administrador', 'vigilancia')
  findAll(@Query() query: QueryPersonasDto) {
    return this.personasService.findAll(query);
  }

  @Get(':id')
  @Roles('administrador', 'vigilancia')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personasService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrador')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.personasService.update(id, dto, user);
  }

  @Patch(':id/estado')
  @Roles('administrador')
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoPersonaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.personasService.updateEstado(id, dto, user);
  }

  // Foto para el reconocimiento facial (reemplaza la anterior).
  @Post(':id/foto')
  @Roles('administrador')
  @UseInterceptors(FileInterceptor('foto', fotosMulterOptions))
  subirFoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() foto: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!foto) {
      throw new BadRequestException('La foto es obligatoria');
    }
    return this.personasService.guardarFoto(id, foto.path, user);
  }

  @Get(':id/foto')
  @Roles('administrador', 'vigilancia')
  async verFoto(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    res.sendFile(await this.personasService.rutaFoto(id));
  }
}
