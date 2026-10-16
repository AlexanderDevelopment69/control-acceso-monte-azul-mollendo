import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import type { DecisionManual } from '../eventos-acceso.service.js';

/** Activar la verificación manual (contingencias, sección 4): el motivo es obligatorio. */
export class ActivarVerificacionManualDto {
  @IsString({ message: 'El motivo debe ser texto' })
  @MinLength(3, { message: 'Escribe el motivo de la verificación manual' })
  @MaxLength(300, { message: 'El motivo no puede tener más de 300 caracteres' })
  motivo!: string;
}

/** Decisión del vigilante sobre la persona en su turno. */
export class DecisionManualDto {
  @IsIn(['apto', 'alcohol', 'no-es-la-persona'], { message: 'La decisión debe ser "apto", "alcohol" o "no-es-la-persona"' })
  decision!: DecisionManual;
}
