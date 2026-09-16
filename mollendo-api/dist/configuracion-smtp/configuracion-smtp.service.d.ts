import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { UpdateConfiguracionSmtpDto } from './dto/update-configuracion-smtp.dto.js';
export interface ConfigTransporteSmtp {
    host: string;
    puerto: number;
    seguro: boolean;
    usuario?: string;
    password?: string;
    remitente: string;
}
export declare class ConfiguracionSmtpService {
    private readonly prisma;
    private readonly auditoriaService;
    constructor(prisma: PrismaService, auditoriaService: AuditoriaService);
    obtener(): Promise<{
        configurado: false;
    } | {
        passwordConfigurada: boolean;
        id: number;
        actualizadoEn: Date;
        host: string;
        puerto: number;
        seguro: boolean;
        usuario: string | null;
        remitente: string;
        configurado: true;
    }>;
    guardar(dto: UpdateConfiguracionSmtpDto, usuarioId: number): Promise<{
        passwordConfigurada: boolean;
        id: number;
        actualizadoEn: Date;
        host: string;
        puerto: number;
        seguro: boolean;
        usuario: string | null;
        remitente: string;
        configurado: true;
    }>;
    eliminar(): Promise<{
        eliminado: boolean;
    }>;
    obtenerConfigTransporte(): Promise<ConfigTransporteSmtp | null>;
}
