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
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        area: string | null;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        id: number;
        empresaId: number;
        puestoId: number | null;
    }>;
    findAll(query: QueryPersonasDto): Promise<{
        puesto: {
            id: number;
            nombre: string;
            caso: import("../generated/prisma/enums.js").CasoPuesto;
        } | null;
        cumplimiento: {
            habilitado: boolean;
            dadoDeBaja: boolean;
            sinPuesto: boolean;
            documentosFaltantes: string[];
        };
        empresa: {
            id: number;
            razonSocial: string;
        };
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        area: string | null;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        id: number;
        empresaId: number;
        puestoId: number | null;
    }[]>;
    findOne(id: number): Promise<{
        puesto: {
            id: number;
            nombre: string;
            caso: import("../generated/prisma/enums.js").CasoPuesto;
        } | null;
        cumplimiento: {
            habilitado: boolean;
            dadoDeBaja: boolean;
            sinPuesto: boolean;
            documentosFaltantes: string[];
        };
        requisitos: {
            tipoDocumentoId: number;
            nombre: string;
            obligatorio: boolean;
            documento: {
                id: number;
                version: number;
                fechaVencimiento: Date | null;
                creadoEn: Date;
            } | null;
            vigente: boolean;
        }[];
        empresa: {
            id: number;
            razonSocial: string;
        };
        documentos: ({
            tipoDocumento: {
                id: number;
                nombre: string;
                tipoValidacion: import("../generated/prisma/enums.js").TipoValidacionDocumento;
            };
        } & {
            creadoEn: Date;
            id: number;
            personaId: number;
            tipoDocumentoId: number;
            fechaEmision: Date | null;
            fechaVencimiento: Date | null;
            archivoUrl: string | null;
            version: number;
        })[];
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        area: string | null;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        id: number;
        empresaId: number;
        puestoId: number | null;
    }>;
    update(id: number, dto: UpdatePersonaDto, user: AuthenticatedUser): Promise<{
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        area: string | null;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        id: number;
        empresaId: number;
        puestoId: number | null;
    }>;
    updateEstado(id: number, dto: UpdateEstadoPersonaDto, user: AuthenticatedUser): Promise<{
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        area: string | null;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        id: number;
        empresaId: number;
        puestoId: number | null;
    }>;
}
