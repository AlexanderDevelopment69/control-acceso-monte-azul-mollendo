import { Body, Controller, Patch } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CambiarPasswordDto } from './dto/cambiar-password.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from './types/authenticated-user.type.js';

/**
 * Cuenta del usuario que inició sesión (administrador o vigilancia). Va
 * aparte de AuthController porque aquel es público y este requiere sesión.
 */
@Controller('cuenta')
export class CuentaController {
  constructor(private readonly authService: AuthService) {}

  // Devuelve tokens nuevos: los anteriores (de esta y otras sesiones) dejan de valer.
  @Patch('password')
  cambiarPassword(@Body() dto: CambiarPasswordDto, @CurrentUser() user: AuthenticatedUser) {
    return this.authService.cambiarPassword(dto, user);
  }
}
