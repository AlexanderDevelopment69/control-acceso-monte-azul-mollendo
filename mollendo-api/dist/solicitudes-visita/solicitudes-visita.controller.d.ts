import { SolicitudesVisitaService } from './solicitudes-visita.service.js';
import { CreateSolicitudVisitaDto } from './dto/create-solicitud-visita.dto.js';
import { UpdateSolicitudVisitaDto } from './dto/update-solicitud-visita.dto.js';
import { QuerySolicitudesVisitaDto } from './dto/query-solicitudes-visita.dto.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
export declare class SolicitudesVisitaController {
    private readonly solicitudesVisitaService;
    constructor(solicitudesVisitaService: SolicitudesVisitaService);
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
