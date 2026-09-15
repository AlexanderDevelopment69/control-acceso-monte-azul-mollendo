import { IsIn, IsString, MaxLength } from 'class-validator';

export class CreatePuestoDto {
  @IsString()
  @MaxLength(100)
  nombre!: string;

  @IsIn(['visita', 'personal_propio', 'contratista', 'tercero'])
  caso!: 'visita' | 'personal_propio' | 'contratista' | 'tercero';
}
