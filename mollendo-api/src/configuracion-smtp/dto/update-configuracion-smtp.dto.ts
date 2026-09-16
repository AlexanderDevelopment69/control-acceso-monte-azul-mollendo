import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

// "" se trata como "no indicado" — así se puede dejar usuario/contraseña sin
// tocar al editar (ver ConfiguracionSmtpService.guardar).
const vacioComoIndefinido = ({ value }: { value: unknown }) => (value === '' ? undefined : value);

export class UpdateConfiguracionSmtpDto {
  @IsString({ message: 'El host debe ser texto' })
  @IsNotEmpty({ message: 'El host es obligatorio' })
  @MaxLength(200, { message: 'El host no puede tener más de 200 caracteres' })
  host!: string;

  @IsInt({ message: 'El puerto debe ser un número' })
  @Min(1, { message: 'El puerto debe ser mayor a 0' })
  @Max(65535, { message: 'El puerto no puede ser mayor a 65535' })
  puerto!: number;

  @IsOptional()
  @IsBoolean({ message: 'La conexión segura debe ser sí o no' })
  seguro?: boolean;

  @Transform(vacioComoIndefinido)
  @IsOptional()
  @IsString({ message: 'El usuario debe ser texto' })
  @MaxLength(200, { message: 'El usuario no puede tener más de 200 caracteres' })
  usuario?: string;

  // Si se omite, se conserva la contraseña ya guardada (ver el service) —
  // así el formulario no necesita mostrarla ni reenviarla en cada guardado.
  @Transform(vacioComoIndefinido)
  @IsOptional()
  @IsString({ message: 'La contraseña debe ser texto' })
  @MaxLength(255, { message: 'La contraseña no puede tener más de 255 caracteres' })
  password?: string;

  @IsString({ message: 'El remitente debe ser texto' })
  @IsNotEmpty({ message: 'El remitente es obligatorio' })
  @IsEmail({}, { message: 'El remitente debe ser un correo válido' })
  @MaxLength(200, { message: 'El remitente no puede tener más de 200 caracteres' })
  remitente!: string;
}
