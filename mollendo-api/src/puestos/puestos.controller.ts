import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { PuestosService } from './puestos.service.js';
import { CreatePuestoDto } from './dto/create-puesto.dto.js';
import { SetRequisitosDto } from './dto/set-requisitos.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';

@Controller('puestos')
export class PuestosController {
  constructor(private readonly puestosService: PuestosService) {}

  @Get()
  findAll() {
    return this.puestosService.findAll();
  }

  @Post()
  @Roles('administrador')
  create(@Body() dto: CreatePuestoDto, @CurrentUser() user: AuthenticatedUser) {
    return this.puestosService.create(dto, user.id);
  }

  @Get(':id/requisitos')
  findRequisitos(@Param('id', ParseIntPipe) id: number) {
    return this.puestosService.findRequisitos(id);
  }

  @Post(':id/requisitos')
  @Roles('administrador')
  setRequisitos(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetRequisitosDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.puestosService.setRequisitos(id, dto, user.id);
  }
}
