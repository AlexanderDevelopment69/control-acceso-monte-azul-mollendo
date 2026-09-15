import { DocumentosService } from './documentos.service.js';
import { CreateDocumentoDto } from './dto/create-documento.dto.js';
import { UpdateEstadoDocumentoDto } from './dto/update-estado-documento.dto.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
export declare class DocumentosController {
    private readonly documentosService;
    constructor(documentosService: DocumentosService);
    subirDocumento(personaId: number, dto: CreateDocumentoDto, archivo: Express.Multer.File, user: AuthenticatedUser): Promise<{
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
    updateEstado(id: number, dto: UpdateEstadoDocumentoDto, user: AuthenticatedUser): Promise<{
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
