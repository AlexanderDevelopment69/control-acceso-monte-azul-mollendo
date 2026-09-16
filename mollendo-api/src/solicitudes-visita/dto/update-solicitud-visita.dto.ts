import { IsDateString, IsIn, IsOptional } from 'class-validator';

export class UpdateSolicitudVisitaDto {
  @IsOptional()
  @IsDateString({}, { message: 'La fecha y hora programada no es válida' })
  fechaHoraProgramada?: string;

  @IsOptional()
  @IsIn(['programada', 'completada', 'cancelada'], {
    message: 'El estado debe ser "programada", "completada" o "cancelada"',
  })
  estado?: 'programada' | 'completada' | 'cancelada';
}
