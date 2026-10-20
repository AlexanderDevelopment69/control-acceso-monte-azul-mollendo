import { BadRequestException, Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { paginacion, rangoDeDias, type ListaPaginadaDto, type Paginado } from '../common/paginacion.js';
import { ultimasVersiones } from '../eventos-acceso/validacion-acceso.engine.js';
import type { QueryDashboardDto } from './dto/query-dashboard.dto.js';
import {
  calcularPresencia,
  clasificarDocumentos,
  claveDia,
  diasDelRango,
  resumirMovimientos,
  type GrupoMovimientos,
} from './dashboard.util.js';
import { calcularHorasHombre, horasDecimales } from './horas-hombre.util.js';
import { PERFIL_LABEL, PERFILES, SIN_PERFIL } from '../personas/perfiles.js';

/**
 * Para las horas-hombre se leen también los movimientos de 7 días antes y
 * después del periodo: así se emparejan las visitas que lo cruzan.
 */
const MARGEN_HORAS_HOMBRE_MS = 7 * 24 * 60 * 60 * 1000;

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

    const [presencia, visitas, horasHombre, porPerfil, movimientos, personal, porEmpresa, documentos] = await Promise.all([
      this.presencia(ahora),
      this.visitas(rango as { gte: Date; lt: Date }),
      this.horasHombre(rango as { gte: Date; lt: Date }),
      this.ingresosPorPerfil(rango),
      this.movimientos(rango as { gte: Date; lt: Date }, dias),
      this.personal(),
      this.personalPorEmpresa(),
      this.documentos(ahora),
    ]);

    return {
      periodo: { desde, hasta },
      generadoEn: ahora.toISOString(),
      presencia,
      visitas,
      horasHombre,
      porPerfil,
      movimientos,
      personal,
      porEmpresa,
      documentos,
    };
  }

  /**
   * Último movimiento autorizado de cada persona (por fecha y hora; el id solo
   * desempata): quiénes están dentro ahora (también lo usan los reportes). Se
   * busca persona por persona con el índice (persona_id, fecha_hora), sin
   * recorrer todo el historial: con un año de movimientos simulado (1,15
   * millones), 14 ms en vez de 900. Se buscan solo los ids en SQL y los datos
   * con Prisma, para que las fechas se lean igual que en el resto del sistema.
   */
  async calcularPresenciaActual(ahora: Date) {
    const ultimos = await this.prisma.$queryRaw<{ id: number }[]>`
      SELECT e.id
      FROM persona p
      CROSS JOIN LATERAL (
        SELECT id FROM evento_acceso
        WHERE persona_id = p.id AND resultado = 'autorizado'
        ORDER BY fecha_hora DESC, id DESC
        LIMIT 1
      ) e`;
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

  /**
   * Horas-hombre del periodo (ver horas-hombre.util.ts): visitas con ingreso y
   * salida, recortadas al periodo. También las usa el reporte de horas-hombre,
   * con su detalle.
   */
  async calcularHorasHombre(rango: { gte: Date; lt: Date }, persona?: Prisma.PersonaWhereInput) {
    const movimientos = await this.prisma.eventoAcceso.findMany({
      where: {
        resultado: 'autorizado',
        personaId: { not: null },
        ...(persona && { persona }),
        fechaHora: {
          gte: new Date(rango.gte.getTime() - MARGEN_HORAS_HOMBRE_MS),
          lt: new Date(rango.lt.getTime() + MARGEN_HORAS_HOMBRE_MS),
        },
      },
      select: { personaId: true, tipoMovimiento: true, fechaHora: true, correccionManual: true },
    });
    return calcularHorasHombre(
      movimientos.map((m) => ({
        personaId: m.personaId!,
        tipoMovimiento: m.tipoMovimiento,
        fechaHora: m.fechaHora,
        correccionManual: m.correccionManual,
      })),
      rango.gte,
      rango.lt,
    );
  }

  /**
   * Horas-hombre del periodo por empresa, de mayor a menor (las primeras
   * MAX_EMPRESAS y "Otras"), para el gráfico. Se calculan en la base de datos
   * con la misma regla que calcularHorasHombre (que usa el reporte, con su
   * detalle): cada ingreso con el movimiento siguiente de la persona si es una
   * salida, sin correcciones manuales, recortado al periodo, con los
   * movimientos de 7 días antes y después. Así un año no trae un millón de
   * filas a la API (con un año simulado, 8 s → menos de 1 s).
   */
  private async horasHombre(rango: { gte: Date; lt: Date }) {
    const desde = new Date(rango.gte.getTime() - MARGEN_HORAS_HOMBRE_MS).toISOString();
    const hasta = new Date(rango.lt.getTime() + MARGEN_HORAS_HOMBRE_MS).toISOString();
    const inicio = rango.gte.toISOString();
    const fin = rango.lt.toISOString();
    const filas = await this.prisma.$queryRaw<{ empresa: string; visitas: number; ms: number }[]>`
      WITH movimientos AS (
        SELECT persona_id, tipo_movimiento, fecha_hora, correccion_manual,
          LEAD(tipo_movimiento) OVER siguiente AS siguiente_tipo,
          LEAD(fecha_hora) OVER siguiente AS siguiente_hora,
          LEAD(correccion_manual) OVER siguiente AS siguiente_a_mano
        FROM evento_acceso
        WHERE resultado = 'autorizado' AND persona_id IS NOT NULL
          AND fecha_hora >= (${desde}::timestamptz AT TIME ZONE 'UTC')
          AND fecha_hora < (${hasta}::timestamptz AT TIME ZONE 'UTC')
        WINDOW siguiente AS (PARTITION BY persona_id ORDER BY fecha_hora, id)
      ),
      visitas AS (
        SELECT persona_id,
          EXTRACT(EPOCH FROM LEAST(siguiente_hora, ${fin}::timestamptz AT TIME ZONE 'UTC')
            - GREATEST(fecha_hora, ${inicio}::timestamptz AT TIME ZONE 'UTC')) * 1000 AS ms
        FROM movimientos
        WHERE tipo_movimiento = 'ingreso' AND siguiente_tipo = 'salida' AND NOT correccion_manual AND NOT siguiente_a_mano
      )
      SELECT e.razon_social AS empresa, count(*)::int AS visitas, sum(v.ms)::float8 AS ms
      FROM visitas v
      JOIN persona p ON p.id = v.persona_id
      JOIN empresa e ON e.id = p.empresa_id
      WHERE v.ms > 0
      GROUP BY e.razon_social`;
    const ordenadas = filas
      .map((f) => ({ empresa: f.empresa, ms: f.ms }))
      .sort((a, b) => b.ms - a.ms || a.empresa.localeCompare(b.empresa));
    const otras = ordenadas.slice(MAX_EMPRESAS).reduce((suma, e) => suma + e.ms, 0);
    const porEmpresa = [...ordenadas.slice(0, MAX_EMPRESAS), ...(otras > 0 ? [{ empresa: 'Otras', ms: otras }] : [])];
    return {
      horas: horasDecimales(filas.reduce((suma, f) => suma + f.ms, 0)),
      visitas: filas.reduce((suma, f) => suma + f.visitas, 0),
      porEmpresa: porEmpresa.map((e) => ({ empresa: e.empresa, horas: horasDecimales(e.ms) })),
    };
  }

  private async presencia(ahora: Date) {
    const resultado = await this.calcularPresenciaActual(ahora);
    return { presentes: resultado.presentes, masDe12h: resultado.masDe12h.length };
  }

  /**
   * Personas con permanencia mayor a 12 horas, paginadas en el servidor: la de
   * mayor permanencia primero.
   */
  async permanencia(query: ListaPaginadaDto) {
    const { pagina, porPagina, skip, take } = paginacion(query, 10);
    const { masDe12h } = await this.calcularPresenciaActual(new Date());
    const paginaLarga = masDe12h.slice(skip, skip + take);
    const personas = await this.prisma.persona.findMany({
      where: { id: { in: paginaLarga.map((p) => p.personaId) } },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        numeroDocumento: true,
        empresa: { select: { razonSocial: true } },
      },
    });
    const porId = new Map(personas.map((p) => [p.id, p]));
    const datos = paginaLarga.map((p) => {
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
    return { datos, total: masDe12h.length, pagina, porPagina } satisfies Paginado<(typeof datos)[number]>;
  }

  /**
   * Todas las personas dentro ahora (último movimiento autorizado = ingreso), de
   * mayor a menor tiempo dentro, para la lista de "Presentes actualmente". Sin
   * paginar: la ventana busca y filtra en la pantalla.
   */
  async presentes() {
    const ahora = new Date();
    const { dentro } = await this.calcularPresenciaActual(ahora);
    const personas = await this.prisma.persona.findMany({
      where: { id: { in: dentro.map((d) => d.personaId) } },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        numeroDocumento: true,
        perfil: true,
        empresa: { select: { razonSocial: true } },
      },
    });
    const porId = new Map(personas.map((p) => [p.id, p]));
    const datos = dentro
      .filter((d) => porId.has(d.personaId))
      .map((d) => {
        const p = porId.get(d.personaId)!;
        return {
          personaId: p.id,
          nombres: p.nombres,
          apellidos: p.apellidos,
          numeroDocumento: p.numeroDocumento,
          perfil: p.perfil,
          empresa: p.empresa.razonSocial,
          ingreso: d.fechaHora.toISOString(),
        };
      });
    return { generadoEn: ahora.toISOString(), datos };
  }

  /**
   * Visitas del periodo: cada ingreso autorizado de cualquier persona. Está
   * finalizada si la persona registró una salida autorizada después; basta su
   * última salida. Se cuenta en la base de datos (con un año, 3 s → menos de 1 s).
   */
  private async visitas(rango: { gte: Date; lt: Date }) {
    const [r] = await this.prisma.$queryRaw<{ total: number; finalizadas: number }[]>`
      WITH ultima_salida AS (
        SELECT persona_id, max(fecha_hora) AS hora
        FROM evento_acceso
        WHERE tipo_movimiento = 'salida' AND resultado = 'autorizado' AND persona_id IS NOT NULL
          AND fecha_hora >= (${rango.gte.toISOString()}::timestamptz AT TIME ZONE 'UTC')
        GROUP BY persona_id
      )
      SELECT count(*)::int AS total, count(*) FILTER (WHERE s.hora > i.fecha_hora)::int AS finalizadas
      FROM evento_acceso i
      LEFT JOIN ultima_salida s USING (persona_id)
      WHERE i.tipo_movimiento = 'ingreso' AND i.resultado = 'autorizado' AND i.persona_id IS NOT NULL
        AND i.fecha_hora >= (${rango.gte.toISOString()}::timestamptz AT TIME ZONE 'UTC')
        AND i.fecha_hora < (${rango.lt.toISOString()}::timestamptz AT TIME ZONE 'UTC')`;
    return { total: r.total, finalizadas: r.finalizadas, presentes: r.total - r.finalizadas };
  }

  /**
   * Los movimientos del periodo se cuentan en la base de datos (por día local,
   * tipo, resultado y motivo): con un año de datos no se traen un millón de filas.
   * Las fechas se guardan en UTC; el día es el de la zona del servidor (Lima).
   */
  private async movimientos(rango: { gte: Date; lt: Date }, dias: string[]) {
    const zona = process.env.TZ ?? 'America/Lima';
    const grupos = await this.prisma.$queryRaw<GrupoMovimientos[]>`
      SELECT
        to_char((fecha_hora AT TIME ZONE 'UTC') AT TIME ZONE ${zona}, 'YYYY-MM-DD') AS dia,
        tipo_movimiento::text AS "tipoMovimiento",
        resultado::text AS resultado,
        count(*)::int AS cantidad,
        count(*) FILTER (WHERE denegado_no_registrado)::int AS "noRegistrado",
        count(*) FILTER (WHERE denegado_por_baja)::int AS "dadoDeBaja",
        count(*) FILTER (WHERE denegado_sin_documentos)::int AS "sinDocumentos",
        count(*) FILTER (WHERE denegado_por_documentos)::int AS documentos,
        count(*) FILTER (WHERE denegado_por_alcohol)::int AS alcohol,
        -- En "facial primero", no hacer rostro y alcohol o no pasar el DNI a tiempo también es no completar el ingreso.
        count(*) FILTER (WHERE denegado_sin_verificacion OR denegado_sin_facial OR denegado_sin_dni)::int AS "sinVerificacion",
        -- Facial primero: sopló otra persona que la del DNI (el rostro no es el de quien pasó el DNI).
        count(*) FILTER (WHERE denegado_rostro_no_coincide OR denegado_no_es_quien_soplo)::int AS "rostroNoCoincide",
        count(*) FILTER (WHERE denegado_ya_dentro)::int AS "yaDentro",
        count(*) FILTER (WHERE denegado_sin_ingreso)::int AS "sinIngreso"
      FROM evento_acceso
      WHERE fecha_hora >= (${rango.gte.toISOString()}::timestamptz AT TIME ZONE 'UTC')
        AND fecha_hora < (${rango.lt.toISOString()}::timestamptz AT TIME ZONE 'UTC')
      GROUP BY 1, 2, 3`;
    return resumirMovimientos(grupos, dias);
  }

  /**
   * Ingresos autorizados del periodo por perfil de la persona (en el orden de
   * los perfiles; "Sin perfil" al final). Los perfiles sin ingresos no se muestran.
   */
  private async ingresosPorPerfil(rango: { gte?: Date; lt?: Date }) {
    const porPersona = await this.prisma.eventoAcceso.groupBy({
      by: ['personaId'],
      where: { tipoMovimiento: 'ingreso', resultado: 'autorizado', fechaHora: rango, personaId: { not: null } },
      _count: { _all: true },
    });
    const personas = await this.prisma.persona.findMany({
      where: { id: { in: porPersona.map((p) => p.personaId!) } },
      select: { id: true, perfil: true },
    });
    const perfilDe = new Map(personas.map((p) => [p.id, p.perfil]));
    const ingresos = new Map<string | null, number>();
    for (const p of porPersona) {
      const perfil = perfilDe.get(p.personaId!) ?? null;
      ingresos.set(perfil, (ingresos.get(perfil) ?? 0) + p._count._all);
    }
    return [...PERFILES, null]
      .map((perfil) => ({ perfil: perfil ? PERFIL_LABEL[perfil] : SIN_PERFIL, ingresos: ingresos.get(perfil) ?? 0 }))
      .filter((p) => p.ingresos > 0);
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
      const propios = porPersona.get(doc.personaId);
      if (propios) propios.push(doc);
      else porPersona.set(doc.personaId, [doc]);
    }
    const actuales = [...porPersona.values()].flatMap((docs) => [...ultimasVersiones(docs).values()]);
    return clasificarDocumentos(
      actuales.map((d) => d.fechaVencimiento),
      hoy,
    );
  }
}
