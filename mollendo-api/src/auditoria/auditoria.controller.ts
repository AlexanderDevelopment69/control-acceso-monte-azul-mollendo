import { Controller, Get, Query } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service.js';
import { QueryAuditoriaDto } from './dto/query-auditoria.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';

@Controller('auditoria')
@Roles('administrador')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  findAll(@Query() query: QueryAuditoriaDto) {
    return this.auditoriaService.findAll(query);
  }
}
