import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { normalizarNumeroDocumento, recortar } from '../../common/transformaciones.js';

export class CreatePersonaDto {
  @IsInt({ message: 'La empresa es obligatoria' })
  empresaId!: number;

  @IsIn(['DNI', 'CE', 'PASAPORTE'], { message: 'El tipo de documento debe ser DNI, CE o PASAPORTE' })
  tipoDocumentoIdentidad!: 'DNI' | 'CE' | 'PASAPORTE';

  // El DNI (8 dígitos) se valida en el servicio, porque depende del tipo de documento.
  @Transform(normalizarNumeroDocumento)
  @IsString({ message: 'El número de documento debe ser texto' })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  @Matches(/^[A-Z0-9]+$/, { message: 'El número de documento solo puede tener letras y números' })
  @MaxLength(20, { message: 'El número de documento no puede tener más de 20 caracteres' })
  numeroDocumento!: string;

  @Transform(recortar)
  @IsString({ message: 'Los nombres deben ser texto' })
  @IsNotEmpty({ message: 'Los nombres son obligatorios' })
  @MaxLength(150, { message: 'Los nombres no pueden tener más de 150 caracteres' })
  nombres!: string;

  @Transform(recortar)
  @IsString({ message: 'Los apellidos deben ser texto' })
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  @MaxLength(150, { message: 'Los apellidos no pueden tener más de 150 caracteres' })
  apellidos!: string;
}
