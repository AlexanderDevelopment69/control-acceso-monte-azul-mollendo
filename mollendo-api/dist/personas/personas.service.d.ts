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
    private assertEmpresaExiste;
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
    private findPersona;
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
