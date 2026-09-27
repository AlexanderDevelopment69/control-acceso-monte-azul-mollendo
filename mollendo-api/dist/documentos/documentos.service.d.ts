import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
import type { CreateDocumentoDto } from './dto/create-documento.dto.js';
export declare class DocumentosService {
    private readonly prisma;
    private readonly auditoriaService;
    private readonly logger;
    constructor(prisma: PrismaService, auditoriaService: AuditoriaService);
    private findPersona;
    subirDocumento(personaId: number, dto: CreateDocumentoDto, archivoPath: string, user: AuthenticatedUser): Promise<{
        fechaEmision: Date | null;
        fechaVencimiento: Date | null;
        archivoUrl: string | null;
        version: number;
        creadoEn: Date;
        id: number;
        personaId: number;
        tipoDocumentoId: number;
    }>;
    findHistorial(personaId: number): Promise<({
        tipoDocumento: {
            id: number;
            nombre: string;
        };
    } & {
        fechaEmision: Date | null;
        fechaVencimiento: Date | null;
        archivoUrl: string | null;
        version: number;
        creadoEn: Date;
        id: number;
        personaId: number;
        tipoDocumentoId: number;
    })[]>;
    eliminarDocumento(personaId: number, tipoDocumentoId: number, user: AuthenticatedUser): Promise<{
        eliminados: number;
    }>;
}
