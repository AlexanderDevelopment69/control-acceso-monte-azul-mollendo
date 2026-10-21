import { Injectable, NotFoundException } from '@nestjs/common';
import QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import type { TarjetaContingencia } from '../generated/prisma/client.js';
import { paginacion, rangoDeDias, type Paginado } from '../common/paginacion.js';
import { generarCodigoTarjeta, tarjetaVencida } from './tarjeta-contingencia.util.js';
import type { ActualizarTarjetaDto, CrearTarjetaDto, QueryUsosTarjetaDto } from './dto/tarjeta-contingencia.dto.js';

/** La tarjeta para el portal, sin el código (solo va en el QR que se imprime). */
export interface TarjetaVista {
  id: number;
  numero: number;
  nombre: string;
  activa: boolean;
  vencida: boolean;
  /** Último día en que sirve (AAAA-MM-DD), o null si no vence. */
  venceEl: string | null;
  creadaEn: string;
  codigoCambiadoEn: string;
  ultimoUso: string | null;
}

/** Resultado de revisar una tarjeta pasada por el lector. */
export type TarjetaRevisada = { tarjeta: TarjetaContingencia } | { rechazo: string; tarjetaId: number | null };

export const nombreTarjeta = (numero: number) => `Tarjeta de contingencia ${numero}`;

const fechaDb = (dia: string | null | undefined) => (dia ? new Date(`${dia}T00:00:00Z`) : null);

/**
 * Tarjetas de contingencia: las crea, imprime, desactiva y vence el
 * administrador; el vigilante solo las ve. Cada vez que una se pasa por un
 * lector queda anotada (anotarUso), aceptada o no.
 */
