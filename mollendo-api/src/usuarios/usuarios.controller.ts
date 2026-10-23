import { Body, Controller, Delete, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';

/** Crear cuentas nuevas: cerrado por ahora (solo las dos del sistema). */
const CREAR_CUENTAS = false;

@Controller('usuarios')
@Roles('administrador')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  /**
   * Por ahora no se crean cuentas nuevas (pedido del usuario, 23/10/2026): solo
   * las dos del sistema. Para volver a permitirlo, poner CREAR_CUENTAS en true
   * (también en el portal, usuarios/page.tsx).
   */
  @Post()
  create(@Body() dto: CreateUsuarioDto, @CurrentUser() user: AuthenticatedUser) {
    if (!CREAR_CUENTAS) throw new ForbiddenException('Por ahora no se pueden crear cuentas nuevas.');
    return this.usuariosService.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usuariosService.update(id, dto, user);
  }

  /** Solo una cuenta que nunca se usó (creada por error); las demás se dan de baja. */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.usuariosService.remove(id, user);
  }
}
