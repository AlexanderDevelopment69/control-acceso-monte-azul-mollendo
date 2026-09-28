import type { Response } from 'express';
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
        empresaId: number;
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        fotoUrl: string | null;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        id: number;
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
        empresaId: number;
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        fotoUrl: string | null;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        id: number;
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
        empresaId: number;
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        fotoUrl: string | null;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        id: number;
    }>;
    update(id: number, dto: UpdatePersonaDto, user: AuthenticatedUser): Promise<{
        empresaId: number;
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        fotoUrl: string | null;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        id: number;
    }>;
    updateEstado(id: number, dto: UpdateEstadoPersonaDto, user: AuthenticatedUser): Promise<{
        empresaId: number;
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        fotoUrl: string | null;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        id: number;
    }>;
    subirFoto(id: number, foto: Express.Multer.File, user: AuthenticatedUser): Promise<{
        empresaId: number;
        tipoDocumentoIdentidad: import("../generated/prisma/enums.js").TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        fotoUrl: string | null;
        estado: import("../generated/prisma/enums.js").EstadoPersona;
        creadoEn: Date;
        id: number;
    }>;
    verFoto(id: number, res: Response): Promise<void>;
}
