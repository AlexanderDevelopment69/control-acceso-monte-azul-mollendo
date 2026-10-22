import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { normalizarNumeroDocumento, recortar } from '../../common/transformaciones.js';
import { PERFILES, type Perfil } from '../perfiles.js';

export class CreatePersonaDto {
  @IsInt({ message: 'La empresa es obligatoria' })
  empresaId!: number;

  @IsIn(PERFILES, { message: 'Elija el perfil de la persona' })
  perfil!: Perfil;

  @IsIn(['DNI', 'CE', 'PASAPORTE'], { message: 'El tipo de documento debe ser DNI, CE o PASAPORTE' })
  tipoDocumentoIdentidad!: 'DNI' | 'CE' | 'PASAPORTE';

  // El DNI (8 dígitos) se valida en el servicio, porque depende del tipo de documento.
  @Transform(normalizarNumeroDocumento)
  @IsString({ message: 'El número de documento debe ser texto' })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  @Matches(/^[A-Z0-9]+$/, { message: 'El número de documento solo puede tener letras y números' })
  @MaxLength(20, { message: 'El número de documento no puede tener más de 20 caracteres' })
  numeroDocumento!: string;

  @Transform(recortar)
  @IsString({ message: 'Los nombres deben ser texto' })
  @IsNotEmpty({ message: 'Los nombres son obligatorios' })
  @MaxLength(150, { message: 'Los nombres no pueden tener más de 150 caracteres' })
  nombres!: string;

  @Transform(recortar)
  @IsString({ message: 'Los apellidos deben ser texto' })
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  @MaxLength(150, { message: 'Los apellidos no pueden tener más de 150 caracteres' })
  apellidos!: string;

  /**
   * Período de autorización (opcional): fecha de ingreso, de finalización
   * (AAAA-MM-DD) y motivo. Si se pone, van los tres (lo revisa el servicio,
   * ver periodo-autorizacion.ts). null o vacío = sin período.
   */
  @IsOptional()
  @IsString({ message: 'La fecha de ingreso debe ser una fecha (AAAA-MM-DD)' })
  autorizadoDesde?: string | null;

  @IsOptional()
  @IsString({ message: 'La fecha de finalización debe ser una fecha (AAAA-MM-DD)' })
  autorizadoHasta?: string | null;

  @IsOptional()
  @IsString({ message: 'El motivo de la autorización debe ser texto' })
  @MaxLength(300, { message: 'El motivo de la autorización puede tener hasta 300 caracteres' })
  motivoAutorizacion?: string | null;
}
