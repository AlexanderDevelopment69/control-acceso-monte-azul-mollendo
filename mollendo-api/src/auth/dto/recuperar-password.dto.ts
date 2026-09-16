import { IsEmail } from 'class-validator';

export class RecuperarPasswordDto {
  @IsEmail({}, { message: 'Ingrese un correo válido' })
  correo!: string;
}
