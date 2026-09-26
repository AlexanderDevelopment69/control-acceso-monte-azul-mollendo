import { PanelService } from './panel.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
export declare class PanelController {
    private readonly panelService;
    private readonly prisma;
    constructor(panelService: PanelService, prisma: PrismaService);
    resumen(): Promise<{
        denegacionesHoy: number;
        alcoholNoConformeHoy: number;
        documentosVencidos: number;
    }>;
    health(): Promise<{
        status: string;
        database: string;
        latenciaMs: number;
        fecha: string;
    }>;
    estadoSistema(): Promise<{
        api: {
            estado: "up";
            entorno: string;
            uptimeSegundos: number;
            nodeVersion: string;
            fecha: string;
        };
        baseDeDatos: {
            estado: "up" | "down";
            latenciaMs: number;
        };
        integraciones: {
            claveEquiposConfigurada: boolean;
        };
        websocket: {
            namespace: string;
        };
    }>;
}
