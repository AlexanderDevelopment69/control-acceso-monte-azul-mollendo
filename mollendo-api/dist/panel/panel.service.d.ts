import { PrismaService } from '../prisma/prisma.service.js';
export declare class PanelService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    resumen(): Promise<{
        denegacionesHoy: number;
        alcoholNoConformeHoy: number;
        documentosVencidos: number;
    }>;
}
