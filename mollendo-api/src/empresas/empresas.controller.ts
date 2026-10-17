import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { EmpresasService } from './empresas.service.js';
import { CreateEmpresaDto } from './dto/create-empresa.dto.js';
import { UpdateEmpresaDto } from './dto/update-empresa.dto.js';
import { QueryEmpresasDto } from './dto/query-empresas.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';

@Controller('empresas')
@Roles('administrador')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post()
  create(@Body() dto: CreateEmpresaDto, @CurrentUser() user: AuthenticatedUser) {
    return this.empresasService.create(dto, user.id);
  }

  @Get()
  findAll(@Query() query: QueryEmpresasDto) {
    return this.empresasService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.empresasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmpresaDto, @CurrentUser() user: AuthenticatedUser) {
    return this.empresasService.update(id, dto, user.id);
  }

  // Solo empresas sin personal ni usuarios (creadas por error); las demás se desactivan.
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.empresasService.remove(id, user.id);
  }
}
