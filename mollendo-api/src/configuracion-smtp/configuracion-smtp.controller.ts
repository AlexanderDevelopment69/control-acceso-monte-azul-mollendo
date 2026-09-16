import { Body, Controller, Delete, Get, Put, Post } from '@nestjs/common';
import { ConfiguracionSmtpService } from './configuracion-smtp.service.js';
import { UpdateConfiguracionSmtpDto } from './dto/update-configuracion-smtp.dto.js';
import { ProbarConfiguracionSmtpDto } from './dto/probar-configuracion-smtp.dto.js';
import { MailerService } from '../common/mailer/mailer.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type.js';

@Controller('configuracion/smtp')
@Roles('administracion')
export class ConfiguracionSmtpController {
  constructor(
    private readonly configuracionSmtpService: ConfiguracionSmtpService,
    private readonly mailerService: MailerService,
  ) {}

  @Get()
  obtener() {
    return this.configuracionSmtpService.obtener();
  }

  @Put()
  guardar(@Body() dto: UpdateConfiguracionSmtpDto, @CurrentUser() user: AuthenticatedUser) {
    return this.configuracionSmtpService.guardar(dto, user.id);
  }

  // Vuelve a depender de las variables de entorno del servidor.
  @Delete()
  eliminar() {
    return this.configuracionSmtpService.eliminar();
  }

  // Envía un correo real con la configuración ya guardada — para que
  // Administración pueda confirmar que el SMTP funciona sin tener que
  // esperar a la próxima invitación/recuperación de contraseña real.
  @Post('probar')
  async probar(@Body() dto: ProbarConfiguracionSmtpDto) {
    await this.mailerService.enviarCorreo({
      to: dto.correoDestino,
      subject: 'Correo de prueba — Sistema de Control de Acceso, Terminal de Mollendo',
      html: '<p>Este es un correo de prueba enviado desde la sección "Sistema y APIs" del portal. Si lo recibió, la configuración de SMTP funciona correctamente.</p>',
    });
    return { enviado: true };
  }
}
