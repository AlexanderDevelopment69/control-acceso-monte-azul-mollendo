import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePuestoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100)
  nombre!: string;

  @IsIn(['visita', 'personal_propio', 'contratista', 'tercero'])
  caso!: 'visita' | 'personal_propio' | 'contratista' | 'tercero';
}
