import { Transform } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional } from 'class-validator';

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

  /**
   * "true" acepta una fecha de vencimiento ya pasada (el documento queda
   * vencido). Solo para cargar datos de demostración; el portal no lo envía.
   */
  @IsOptional()
  @IsIn(['true', 'false'], { message: 'permitirVencido debe ser "true" o "false"' })
  permitirVencido?: 'true' | 'false';
}
