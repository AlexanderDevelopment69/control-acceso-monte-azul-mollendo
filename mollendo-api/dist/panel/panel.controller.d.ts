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
    }>;
}
