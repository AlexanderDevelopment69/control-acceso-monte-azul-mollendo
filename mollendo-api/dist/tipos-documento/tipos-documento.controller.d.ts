import { TiposDocumentoService } from './tipos-documento.service.js';
import { CreateTipoDocumentoDto } from './dto/create-tipo-documento.dto.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
export declare class TiposDocumentoController {
    private readonly tiposDocumentoService;
    constructor(tiposDocumentoService: TiposDocumentoService);
    findAll(): Promise<{
        id: number;
        nombre: string;
        tipoValidacion: import("../generated/prisma/enums.js").TipoValidacionDocumento;
    }[]>;
    create(dto: CreateTipoDocumentoDto, user: AuthenticatedUser): Promise<{
        id: number;
        nombre: string;
        tipoValidacion: import("../generated/prisma/enums.js").TipoValidacionDocumento;
    }>;
}
