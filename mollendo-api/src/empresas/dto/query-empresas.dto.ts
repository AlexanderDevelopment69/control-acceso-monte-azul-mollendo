import { IsIn, IsOptional, IsString } from 'class-validator';

export class QueryEmpresasDto {
  @IsOptional()
  @IsIn(['activa', 'inactiva'])
  estado?: 'activa' | 'inactiva';

  @IsOptional()
  @IsString()
  busqueda?: string;
}
