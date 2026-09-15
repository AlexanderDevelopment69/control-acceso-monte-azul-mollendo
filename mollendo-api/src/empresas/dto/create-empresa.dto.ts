import { IsEmail, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  @Length(11, 11, { message: 'El RUC debe tener 11 dígitos' })
  ruc!: string;

  @IsString()
  @MaxLength(200)
  razonSocial!: string;

  @IsEmail()
  correoContacto!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefonoContacto?: string;
}
