import { IsIn, IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePersonaDto {
  @IsInt({ message: 'La empresa es obligatoria' })
  empresaId!: number;

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
}
