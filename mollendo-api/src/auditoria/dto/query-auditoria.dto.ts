import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryAuditoriaDto {
  @IsOptional()
  @IsString()
  tablaAfectada?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  registroId?: number;
}
