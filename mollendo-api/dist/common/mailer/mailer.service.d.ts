import { ConfiguracionSmtpService } from '../../configuracion-smtp/configuracion-smtp.service.js';
interface EnviarCorreoOptions {
    to: string;
    subject: string;
    html: string;
}
export declare class MailerService {
    private readonly configuracionSmtpService;
    private readonly logger;
    constructor(configuracionSmtpService: ConfiguracionSmtpService);
    enviarCorreo({ to, subject, html }: EnviarCorreoOptions): Promise<void>;
    enviarInvitacionEmpresa(correo: string, enlaceActivacion: string): Promise<void>;
    enviarRecuperacionPassword(correo: string, enlaceRecuperacion: string): Promise<void>;
}
export {};
