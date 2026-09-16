import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

// "" se trata como "no indicado" — así se puede dejar usuario/contraseña sin
// tocar al editar (ver ConfiguracionSmtpService.guardar).
const vacioComoIndefinido = ({ value }: { value: unknown }) => (value === '' ? undefined : value);

export class UpdateConfiguracionSmtpDto {
  @IsString()
  @IsNotEmpty({ message: 'El host es obligatorio' })
  @MaxLength(200)
  host!: string;

  @IsInt({ message: 'El puerto debe ser un número' })
  @Min(1)
  @Max(65535)
  puerto!: number;

  @IsOptional()
  @IsBoolean()
  seguro?: boolean;

  @Transform(vacioComoIndefinido)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  usuario?: string;

  // Si se omite, se conserva la contraseña ya guardada (ver el service) —
  // así el formulario no necesita mostrarla ni reenviarla en cada guardado.
  @Transform(vacioComoIndefinido)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  password?: string;

  @IsString()
  @IsNotEmpty({ message: 'El remitente es obligatorio' })
  @IsEmail({}, { message: 'El remitente debe ser un correo válido' })
  @MaxLength(200)
  remitente!: string;
}
