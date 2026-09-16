import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

// "" se trata como "no indicado" — evita guardar un área vacía en vez de
// simplemente ausente, sin depender de que el frontend siempre lo limpie antes.
const vacioComoIndefinido = ({ value }: { value: unknown }) => (value === '' ? undefined : value);

export class CreatePersonaDto {
  @IsOptional()
  @IsInt()
  puestoId?: number;

  @IsIn(['DNI', 'CE', 'PASAPORTE'])
  tipoDocumentoIdentidad!: 'DNI' | 'CE' | 'PASAPORTE';

  @IsString()
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  @MaxLength(20)
  numeroDocumento!: string;

  @IsString()
  @IsNotEmpty({ message: 'Los nombres son obligatorios' })
  @MaxLength(150)
  nombres!: string;

  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  @MaxLength(150)
  apellidos!: string;

  @Transform(vacioComoIndefinido)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  area?: string;
}
