import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { CreatePuestoDto } from './dto/create-puesto.dto.js';
import type { SetRequisitosDto } from './dto/set-requisitos.dto.js';
export declare class PuestosService {
    private readonly prisma;
    private readonly auditoriaService;
    constructor(prisma: PrismaService, auditoriaService: AuditoriaService);
    create(dto: CreatePuestoDto, usuarioId: number): Promise<{
        id: number;
        nombre: string;
        caso: import("../generated/prisma/enums.js").CasoPuesto;
    }>;
    findAll(): Promise<{
        id: number;
        nombre: string;
        caso: import("../generated/prisma/enums.js").CasoPuesto;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        nombre: string;
        caso: import("../generated/prisma/enums.js").CasoPuesto;
    }>;
    findRequisitos(puestoId: number): Promise<({
        tipoDocumento: {
            id: number;
            nombre: string;
            tipoValidacion: import("../generated/prisma/enums.js").TipoValidacionDocumento;
        };
    } & {
        tipoDocumentoId: number;
        obligatorio: boolean;
        puestoId: number;
    })[]>;
    setRequisitos(puestoId: number, dto: SetRequisitosDto, usuarioId: number): Promise<({
        tipoDocumento: {
            id: number;
            nombre: string;
            tipoValidacion: import("../generated/prisma/enums.js").TipoValidacionDocumento;
        };
    } & {
        tipoDocumentoId: number;
        obligatorio: boolean;
        puestoId: number;
    })[]>;
}
