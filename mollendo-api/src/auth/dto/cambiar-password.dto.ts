import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CambiarPasswordDto {
  @IsString({ message: 'La contraseña actual debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña actual es obligatoria' })
  passwordActual!: string;

  @IsString({ message: 'La contraseña nueva debe ser texto' })
  @MinLength(8, { message: 'La contraseña nueva debe tener al menos 8 caracteres' })
  passwordNueva!: string;
}