@Injectable()
export class TarjetasContingenciaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async listar(): Promise<TarjetaVista[]> {
    const tarjetas = await this.prisma.tarjetaContingencia.findMany({ orderBy: { numero: 'asc' } });
    const usos = await this.prisma.usoTarjetaContingencia.groupBy({
      by: ['tarjetaId'],
      where: { tarjetaId: { in: tarjetas.map((t) => t.id) } },
      _max: { fechaHora: true },
    });
    const ultimo = new Map(usos.map((u) => [u.tarjetaId, u._max.fechaHora]));
    return tarjetas.map((t) => this.vista(t, ultimo.get(t.id) ?? null));
  }

  private vista(t: TarjetaContingencia, ultimoUso: Date | null): TarjetaVista {
    return {
      id: t.id,
      numero: t.numero,
      nombre: nombreTarjeta(t.numero),
      activa: t.activa,
      vencida: tarjetaVencida(t.venceEl),
      venceEl: t.venceEl ? t.venceEl.toISOString().slice(0, 10) : null,
      creadaEn: t.creadaEn.toISOString(),
      codigoCambiadoEn: t.codigoCambiadoEn.toISOString(),
      ultimoUso: ultimoUso?.toISOString() ?? null,
    };
  }

  private async buscar(id: number) {
    const tarjeta = await this.prisma.tarjetaContingencia.findUnique({ where: { id } });
    if (!tarjeta) throw new NotFoundException('Tarjeta no encontrada');
    return tarjeta;
  }

  async crear(dto: CrearTarjetaDto, usuarioId: number): Promise<TarjetaVista> {
    const ultima = await this.prisma.tarjetaContingencia.aggregate({ _max: { numero: true } });
    const tarjeta = await this.prisma.tarjetaContingencia.create({
      data: { numero: (ultima._max.numero ?? 0) + 1, codigo: generarCodigoTarjeta(), venceEl: fechaDb(dto.venceEl) },
    });
    await this.auditoria.registrar({ usuarioId, tablaAfectada: 'tarjeta_contingencia', registroId: tarjeta.id, accion: 'crear' });
    return this.vista(tarjeta, null);
  }

  /** Activar o desactivar, y cambiar el vencimiento (null: que no venza). */
  async actualizar(id: number, dto: ActualizarTarjetaDto, usuarioId: number): Promise<TarjetaVista> {
    await this.buscar(id);
    const tarjeta = await this.prisma.tarjetaContingencia.update({
      where: { id },
      data: {
        ...(dto.activa !== undefined && { activa: dto.activa }),
        ...(dto.venceEl !== undefined && { venceEl: fechaDb(dto.venceEl) }),
      },
    });
    await this.auditoria.registrar({ usuarioId, tablaAfectada: 'tarjeta_contingencia', registroId: id, accion: 'modificar' });
    return this.vista(tarjeta, null);
  }

  /** Código nuevo (p. ej. se perdió o se fotografió la tarjeta): la impresa antes deja de servir. */
  async cambiarCodigo(id: number, usuarioId: number): Promise<TarjetaVista> {
    await this.buscar(id);
    const tarjeta = await this.prisma.tarjetaContingencia.update({
      where: { id },
      data: { codigo: generarCodigoTarjeta(), codigoCambiadoEn: new Date() },
    });
    await this.auditoria.registrar({ usuarioId, tablaAfectada: 'tarjeta_contingencia', registroId: id, accion: 'modificar' });
    return this.vista(tarjeta, null);
  }

  /** El QR de la tarjeta (SVG) para imprimirla. */
  async qr(id: number): Promise<string> {
    const tarjeta = await this.buscar(id);
    return QRCode.toString(tarjeta.codigo, { type: 'svg', errorCorrectionLevel: 'M', margin: 2 });
  }

  /** ¿Sirve la tarjeta que leyó el lector? Registrada, activa y sin vencer. */
  async revisar(codigo: string): Promise<TarjetaRevisada> {
    const tarjeta = await this.prisma.tarjetaContingencia.findUnique({ where: { codigo } });
    if (!tarjeta) return { rechazo: 'Tarjeta no registrada (o con un código cambiado)', tarjetaId: null };
    if (!tarjeta.activa) return { rechazo: 'Tarjeta desactivada', tarjetaId: tarjeta.id };
    if (tarjetaVencida(tarjeta.venceEl)) return { rechazo: 'Tarjeta vencida', tarjetaId: tarjeta.id };
    return { tarjeta };
  }

  async anotarUso(uso: {
    tarjetaId: number | null;
    tipoMovimiento: 'ingreso' | 'salida';
    aceptada: boolean;
    detalle: string;
    eventoAccesoId?: number;
  }): Promise<void> {
    await this.prisma.usoTarjetaContingencia.create({ data: { ...uso, detalle: uso.detalle.slice(0, 200) } });
  }

  /** Cada vez que se pasó una tarjeta, más recientes primero, con el trabajador del ingreso o la salida. */
  async usos(query: QueryUsosTarjetaDto) {
    const { pagina, porPagina, skip, take } = paginacion(query, 10);
    const where = { fechaHora: rangoDeDias(query.desde, query.hasta) };
    const [filas, total] = await Promise.all([
      this.prisma.usoTarjetaContingencia.findMany({
        where,
        include: { tarjeta: { select: { numero: true } } },
        orderBy: [{ fechaHora: 'desc' }, { id: 'desc' }],
        skip,
        take,
      }),
      this.prisma.usoTarjetaContingencia.count({ where }),
    ]);
    const ids = filas.map((f) => f.eventoAccesoId).filter((id): id is number => id !== null);
    const eventos = await this.prisma.eventoAcceso.findMany({
      where: { id: { in: ids } },
      select: { id: true, resultado: true, persona: { select: { nombres: true, apellidos: true, numeroDocumento: true } } },
    });
    const evento = new Map(eventos.map((e) => [e.id, e]));
    const datos = filas.map((f) => {
      const e = f.eventoAccesoId ? evento.get(f.eventoAccesoId) : undefined;
      return {
        id: f.id,
        fechaHora: f.fechaHora.toISOString(),
        tarjeta: f.tarjeta ? nombreTarjeta(f.tarjeta.numero) : null,
        tipoMovimiento: f.tipoMovimiento,
        aceptada: f.aceptada,
        detalle: f.detalle,
        resultado: e?.resultado ?? null,
        persona: e?.persona ? `${e.persona.nombres} ${e.persona.apellidos}` : null,
        numeroDocumento: e?.persona?.numeroDocumento ?? null,
      };
    });
    return { datos, total, pagina, porPagina } satisfies Paginado<(typeof datos)[number]>;
  }
}
