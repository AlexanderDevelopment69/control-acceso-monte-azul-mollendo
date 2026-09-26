import { EmpresasService } from './empresas.service.js';
import { CreateEmpresaDto } from './dto/create-empresa.dto.js';
import { UpdateEmpresaDto } from './dto/update-empresa.dto.js';
import { QueryEmpresasDto } from './dto/query-empresas.dto.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
export declare class EmpresasController {
    private readonly empresasService;
    constructor(empresasService: EmpresasService);
    create(dto: CreateEmpresaDto, user: AuthenticatedUser): Promise<{
        id: number;
        ruc: string;
        razonSocial: string;
        correoContacto: string;
        telefonoContacto: string | null;
        estado: import("../generated/prisma/enums.js").EstadoEmpresa;
        contratoVigenciaInicio: Date | null;
        contratoVigenciaFin: Date | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }>;
    findAll(query: QueryEmpresasDto): Promise<{
        id: number;
        ruc: string;
        razonSocial: string;
        correoContacto: string;
        telefonoContacto: string | null;
        estado: import("../generated/prisma/enums.js").EstadoEmpresa;
        contratoVigenciaInicio: Date | null;
        contratoVigenciaFin: Date | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        ruc: string;
        razonSocial: string;
        correoContacto: string;
        telefonoContacto: string | null;
        estado: import("../generated/prisma/enums.js").EstadoEmpresa;
        contratoVigenciaInicio: Date | null;
        contratoVigenciaFin: Date | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }>;
    update(id: number, dto: UpdateEmpresaDto, user: AuthenticatedUser): Promise<{
        id: number;
        ruc: string;
        razonSocial: string;
        correoContacto: string;
        telefonoContacto: string | null;
        estado: import("../generated/prisma/enums.js").EstadoEmpresa;
        contratoVigenciaInicio: Date | null;
        contratoVigenciaFin: Date | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }>;
}
