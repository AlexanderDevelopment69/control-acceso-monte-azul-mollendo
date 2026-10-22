import { IsEmail, IsIn, IsOptional, MaxLength } from 'class-validator';
import { PasswordSegura } from '../../auth/password-segura.decorator.js';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsIn(['activo', 'baja'], { message: 'El estado debe ser "activo" o "baja"' })
  estadoCuenta?: 'activo' | 'baja';

  /** Correo nuevo (con él se entra): se cierran las sesiones de la cuenta. */
  @IsOptional()
  @IsEmail({}, { message: 'Ingrese un correo válido' })
  @MaxLength(150, { message: 'El correo no puede tener más de 150 caracteres' })
  correo?: string;

  // Sin recuperación por correo (alcance base): el administrador restablece la contraseña.
  @IsOptional()
  @PasswordSegura()
  password?: string;
}
