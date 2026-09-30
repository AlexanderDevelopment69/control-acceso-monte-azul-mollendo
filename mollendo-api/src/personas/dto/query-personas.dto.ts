import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional } from 'class-validator';
import { TIPOS_PERSONA, type TipoPersona } from './create-persona.dto.js';

export class QueryPersonasDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'El ID de la empresa debe ser un número' })
  empresaId?: number;

  @IsOptional()
  @IsIn(['activo', 'inactivo'], { message: 'El estado debe ser "activo" o "inactivo"' })
  estado?: 'activo' | 'inactivo';

  @IsOptional()
  @IsIn(TIPOS_PERSONA, { message: 'El tipo de persona debe ser "personal" o "visita"' })
  tipoPersona?: TipoPersona;
}
