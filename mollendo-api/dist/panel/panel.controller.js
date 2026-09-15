var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Get } from '@nestjs/common';
import { PanelService } from './panel.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
let PanelController = class PanelController {
    panelService;
    prisma;
    constructor(panelService, prisma) {
        this.panelService = panelService;
        this.prisma = prisma;
    }
    resumen() {
        return this.panelService.resumen();
    }
    async health() {
        const inicio = Date.now();
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return { status: 'ok', database: 'up', latenciaMs: Date.now() - inicio, fecha: new Date().toISOString() };
        }
        catch {
            return { status: 'degraded', database: 'down', latenciaMs: Date.now() - inicio, fecha: new Date().toISOString() };
        }
    }
    async estadoSistema() {
        const inicio = Date.now();
        let baseDeDatos;
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            baseDeDatos = { estado: 'up', latenciaMs: Date.now() - inicio };
        }
        catch {
            baseDeDatos = { estado: 'down', latenciaMs: Date.now() - inicio };
        }
        return {
            api: {
                estado: 'up',
                entorno: process.env.NODE_ENV ?? 'development',
                uptimeSegundos: Math.round(process.uptime()),
                nodeVersion: process.version,
                fecha: new Date().toISOString(),
            },
            baseDeDatos,
            integraciones: {
                smtpConfigurado: !!process.env.SMTP_HOST,
                claveEquiposConfigurada: !!process.env.DEVICE_API_KEY,
            },
            websocket: { namespace: '/ws/eventos' },
        };
    }
};
__decorate([
    Get('panel/resumen'),
    Roles('administracion', 'vigilancia'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PanelController.prototype, "resumen", null);
__decorate([
    Get('health'),
    Public(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PanelController.prototype, "health", null);
__decorate([
    Get('panel/estado-sistema'),
    Roles('administracion'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PanelController.prototype, "estadoSistema", null);
PanelController = __decorate([
    Controller(),
    __metadata("design:paramtypes", [PanelService,
        PrismaService])
], PanelController);
export { PanelController };
//# sourceMappingURL=panel.controller.js.map