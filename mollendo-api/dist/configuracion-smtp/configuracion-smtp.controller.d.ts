import { ConfiguracionSmtpService } from './configuracion-smtp.service.js';
import { UpdateConfiguracionSmtpDto } from './dto/update-configuracion-smtp.dto.js';
import { ProbarConfiguracionSmtpDto } from './dto/probar-configuracion-smtp.dto.js';
import { MailerService } from '../common/mailer/mailer.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';
export declare class ConfiguracionSmtpController {
    private readonly configuracionSmtpService;
    private readonly mailerService;
    constructor(configuracionSmtpService: ConfiguracionSmtpService, mailerService: MailerService);
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
    guardar(dto: UpdateConfiguracionSmtpDto, user: AuthenticatedUser): Promise<{
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
    probar(dto: ProbarConfiguracionSmtpDto): Promise<{
        enviado: boolean;
    }>;
}
