import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsIn(['activo', 'baja'], { message: 'El estado debe ser "activo" o "baja"' })
  estadoCuenta?: 'activo' | 'baja';

  // Sin recuperación por correo (alcance base): el administrador restablece la contraseña.
  @IsOptional()
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password?: string;
}
