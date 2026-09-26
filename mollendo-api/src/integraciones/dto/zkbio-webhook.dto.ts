import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Contrato PROVISIONAL del evento de ZKBio CVSecurity (identificación facial
 * del terminal ZKTeco G4 Pro + resultado del alcoholímetro). Se ajustará al
 * formato real cuando el cliente entregue la documentación/SDK de ZKBio
 * (spec base, sección 12).
 */
export class ZkbioWebhookDto {
  @IsOptional()
  @IsIn(['DNI', 'CE', 'PASAPORTE'], { message: 'El tipo de documento debe ser DNI, CE o PASAPORTE' })
  tipoDocumentoIdentidad?: 'DNI' | 'CE' | 'PASAPORTE';

  @IsString({ message: 'El número de documento debe ser texto' })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  numeroDocumento!: string;

  @IsIn(['conforme', 'no_conforme'], { message: 'El resultado de alcohol debe ser "conforme" o "no_conforme"' })
  resultadoAlcohol!: 'conforme' | 'no_conforme';

  @IsOptional()
  @IsString({ message: 'El ID del molinete debe ser texto' })
  @MaxLength(50, { message: 'El ID del molinete no puede tener más de 50 caracteres' })
  torniqueteId?: string;
}
