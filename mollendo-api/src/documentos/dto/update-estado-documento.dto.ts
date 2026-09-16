import { IsIn } from 'class-validator';

export class UpdateEstadoDocumentoDto {
  @IsIn(['aprobado', 'rechazado'], { message: 'El estado debe ser "aprobado" o "rechazado"' })
  estadoAprobacion!: 'aprobado' | 'rechazado';
}
