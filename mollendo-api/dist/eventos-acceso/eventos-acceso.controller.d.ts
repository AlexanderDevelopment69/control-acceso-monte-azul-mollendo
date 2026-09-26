import { EventosAccesoService } from './eventos-acceso.service.js';
import { IngresoDto } from './dto/ingreso.dto.js';
import { SalidaDto } from './dto/salida.dto.js';
import { QueryEventosAccesoDto } from './dto/query-eventos-acceso.dto.js';
export declare class EventosAccesoController {
    private readonly eventosAccesoService;
    constructor(eventosAccesoService: EventosAccesoService);
    registrarIngreso(dto: IngresoDto): Promise<{
        eventoId: null;
        tipoMovimiento: "ingreso" | "salida";
        resultado: "denegado";
        fechaHora: string;
        persona: null;
        numeroDocumento: string;
        motivos: {
            personaNoRegistrada: boolean;
        };
    } | {
        eventoId: number;
        tipoMovimiento: import("../generated/prisma/enums.js").TipoMovimiento;
        resultado: import("../generated/prisma/enums.js").ResultadoAcceso;
        fechaHora: string;
        persona: {
            id: number;
            nombres: string;
            apellidos: string;
        };
        numeroDocumento: string;
        motivos: {
            dadoDeBaja: boolean;
            sinPuesto: boolean;
            alcohol: boolean;
            documentos: boolean;
            documentosFaltantes: string[];
        };
    }>;
    registrarSalida(dto: SalidaDto): Promise<{
        eventoId: null;
        tipoMovimiento: "ingreso" | "salida";
        resultado: "denegado";
        fechaHora: string;
        persona: null;
        numeroDocumento: string;
        motivos: {
            personaNoRegistrada: boolean;
        };
    } | {
        eventoId: number;
        tipoMovimiento: import("../generated/prisma/enums.js").TipoMovimiento;
        resultado: import("../generated/prisma/enums.js").ResultadoAcceso;
        fechaHora: string;
        persona: {
            id: number;
            nombres: string;
            apellidos: string;
        };
        numeroDocumento: string;
        motivos: {};
    }>;
    findAll(query: QueryEventosAccesoDto): Promise<({
        persona: {
            id: number;
            empresaId: number;
            nombres: string;
            apellidos: string;
        };
    } & {
        tipoMovimiento: import("../generated/prisma/enums.js").TipoMovimiento;
        resultado: import("../generated/prisma/enums.js").ResultadoAcceso;
        denegadoPorBaja: boolean;
        denegadoPorAlcohol: boolean;
        denegadoPorDocumentos: boolean;
        denegadoSinPuesto: boolean;
        fechaHora: Date;
        torniqueteId: string | null;
        id: number;
        personaId: number;
    })[]>;
}
