import { IsIn, IsString } from 'class-validator';

export class TorniqueteComandoDto {
  @IsString()
  torniqueteId!: string;

  @IsIn(['abrir', 'cerrar'])
  comando!: 'abrir' | 'cerrar';
}
