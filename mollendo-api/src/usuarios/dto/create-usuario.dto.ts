import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsEmail({}, { message: 'Ingrese un correo válido' })
  @MaxLength(150, { message: 'El correo no puede tener más de 150 caracteres' })
  correo!: string;

  @IsIn(['administrador', 'vigilancia'], { message: 'El rol debe ser "administrador" o "vigilancia"' })
  rol!: 'administrador' | 'vigilancia';

  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;
}
