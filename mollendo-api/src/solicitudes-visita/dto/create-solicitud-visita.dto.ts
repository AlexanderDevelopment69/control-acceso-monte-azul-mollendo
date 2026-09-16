import { IsDateString, IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSolicitudVisitaDto {
  @IsInt()
  personaId!: number;

  @IsString()
  @IsNotEmpty({ message: 'Indique a quién visita' })
  @MaxLength(150)
  personaVisitada!: string;

  @IsString()
  @IsNotEmpty({ message: 'El motivo es obligatorio' })
  @MaxLength(300)
  motivo!: string;

  @IsDateString()
  fechaHoraProgramada!: string;
}
