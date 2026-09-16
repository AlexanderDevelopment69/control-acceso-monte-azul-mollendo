import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePuestoDto {
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  nombre!: string;

  @IsIn(['visita', 'personal_propio', 'contratista', 'tercero'], {
    message: 'El caso debe ser "visita", "personal_propio", "contratista" o "tercero"',
  })
  caso!: 'visita' | 'personal_propio' | 'contratista' | 'tercero';
}
