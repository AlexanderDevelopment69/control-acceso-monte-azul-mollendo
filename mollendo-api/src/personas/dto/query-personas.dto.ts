import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional } from 'class-validator';

export class QueryPersonasDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  empresaId?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  puestoId?: number;

  @IsOptional()
  @IsIn(['activo', 'inactivo'])
  estado?: 'activo' | 'inactivo';
}
