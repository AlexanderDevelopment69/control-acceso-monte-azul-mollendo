import { Body, Controller, Get, Patch, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { guardarSesion } from './cookies-sesion.js';
import { AuthService } from './auth.service.js';
import { CambiarPasswordDto } from './dto/cambiar-password.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import type { AuthenticatedUser } from './types/authenticated-user.type.js';

/**
 * Cuenta del usuario que inició sesión (administrador o vigilancia). Va
 * aparte de AuthController porque aquel es público y este requiere sesión.
 */
@Controller('cuenta')
export class CuentaController {
  constructor(private readonly authService: AuthService) {}

  /** Quién tiene la sesión abierta (el portal lo pregunta al cargar, en vez de leer el token). */
  @Get()
  sesion(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  // Tokens nuevos (también en las cookies): los anteriores, de esta y otras sesiones, dejan de valer.
  // Solo el administrador: la contraseña del vigilante se la cambia el administrador (Usuarios).
  @Patch('password')
  @Roles('administrador')
  async cambiarPassword(
    @Body() dto: CambiarPasswordDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.cambiarPassword(dto, user);
    guardarSesion(req, res, tokens);
    return tokens;
  }
}
