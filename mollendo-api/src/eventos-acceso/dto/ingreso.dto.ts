import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { normalizarNumeroDocumento } from '../../common/transformaciones.js';

export class IngresoDto {
  @IsIn(['DNI', 'CE', 'PASAPORTE'], { message: 'El tipo de documento debe ser DNI, CE o PASAPORTE' })
  tipoDocumentoIdentidad!: 'DNI' | 'CE' | 'PASAPORTE';

  @Transform(normalizarNumeroDocumento)
  @IsString({ message: 'El número de documento debe ser texto' })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  numeroDocumento!: string;

  @IsBoolean({ message: 'El resultado del alcoholímetro debe ser sí o no' })
  alcoholConforme!: boolean;

  @IsOptional()
  @IsString({ message: 'El ID del torniquete debe ser texto' })
  @MaxLength(50, { message: 'El ID del torniquete no puede tener más de 50 caracteres' })
  torniqueteId?: string;
}
