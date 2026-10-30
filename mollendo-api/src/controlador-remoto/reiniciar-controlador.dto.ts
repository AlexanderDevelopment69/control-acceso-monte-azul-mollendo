import { IsString, MaxLength, MinLength } from 'class-validator';

/** Reiniciar el Controlador (PC): el motivo es obligatorio y queda en la Auditoría. */
export class ReiniciarControladorDto {
  @IsString({ message: 'El motivo debe ser texto' })
  @MinLength(3, { message: 'Escriba el motivo del reinicio' })
  // La Auditoría guarda hasta 200 caracteres, con "Reinicio del Controlador (PC) · Motivo: " delante.
  @MaxLength(150, { message: 'El motivo no puede tener más de 150 caracteres' })
  motivo!: string;
}
