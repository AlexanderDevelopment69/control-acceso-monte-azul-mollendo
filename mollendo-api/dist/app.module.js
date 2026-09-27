var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { EmpresasModule } from './empresas/empresas.module.js';
import { AuditoriaModule } from './auditoria/auditoria.module.js';
import { TiposDocumentoModule } from './tipos-documento/tipos-documento.module.js';
import { PersonasModule } from './personas/personas.module.js';
import { DocumentosModule } from './documentos/documentos.module.js';
import { EventosAccesoModule } from './eventos-acceso/eventos-acceso.module.js';
import { IntegracionesModule } from './integraciones/integraciones.module.js';
import { PanelModule } from './panel/panel.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [
            ConfigModule.forRoot({ isGlobal: true }),
            EventEmitterModule.forRoot(),
            PassportModule,
            PrismaModule,
            AuditoriaModule,
            AuthModule,
            UsuariosModule,
            EmpresasModule,
            TiposDocumentoModule,
            PersonasModule,
            DocumentosModule,
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
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map