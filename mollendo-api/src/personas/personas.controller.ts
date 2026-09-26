import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
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
}
