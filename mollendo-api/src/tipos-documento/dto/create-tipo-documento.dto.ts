import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTipoDocumentoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100)
  nombre!: string;

  @IsIn(['fecha_vencimiento', 'si_no', 'vigente_por_actividad'])
  tipoValidacion!: 'fecha_vencimiento' | 'si_no' | 'vigente_por_actividad';
}
