import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEstadoPersonaDto {
  @IsIn(['activo', 'inactivo'], { message: 'El estado debe ser "activo" o "inactivo"' })
  estado!: 'activo' | 'inactivo';

  /** Por qué se da de baja o se reactiva: obligatorio en los dos casos (lo revisa PersonasService.updateEstado). */
  @IsOptional()
  @IsString({ message: 'El motivo debe ser un texto' })
  @MaxLength(300, { message: 'El motivo puede tener hasta 300 caracteres' })
  motivo?: string;
}
