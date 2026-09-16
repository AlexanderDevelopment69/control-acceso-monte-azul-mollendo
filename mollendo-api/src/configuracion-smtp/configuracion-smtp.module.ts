import { Global, Module } from '@nestjs/common';
import { ConfiguracionSmtpController } from './configuracion-smtp.controller.js';
import { ConfiguracionSmtpService } from './configuracion-smtp.service.js';

// Global (igual que PrismaModule/MailerModule): MailerService necesita
// inyectar ConfiguracionSmtpService, y este módulo a su vez necesita
// MailerService para el endpoint de "probar" — así se evita un import
// circular entre los dos módulos.
@Global()
@Module({
  controllers: [ConfiguracionSmtpController],
  providers: [ConfiguracionSmtpService],
  exports: [ConfiguracionSmtpService],
})
export class ConfiguracionSmtpModule {}
