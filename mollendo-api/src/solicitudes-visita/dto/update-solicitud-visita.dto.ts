import { IsDateString, IsIn, IsOptional } from 'class-validator';

export class UpdateSolicitudVisitaDto {
  @IsOptional()
  @IsDateString()
  fechaHoraProgramada?: string;

  @IsOptional()
  @IsIn(['programada', 'completada', 'cancelada'])
  estado?: 'programada' | 'completada' | 'cancelada';
}
