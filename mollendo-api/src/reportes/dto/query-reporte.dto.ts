import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Matches } from 'class-validator';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

export const TIPOS_REPORTE = ['personal', 'documentos', 'movimientos', 'visitas', 'presentes', 'auditoria'] as const;
export type TipoReporte = (typeof TIPOS_REPORTE)[number];

/** Formato y filtros de un reporte. Cada reporte usa solo los que le corresponden. */
export class QueryReporteDto {
  @IsIn(['xlsx', 'pdf'], { message: 'El formato debe ser "xlsx" (Excel) o "pdf"' })
  formato!: 'xlsx' | 'pdf';

  /** Periodo (movimientos, visitas y auditoría): días locales, ambos incluidos; por defecto hoy. */
  @IsOptional()
  @Matches(FECHA, { message: 'La fecha "desde" debe tener el formato AAAA-MM-DD' })
  desde?: string;

  @IsOptional()
  @Matches(FECHA, { message: 'La fecha "hasta" debe tener el formato AAAA-MM-DD' })
  hasta?: string;

  /** Personal y documentos. */
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'La empresa debe ser un número' })
  empresaId?: number;

  /** Personal: activos o dados de baja. */
  @IsOptional()
  @IsIn(['activo', 'inactivo'], { message: 'El estado debe ser "activo" o "inactivo"' })
  estado?: 'activo' | 'inactivo';

  /** Documentos: vigentes, por vencer (30 días) o vencidos. */
  @IsOptional()
  @IsIn(['vigente', 'por_vencer', 'vencido'], { message: 'El estado del documento debe ser "vigente", "por_vencer" o "vencido"' })
  estadoDocumento?: 'vigente' | 'por_vencer' | 'vencido';

  /** Movimientos. */
  @IsOptional()
  @IsIn(['ingreso', 'salida'], { message: 'El movimiento debe ser "ingreso" o "salida"' })
  movimiento?: 'ingreso' | 'salida';

  @IsOptional()
  @IsIn(['autorizado', 'denegado'], { message: 'El resultado debe ser "autorizado" o "denegado"' })
  resultado?: 'autorizado' | 'denegado';
}
