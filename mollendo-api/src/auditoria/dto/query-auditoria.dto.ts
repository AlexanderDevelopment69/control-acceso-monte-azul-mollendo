import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryAuditoriaDto {
  @IsOptional()
  @IsString({ message: 'La tabla afectada debe ser texto' })
  tablaAfectada?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'El ID del registro debe ser un número' })
  registroId?: number;
}
