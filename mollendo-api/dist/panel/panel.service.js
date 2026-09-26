var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
function inicioDeHoy() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return hoy;
}
let PanelService = class PanelService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async resumen() {
        const desde = inicioDeHoy();
        const [denegacionesHoy, alcoholNoConformeHoy, documentosVencidos] = await Promise.all([
            this.prisma.eventoAcceso.count({ where: { resultado: 'denegado', fechaHora: { gte: desde } } }),
            this.prisma.eventoAcceso.count({ where: { denegadoPorAlcohol: true, fechaHora: { gte: desde } } }),
            this.prisma.documentoPersona.count({ where: { fechaVencimiento: { lt: desde } } }),
        ]);
        return { denegacionesHoy, alcoholNoConformeHoy, documentosVencidos };
    }
};
PanelService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], PanelService);
export { PanelService };
//# sourceMappingURL=panel.service.js.map