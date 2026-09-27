import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTipoDocumentoDto {
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  nombre!: string;
}
