import { IsIn } from 'class-validator';

export class UpdateEstadoPersonaDto {
  @IsIn(['activo', 'inactivo'], { message: 'El estado debe ser "activo" o "inactivo"' })
  estado!: 'activo' | 'inactivo';
}
