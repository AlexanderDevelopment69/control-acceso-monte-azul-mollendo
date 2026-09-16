import { Transform } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional } from 'class-validator';

export class QueryEventosAccesoDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'El ID de la persona debe ser un número' })
  personaId?: number;

  @IsOptional()
  @IsIn(['autorizado', 'denegado'], { message: 'El resultado debe ser "autorizado" o "denegado"' })
  resultado?: 'autorizado' | 'denegado';

  @IsOptional()
  @IsDateString({}, { message: 'La fecha "desde" no es válida' })
  desde?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha "hasta" no es válida' })
  hasta?: string;
}
