import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsInt, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { CreatePersonaDto } from '../dto/create-persona.dto.js';
import { COLUMNAS_CARGA, MAX_FILAS_CARGA, type ClaveCarga } from './carga-masiva.util.js';

/** Las filas "listas" de la revisión, para registrarlas (cada una se vuelve a validar). */
export class RegistrarCargaMasivaDto {
  @IsArray({ message: 'Faltan las personas a registrar' })
  @ArrayMinSize(1, { message: 'No hay personas para registrar' })
  @ArrayMaxSize(MAX_FILAS_CARGA, { message: `Hasta ${MAX_FILAS_CARGA} personas por carga` })
  @ValidateNested({ each: true })
  @Type(() => CreatePersonaDto)
  personas!: CreatePersonaDto[];
}

/** Una fila con error, tal como se leyó del Excel, con su motivo. */
export class FilaConErrorDto {
  @IsInt()
  fila!: number;

  @IsOptional() @IsString() @MaxLength(300) perfil = '';
  @IsOptional() @IsString() @MaxLength(300) empresa = '';
  @IsOptional() @IsString() @MaxLength(300) tipoDocumento = '';
  @IsOptional() @IsString() @MaxLength(300) numeroDocumento = '';
  @IsOptional() @IsString() @MaxLength(300) nombres = '';
  @IsOptional() @IsString() @MaxLength(300) apellidos = '';
  @IsOptional() @IsString() @MaxLength(1000) motivo = '';

  /** Columnas con error: se pintan en el Excel. */
  @IsOptional()
  @IsArray()
  @IsIn(COLUMNAS_CARGA.map((c) => c.clave), { each: true })
  campos: ClaveCarga[] = [];
}

/** Filas con error para el Excel que se corrige y se vuelve a subir. */
export class FilasConErrorDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'No hay filas con error' })
  @ArrayMaxSize(MAX_FILAS_CARGA)
  @ValidateNested({ each: true })
  @Type(() => FilaConErrorDto)
  filas!: FilaConErrorDto[];
}
