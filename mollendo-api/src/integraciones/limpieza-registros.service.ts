import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

/** Días que se conservan los registros técnicos del G4 Pro y de la espera de ingreso. */
export const DIAS_CONSERVACION = 90;
const MS_POR_DIA = 24 * 60 * 60 * 1000;
/** Primera limpieza un rato después de arrancar (sin competir con el arranque) y luego una vez al día. */
const PRIMERA_LIMPIEZA_MS = 5 * 60 * 1000;
const CADA_DIA_MS = MS_POR_DIA;

/**
 * Borra los registros técnicos viejos, que crecen con cada ingreso y nadie
 * consulta: los comandos ya entregados al G4 Pro (dar y quitar el permiso de
 * paso, registrar personas), las verificaciones que manda el equipo (`rtlog`)
 * y las esperas de ingreso ya cerradas. Con ~2 000 ingresos diarios serían más
 * de un millón de filas al año.
 *
 * No toca los ingresos y salidas (`evento_acceso`), la auditoría, el personal
 * ni sus documentos; tampoco los comandos que el equipo todavía no recogió.
 */
@Injectable()
export class LimpiezaRegistrosService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LimpiezaRegistrosService.name);
  private primera: NodeJS.Timeout | null = null;
  private diaria: NodeJS.Timeout | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.primera = setTimeout(() => void this.limpiar(), PRIMERA_LIMPIEZA_MS);
    this.diaria = setInterval(() => void this.limpiar(), CADA_DIA_MS);
  }

  onModuleDestroy() {
    if (this.primera) clearTimeout(this.primera);
    if (this.diaria) clearInterval(this.diaria);
  }

  /** Borra lo anterior a DIAS_CONSERVACION días; devuelve cuántas filas borró de cada tabla. */
  async limpiar(ahora = new Date()) {
    const antesDe = new Date(ahora.getTime() - DIAS_CONSERVACION * MS_POR_DIA);
    try {
      const [comandos, verificaciones, esperas] = await this.prisma.$transaction([
        this.prisma.comandoDispositivo.deleteMany({ where: { estado: { not: 'pendiente' }, creadoEn: { lt: antesDe } } }),
        this.prisma.verificacionDispositivo.deleteMany({ where: { creadoEn: { lt: antesDe } } }),
        this.prisma.ingresoPendiente.deleteMany({ where: { consumidoEn: { not: null }, creadoEn: { lt: antesDe } } }),
      ]);
      const resultado = { comandos: comandos.count, verificaciones: verificaciones.count, esperas: esperas.count };
      if (resultado.comandos + resultado.verificaciones + resultado.esperas > 0) {
        this.logger.log(
          `Limpieza de registros técnicos de más de ${DIAS_CONSERVACION} días: ${resultado.comandos} comandos del G4 Pro, ${resultado.verificaciones} verificaciones y ${resultado.esperas} esperas de ingreso`,
        );
      }
      return resultado;
    } catch (error) {
      this.logger.error(`No se pudieron limpiar los registros técnicos: ${(error as Error).message}`);
      return null;
    }
  }
}
