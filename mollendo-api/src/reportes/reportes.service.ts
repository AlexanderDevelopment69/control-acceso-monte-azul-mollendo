import { existsSync, statSync } from 'node:fs';
import { extname } from 'node:path';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { rangoDeDias } from '../common/paginacion.js';
import { TABLA_LABEL } from '../auditoria/auditoria.service.js';
import { DashboardService } from '../panel/dashboard.service.js';
import { claveDia, diasDelRango } from '../panel/dashboard.util.js';
import {
  documentosActuales,
  esDocumentoVigente,
  evaluarIngreso,
  ultimasVersiones,
} from '../eventos-acceso/validacion-acceso.engine.js';
import type { QueryReporteDto, TipoReporte } from './dto/query-reporte.dto.js';
import { textoDia, textoDuracion, type Celda, type Reporte } from './reporte.types.js';

/** Periodo máximo de los reportes con fechas. */
const MAX_DIAS = 366;
/** Filas máximas de un reporte (un PDF más largo deja de ser útil). */
const MAX_FILAS = 20_000;
/** Un documento vigente está "por vencer" si vence dentro de estos días (igual que el Dashboard). */
const DIAS_AVISO = 30;
const MS_POR_DIA = 24 * 60 * 60 * 1000;
/** Peso máximo de los archivos de un ZIP de documentos. */
const MAX_BYTES_ZIP = 2 * 1024 * 1024 * 1024;

