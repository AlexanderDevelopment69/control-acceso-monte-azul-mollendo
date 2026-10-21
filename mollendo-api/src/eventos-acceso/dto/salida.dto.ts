import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsISO8601, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { normalizarNumeroDocumento } from '../../common/transformaciones.js';

export class SalidaDto {
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

  /**
   * Salida que el controlador ya dejó pasar sin conexión con el
   * servidor (opción B: sin internet se puede salir, no entrar): se registra con
   * la hora en que ocurrió (`fechaHora`) y sin volver a abrir el molinete.
   */
  @IsOptional()
  @IsBoolean({ message: 'sinConexion debe ser verdadero o falso' })
  sinConexion?: boolean;

  @IsOptional()
  @IsISO8601({}, { message: 'La fecha y hora deben tener el formato ISO 8601' })
  fechaHora?: string;

  /**
   * Solo dentro del servidor (sin validador: por la API se rechaza): salida
   * con tarjeta de contingencia y el vigilante que eligió al trabajador.
   */
  declare tarjetaContingenciaId?: number;
  declare verificadoPorId?: number;
  /** Solo dentro del servidor: lector de DNI de salida desconectado, el vigilante abrió la salida desde "Presentes ahora". */
  declare sinLector?: boolean;
}
