import { DocumentosService } from './documentos.service.js';
import { CreateDocumentoDto } from './dto/create-documento.dto.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
export declare class DocumentosController {
    private readonly documentosService;
    constructor(documentosService: DocumentosService);
    subirDocumento(personaId: number, dto: CreateDocumentoDto, archivo: Express.Multer.File, user: AuthenticatedUser): Promise<{
        id: number;
        creadoEn: Date;
        tipoDocumentoId: number;
        personaId: number;
        fechaEmision: Date | null;
        fechaVencimiento: Date | null;
        archivoUrl: string | null;
        version: number;
    }>;
    findHistorial(personaId: number): Promise<({
        tipoDocumento: {
            id: number;
            nombre: string;
            tipoValidacion: import("../generated/prisma/enums.js").TipoValidacionDocumento;
        };
    } & {
        id: number;
        creadoEn: Date;
        tipoDocumentoId: number;
        personaId: number;
        fechaEmision: Date | null;
        fechaVencimiento: Date | null;
        archivoUrl: string | null;
        version: number;
    })[]>;
}
