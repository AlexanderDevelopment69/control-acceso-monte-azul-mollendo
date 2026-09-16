import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class TorniqueteComandoDto {
  @IsString()
  @IsNotEmpty({ message: 'El identificador del torniquete es obligatorio' })
  torniqueteId!: string;

  @IsIn(['abrir', 'cerrar'])
  comando!: 'abrir' | 'cerrar';
}
