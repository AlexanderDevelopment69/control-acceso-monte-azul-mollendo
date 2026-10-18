import { IsIn, IsOptional } from 'class-validator';
import { PasswordSegura } from '../../auth/password-segura.decorator.js';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsIn(['activo', 'baja'], { message: 'El estado debe ser "activo" o "baja"' })
  estadoCuenta?: 'activo' | 'baja';

  // Sin recuperación por correo (alcance base): el administrador restablece la contraseña.
  @IsOptional()
  @PasswordSegura()
  password?: string;
}
