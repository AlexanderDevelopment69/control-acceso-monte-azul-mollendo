import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
import type { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import type { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
export declare class UsuariosService {
    private readonly prisma;
    private readonly auditoriaService;
    constructor(prisma: PrismaService, auditoriaService: AuditoriaService);
    findAll(): import("../generated/prisma/internal/prismaNamespace.js").PrismaPromise<{
        id: number;
        creadoEn: Date;
        rol: import("../generated/prisma/enums.js").RolUsuario;
        correo: string;
        estadoCuenta: import("../generated/prisma/enums.js").EstadoCuenta;
    }[]>;
    create(dto: CreateUsuarioDto, user: AuthenticatedUser): Promise<{
        id: number;
        creadoEn: Date;
        rol: import("../generated/prisma/enums.js").RolUsuario;
        correo: string;
        estadoCuenta: import("../generated/prisma/enums.js").EstadoCuenta;
    }>;
    update(id: number, dto: UpdateUsuarioDto, user: AuthenticatedUser): Promise<{
        id: number;
        creadoEn: Date;
        rol: import("../generated/prisma/enums.js").RolUsuario;
        correo: string;
        estadoCuenta: import("../generated/prisma/enums.js").EstadoCuenta;
    }>;
}
