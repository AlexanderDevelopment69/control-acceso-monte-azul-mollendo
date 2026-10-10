import { IsInt, IsOptional, Max, Min } from 'class-validator';

/** Hora de la sincronización diaria con los G4 Pro (0 a 23, hora de Lima); null la desactiva. */
export class SincronizacionDiariaDto {
  @IsOptional()
  @IsInt({ message: 'La hora debe ser un número entero' })
  @Min(0, { message: 'La hora va de 0 a 23' })
  @Max(23, { message: 'La hora va de 0 a 23' })
  hora!: number | null;
}
