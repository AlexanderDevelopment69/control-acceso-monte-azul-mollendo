import { Transform } from 'class-transformer';
import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class CreateDocumentoDto {
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'El tipo de documento es obligatorio' })
  tipoDocumentoId!: number;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de emisión no es válida' })
  fechaEmision?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de vencimiento no es válida' })
  fechaVencimiento?: string;
}
