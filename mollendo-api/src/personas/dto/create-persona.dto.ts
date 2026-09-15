import { IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePersonaDto {
  @IsOptional()
  @IsInt()
  puestoId?: number;

  @IsIn(['DNI', 'CE', 'PASAPORTE'])
  tipoDocumentoIdentidad!: 'DNI' | 'CE' | 'PASAPORTE';

  @IsString()
  @MaxLength(20)
  numeroDocumento!: string;

  @IsString()
  @MaxLength(150)
  nombres!: string;

  @IsString()
  @MaxLength(150)
  apellidos!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  area?: string;
}
