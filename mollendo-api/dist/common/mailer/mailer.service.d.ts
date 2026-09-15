interface EnviarCorreoOptions {
    to: string;
    subject: string;
    html: string;
}
export declare class MailerService {
    private readonly logger;
    private readonly transporter;
    constructor();
    enviarCorreo({ to, subject, html }: EnviarCorreoOptions): Promise<void>;
    enviarInvitacionEmpresa(correo: string, enlaceActivacion: string): Promise<void>;
    enviarRecuperacionPassword(correo: string, enlaceRecuperacion: string): Promise<void>;
}
export {};
