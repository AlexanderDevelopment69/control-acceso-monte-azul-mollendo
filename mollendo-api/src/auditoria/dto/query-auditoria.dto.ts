import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ListaPaginadaDto } from '../../common/paginacion.js';

export class QueryAuditoriaDto extends ListaPaginadaDto {
  @IsOptional()
  @IsString({ message: 'La tabla afectada debe ser texto' })
  tablaAfectada?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'El ID del registro debe ser un número' })
  registroId?: number;
}
