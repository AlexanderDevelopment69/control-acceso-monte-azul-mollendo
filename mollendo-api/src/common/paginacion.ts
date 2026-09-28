import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parámetros comunes de las listas paginadas en el servidor: página, tamaño,
 * búsqueda de texto y rango de días (desde/hasta, ambos incluidos, en formato
 * AAAA-MM-DD y en la hora local del servidor, que es la de Lima).
 */
export class ListaPaginadaDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'La página debe ser un número' })
  @Min(1, { message: 'La página debe ser 1 o mayor' })
  pagina?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'El tamaño de página debe ser un número' })
  @Min(1, { message: 'El tamaño de página debe ser 1 o mayor' })
  @Max(100, { message: 'El tamaño de página no puede ser mayor a 100' })
  porPagina?: number;

  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser texto' })
  @MaxLength(100, { message: 'La búsqueda no puede tener más de 100 caracteres' })
  busqueda?: string;

  @IsOptional()
  @Matches(FECHA, { message: 'La fecha "desde" debe tener el formato AAAA-MM-DD' })
  desde?: string;

  @IsOptional()
  @Matches(FECHA, { message: 'La fecha "hasta" debe tener el formato AAAA-MM-DD' })
  hasta?: string;
}

export interface Paginado<T> {
  datos: T[];
  total: number;
  pagina: number;
  porPagina: number;
}

/** Página y tamaño con sus valores por defecto, listos para `skip` / `take`. */
export function paginacion(dto: ListaPaginadaDto, porPaginaPorDefecto = 20) {
  const pagina = dto.pagina ?? 1;
  const porPagina = dto.porPagina ?? porPaginaPorDefecto;
  return { pagina, porPagina, skip: (pagina - 1) * porPagina, take: porPagina };
}

/**
 * Filtro de Prisma para un rango de días: desde las 00:00 de `desde` hasta el
 * final de `hasta` (el día completo). `undefined` si no se pidió ninguno.
 */
export function rangoDeDias(desde?: string, hasta?: string): { gte?: Date; lt?: Date } | undefined {
  if (!desde && !hasta) return undefined;
  const inicio = (dia: string) => {
    const [a, m, d] = dia.split('-').map(Number);
    return new Date(a, m - 1, d); // hora local (Lima)
  };
  const filtro: { gte?: Date; lt?: Date } = {};
  if (desde) filtro.gte = inicio(desde);
  if (hasta) {
    const fin = inicio(hasta);
    fin.setDate(fin.getDate() + 1);
    filtro.lt = fin;
  }
  return filtro;
}

/** Palabras de la búsqueda, sin espacios de más. */
export function palabras(busqueda?: string): string[] {
  return (busqueda ?? '').trim().split(/\s+/).filter(Boolean);
}
