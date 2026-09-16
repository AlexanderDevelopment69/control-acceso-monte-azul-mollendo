import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTipoDocumentoDto {
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  nombre!: string;

  @IsIn(['fecha_vencimiento', 'si_no', 'vigente_por_actividad'], {
    message: 'El tipo de validación debe ser "fecha_vencimiento", "si_no" o "vigente_por_actividad"',
  })
  tipoValidacion!: 'fecha_vencimiento' | 'si_no' | 'vigente_por_actividad';
}
