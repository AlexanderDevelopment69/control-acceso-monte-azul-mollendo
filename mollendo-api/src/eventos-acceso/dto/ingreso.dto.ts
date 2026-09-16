import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class IngresoDto {
  @IsIn(['DNI', 'CE', 'PASAPORTE'])
  tipoDocumentoIdentidad!: 'DNI' | 'CE' | 'PASAPORTE';

  @IsString()
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  numeroDocumento!: string;

  @IsBoolean()
  alcoholConforme!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  torniqueteId?: string;
}
