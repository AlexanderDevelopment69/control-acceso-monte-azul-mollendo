import { UsuariosService } from './usuarios.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
export declare class UsuariosController {
    private readonly usuariosService;
    constructor(usuariosService: UsuariosService);
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
