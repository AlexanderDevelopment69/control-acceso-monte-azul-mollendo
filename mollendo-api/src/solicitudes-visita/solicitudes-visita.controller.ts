import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { SolicitudesVisitaService } from './solicitudes-visita.service.js';
import { CreateSolicitudVisitaDto } from './dto/create-solicitud-visita.dto.js';
import { UpdateSolicitudVisitaDto } from './dto/update-solicitud-visita.dto.js';
import { QuerySolicitudesVisitaDto } from './dto/query-solicitudes-visita.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';

@Controller('solicitudes-visita')
export class SolicitudesVisitaController {
  constructor(private readonly solicitudesVisitaService: SolicitudesVisitaService) {}

  @Post()
  @Roles('empresa')
  create(@Body() dto: CreateSolicitudVisitaDto, @CurrentUser() user: AuthenticatedUser) {
    return this.solicitudesVisitaService.create(dto, user);
  }

  @Get()
  @Roles('administracion', 'empresa', 'vigilancia')
  findAll(@Query() query: QuerySolicitudesVisitaDto, @CurrentUser() user: AuthenticatedUser) {
    return this.solicitudesVisitaService.findAll(query, user);
  }

  @Patch(':id')
  @Roles('empresa')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSolicitudVisitaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.solicitudesVisitaService.update(id, dto, user);
  }
}
