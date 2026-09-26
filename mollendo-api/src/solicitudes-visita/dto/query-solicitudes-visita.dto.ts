import { Transform } from 'class-transformer';
import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class QuerySolicitudesVisitaDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'El ID de la empresa debe ser un número' })
  empresaId?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'El ID de la persona debe ser un número' })
  personaId?: number;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha "desde" no es válida' })
  desde?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha "hasta" no es válida' })
  hasta?: string;
}
