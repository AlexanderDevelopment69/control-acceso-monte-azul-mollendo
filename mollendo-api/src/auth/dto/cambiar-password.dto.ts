import { IsNotEmpty, IsString } from 'class-validator';
import { PasswordSegura } from '../password-segura.decorator.js';

export class CambiarPasswordDto {
  @IsString({ message: 'La contraseña actual debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña actual es obligatoria' })
  passwordActual!: string;

  @PasswordSegura('La contraseña nueva')
  passwordNueva!: string;
}
