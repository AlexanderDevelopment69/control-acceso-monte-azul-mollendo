import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
import type { CreatePersonaDto } from './dto/create-persona.dto.js';
import type { UpdatePersonaDto } from './dto/update-persona.dto.js';
import type { UpdateEstadoPersonaDto } from './dto/update-estado-persona.dto.js';
import type { QueryPersonasDto } from './dto/query-personas.dto.js';
export declare class PersonasService {
    private readonly prisma;
    private readonly auditoriaService;
    constructor(prisma: PrismaService, auditoriaService: AuditoriaService);
    private assertPuedeGestionar;
    create(dto: CreatePersonaDto, user: AuthenticatedUser): Promise<{
        id: number;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        empresaId: number;
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
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        empresaId: number;
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
            personaId: number;
            fechaEmision: Date | null;
            fechaVencimiento: Date | null;
            archivoUrl: string | null;
            vigente: boolean;
            estadoAprobacion: import("../generated/prisma/enums.js").EstadoAprobacionDocumento;
            version: number;
        })[];
    } & {
        id: number;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        empresaId: number;
        puestoId: number | null;
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        area: string | null;
    }>;
    update(id: number, dto: UpdatePersonaDto, user: AuthenticatedUser): Promise<{
        id: number;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        empresaId: number;
        puestoId: number | null;
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        area: string | null;
    }>;
    updateEstado(id: number, dto: UpdateEstadoPersonaDto, user: AuthenticatedUser): Promise<{
        id: number;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        empresaId: number;
        puestoId: number | null;
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        area: string | null;
    }>;
}
