import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import type { IngresoDto } from './dto/ingreso.dto.js';
import type { SalidaDto } from './dto/salida.dto.js';
import type { QueryEventosAccesoDto } from './dto/query-eventos-acceso.dto.js';
export declare class EventosAccesoService {
    private readonly prisma;
    private readonly eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    private findPersonaPorDocumento;
    private getDocumentosRequeridos;
    private getDocumentosVigentesAprobados;
    registrarIngreso(dto: IngresoDto): Promise<{
        eventoId: number;
        resultado: import("../generated/prisma/enums.js").ResultadoAcceso;
        persona: {
            id: number;
            nombres: string;
            apellidos: string;
        };
        motivos: {
            dadoDeBaja: boolean;
            alcohol: boolean;
            documentos: boolean;
            documentosFaltantes: string[];
        };
    }>;
    registrarSalida(dto: SalidaDto): Promise<{
        eventoId: number;
        resultado: import("../generated/prisma/enums.js").ResultadoAcceso;
        persona: {
            id: number;
            nombres: string;
            apellidos: string;
        };
        motivos: {
            sinIngresoPrevio: boolean;
        };
    }>;
    findAll(query: QueryEventosAccesoDto): Promise<({
        persona: {
            id: number;
            empresaId: number;
            nombres: string;
            apellidos: string;
        };
    } & {
        id: number;
        fechaHora: Date;
        personaId: number;
        torniqueteId: string | null;
        resultado: import("../generated/prisma/enums.js").ResultadoAcceso;
        tipoMovimiento: import("../generated/prisma/enums.js").TipoMovimiento;
        denegadoPorBaja: boolean;
        denegadoPorAlcohol: boolean;
        denegadoPorDocumentos: boolean;
        denegadoSinIngresoPrevio: boolean;
    })[]>;
}
