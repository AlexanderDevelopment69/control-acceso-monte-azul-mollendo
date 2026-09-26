import { PrismaService } from '../prisma/prisma.service.js';
import type { AccionAuditoria } from '../generated/prisma/enums.js';
interface RegistrarAuditoriaParams {
    usuarioId: number | null;
    tablaAfectada: string;
    registroId: number;
    accion: AccionAuditoria;
}
export declare class AuditoriaService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    registrar(params: RegistrarAuditoriaParams): Promise<void>;
    findAll(filtros: {
        tablaAfectada?: string;
        registroId?: number;
    }): Promise<({
        usuario: {
            id: number;
            rol: import("../generated/prisma/enums.js").RolUsuario;
            correo: string;
        } | null;
    } & {
        id: number;
        fechaHora: Date;
        usuarioId: number | null;
        tablaAfectada: string;
        registroId: number;
        accion: AccionAuditoria;
    })[]>;
}
export {};
