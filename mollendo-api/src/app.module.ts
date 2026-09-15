import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { MailerModule } from './common/mailer/mailer.module.js';
import { AuthModule } from './auth/auth.module.js';
import { EmpresasModule } from './empresas/empresas.module.js';
import { AuditoriaModule } from './auditoria/auditoria.module.js';
import { TiposDocumentoModule } from './tipos-documento/tipos-documento.module.js';
import { PuestosModule } from './puestos/puestos.module.js';
import { PersonasModule } from './personas/personas.module.js';
import { DocumentosModule } from './documentos/documentos.module.js';
import { SolicitudesVisitaModule } from './solicitudes-visita/solicitudes-visita.module.js';
import { EventosAccesoModule } from './eventos-acceso/eventos-acceso.module.js';
import { IntegracionesModule } from './integraciones/integraciones.module.js';
import { PanelModule } from './panel/panel.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    PassportModule,
    PrismaModule,
    MailerModule,
    AuditoriaModule,
    AuthModule,
    EmpresasModule,
    TiposDocumentoModule,
    PuestosModule,
    PersonasModule,
    DocumentosModule,
    SolicitudesVisitaModule,
    EventosAccesoModule,
    IntegracionesModule,
    PanelModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
