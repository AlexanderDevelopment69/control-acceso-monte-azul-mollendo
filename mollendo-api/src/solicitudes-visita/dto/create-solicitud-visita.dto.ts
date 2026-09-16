import { IsDateString, IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSolicitudVisitaDto {
  @IsInt({ message: 'La persona es obligatoria' })
  personaId!: number;

  @IsString({ message: 'La persona visitada debe ser texto' })
  @IsNotEmpty({ message: 'Indique a quién visita' })
  @MaxLength(150, { message: 'La persona visitada no puede tener más de 150 caracteres' })
  personaVisitada!: string;

  @IsString({ message: 'El motivo debe ser texto' })
  @IsNotEmpty({ message: 'El motivo es obligatorio' })
  @MaxLength(300, { message: 'El motivo no puede tener más de 300 caracteres' })
  motivo!: string;

  @IsDateString({}, { message: 'La fecha y hora programada no es válida' })
  fechaHoraProgramada!: string;
}
