import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class SalidaDto {
  @IsIn(['DNI', 'CE', 'PASAPORTE'])
  tipoDocumentoIdentidad!: 'DNI' | 'CE' | 'PASAPORTE';

  @IsString()
  numeroDocumento!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  torniqueteId?: string;
}
