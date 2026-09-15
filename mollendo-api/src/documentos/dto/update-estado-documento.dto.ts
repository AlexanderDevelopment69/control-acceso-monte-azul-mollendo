import { IsIn } from 'class-validator';

export class UpdateEstadoDocumentoDto {
  @IsIn(['aprobado', 'rechazado'])
  estadoAprobacion!: 'aprobado' | 'rechazado';
}
