import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional } from 'class-validator';
import { ListaPaginadaDto } from '../../common/paginacion.js';
import { TIPOS_PERSONA, type TipoPersona } from '../../personas/dto/create-persona.dto.js';

export class QueryEventosAccesoDto extends ListaPaginadaDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'El ID de la persona debe ser un número' })
  personaId?: number;

  @IsOptional()
  @IsIn(['autorizado', 'denegado'], { message: 'El resultado debe ser "autorizado" o "denegado"' })
  resultado?: 'autorizado' | 'denegado';

  @IsOptional()
  @IsIn(TIPOS_PERSONA, { message: 'El tipo de persona debe ser "personal" o "visita"' })
  tipoPersona?: TipoPersona;
}
