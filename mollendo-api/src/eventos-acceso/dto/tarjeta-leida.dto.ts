import { IsIn, IsInt, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

/** Tarjeta de contingencia pasada por un lector de DNI (en lugar del DNI). */
export class TarjetaLeidaDto {
  @IsString({ message: 'El código de la tarjeta debe ser texto' })
  @Matches(/^TMAM-CONT-[A-Z2-7]{20}$/, { message: 'El código no es de una tarjeta de contingencia' })
  codigo!: string;

  @IsIn(['ingreso', 'salida'], { message: 'El movimiento debe ser "ingreso" o "salida"' })
  tipoMovimiento!: 'ingreso' | 'salida';

  @IsOptional()
  @IsString({ message: 'El ID del torniquete debe ser texto' })
  @MaxLength(50, { message: 'El ID del torniquete no puede tener más de 50 caracteres' })
  torniqueteId?: string;
}

/** Salida sin DNI: el trabajador que elige el vigilante en el Panel antes de pasar la tarjeta. */
export class SalidaSinDniDto {
  @IsInt({ message: 'Falta el trabajador' })
  personaId!: number;
}
