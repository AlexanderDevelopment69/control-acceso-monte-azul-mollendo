import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PushSdkService } from './push-sdk.service.js';

/** Cada cuánto se pregunta al equipo facial si el alcoholímetro sigue conectado. */
const REVISION_MS = 60 * 1000;
/** Cuánto se espera la respuesta (el equipo recoge las órdenes cada ~2 s). */
const ESPERA_RESPUESTA_MS = 20 * 1000;

/**
 * El alcoholímetro DT1700 va por USB al G4 Pro, que lo ve como un puerto serie
 * USB "USB Serial" (fabricante 1a86, producto 7523; visto el 21/10/2026: es el
 * único puerto serie del equipo). Se cuentan sus entradas en /sys/bus/usb/devices:
 * responde un número (2 si está, 0 si no). Una sola orden: con varias separadas
 * por ";" el equipo solo devuelve la salida de la última.
 */
export const COMANDO_ALCOHOLIMETRO = 'SHELL cat /sys/bus/usb/devices/*/uevent | grep -c PRODUCT=1a86/7523/';

/** Lo que se sabe del alcoholímetro de un equipo facial. */
export interface EstadoAlcoholimetro {
  /** null: todavía no se sabe (el equipo no respondió o está desconectado). */
  conectado: boolean | null;
  /** Última vez que se revisó con respuesta del equipo. */
  revisado: string | null;
  /** Última vez que se lo vio conectado. */
  conectadoVisto: string | null;
}

/** La respuesta del equipo dice si el alcoholímetro está (null si no trae el número). */
export function alcoholimetroEnRespuesta(respuesta: string): boolean | null {
  const cuenta = /^\s*(\d+)\s*$/m.exec(respuesta);
  return cuenta ? Number(cuenta[1]) > 0 : null;
}

/**
 * Vigila el alcoholímetro de cada equipo facial en línea (parte A, pedido del
 * usuario el 21/10/2026): si se desconecta, "Sistema y APIs", la franja de
 * fallas y la Auditoría lo muestran como un equipo más. Si está conectado pero
 * no mide, no se ve aquí (el equipo solo le habla durante una prueba).
 */
@Injectable()
export class AlcoholimetroService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AlcoholimetroService.name);
  private readonly estados = new Map<string, EstadoAlcoholimetro>();
  private revision: ReturnType<typeof setInterval> | null = null;
  private revisando = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly pushSdk: PushSdkService,
  ) {}

  onModuleInit() {
    this.revision = setInterval(() => void this.revisar(), REVISION_MS);
  }

  onModuleDestroy() {
    if (this.revision) clearInterval(this.revision);
  }

  /** Lo que se sabe del alcoholímetro de ese equipo. */
  estado(serialNumber: string): EstadoAlcoholimetro {
    return this.estados.get(serialNumber) ?? { conectado: null, revisado: null, conectadoVisto: null };
  }

  /** Pregunta a cada equipo en línea; uno sin respuesta queda como estaba. */
  async revisar(): Promise<void> {
    if (this.revisando) return;
    this.revisando = true;
    try {
      const enLinea = new Set((await this.pushSdk.listarEstadoDispositivos()).filter((d) => d.enLinea).map((d) => d.serialNumber));
      const equipos = await this.prisma.dispositivoAcceso.findMany({ select: { id: true, serialNumber: true } });
      for (const equipo of equipos.filter((e) => enLinea.has(e.serialNumber))) {
        const respuesta = await this.pushSdk.consultar(equipo.id, COMANDO_ALCOHOLIMETRO, ESPERA_RESPUESTA_MS, { silencioso: true, temporal: true });
        const conectado = respuesta === null ? null : alcoholimetroEnRespuesta(respuesta);
        if (conectado === null) continue;
        const antes = this.estado(equipo.serialNumber);
        const ahora = new Date().toISOString();
        this.estados.set(equipo.serialNumber, { conectado, revisado: ahora, conectadoVisto: conectado ? ahora : antes.conectadoVisto });
        if (antes.conectado !== conectado) {
          this.logger[conectado ? 'log' : 'warn'](`Alcoholímetro del ${equipo.serialNumber}: ${conectado ? 'conectado' : 'desconectado'}`);
        }
      }
    } catch (error) {
      this.logger.warn(`No se pudo revisar el alcoholímetro: ${(error as Error).message}`);
    } finally {
      this.revisando = false;
    }
  }
}
