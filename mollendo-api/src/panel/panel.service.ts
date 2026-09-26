import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

function inicioDeHoy(): Date {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return hoy;
}

@Injectable()
export class PanelService {
  constructor(private readonly prisma: PrismaService) {}

  async resumen() {
    const desde = inicioDeHoy();

    const [denegacionesHoy, alcoholNoConformeHoy, documentosVencidos] = await Promise.all([
      this.prisma.eventoAcceso.count({ where: { resultado: 'denegado', fechaHora: { gte: desde } } }),
      this.prisma.eventoAcceso.count({ where: { denegadoPorAlcohol: true, fechaHora: { gte: desde } } }),
      this.prisma.documentoPersona.count({ where: { fechaVencimiento: { lt: desde } } }),
    ]);

    return { denegacionesHoy, alcoholNoConformeHoy, documentosVencidos };
  }
}
