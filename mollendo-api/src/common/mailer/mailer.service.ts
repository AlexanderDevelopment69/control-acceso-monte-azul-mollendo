import { Injectable, Logger } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';

interface EnviarCorreoOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly transporter: Transporter;

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

  async enviarCorreo({ to, subject, html }: EnviarCorreoOptions): Promise<void> {
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

  async enviarInvitacionEmpresa(correo: string, enlaceActivacion: string): Promise<void> {
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

  async enviarRecuperacionPassword(correo: string, enlaceRecuperacion: string): Promise<void> {
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
}
