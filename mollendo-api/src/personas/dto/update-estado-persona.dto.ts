import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEstadoPersonaDto {
  @IsIn(['activo', 'inactivo'], { message: 'El estado debe ser "activo" o "inactivo"' })
  estado!: 'activo' | 'inactivo';

  /** Al dar de baja, por qué (opcional). */
  @IsOptional()
  @IsString({ message: 'El motivo debe ser un texto' })
  @MaxLength(300, { message: 'El motivo puede tener hasta 300 caracteres' })
  motivo?: string;
}
