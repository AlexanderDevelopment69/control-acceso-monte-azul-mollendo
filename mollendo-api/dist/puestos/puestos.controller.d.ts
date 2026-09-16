import { PuestosService } from './puestos.service.js';
import { CreatePuestoDto } from './dto/create-puesto.dto.js';
import { SetRequisitosDto } from './dto/set-requisitos.dto.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
export declare class PuestosController {
    private readonly puestosService;
    constructor(puestosService: PuestosService);
    findAll(): Promise<{
        id: number;
        nombre: string;
        caso: import("../generated/prisma/enums.js").CasoPuesto;
    }[]>;
    create(dto: CreatePuestoDto, user: AuthenticatedUser): Promise<{
        id: number;
        nombre: string;
        caso: import("../generated/prisma/enums.js").CasoPuesto;
    }>;
    findRequisitos(id: number): Promise<({
        tipoDocumento: {
            id: number;
            nombre: string;
            tipoValidacion: import("../generated/prisma/enums.js").TipoValidacionDocumento;
        };
    } & {
        puestoId: number;
        tipoDocumentoId: number;
        obligatorio: boolean;
    })[]>;
    setRequisitos(id: number, dto: SetRequisitosDto, user: AuthenticatedUser): Promise<({
        tipoDocumento: {
            id: number;
            nombre: string;
            tipoValidacion: import("../generated/prisma/enums.js").TipoValidacionDocumento;
        };
    } & {
        puestoId: number;
        tipoDocumentoId: number;
        obligatorio: boolean;
    })[]>;
}
