import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional } from 'class-validator';

export class QueryPersonasDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'El ID de la empresa debe ser un número' })
  empresaId?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'El ID del puesto debe ser un número' })
  puestoId?: number;

  @IsOptional()
  @IsIn(['activo', 'inactivo'], { message: 'El estado debe ser "activo" o "inactivo"' })
  estado?: 'activo' | 'inactivo';
}
