import { IsBoolean, IsIn, IsOptional, Matches } from 'class-validator';
import { ListaPaginadaDto } from '../../common/paginacion.js';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

const TIPOS = ['contingencia', 'acceso'] as const;
const MENSAJE_TIPO = 'El tipo de tarjeta debe ser contingencia o acceso';

/** Nueva tarjeta: `venceEl` es el último día en que sirve; sin él (o null), no vence. Sin tipo: de contingencia. */
export class CrearTarjetaDto {
  @IsOptional()
  @IsIn(TIPOS, { message: MENSAJE_TIPO })
  tipo?: (typeof TIPOS)[number];

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

/** Solo las tarjetas de ese tipo (sin tipo: de contingencia). */
export class QueryTipoTarjetaDto {
  @IsOptional()
  @IsIn(TIPOS, { message: MENSAJE_TIPO })
  tipo?: (typeof TIPOS)[number];
}

export class QueryUsosTarjetaDto extends ListaPaginadaDto {
  @IsOptional()
  @IsIn(TIPOS, { message: MENSAJE_TIPO })
  tipo?: (typeof TIPOS)[number];
}
