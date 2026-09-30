import { IsOptional, Matches } from 'class-validator';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

/** Periodo del dashboard: días locales, ambos incluidos; por defecto hoy. */
export class QueryDashboardDto {
  @IsOptional()
  @Matches(FECHA, { message: 'La fecha "desde" debe tener el formato AAAA-MM-DD' })
  desde?: string;

  @IsOptional()
  @Matches(FECHA, { message: 'La fecha "hasta" debe tener el formato AAAA-MM-DD' })
  hasta?: string;
}
