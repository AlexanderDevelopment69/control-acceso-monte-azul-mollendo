import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsInt, ValidateNested } from 'class-validator';

class RequisitoItemDto {
  @IsInt()
  tipoDocumentoId!: number;

  @IsBoolean()
  obligatorio!: boolean;
}

export class SetRequisitosDto {
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => RequisitoItemDto)
  requisitos!: RequisitoItemDto[];
}
