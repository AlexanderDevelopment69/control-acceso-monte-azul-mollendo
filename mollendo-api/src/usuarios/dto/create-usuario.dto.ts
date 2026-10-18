import { IsEmail, IsIn, MaxLength } from 'class-validator';
import { PasswordSegura } from '../../auth/password-segura.decorator.js';

export class CreateUsuarioDto {
  @IsEmail({}, { message: 'Ingrese un correo válido' })
  @MaxLength(150, { message: 'El correo no puede tener más de 150 caracteres' })
  correo!: string;

  @IsIn(['administrador', 'vigilancia'], { message: 'El rol debe ser "administrador" o "vigilancia"' })
  rol!: 'administrador' | 'vigilancia';

  @PasswordSegura()
  password!: string;
}
