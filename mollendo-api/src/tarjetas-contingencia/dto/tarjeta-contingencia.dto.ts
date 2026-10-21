import { IsBoolean, IsOptional, Matches } from 'class-validator';
import { ListaPaginadaDto } from '../../common/paginacion.js';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

/** Nueva tarjeta: `venceEl` es el último día en que sirve; sin él (o null), no vence. */
export class CrearTarjetaDto {
  @IsOptional()
  @Matches(FECHA, { message: 'La fecha de vencimiento debe tener el formato AAAA-MM-DD' })
  venceEl?: string | null;
}

export class ActualizarTarjetaDto {
  @IsOptional()
  @IsBoolean({ message: 'activa debe ser verdadero o falso' })
  activa?: boolean;

  /** null: que no venza. */
  @IsOptional()
  @Matches(FECHA, { message: 'La fecha de vencimiento debe tener el formato AAAA-MM-DD' })
  venceEl?: string | null;
}

export class QueryUsosTarjetaDto extends ListaPaginadaDto {}
