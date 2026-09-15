import { Transform } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional } from 'class-validator';

export class QueryEventosAccesoDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  personaId?: number;

  @IsOptional()
  @IsIn(['autorizado', 'denegado'])
  resultado?: 'autorizado' | 'denegado';

  @IsOptional()
  @IsDateString()
  desde?: string;

  @IsOptional()
  @IsDateString()
  hasta?: string;
}
