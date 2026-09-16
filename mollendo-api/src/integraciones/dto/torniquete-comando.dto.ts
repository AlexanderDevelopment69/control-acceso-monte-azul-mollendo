import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class TorniqueteComandoDto {
  @IsString({ message: 'El identificador del torniquete debe ser texto' })
  @IsNotEmpty({ message: 'El identificador del torniquete es obligatorio' })
  torniqueteId!: string;

  @IsIn(['abrir', 'cerrar'], { message: 'El comando debe ser "abrir" o "cerrar"' })
  comando!: 'abrir' | 'cerrar';
}
