import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { paginacion, rangoDeDias, type ListaPaginadaDto, type Paginado } from '../common/paginacion.js';
import { ultimasVersiones } from '../eventos-acceso/validacion-acceso.engine.js';
import type { QueryDashboardDto } from './dto/query-dashboard.dto.js';
import {
  calcularPresencia,
  calcularVisitas,
  clasificarDocumentos,
  claveDia,
  diasDelRango,
  resumirMovimientos,
} from './dashboard.util.js';

/** Periodo máximo del dashboard, para que la serie diaria siga siendo legible. */
const MAX_DIAS = 366;
/** Empresas que se muestran en el gráfico de personal por empresa. */
const MAX_EMPRESAS = 8;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async obtener(query: QueryDashboardDto) {
    const ahora = new Date();
    const hoy = claveDia(ahora);
    const desde = query.desde ?? hoy;
    const hasta = query.hasta ?? hoy;
    if (desde > hasta) {
      throw new BadRequestException('La fecha "desde" no puede ser posterior a "hasta"');
    }
    const dias = diasDelRango(desde, hasta);
    if (dias.length > MAX_DIAS) {
      throw new BadRequestException(`El periodo no puede ser mayor a ${MAX_DIAS} días`);
    }
    const rango = rangoDeDias(desde, hasta)!;

    const [presencia, visitas, movimientos, personal, porEmpresa, documentos] = await Promise.all([
      this.presencia(ahora),
      this.visitas(rango),
      this.movimientos(rango, dias),
      this.personal(),
      this.personalPorEmpresa(),
      this.documentos(ahora),
    ]);

    return {
      periodo: { desde, hasta },
      generadoEn: ahora.toISOString(),
      presencia,
      visitas,
      movimientos,
      personal,
      porEmpresa,
      documentos,
    };
  }

  /**
   * Último movimiento autorizado de cada persona, por fecha y hora (el id solo
   * desempata). Se buscan solo los ids en SQL y los datos con Prisma, para que
   * las fechas se lean igual que en el resto del sistema.
   */
  /** Último movimiento autorizado de cada persona: quiénes están dentro ahora (también lo usan los reportes). */
  async calcularPresenciaActual(ahora: Date) {
    const ultimos = await this.prisma.$queryRaw<{ id: number }[]>`
      SELECT DISTINCT ON (persona_id) id
      FROM evento_acceso
      WHERE resultado = 'autorizado' AND persona_id IS NOT NULL
      ORDER BY persona_id, fecha_hora DESC, id DESC`;
    const eventos = await this.prisma.eventoAcceso.findMany({
      where: { id: { in: ultimos.map((u) => u.id) } },
      select: { personaId: true, tipoMovimiento: true, fechaHora: true },
    });
    return calcularPresencia(
      eventos.map((e) => ({
        personaId: e.personaId!,
        tipoMovimiento: e.tipoMovimiento,
        fechaHora: e.fechaHora,
      })),
      ahora,
    );
  }

  private async presencia(ahora: Date) {
    const resultado = await this.calcularPresenciaActual(ahora);
    return { presentes: resultado.presentes, masDe24h: resultado.masDe24h.length };
  }

  /**
   * Personas con permanencia mayor a 24 horas, paginadas en el servidor: la de
   * mayor permanencia primero.
   */
  async permanencia(query: ListaPaginadaDto) {
    const { pagina, porPagina, skip, take } = paginacion(query, 10);
    const { masDe24h } = await this.calcularPresenciaActual(new Date());
    const pagina24h = masDe24h.slice(skip, skip + take);
    const personas = await this.prisma.persona.findMany({
      where: { id: { in: pagina24h.map((p) => p.personaId) } },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        numeroDocumento: true,
        empresa: { select: { razonSocial: true } },
      },
    });
    const porId = new Map(personas.map((p) => [p.id, p]));
    const datos = pagina24h.map((p) => {
      const persona = porId.get(p.personaId)!;
      return {
        personaId: p.personaId,
        nombres: persona.nombres,
        apellidos: persona.apellidos,
        numeroDocumento: persona.numeroDocumento,
        empresa: persona.empresa.razonSocial,
        ingreso: p.fechaHora.toISOString(),
      };
    });
    return { datos, total: masDe24h.length, pagina, porPagina } satisfies Paginado<(typeof datos)[number]>;
  }

  /** Visitas del periodo: cada ingreso autorizado de cualquier persona. */
  private async visitas(rango: { gte?: Date; lt?: Date }) {
    const ingresos = await this.prisma.eventoAcceso.findMany({
      where: {
        tipoMovimiento: 'ingreso',
        resultado: 'autorizado',
        fechaHora: rango,
        personaId: { not: null },
      },
      select: { personaId: true, fechaHora: true },
    });
    const salidas = ingresos.length
      ? await this.prisma.eventoAcceso.findMany({
          where: {
            tipoMovimiento: 'salida',
            resultado: 'autorizado',
            fechaHora: { gte: rango.gte },
            personaId: { in: [...new Set(ingresos.map((i) => i.personaId!))] },
          },
          select: { personaId: true, fechaHora: true },
        })
      : [];
    return calcularVisitas(
      ingresos.map((i) => ({ personaId: i.personaId!, fechaHora: i.fechaHora })),
      salidas.map((s) => ({ personaId: s.personaId!, fechaHora: s.fechaHora })),
    );
  }

  private async movimientos(rango: { gte?: Date; lt?: Date }, dias: string[]) {
    const eventos = await this.prisma.eventoAcceso.findMany({
      where: { fechaHora: rango },
      select: {
        tipoMovimiento: true,
        resultado: true,
        fechaHora: true,
        denegadoNoRegistrado: true,
        denegadoPorBaja: true,
        denegadoSinDocumentos: true,
        denegadoPorDocumentos: true,
        denegadoPorAlcohol: true,
        denegadoSinVerificacion: true,
        denegadoRostroNoCoincide: true,
      },
    });
    return resumirMovimientos(eventos, dias);
  }

  /** Personal registrado, activo y dado de baja. */
  private async personal() {
    const [activos, dadosDeBaja] = await Promise.all([
      this.prisma.persona.count({ where: { estado: 'activo' } }),
      this.prisma.persona.count({ where: { estado: 'inactivo' } }),
    ]);
    return { total: activos + dadosDeBaja, activos, dadosDeBaja };
  }

  /** Empresas con más personas activas (el resto se agrupa en "Otras"). */
  private async personalPorEmpresa() {
    const grupos = await this.prisma.persona.groupBy({
      by: ['empresaId'],
      where: { estado: 'activo' },
      _count: { _all: true },
    });
    const empresas = await this.prisma.empresa.findMany({
      where: { id: { in: grupos.map((g) => g.empresaId) } },
      select: { id: true, razonSocial: true },
    });
    const nombre = new Map(empresas.map((e) => [e.id, e.razonSocial]));
    const ordenadas = grupos
      .map((g) => ({ empresa: nombre.get(g.empresaId) ?? '—', activos: g._count._all }))
      .sort((a, b) => b.activos - a.activos || a.empresa.localeCompare(b.empresa));
    const primeras = ordenadas.slice(0, MAX_EMPRESAS);
    const otras = ordenadas.slice(MAX_EMPRESAS).reduce((suma, e) => suma + e.activos, 0);
    return otras > 0 ? [...primeras, { empresa: 'Otras', activos: otras }] : primeras;
  }

  /** Documentos del personal activo (última versión de cada uno). */
  private async documentos(hoy: Date) {
    const documentos = await this.prisma.documentoPersona.findMany({
      where: { persona: { estado: 'activo' } },
      select: { id: true, personaId: true, tipoDocumentoId: true, version: true, fechaVencimiento: true },
    });
    const porPersona = new Map<number, typeof documentos>();
    for (const doc of documentos) {
      porPersona.set(doc.personaId, [...(porPersona.get(doc.personaId) ?? []), doc]);
    }
    const actuales = [...porPersona.values()].flatMap((docs) => [...ultimasVersiones(docs).values()]);
    return clasificarDocumentos(
      actuales.map((d) => d.fechaVencimiento),
      hoy,
    );
  }
}
