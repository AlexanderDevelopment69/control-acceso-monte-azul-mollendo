var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Delete, Get, Put, Post } from '@nestjs/common';
import { ConfiguracionSmtpService } from './configuracion-smtp.service.js';
import { UpdateConfiguracionSmtpDto } from './dto/update-configuracion-smtp.dto.js';
import { ProbarConfiguracionSmtpDto } from './dto/probar-configuracion-smtp.dto.js';
import { MailerService } from '../common/mailer/mailer.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
let ConfiguracionSmtpController = class ConfiguracionSmtpController {
    configuracionSmtpService;
    mailerService;
    constructor(configuracionSmtpService, mailerService) {
        this.configuracionSmtpService = configuracionSmtpService;
        this.mailerService = mailerService;
    }
    obtener() {
        return this.configuracionSmtpService.obtener();
    }
    guardar(dto, user) {
        return this.configuracionSmtpService.guardar(dto, user.id);
    }
    eliminar() {
        return this.configuracionSmtpService.eliminar();
    }
    async probar(dto) {
        await this.mailerService.enviarCorreo({
            to: dto.correoDestino,
            subject: 'Correo de prueba — Sistema de Control de Acceso, Terminal de Mollendo',
            html: '<p>Este es un correo de prueba enviado desde la sección "Sistema y APIs" del portal. Si lo recibió, la configuración de SMTP funciona correctamente.</p>',
        });
        return { enviado: true };
    }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConfiguracionSmtpController.prototype, "obtener", null);
__decorate([
    Put(),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpdateConfiguracionSmtpDto, Object]),
    __metadata("design:returntype", void 0)
], ConfiguracionSmtpController.prototype, "guardar", null);
__decorate([
    Delete(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConfiguracionSmtpController.prototype, "eliminar", null);
__decorate([
    Post('probar'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ProbarConfiguracionSmtpDto]),
    __metadata("design:returntype", Promise)
], ConfiguracionSmtpController.prototype, "probar", null);
ConfiguracionSmtpController = __decorate([
    Controller('configuracion/smtp'),
    Roles('administracion'),
    __metadata("design:paramtypes", [ConfiguracionSmtpService,
        MailerService])
], ConfiguracionSmtpController);
export { ConfiguracionSmtpController };
//# sourceMappingURL=configuracion-smtp.controller.js.map