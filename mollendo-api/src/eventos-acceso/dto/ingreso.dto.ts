import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { normalizarNumeroDocumento } from '../../common/transformaciones.js';

/**
 * Solo el DNI: el resultado facial + alcoholímetro ya no llega en esta misma
 * llamada. El G4 Pro abre el ingreso con su propio relé y manda su resultado
 * por separado (protocolo PUSH, ver push-sdk/); el backend lo correlaciona
 * con el DNI más reciente por cercanía de horario (ver
 * EventosAccesoService.correlacionarVerificacionDispositivo). Ver
 * Analisis_Control_Acceso_Mollendo.md sección 6.0 para el porqué.
 */
export class IngresoDto {
  @IsIn(['DNI', 'CE', 'PASAPORTE'], { message: 'El tipo de documento debe ser DNI, CE o PASAPORTE' })
  tipoDocumentoIdentidad!: 'DNI' | 'CE' | 'PASAPORTE';

  @Transform(normalizarNumeroDocumento)
  @IsString({ message: 'El número de documento debe ser texto' })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  numeroDocumento!: string;

  @IsOptional()
  @IsString({ message: 'El ID del torniquete debe ser texto' })
  @MaxLength(50, { message: 'El ID del torniquete no puede tener más de 50 caracteres' })
  torniqueteId?: string;
}
