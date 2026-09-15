import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { CreateEmpresaDto } from './create-empresa.dto.js';

export class UpdateEmpresaDto extends PartialType(CreateEmpresaDto) {
  @IsOptional()
  @IsIn(['activa', 'inactiva'])
  estado?: 'activa' | 'inactiva';
}
