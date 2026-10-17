import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsString, MaxLength, MinLength } from 'class-validator';
import { recortar } from '../../common/transformaciones.js';

/**
 * Corrección manual del antipassback: registrar la salida de quien figura
 * dentro, o el ingreso de quien figura fuera. El motivo es obligatorio.
 */
export class CorreccionAntipassbackDto {
  @IsInt({ message: 'Falta la persona' })
  personaId!: number;

  @IsIn(['ingreso', 'salida'], { message: 'El movimiento debe ser "ingreso" o "salida"' })
  tipoMovimiento!: 'ingreso' | 'salida';

  @Transform(recortar)
  @IsString({ message: 'El motivo debe ser texto' })
  @MinLength(3, { message: 'Escribe el motivo de la corrección' })
  @MaxLength(300, { message: 'El motivo no puede tener más de 300 caracteres' })
  motivo!: string;
}
