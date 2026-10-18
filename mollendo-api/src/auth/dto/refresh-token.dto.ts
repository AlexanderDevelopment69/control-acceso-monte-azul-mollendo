import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** El portal lo manda en la cookie de renovación; otros clientes (scripts, Swagger), en el cuerpo. */
export class RefreshTokenDto {
  @IsOptional()
  @IsString({ message: 'El refresh token debe ser texto' })
  @IsNotEmpty({ message: 'El refresh token es obligatorio' })
  refreshToken?: string;
}
