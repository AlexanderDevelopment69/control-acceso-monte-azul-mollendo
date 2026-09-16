import { Injectable, Logger } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { ConfiguracionSmtpService } from '../../configuracion-smtp/configuracion-smtp.service.js';

interface EnviarCorreoOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly configuracionSmtpService: ConfiguracionSmtpService) {}

  async enviarCorreo({ to, subject, html }: EnviarCorreoOptions): Promise<void> {
    // Se arma el transportador en cada envío (no se cachea) para que un
    // cambio de configuración desde el portal se aplique de inmediato, sin
    // reiniciar el servidor.
    const config = await this.configuracionSmtpService.obtenerConfigTransporte();
    if (!config) {
      this.logger.warn(`SMTP no configurado — correo a "${to}" no enviado. Asunto: "${subject}"`);
      this.logger.debug(html);
      return;
    }

    const transporter = createTransport({
      host: config.host,
      port: config.puerto,
      secure: config.seguro,
      auth: config.usuario ? { user: config.usuario, pass: config.password } : undefined,
    });

    await transporter.sendMail({
      from: config.remitente,
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
