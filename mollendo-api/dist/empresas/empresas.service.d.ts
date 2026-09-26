import { PrismaService } from '../prisma/prisma.service.js';
import { MailerService } from '../common/mailer/mailer.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { CreateEmpresaDto } from './dto/create-empresa.dto.js';
import type { UpdateEmpresaDto } from './dto/update-empresa.dto.js';
import type { QueryEmpresasDto } from './dto/query-empresas.dto.js';
export declare class EmpresasService {
    private readonly prisma;
    private readonly mailerService;
    private readonly auditoriaService;
    constructor(prisma: PrismaService, mailerService: MailerService, auditoriaService: AuditoriaService);
    create(dto: CreateEmpresaDto, usuarioId: number): Promise<{
        id: number;
        creadoEn: Date;
        actualizadoEn: Date;
        ruc: string;
        razonSocial: string;
        correoContacto: string;
        telefonoContacto: string | null;
        estado: import("../generated/prisma/enums.js").EstadoEmpresa;
        contratoVigenciaInicio: Date | null;
        contratoVigenciaFin: Date | null;
    }>;
    findAll(query: QueryEmpresasDto): Promise<{
        id: number;
        creadoEn: Date;
        actualizadoEn: Date;
        ruc: string;
        razonSocial: string;
        correoContacto: string;
        telefonoContacto: string | null;
        estado: import("../generated/prisma/enums.js").EstadoEmpresa;
        contratoVigenciaInicio: Date | null;
        contratoVigenciaFin: Date | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        creadoEn: Date;
        actualizadoEn: Date;
        ruc: string;
        razonSocial: string;
        correoContacto: string;
        telefonoContacto: string | null;
        estado: import("../generated/prisma/enums.js").EstadoEmpresa;
        contratoVigenciaInicio: Date | null;
        contratoVigenciaFin: Date | null;
    }>;
    update(id: number, dto: UpdateEmpresaDto, usuarioId: number): Promise<{
        id: number;
        creadoEn: Date;
        actualizadoEn: Date;
        ruc: string;
        razonSocial: string;
        correoContacto: string;
        telefonoContacto: string | null;
        estado: import("../generated/prisma/enums.js").EstadoEmpresa;
        contratoVigenciaInicio: Date | null;
        contratoVigenciaFin: Date | null;
    }>;
    invitar(id: number): Promise<{
        mensaje: string;
    }>;
}
