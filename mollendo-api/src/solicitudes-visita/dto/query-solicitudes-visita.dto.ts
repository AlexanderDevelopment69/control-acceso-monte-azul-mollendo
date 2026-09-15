import { Transform } from 'class-transformer';
import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class QuerySolicitudesVisitaDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  empresaId?: number;

  @IsOptional()
  @IsDateString()
  desde?: string;

  @IsOptional()
  @IsDateString()
  hasta?: string;
}
