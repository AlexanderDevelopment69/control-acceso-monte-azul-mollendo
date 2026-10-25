import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { esDocumentoVigente, ultimasVersiones } from '../eventos-acceso/validacion-acceso.engine.js';
import { DashboardService } from './dashboard.service.js';

function inicioDeHoy(): Date {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return hoy;
}

@Injectable()
export class PanelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboard: DashboardService,
  ) {}

  /**
   * Documentos vencidos que hoy impiden ingresar: solo la última versión de
   * cada documento (las reemplazadas no cuentan) y solo del personal activo,
   * con la misma regla de vigencia que el molinete (vence hoy = vigente).
   */
  private async contarDocumentosVencidos(hoy: Date): Promise<number> {
    const documentos = await this.prisma.documentoPersona.findMany({
      where: { persona: { estado: 'activo' } },
      select: { id: true, personaId: true, tipoDocumentoId: true, version: true, fechaVencimiento: true },
    });

    const porPersona = new Map<number, typeof documentos>();
    for (const doc of documentos) {
      porPersona.set(doc.personaId, [...(porPersona.get(doc.personaId) ?? []), doc]);
    }

    let vencidos = 0;
    for (const docs of porPersona.values()) {
      for (const doc of ultimasVersiones(docs).values()) {
        if (!esDocumentoVigente(doc.fechaVencimiento, hoy)) vencidos++;
      }
    }
    return vencidos;
  }

  async resumen() {
    const desde = inicioDeHoy();

    const [denegacionesHoy, alcoholNoConformeHoy, documentosVencidos, presencia] = await Promise.all([
      this.prisma.eventoAcceso.count({ where: { resultado: 'denegado', fechaHora: { gte: desde } } }),
      this.prisma.eventoAcceso.count({ where: { denegadoPorAlcohol: true, fechaHora: { gte: desde } } }),
      this.contarDocumentosVencidos(new Date()),
      // Personas dentro ahora (como "Presentes actualmente" del Dashboard), para el vigilante.
      this.dashboard.calcularPresenciaActual(new Date()),
    ]);

    return { denegacionesHoy, alcoholNoConformeHoy, documentosVencidos, presentesAhora: presencia.presentes };
  }
}
