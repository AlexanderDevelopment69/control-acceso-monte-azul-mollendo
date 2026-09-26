import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

// "" se trata como "no indicado" — evita guardar un área vacía en vez de
// simplemente ausente, sin depender de que el frontend siempre lo limpie antes.
const vacioComoIndefinido = ({ value }: { value: unknown }) => (value === '' ? undefined : value);

export class CreatePersonaDto {
  @IsInt({ message: 'La empresa es obligatoria' })
  empresaId!: number;

  @IsOptional()
  @IsInt({ message: 'El puesto debe ser válido' })
  puestoId?: number;

  @IsIn(['DNI', 'CE', 'PASAPORTE'], { message: 'El tipo de documento debe ser DNI, CE o PASAPORTE' })
  tipoDocumentoIdentidad!: 'DNI' | 'CE' | 'PASAPORTE';

  @IsString({ message: 'El número de documento debe ser texto' })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  @MaxLength(20, { message: 'El número de documento no puede tener más de 20 caracteres' })
  numeroDocumento!: string;

  @IsString({ message: 'Los nombres deben ser texto' })
  @IsNotEmpty({ message: 'Los nombres son obligatorios' })
  @MaxLength(150, { message: 'Los nombres no pueden tener más de 150 caracteres' })
  nombres!: string;

  @IsString({ message: 'Los apellidos deben ser texto' })
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  @MaxLength(150, { message: 'Los apellidos no pueden tener más de 150 caracteres' })
  apellidos!: string;

  @Transform(vacioComoIndefinido)
  @IsOptional()
  @IsString({ message: 'El área debe ser texto' })
  @MaxLength(100, { message: 'El área no puede tener más de 100 caracteres' })
  area?: string;
}
