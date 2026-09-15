import { CreateEmpresaDto } from './create-empresa.dto.js';
declare const UpdateEmpresaDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateEmpresaDto>>;
export declare class UpdateEmpresaDto extends UpdateEmpresaDto_base {
    estado?: 'activa' | 'inactiva';
}
export {};
