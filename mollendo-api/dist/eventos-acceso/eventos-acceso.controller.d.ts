import { EventosAccesoService } from './eventos-acceso.service.js';
import { IngresoDto } from './dto/ingreso.dto.js';
import { SalidaDto } from './dto/salida.dto.js';
import { QueryEventosAccesoDto } from './dto/query-eventos-acceso.dto.js';
export declare class EventosAccesoController {
    private readonly eventosAccesoService;
    constructor(eventosAccesoService: EventosAccesoService);
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
        personaId: number;
        tipoMovimiento: import("../generated/prisma/enums.js").TipoMovimiento;
        resultado: import("../generated/prisma/enums.js").ResultadoAcceso;
        denegadoPorBaja: boolean;
        denegadoPorAlcohol: boolean;
        denegadoPorDocumentos: boolean;
        denegadoSinIngresoPrevio: boolean;
        fechaHora: Date;
        torniqueteId: string | null;
    })[]>;
}
