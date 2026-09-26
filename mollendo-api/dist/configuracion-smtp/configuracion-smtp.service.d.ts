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
        usuario: string | null;
        id: number;
        host: string;
        puerto: number;
        seguro: boolean;
        remitente: string;
        actualizadoEn: Date;
        configurado: true;
    }>;
    guardar(dto: UpdateConfiguracionSmtpDto, usuarioId: number): Promise<{
        passwordConfigurada: boolean;
        usuario: string | null;
        id: number;
        host: string;
        puerto: number;
        seguro: boolean;
        remitente: string;
        actualizadoEn: Date;
        configurado: true;
    }>;
    eliminar(): Promise<{
        eliminado: boolean;
    }>;
    obtenerConfigTransporte(): Promise<ConfigTransporteSmtp | null>;
}
