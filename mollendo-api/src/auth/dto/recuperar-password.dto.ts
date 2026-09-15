import { IsEmail } from 'class-validator';

export class RecuperarPasswordDto {
  @IsEmail()
  correo!: string;
}
