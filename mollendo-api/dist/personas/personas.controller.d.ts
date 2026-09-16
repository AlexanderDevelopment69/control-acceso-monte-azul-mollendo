import { PersonasService } from './personas.service.js';
import { CreatePersonaDto } from './dto/create-persona.dto.js';
import { UpdatePersonaDto } from './dto/update-persona.dto.js';
import { UpdateEstadoPersonaDto } from './dto/update-estado-persona.dto.js';
import { QueryPersonasDto } from './dto/query-personas.dto.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
export declare class PersonasController {
    private readonly personasService;
    constructor(personasService: PersonasService);
    create(dto: CreatePersonaDto, user: AuthenticatedUser): Promise<{
        id: number;
        empresaId: number;
        creadoEn: Date;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        puestoId: number | null;
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        area: string | null;
    }>;
    findAll(query: QueryPersonasDto, user: AuthenticatedUser): Promise<({
        empresa: {
            id: number;
            razonSocial: string;
        };
        puesto: {
            id: number;
            nombre: string;
            caso: import("../generated/prisma/enums.js").CasoPuesto;
        } | null;
    } & {
        id: number;
        empresaId: number;
        creadoEn: Date;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        puestoId: number | null;
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        area: string | null;
    })[]>;
    findOne(id: number, user: AuthenticatedUser): Promise<{
        empresa: {
            id: number;
            razonSocial: string;
        };
        puesto: {
            id: number;
            nombre: string;
            caso: import("../generated/prisma/enums.js").CasoPuesto;
        } | null;
        documentos: ({
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
        })[];
    } & {
        id: number;
        empresaId: number;
        creadoEn: Date;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        puestoId: number | null;
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        area: string | null;
    }>;
    update(id: number, dto: UpdatePersonaDto, user: AuthenticatedUser): Promise<{
        id: number;
        empresaId: number;
        creadoEn: Date;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        puestoId: number | null;
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        area: string | null;
    }>;
    updateEstado(id: number, dto: UpdateEstadoPersonaDto, user: AuthenticatedUser): Promise<{
        id: number;
        empresaId: number;
        creadoEn: Date;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        puestoId: number | null;
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        area: string | null;
    }>;
}
