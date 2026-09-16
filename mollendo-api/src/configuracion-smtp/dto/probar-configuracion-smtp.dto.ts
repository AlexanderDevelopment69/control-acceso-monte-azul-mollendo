import { IsEmail, IsNotEmpty } from 'class-validator';

export class ProbarConfiguracionSmtpDto {
  @IsEmail({}, { message: 'Ingrese un correo válido' })
  @IsNotEmpty({ message: 'El correo de destino es obligatorio' })
  correoDestino!: string;
}
