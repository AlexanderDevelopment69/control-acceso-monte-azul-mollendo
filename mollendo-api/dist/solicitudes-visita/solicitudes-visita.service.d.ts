import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
import type { CreateSolicitudVisitaDto } from './dto/create-solicitud-visita.dto.js';
import type { UpdateSolicitudVisitaDto } from './dto/update-solicitud-visita.dto.js';
import type { QuerySolicitudesVisitaDto } from './dto/query-solicitudes-visita.dto.js';
export declare class SolicitudesVisitaService {
    private readonly prisma;
    private readonly auditoriaService;
    constructor(prisma: PrismaService, auditoriaService: AuditoriaService);
    create(dto: CreateSolicitudVisitaDto, user: AuthenticatedUser): Promise<{
        estado: import("../generated/prisma/enums.js").EstadoSolicitudVisita;
        creadoEn: Date;
        id: number;
        empresaId: number;
        personaId: number;
        personaVisitada: string;
        motivo: string;
        fechaHoraProgramada: Date;
    }>;
    findAll(query: QuerySolicitudesVisitaDto): Promise<({
        persona: {
            nombres: string;
            apellidos: string;
            id: number;
        };
    } & {
        estado: import("../generated/prisma/enums.js").EstadoSolicitudVisita;
        creadoEn: Date;
        id: number;
        empresaId: number;
        personaId: number;
        personaVisitada: string;
        motivo: string;
        fechaHoraProgramada: Date;
    })[]>;
    findOne(id: number): Promise<{
        persona: {
            nombres: string;
            apellidos: string;
            id: number;
        };
    } & {
        estado: import("../generated/prisma/enums.js").EstadoSolicitudVisita;
        creadoEn: Date;
        id: number;
        empresaId: number;
        personaId: number;
        personaVisitada: string;
        motivo: string;
        fechaHoraProgramada: Date;
    }>;
    update(id: number, dto: UpdateSolicitudVisitaDto, user: AuthenticatedUser): Promise<{
        estado: import("../generated/prisma/enums.js").EstadoSolicitudVisita;
        creadoEn: Date;
        id: number;
        empresaId: number;
        personaId: number;
        personaVisitada: string;
        motivo: string;
        fechaHoraProgramada: Date;
    }>;
}
