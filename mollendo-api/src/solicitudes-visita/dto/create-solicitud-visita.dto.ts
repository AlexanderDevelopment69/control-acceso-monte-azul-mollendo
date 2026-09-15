import { IsDateString, IsInt, IsString, MaxLength } from 'class-validator';

export class CreateSolicitudVisitaDto {
  @IsInt()
  personaId!: number;

  @IsString()
  @MaxLength(150)
  personaVisitada!: string;

  @IsString()
  @MaxLength(300)
  motivo!: string;

  @IsDateString()
  fechaHoraProgramada!: string;
}
