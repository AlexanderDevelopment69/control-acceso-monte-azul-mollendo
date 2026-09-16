import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsInt, ValidateNested } from 'class-validator';

class RequisitoItemDto {
  @IsInt({ message: 'El tipo de documento debe ser válido' })
  tipoDocumentoId!: number;

  @IsBoolean({ message: 'El campo obligatorio debe ser sí o no' })
  obligatorio!: boolean;
}

export class SetRequisitosDto {
  @IsArray({ message: 'Los requisitos deben ser una lista' })
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => RequisitoItemDto)
  requisitos!: RequisitoItemDto[];
}
