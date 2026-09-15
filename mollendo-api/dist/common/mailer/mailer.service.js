var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailerService_1;
import { Injectable, Logger } from '@nestjs/common';
import { createTransport } from 'nodemailer';
let MailerService = MailerService_1 = class MailerService {
    logger = new Logger(MailerService_1.name);
    transporter;
    constructor() {
        this.transporter = createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT ?? 587),
            secure: false,
            auth: process.env.SMTP_USER
                ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
                : undefined,
        });
    }
    async enviarCorreo({ to, subject, html }) {
        if (!process.env.SMTP_HOST) {
            this.logger.warn(`SMTP no configurado — correo a "${to}" no enviado. Asunto: "${subject}"`);
            this.logger.debug(html);
            return;
        }
        await this.transporter.sendMail({
            from: process.env.SMTP_FROM ?? 'no-reply@mollendo.local',
            to,
            subject,
            html,
        });
    }
    async enviarInvitacionEmpresa(correo, enlaceActivacion) {
        await this.enviarCorreo({
            to: correo,
            subject: 'Invitación — Sistema de Control de Acceso, Terminal de Mollendo',
            html: `
        <p>Se ha creado una cuenta para su empresa en el portal de control de acceso del Terminal de Mollendo.</p>
        <p>Active su cuenta y cree su contraseña en el siguiente enlace:</p>
        <p><a href="${enlaceActivacion}">${enlaceActivacion}</a></p>
        <p>Este enlace expira en 48 horas.</p>
      `,
        });
    }
    async enviarRecuperacionPassword(correo, enlaceRecuperacion) {
        await this.enviarCorreo({
            to: correo,
            subject: 'Recuperar contraseña — Sistema de Control de Acceso, Terminal de Mollendo',
            html: `
        <p>Se solicitó restablecer la contraseña de su cuenta.</p>
        <p>Si fue usted, defina una nueva contraseña en el siguiente enlace:</p>
        <p><a href="${enlaceRecuperacion}">${enlaceRecuperacion}</a></p>
        <p>Si no fue usted, ignore este correo — su contraseña actual sigue siendo válida.</p>
        <p>Este enlace expira en 1 hora.</p>
      `,
        });
    }
};
MailerService = MailerService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], MailerService);
export { MailerService };
//# sourceMappingURL=mailer.service.js.map