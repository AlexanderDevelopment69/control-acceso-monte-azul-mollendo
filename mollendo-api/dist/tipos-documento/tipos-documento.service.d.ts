import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { CreateTipoDocumentoDto } from './dto/create-tipo-documento.dto.js';
export declare class TiposDocumentoService {
    private readonly prisma;
    private readonly auditoriaService;
    constructor(prisma: PrismaService, auditoriaService: AuditoriaService);
    create(dto: CreateTipoDocumentoDto, usuarioId: number): Promise<{
        id: number;
        nombre: string;
        tipoValidacion: import("../generated/prisma/enums.js").TipoValidacionDocumento;
    }>;
    findAll(): Promise<{
        id: number;
        nombre: string;
        tipoValidacion: import("../generated/prisma/enums.js").TipoValidacionDocumento;
    }[]>;
}
