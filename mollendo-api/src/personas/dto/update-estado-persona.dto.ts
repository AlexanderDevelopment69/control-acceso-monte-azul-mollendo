import { IsIn } from 'class-validator';

export class UpdateEstadoPersonaDto {
  @IsIn(['activo', 'inactivo'])
  estado!: 'activo' | 'inactivo';
}
