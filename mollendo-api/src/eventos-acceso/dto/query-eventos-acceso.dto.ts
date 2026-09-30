import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional } from 'class-validator';
import { ListaPaginadaDto } from '../../common/paginacion.js';

export class QueryEventosAccesoDto extends ListaPaginadaDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'El ID de la persona debe ser un número' })
  personaId?: number;

  @IsOptional()
  @IsIn(['autorizado', 'denegado'], { message: 'El resultado debe ser "autorizado" o "denegado"' })
  resultado?: 'autorizado' | 'denegado';
}
