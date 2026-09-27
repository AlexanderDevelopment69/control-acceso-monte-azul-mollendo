import { EventEmitter2 } from '@nestjs/event-emitter';
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
    private readonly eventEmitter;
    private readonly logger;
    constructor(prisma: PrismaService, auditoriaService: AuditoriaService, eventEmitter: EventEmitter2);
    private assertEmpresaExiste;
    create(dto: CreatePersonaDto, user: AuthenticatedUser): Promise<{
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        fotoUrl: string | null;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        id: number;
        empresaId: number;
    }>;
    findAll(query: QueryPersonasDto): Promise<{
        cumplimiento: {
            habilitado: boolean;
            dadoDeBaja: boolean;
            sinDocumentos: boolean;
            documentosVencidos: string[];
        };
        empresa: {
            id: number;
            razonSocial: string;
        };
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        fotoUrl: string | null;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        id: number;
        empresaId: number;
    }[]>;
    findOne(id: number): Promise<{
        cumplimiento: {
            habilitado: boolean;
            dadoDeBaja: boolean;
            sinDocumentos: boolean;
            documentosVencidos: string[];
        };
        documentosActuales: {
            id: number;
            tipoDocumentoId: number;
            nombre: string;
            version: number;
            fechaVencimiento: Date | null;
            creadoEn: Date;
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
        fotoUrl: string | null;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        id: number;
        empresaId: number;
    }>;
    private findPersona;
    update(id: number, dto: UpdatePersonaDto, user: AuthenticatedUser): Promise<{
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        fotoUrl: string | null;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        id: number;
        empresaId: number;
    }>;
    updateEstado(id: number, dto: UpdateEstadoPersonaDto, user: AuthenticatedUser): Promise<{
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        fotoUrl: string | null;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        id: number;
        empresaId: number;
    }>;
    guardarFoto(id: number, rutaArchivo: string, user: AuthenticatedUser): Promise<{
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        fotoUrl: string | null;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        id: number;
        empresaId: number;
    }>;
    rutaFoto(id: number): Promise<string>;
}
