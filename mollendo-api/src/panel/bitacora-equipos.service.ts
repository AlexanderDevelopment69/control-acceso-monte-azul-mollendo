import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import { EstadoSistemaService } from './estado-sistema.service.js';
import { dependeDelControlador, fallasEquipos, textoVuelta, type Falla } from './bitacora-equipos.js';

/** Cada cuánto se revisan los equipos (el controlador informa cada ~5 s; el G4 Pro, cada ~2 s). */
const REVISION_MS = 5 * 1000;
/** Al arrancar el servidor, el controlador y el G4 Pro tardan unos segundos en volver a conectarse: no es una desconexión. */
const ESPERA_INICIAL_MS = 30 * 1000;
/** En la Auditoría, el dato de estos registros. */
export const TABLA_EQUIPOS = 'equipo';

/**
 * Registro de desconexiones en la Auditoría (pedido del usuario, 21/10/2026):
 * cada vez que un equipo o servicio se cae y cada vez que vuelve, con cuánto
 * duró, a nombre de "Sistema". Las fallas abiertas se recuperan de la propia
 * Auditoría al arrancar, así que un reinicio del servidor no las pierde. Si la
 * base de datos no responde, los registros esperan en memoria y se guardan
 * con su hora cuando vuelve.
 */
@Injectable()
export class BitacoraEquiposService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BitacoraEquiposService.name);
  /** Fallas abiertas: por equipo, desde cuándo. */
  private readonly abiertas = new Map<string, Date>();
  private pendientes: Prisma.AuditoriaCreateManyInput[] = [];
  private iniciado = false;
  private arranque: ReturnType<typeof setTimeout> | null = null;
  private revision: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly estadoSistema: EstadoSistemaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    this.arranque = setTimeout(() => {
      void this.revisar();
      this.revision = setInterval(() => void this.revisar(), REVISION_MS);
    }, ESPERA_INICIAL_MS);
  }

  onModuleDestroy() {
    if (this.arranque) clearTimeout(this.arranque);
    if (this.revision) clearInterval(this.revision);
  }

  /** Fallas que quedaron abiertas antes del último arranque (el último registro de cada equipo es una desconexión). */
  private async recuperarAbiertas() {
    const ultimos = await this.prisma.auditoria.findMany({
      where: { tablaAfectada: TABLA_EQUIPOS },
      orderBy: [{ fechaHora: 'desc' }, { id: 'desc' }],
      take: 500,
    });
    const vistos = new Set<string>();
    for (const r of ultimos) {
      const etiqueta = r.detalle?.split(':')[0];
      if (!etiqueta || vistos.has(etiqueta)) continue;
      vistos.add(etiqueta);
      if (r.accion === 'desconexion') this.abiertas.set(etiqueta, r.fechaHora);
    }
  }

  /** Compara lo que está caído ahora con lo anterior y registra lo que cambió. */
  async revisar(ahora = new Date()): Promise<void> {
    try {
      if (!this.iniciado) {
        await this.recuperarAbiertas();
        this.iniciado = true;
      }
    } catch {
      // Sin base de datos: se intenta de nuevo en la próxima revisión.
    }

    let fallas: Falla[];
    let remoto = true;
    let sinControlador = false;
    let soloBase = false;
    try {
      const e = await this.estadoSistema.calcular();
      const estado = {
        fecha: e.api.fecha,
        baseDeDatos: e.baseDeDatos,
        claveEquiposConfigurada: e.integraciones.claveEquiposConfigurada,
        respaldos: e.respaldos,
        dispositivos: e.equipos.dispositivos,
        lectoresDni: e.lectoresDni,
        releMolinetes: e.releMolinetes,
        controlador: e.controladorGarita,
      };
      fallas = fallasEquipos(estado);
      remoto = estado.controlador.remoto;
      sinControlador = estado.controlador.remoto && !estado.controlador.conectado;
    } catch {
      // Sin base de datos no se puede leer el resto: solo se sabe eso.
      fallas = [{ etiqueta: 'Base de datos', caida: 'sin conexión' }];
      soloBase = true;
    }

    const antes = this.pendientes.length;
    const caidas = new Map(fallas.map((f) => [f.etiqueta, f]));
    for (const f of fallas) {
      if (this.abiertas.has(f.etiqueta)) continue;
      this.abiertas.set(f.etiqueta, ahora);
      this.anotar('desconexion', `${f.etiqueta}: ${f.caida}`, ahora);
    }
    for (const [etiqueta, desde] of this.abiertas) {
      if (caidas.has(etiqueta)) continue;
      // Lo que no se pudo revisar sigue como estaba.
      if (soloBase || (sinControlador && dependeDelControlador(etiqueta))) continue;
      this.abiertas.delete(etiqueta);
      this.anotar('reconexion', textoVuelta(etiqueta, ahora.getTime() - desde.getTime(), remoto), ahora);
    }
    // Algo se cayó o volvió: la franja de fallas y "Sistema y APIs" se actualizan en el acto (y juntas).
    if (this.pendientes.length !== antes) this.eventEmitter.emit('equipos.cambio', {});
    await this.guardar();
  }

  private anotar(accion: 'desconexion' | 'reconexion', detalle: string, fechaHora: Date) {
    if (accion === 'desconexion') this.logger.warn(detalle);
    else this.logger.log(detalle);
    this.pendientes.push({ tablaAfectada: TABLA_EQUIPOS, registroId: 0, accion, detalle: detalle.slice(0, 200), fechaHora });
  }

  private async guardar() {
    if (this.pendientes.length === 0) return;
    try {
      await this.prisma.auditoria.createMany({ data: this.pendientes });
      this.pendientes = [];
    } catch {
      // Sin base de datos: se guardan en la próxima revisión, con su hora.
      if (this.pendientes.length > 500) this.pendientes = this.pendientes.slice(-500);
    }
  }
}
