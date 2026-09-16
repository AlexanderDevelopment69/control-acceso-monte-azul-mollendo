import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SalidaDto {
  @IsIn(['DNI', 'CE', 'PASAPORTE'], { message: 'El tipo de documento debe ser DNI, CE o PASAPORTE' })
  tipoDocumentoIdentidad!: 'DNI' | 'CE' | 'PASAPORTE';

  @IsString({ message: 'El número de documento debe ser texto' })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  numeroDocumento!: string;

  @IsOptional()
  @IsString({ message: 'El ID del torniquete debe ser texto' })
  @MaxLength(50, { message: 'El ID del torniquete no puede tener más de 50 caracteres' })
  torniqueteId?: string;
}
