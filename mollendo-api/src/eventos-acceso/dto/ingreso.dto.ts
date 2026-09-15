import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class IngresoDto {
  @IsIn(['DNI', 'CE', 'PASAPORTE'])
  tipoDocumentoIdentidad!: 'DNI' | 'CE' | 'PASAPORTE';

  @IsString()
  numeroDocumento!: string;

  @IsBoolean()
  alcoholConforme!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  torniqueteId?: string;
}
