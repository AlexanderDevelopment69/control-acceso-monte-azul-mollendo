import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';

// "" se trata como "no indicado" — evita guardar un teléfono vacío en vez de
// simplemente ausente, sin depender de que el frontend siempre lo limpie antes.
const vacioComoIndefinido = ({ value }: { value: unknown }) => (value === '' ? undefined : value);

export class CreateEmpresaDto {
  @IsString()
  @Length(11, 11, { message: 'El RUC debe tener 11 dígitos' })
  ruc!: string;

  @IsString()
  @IsNotEmpty({ message: 'La razón social es obligatoria' })
  @MaxLength(200)
  razonSocial!: string;

  @IsEmail({}, { message: 'Ingrese un correo válido' })
  correoContacto!: string;

  @Transform(vacioComoIndefinido)
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefonoContacto?: string;
}
