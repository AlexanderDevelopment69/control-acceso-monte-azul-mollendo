import { Body, Controller, Delete, Get, Header, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { TarjetasContingenciaService } from './tarjetas-contingencia.service.js';
import { ActualizarTarjetaDto, CrearTarjetaDto, QueryUsosTarjetaDto } from './dto/tarjeta-contingencia.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';

/** Tarjetas de contingencia: el administrador las maneja; el vigilante solo las ve. */
@Controller('tarjetas-contingencia')
export class TarjetasContingenciaController {
  constructor(private readonly tarjetas: TarjetasContingenciaService) {}

  @Get()
  @Roles('administrador')
  listar() {
    return this.tarjetas.listar();
  }

  /** Cada vez que se pasó una tarjeta por un lector, aceptada o no. */
  @Get('usos')
  @Roles('administrador')
  usos(@Query() query: QueryUsosTarjetaDto) {
    return this.tarjetas.usos(query);
  }

  @Post()
  @Roles('administrador')
  crear(@Body() dto: CrearTarjetaDto, @CurrentUser() usuario: AuthenticatedUser) {
    return this.tarjetas.crear(dto, usuario.id);
  }

  @Patch(':id')
  @Roles('administrador')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarTarjetaDto, @CurrentUser() usuario: AuthenticatedUser) {
    return this.tarjetas.actualizar(id, dto, usuario.id);
  }

  @Post(':id/cambiar-codigo')
  @Roles('administrador')
  cambiarCodigo(@Param('id', ParseIntPipe) id: number, @CurrentUser() usuario: AuthenticatedUser) {
    return this.tarjetas.cambiarCodigo(id, usuario.id);
  }

  /** Solo si nunca se usó; si no, se desactiva. */
  @Delete(':id')
  @Roles('administrador')
  eliminar(@Param('id', ParseIntPipe) id: number, @CurrentUser() usuario: AuthenticatedUser) {
    return this.tarjetas.eliminar(id, usuario.id);
  }

  /** El QR para imprimir (solo el administrador: quien lo tiene, tiene la tarjeta). */
  @Get(':id/qr')
  @Roles('administrador')
  @Header('Content-Type', 'image/svg+xml')
  @Header('Cache-Control', 'no-store')
  qr(@Param('id', ParseIntPipe) id: number) {
    return this.tarjetas.qr(id);
  }
}
