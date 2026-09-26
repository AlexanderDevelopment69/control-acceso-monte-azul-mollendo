import { AuditoriaService } from './auditoria.service.js';
import { QueryAuditoriaDto } from './dto/query-auditoria.dto.js';
export declare class AuditoriaController {
    private readonly auditoriaService;
    constructor(auditoriaService: AuditoriaService);
    findAll(query: QueryAuditoriaDto): Promise<({
        usuario: {
            id: number;
            rol: import("../generated/prisma/enums.js").RolUsuario;
            correo: string;
        } | null;
    } & {
        tablaAfectada: string;
        registroId: number;
        accion: import("../generated/prisma/enums.js").AccionAuditoria;
        fechaHora: Date;
        id: number;
        usuarioId: number | null;
    })[]>;
}