/** Nombre válido para una carpeta o archivo en Windows, macOS y Linux. */
export function nombreSeguro(texto: string): string {
  // Sin caracteres prohibidos en nombres de archivo ni saltos de línea o tabulaciones.
  const limpio = texto.replace(/[<>:"/\\|?*]/g, '-').replace(/\s+/g, ' ').replace(/[. ]+$/, '').trim();
  return (limpio || 'sin-nombre').slice(0, 80);
}

/** Ruta dentro del ZIP sin repetir: si ya existe, agrega " (2)", " (3)"… */
export function rutaUnica(ruta: string, usados: Set<string>): string {
  let candidata = ruta;
  for (let n = 2; usados.has(candidata.toLowerCase()); n++) {
    const punto = ruta.lastIndexOf('.');
    candidata = punto > ruta.lastIndexOf('/') ? `${ruta.slice(0, punto)} (${n})${ruta.slice(punto)}` : `${ruta} (${n})`;
  }
  usados.add(candidata.toLowerCase());
  return candidata;
}

const ESTADO_PERSONA = { activo: 'Activo', inactivo: 'Dado de baja' } as const;
const ACCION = { crear: 'Crear', modificar: 'Modificar', eliminar: 'Eliminar' } as const;

/** Motivos de denegación de un evento, como en el Panel de vigilancia. */
function motivosEvento(e: {
  denegadoNoRegistrado: boolean;
  denegadoPorBaja: boolean;
  denegadoSinDocumentos: boolean;
  denegadoPorDocumentos: boolean;
  denegadoPorAlcohol: boolean;
}): string {
  const motivos: string[] = [];
  if (e.denegadoNoRegistrado) motivos.push('No registrado');
  if (e.denegadoPorBaja) motivos.push('Dado de baja');
  if (e.denegadoSinDocumentos) motivos.push('Sin documentos');
  if (e.denegadoPorDocumentos) motivos.push('Documentos');
  if (e.denegadoPorAlcohol) motivos.push('Alcohol');
  return motivos.join(', ');
}

@Injectable()
export class ReportesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboard: DashboardService,
  ) {}

  async generar(tipo: TipoReporte, query: QueryReporteDto): Promise<Reporte> {
    const reporte = await this.armar(tipo, query);
    if (reporte.filas.length > MAX_FILAS) {
      throw new BadRequestException(
        `El reporte tiene ${reporte.filas.length} filas (máximo ${MAX_FILAS}). Acota el periodo o los filtros.`,
      );
    }
    return reporte;
  }

  private armar(tipo: TipoReporte, query: QueryReporteDto): Promise<Reporte> {
    switch (tipo) {
      case 'personal':
        return this.personal(query);
      case 'documentos':
        return this.documentos(query);
      case 'movimientos':
        return this.movimientos(query);
      case 'visitas':
        return this.visitas(query);
      case 'presentes':
        return this.presentes();
      case 'auditoria':
        return this.auditoria(query);
    }
  }

  /** Periodo de los reportes con fechas: por defecto hoy; como mucho MAX_DIAS días. */
  private periodo(query: QueryReporteDto) {
    const hoy = claveDia(new Date());
    const desde = query.desde ?? query.hasta ?? hoy;
    const hasta = query.hasta ?? query.desde ?? hoy;
    if (desde > hasta) throw new BadRequestException('La fecha "desde" no puede ser posterior a "hasta"');
    if (diasDelRango(desde, hasta).length > MAX_DIAS) {
      throw new BadRequestException(`El periodo no puede ser mayor a ${MAX_DIAS} días`);
    }
    const texto = desde === hasta ? `Día: ${textoDia(desde)}` : `Periodo: ${textoDia(desde)} al ${textoDia(hasta)}`;
    return { rango: rangoDeDias(desde, hasta)!, texto, sufijo: desde === hasta ? desde : `${desde}_${hasta}` };
  }

  private async filtroEmpresa(empresaId?: number): Promise<string[]> {
    if (empresaId === undefined) return [];
    const empresa = await this.prisma.empresa.findUnique({ where: { id: empresaId } });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');
    return [`Empresa: ${empresa.razonSocial}`];
  }

  /** Personal con su empresa, estado y si hoy puede ingresar (mismo motor que el molinete). */
  private async personal(query: QueryReporteDto): Promise<Reporte> {
    const hoy = new Date();
    const personas = await this.prisma.persona.findMany({
      where: { empresaId: query.empresaId, estado: query.estado },
      include: {
        empresa: { select: { razonSocial: true, ruc: true } },
        documentos: { include: { tipoDocumento: { select: { nombre: true } } } },
      },
      orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
    });
    let pueden = 0;
    const filas: Celda[][] = personas.map((p) => {
      const actuales = documentosActuales(p.documentos, hoy);
      const resultado = evaluarIngreso({ personaActiva: p.estado === 'activo', alcoholConforme: true, documentos: actuales });
      if (resultado.autorizado) pueden++;
      const motivos = resultado.denegadoPorBaja
        ? 'Dado de baja'
        : [
            resultado.denegadoSinDocumentos && 'Sin documentos cargados',
            resultado.documentosVencidos.length > 0 && `Vencido: ${resultado.documentosVencidos.join(', ')}`,
          ]
            .filter(Boolean)
            .join(' · ');
      return [
        p.apellidos,
        p.nombres,
        p.tipoDocumentoIdentidad,
        p.numeroDocumento,
        p.empresa.razonSocial,
        p.empresa.ruc,
        ESTADO_PERSONA[p.estado],
        resultado.autorizado ? 'Sí' : 'No',
        motivos || null,
        actuales.length,
        p.creadoEn,
      ];
    });
    return {
      titulo: 'Personal y empresas',
      archivo: `reporte-personal-${claveDia(hoy)}`,
      filtros: [
        ...(await this.filtroEmpresa(query.empresaId)),
        ...(query.estado ? [`Estado: ${query.estado === 'activo' ? 'Activos' : 'Dados de baja'}`] : []),
        'Puede ingresar: según sus documentos a la fecha (la prueba de alcohol se hace en garita).',
      ],
      columnas: [
        { titulo: 'Apellidos', ancho: 20 },
        { titulo: 'Nombres', ancho: 16 },
        { titulo: 'Tipo doc.', ancho: 8 },
        { titulo: 'N° documento', ancho: 12 },
        { titulo: 'Empresa', ancho: 30 },
        { titulo: 'RUC', ancho: 14 },
        { titulo: 'Estado', ancho: 12 },
        { titulo: 'Puede ingresar', ancho: 10 },
        { titulo: 'Motivo', ancho: 26 },
        { titulo: 'N° docs.', tipo: 'numero', ancho: 9 },
        { titulo: 'Registrado', tipo: 'fechaHora', ancho: 18 },
      ],
      filas,
      resumen: [`Total: ${personas.length}`, `Pueden ingresar: ${pueden}`, `No pueden: ${personas.length - pueden}`],
    };
  }

  /** Última versión de cada documento de cada persona, con su vigencia a hoy. */
  private async documentos(query: QueryReporteDto): Promise<Reporte> {
    return (await this.armarDocumentos(query, false)).reporte;
  }

  /**
   * Reporte de documentos con sus archivos, para el ZIP: el Excel lleva en cada
   * fila un enlace relativo al archivo dentro del ZIP (archivos/empresa/persona/…).
   */
  async documentosConArchivos(query: QueryReporteDto) {
    const { reporte, archivos } = await this.armarDocumentos(query, true);
    if (reporte.filas.length > MAX_FILAS) {
      throw new BadRequestException(`El reporte tiene ${reporte.filas.length} filas (máximo ${MAX_FILAS}). Acota los filtros.`);
    }
    const peso = archivos.reduce((suma, a) => suma + statSync(a.ruta).size, 0);
    if (peso > MAX_BYTES_ZIP) {
      throw new BadRequestException(
        `Los archivos suman ${Math.round(peso / 1024 / 1024)} MB (máximo ${MAX_BYTES_ZIP / 1024 / 1024} MB). Filtra por empresa o por estado.`,
      );
    }
    return { reporte, archivos };
  }

  private async armarDocumentos(query: QueryReporteDto, conArchivos: boolean) {
    const hoy = new Date();
    const inicioDeHoy = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const anteriores = conArchivos && query.incluirAnteriores === 'true';
    const personas = await this.prisma.persona.findMany({
      where: { empresaId: query.empresaId },
      include: {
        empresa: { select: { razonSocial: true } },
        documentos: { include: { tipoDocumento: { select: { nombre: true } } } },
      },
    });
    const estados = { vigente: 'Vigente', por_vencer: 'Por vencer', vencido: 'Vencido' } as const;
    const cuenta = { vigente: 0, por_vencer: 0, vencido: 0 };
    const filas: { orden: number; persona: string; documento: string; version: number; fila: Celda[] }[] = [];
    const archivos: { ruta: string; enZip: string }[] = [];
    const usados = new Set<string>();
    let sinArchivo = 0;

    for (const p of personas) {
      const persona = `${p.apellidos}, ${p.nombres}`;
      const ultimas = ultimasVersiones(p.documentos);
      for (const d of ultimas.values()) {
        const dias = d.fechaVencimiento ? Math.round((d.fechaVencimiento.getTime() - inicioDeHoy) / MS_POR_DIA) : null;
        const estado = !esDocumentoVigente(d.fechaVencimiento, hoy)
          ? 'vencido'
          : dias !== null && dias <= DIAS_AVISO
            ? 'por_vencer'
            : 'vigente';
        cuenta[estado]++;
        if (query.estadoDocumento && query.estadoDocumento !== estado) continue;

        // La versión vigente y, si se pidieron, las reemplazadas (de la más nueva a la más vieja).
        const versiones = anteriores
          ? p.documentos.filter((v) => v.tipoDocumentoId === d.tipoDocumentoId).sort((a, b) => b.version - a.version)
          : [d];
        for (const v of versiones) {
          const actual = v.id === d.id;
          const fila: Celda[] = [
            persona,
            p.numeroDocumento,
            p.empresa.razonSocial,
            ESTADO_PERSONA[p.estado],
            d.tipoDocumento.nombre,
            v.version,
            v.creadoEn,
            v.fechaVencimiento,
            actual ? dias : null,
            actual ? estados[estado] : 'Reemplazado',
          ];
          if (conArchivos) {
            if (v.archivoUrl && existsSync(v.archivoUrl)) {
              const enZip = rutaUnica(
                [
                  'archivos',
                  nombreSeguro(p.empresa.razonSocial),
                  nombreSeguro(`${persona} (${p.numeroDocumento})`),
                  `${nombreSeguro(`${d.tipoDocumento.nombre} v${v.version}`)}${extname(v.archivoUrl).toLowerCase()}`,
                ].join('/'),
                usados,
              );
              archivos.push({ ruta: v.archivoUrl, enZip });
              fila.push({ texto: 'Abrir', enlace: enZip });
            } else {
              sinArchivo++;
              fila.push('No disponible');
            }
          }
          filas.push({ orden: dias ?? Number.MAX_SAFE_INTEGER, persona, documento: d.tipoDocumento.nombre, version: v.version, fila });
        }
      }
    }
    // Primero lo más urgente (vencidos, luego por vencer); las versiones de un mismo documento juntas.
    filas.sort(
      (a, b) =>
        a.orden - b.orden ||
        a.persona.localeCompare(b.persona) ||
        a.documento.localeCompare(b.documento) ||
        b.version - a.version,
    );
    const actuales = filas.filter((f) => f.fila[9] !== 'Reemplazado').length;

    const reporte: Reporte = {
      titulo: 'Documentos por persona',
      archivo: `reporte-documentos-${claveDia(hoy)}`,
      filtros: [
        ...(await this.filtroEmpresa(query.empresaId)),
        ...(query.estadoDocumento ? [`Estado del documento: ${estados[query.estadoDocumento]}`] : []),
        anteriores
          ? `Cada documento con todas sus versiones (las anteriores, como "Reemplazado"). Por vencer: vence en los próximos ${DIAS_AVISO} días.`
          : `Última versión de cada documento. Por vencer: vence en los próximos ${DIAS_AVISO} días.`,
        ...(conArchivos ? ['Columna "Archivo": abre el archivo, que va en la carpeta "archivos" del mismo ZIP.'] : []),
      ],
      columnas: [
        { titulo: 'Persona', ancho: 30 },
        { titulo: 'N° documento', ancho: 13 },
        { titulo: 'Empresa', ancho: 32 },
        { titulo: 'Estado de la persona', ancho: 14 },
        { titulo: 'Documento', ancho: 26 },
        { titulo: 'Versión', tipo: 'numero', ancho: 8 },
        { titulo: 'Cargado', tipo: 'fechaHora', ancho: 16 },
        { titulo: 'Vence', tipo: 'fecha', ancho: 12 },
        { titulo: 'Días para vencer', tipo: 'numero', ancho: 11 },
        { titulo: 'Estado', ancho: 12 },
        ...(conArchivos ? [{ titulo: 'Archivo', ancho: 12 }] : []),
      ],
      filas: filas.map((f) => f.fila),
      resumen: [
        `Documentos: ${actuales}`,
        ...(anteriores ? [`Versiones anteriores: ${filas.length - actuales}`] : []),
        ...(query.estadoDocumento
          ? []
          : [`Vigentes: ${cuenta.vigente}`, `Por vencer: ${cuenta.por_vencer}`, `Vencidos: ${cuenta.vencido}`]),
        ...(conArchivos ? [`Archivos incluidos: ${archivos.length}`] : []),
        ...(sinArchivo ? [`Sin archivo en el servidor: ${sinArchivo}`] : []),
      ],
    };
    return { reporte, archivos };
  }

  /** Historial de ingresos y salidas del periodo, en orden cronológico. */
  private async movimientos(query: QueryReporteDto): Promise<Reporte> {
    const periodo = this.periodo(query);
    const eventos = await this.prisma.eventoAcceso.findMany({
      where: { fechaHora: periodo.rango, tipoMovimiento: query.movimiento, resultado: query.resultado },
      include: { persona: { select: { nombres: true, apellidos: true, empresa: { select: { razonSocial: true } } } } },
      orderBy: [{ fechaHora: 'asc' }, { id: 'asc' }],
    });
    const contar = (mov: string, res: string) =>
      eventos.filter((e) => e.tipoMovimiento === mov && e.resultado === res).length;
    return {
      titulo: 'Ingresos y salidas',
      archivo: `reporte-ingresos-salidas-${periodo.sufijo}`,
      filtros: [
        periodo.texto,
        ...(query.movimiento ? [`Movimiento: ${query.movimiento === 'ingreso' ? 'Ingresos' : 'Salidas'}`] : []),
        ...(query.resultado ? [`Resultado: ${query.resultado === 'autorizado' ? 'Autorizados' : 'Denegados'}`] : []),
      ],
      columnas: [
        { titulo: 'Fecha y hora', tipo: 'fechaHora', ancho: 16 },
        { titulo: 'Movimiento', ancho: 11 },
        { titulo: 'Resultado', ancho: 11 },
        { titulo: 'Tipo doc.', ancho: 9 },
        { titulo: 'N° documento', ancho: 13 },
        { titulo: 'Persona', ancho: 30 },
        { titulo: 'Empresa', ancho: 32 },
        { titulo: 'Motivo', ancho: 26 },
        { titulo: 'Molinete', ancho: 12 },
      ],
      filas: eventos.map((e) => [
        e.fechaHora,
        e.tipoMovimiento === 'ingreso' ? 'Ingreso' : 'Salida',
        e.resultado === 'autorizado' ? 'Autorizado' : 'Denegado',
        e.tipoDocumentoIdentidad,
        e.numeroDocumento,
        e.persona ? `${e.persona.apellidos}, ${e.persona.nombres}` : 'No registrado',
        e.persona?.empresa.razonSocial ?? null,
        e.resultado === 'denegado' ? motivosEvento(e) || null : null,
        e.torniqueteId,
      ]),
      resumen: [
        `Total: ${eventos.length}`,
        `Ingresos autorizados: ${contar('ingreso', 'autorizado')}`,
        `Ingresos denegados: ${contar('ingreso', 'denegado')}`,
        `Salidas: ${contar('salida', 'autorizado')}`,
      ],
    };
  }

  /**
   * Visitas del periodo: cada ingreso autorizado, con la primera salida
   * autorizada posterior de esa persona (si la hay). Igual que el Dashboard.
   */
  private async visitas(query: QueryReporteDto): Promise<Reporte> {
    const periodo = this.periodo(query);
    const ingresos = await this.prisma.eventoAcceso.findMany({
      where: { tipoMovimiento: 'ingreso', resultado: 'autorizado', fechaHora: periodo.rango, personaId: { not: null } },
      include: { persona: { select: { nombres: true, apellidos: true, numeroDocumento: true, empresa: { select: { razonSocial: true } } } } },
      orderBy: [{ fechaHora: 'asc' }, { id: 'asc' }],
    });
    const salidas = ingresos.length
      ? await this.prisma.eventoAcceso.findMany({
          where: {
            tipoMovimiento: 'salida',
            resultado: 'autorizado',
            fechaHora: { gte: periodo.rango.gte },
            personaId: { in: [...new Set(ingresos.map((i) => i.personaId!))] },
          },
          select: { personaId: true, fechaHora: true },
          orderBy: { fechaHora: 'asc' },
        })
      : [];
    const salidasPorPersona = new Map<number, Date[]>();
    for (const s of salidas) salidasPorPersona.set(s.personaId!, [...(salidasPorPersona.get(s.personaId!) ?? []), s.fechaHora]);

    const ahora = new Date();
    let finalizadas = 0;
    const filas: Celda[][] = ingresos.map((i) => {
      const salida = (salidasPorPersona.get(i.personaId!) ?? []).find((s) => s > i.fechaHora) ?? null;
      if (salida) finalizadas++;
      return [
        `${i.persona!.apellidos}, ${i.persona!.nombres}`,
        i.persona!.numeroDocumento,
        i.persona!.empresa.razonSocial,
        i.fechaHora,
        salida,
        textoDuracion((salida ?? ahora).getTime() - i.fechaHora.getTime()),
        salida ? 'Finalizada' : 'Presente',
      ];
    });
    return {
      titulo: 'Visitas del periodo',
      archivo: `reporte-visitas-${periodo.sufijo}`,
      filtros: [
        periodo.texto,
        'Cada ingreso autorizado es una visita. Finalizada: registró su salida; presente: todavía no (duración hasta ahora).',
      ],
      columnas: [
        { titulo: 'Persona', ancho: 30 },
        { titulo: 'N° documento', ancho: 13 },
        { titulo: 'Empresa', ancho: 34 },
        { titulo: 'Ingreso', tipo: 'fechaHora', ancho: 16 },
        { titulo: 'Salida', tipo: 'fechaHora', ancho: 16 },
        { titulo: 'Duración', ancho: 14 },
        { titulo: 'Estado', ancho: 11 },
      ],
      filas,
      resumen: [`Total de visitas: ${ingresos.length}`, `Finalizadas: ${finalizadas}`, `Presentes: ${ingresos.length - finalizadas}`],
    };
  }

  /** Personas dentro del terminal ahora, con su tiempo dentro. */
  private async presentes(): Promise<Reporte> {
    const ahora = new Date();
    const { dentro } = await this.dashboard.calcularPresenciaActual(ahora);
    const personas = await this.prisma.persona.findMany({
      where: { id: { in: dentro.map((d) => d.personaId) } },
      select: { id: true, nombres: true, apellidos: true, numeroDocumento: true, estado: true, empresa: { select: { razonSocial: true } } },
    });
    const porId = new Map(personas.map((p) => [p.id, p]));
    const masDe24h = dentro.filter((d) => ahora.getTime() - d.fechaHora.getTime() > MS_POR_DIA).length;
    return {
      titulo: 'Personal presente',
      archivo: `reporte-presentes-${claveDia(ahora)}`,
      filtros: ['Personas cuyo último movimiento autorizado es un ingreso, de mayor a menor permanencia.'],
      columnas: [
        { titulo: 'Persona', ancho: 30 },
        { titulo: 'N° documento', ancho: 13 },
        { titulo: 'Empresa', ancho: 34 },
        { titulo: 'Estado', ancho: 13 },
        { titulo: 'Ingreso', tipo: 'fechaHora', ancho: 16 },
        { titulo: 'Tiempo dentro', ancho: 14 },
        { titulo: 'Más de 24 h', ancho: 10 },
      ],
      filas: dentro.map((d) => {
        const p = porId.get(d.personaId)!;
        const ms = ahora.getTime() - d.fechaHora.getTime();
        return [
          `${p.apellidos}, ${p.nombres}`,
          p.numeroDocumento,
          p.empresa.razonSocial,
          ESTADO_PERSONA[p.estado],
          d.fechaHora,
          textoDuracion(ms),
          ms > MS_POR_DIA ? 'Sí' : 'No',
        ];
      }),
      resumen: [`Presentes: ${dentro.length}`, `Más de 24 horas: ${masDe24h}`],
    };
  }

  /** Auditoría del periodo, en orden cronológico. */
  private async auditoria(query: QueryReporteDto): Promise<Reporte> {
    const periodo = this.periodo(query);
    const registros = await this.prisma.auditoria.findMany({
      where: { fechaHora: periodo.rango },
      include: { usuario: { select: { correo: true } } },
      orderBy: [{ fechaHora: 'asc' }, { id: 'asc' }],
    });
    return {
      titulo: 'Auditoría',
      archivo: `reporte-auditoria-${periodo.sufijo}`,
      filtros: [periodo.texto],
      columnas: [
        { titulo: 'Fecha y hora', tipo: 'fechaHora', ancho: 16 },
        { titulo: 'Usuario', ancho: 30 },
        { titulo: 'Acción', ancho: 12 },
        { titulo: 'Dato', ancho: 20 },
        { titulo: 'N° de registro', tipo: 'numero', ancho: 13 },
      ],
      filas: registros.map((r) => [
        r.fechaHora,
        r.usuario?.correo ?? 'Sistema',
        ACCION[r.accion],
        TABLA_LABEL[r.tablaAfectada] ?? r.tablaAfectada,
        r.registroId,
      ]),
      resumen: [`Total: ${registros.length}`],
    };
  }
}
