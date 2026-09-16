import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';

// "" se trata como "no indicado" — evita guardar un teléfono vacío en vez de
// simplemente ausente, sin depender de que el frontend siempre lo limpie antes.
const vacioComoIndefinido = ({ value }: { value: unknown }) => (value === '' ? undefined : value);

export class CreateEmpresaDto {
  @IsString({ message: 'El RUC debe ser texto' })
  @Length(11, 11, { message: 'El RUC debe tener 11 dígitos' })
  ruc!: string;

  @IsString({ message: 'La razón social debe ser texto' })
  @IsNotEmpty({ message: 'La razón social es obligatoria' })
  @MaxLength(200, { message: 'La razón social no puede tener más de 200 caracteres' })
  razonSocial!: string;

  @IsEmail({}, { message: 'Ingrese un correo válido' })
  correoContacto!: string;

  @Transform(vacioComoIndefinido)
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto' })
  @MaxLength(20, { message: 'El teléfono no puede tener más de 20 caracteres' })
  telefonoContacto?: string;
}
