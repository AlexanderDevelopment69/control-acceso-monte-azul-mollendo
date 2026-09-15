import { Transform } from 'class-transformer';
import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class CreateDocumentoDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  tipoDocumentoId!: number;

  @IsOptional()
  @IsDateString()
  fechaEmision?: string;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;
}
