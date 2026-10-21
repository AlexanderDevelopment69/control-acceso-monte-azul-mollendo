import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import type { CausaVerificacionManual } from '../verificacion-manual.service.js';
import type { DecisionManual } from '../eventos-acceso.service.js';

/** Activar la verificación manual (contingencias, sección 4): el motivo es obligatorio. */
export class ActivarVerificacionManualDto {
  @IsString({ message: 'El motivo debe ser texto' })
  @MinLength(3, { message: 'Escriba el motivo de la verificación manual' })
  @MaxLength(300, { message: 'El motivo no puede tener más de 300 caracteres' })
  motivo!: string;

  /** Desde dónde se activó: equipo facial o alcoholímetro desconectado, o el aviso ámbar "No completó". */
  @IsOptional()
  @IsIn(['terminal', 'alcoholimetro', 'ambar'], { message: 'La causa debe ser "terminal", "alcoholimetro" o "ambar"' })
  causa?: CausaVerificacionManual;
}

/** Orden del ingreso: true = primero rostro y alcohol, al final el DNI (en prueba). */
export class CambiarModoIngresoDto {
  @IsBoolean({ message: 'facialPrimero debe ser true o false' })
  facialPrimero!: boolean;
}

const GRADO_INVALIDO = 'Escriba el grado que marcó el alcoholímetro (por ejemplo, 0.000).';

/**
 * Decisión del vigilante sobre la persona en su turno: "grado" con lo que marcó
 * el alcoholímetro de repuesto (mg/L; decide el sistema), "marco-apto" /
 * "marco-alcohol" si no muestra el número, o "no-es-la-persona". "apto" y
 * "alcohol" (antes del 21/10/2026) valen como "marco-apto" y "marco-alcohol".
 */
export class DecisionManualDto {
  @IsIn(['grado', 'marco-apto', 'marco-alcohol', 'no-es-la-persona', 'apto', 'alcohol'], {
    message: 'La decisión debe ser "grado", "marco-apto", "marco-alcohol" o "no-es-la-persona"',
  })
  decision!: DecisionManual;

  @ValidateIf((o: DecisionManualDto) => o.decision === 'grado')
  // Un solo mensaje: el rango (0 a 10 mg/L) lo revisa EventosAccesoService.decidirManual.
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: GRADO_INVALIDO })
  grado?: number;
}
