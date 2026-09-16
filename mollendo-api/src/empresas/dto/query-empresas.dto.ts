import { IsIn, IsOptional, IsString } from 'class-validator';

export class QueryEmpresasDto {
  @IsOptional()
  @IsIn(['activa', 'inactiva'], { message: 'El estado debe ser "activa" o "inactiva"' })
  estado?: 'activa' | 'inactiva';

  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser texto' })
  busqueda?: string;
}
