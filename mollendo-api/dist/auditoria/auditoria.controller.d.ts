import { AuditoriaService } from './auditoria.service.js';
import { QueryAuditoriaDto } from './dto/query-auditoria.dto.js';
export declare class AuditoriaController {
    private readonly auditoriaService;
    constructor(auditoriaService: AuditoriaService);
    findAll(query: QueryAuditoriaDto): Promise<({
        usuario: {
            correo: string;
            id: number;
            rol: import("../generated/prisma/enums.js").RolUsuario;
        } | null;
    } & {
        id: number;
        tablaAfectada: string;
        registroId: number;
        accion: import("../generated/prisma/enums.js").AccionAuditoria;
        fechaHora: Date;
        usuarioId: number | null;
    })[]>;
}
