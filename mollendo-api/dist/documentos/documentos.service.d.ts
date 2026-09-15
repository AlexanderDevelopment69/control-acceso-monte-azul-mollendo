import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
import type { CreateDocumentoDto } from './dto/create-documento.dto.js';
import type { UpdateEstadoDocumentoDto } from './dto/update-estado-documento.dto.js';
export declare class DocumentosService {
    private readonly prisma;
    private readonly auditoriaService;
    constructor(prisma: PrismaService, auditoriaService: AuditoriaService);
    private findPersonaConAcceso;
    subirDocumento(personaId: number, dto: CreateDocumentoDto, archivoPath: string, user: AuthenticatedUser): Promise<{
        id: number;
        creadoEn: Date;
        tipoDocumentoId: number;
        fechaEmision: Date | null;
        fechaVencimiento: Date | null;
        estadoAprobacion: import("../generated/prisma/enums.js").EstadoAprobacionDocumento;
        personaId: number;
        archivoUrl: string | null;
        vigente: boolean;
        version: number;
    }>;
    findHistorial(personaId: number, user: AuthenticatedUser): Promise<({
        tipoDocumento: {
            id: number;
            nombre: string;
            tipoValidacion: import("../generated/prisma/enums.js").TipoValidacionDocumento;
        };
    } & {
        id: number;
        creadoEn: Date;
        tipoDocumentoId: number;
        fechaEmision: Date | null;
        fechaVencimiento: Date | null;
        estadoAprobacion: import("../generated/prisma/enums.js").EstadoAprobacionDocumento;
        personaId: number;
        archivoUrl: string | null;
        vigente: boolean;
        version: number;
    })[]>;
    updateEstado(documentoId: number, dto: UpdateEstadoDocumentoDto, user: AuthenticatedUser): Promise<{
        id: number;
        creadoEn: Date;
        tipoDocumentoId: number;
        fechaEmision: Date | null;
        fechaVencimiento: Date | null;
        estadoAprobacion: import("../generated/prisma/enums.js").EstadoAprobacionDocumento;
        personaId: number;
        archivoUrl: string | null;
        vigente: boolean;
        version: number;
    }>;
}
