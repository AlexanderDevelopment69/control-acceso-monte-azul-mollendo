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
            correo: string;
            id: number;
            rol: import("../generated/prisma/enums.js").RolUsuario;
        } | null;
    } & {
        id: number;
        tablaAfectada: string;
        registroId: number;
        accion: AccionAuditoria;
        fechaHora: Date;
        usuarioId: number | null;
    })[]>;
}
export {};
