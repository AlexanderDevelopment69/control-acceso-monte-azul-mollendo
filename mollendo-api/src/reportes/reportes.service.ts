import { existsSync, statSync } from 'node:fs';
import { extname } from 'node:path';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { rangoDeDias } from '../common/paginacion.js';
import { TABLA_LABEL } from '../auditoria/auditoria.service.js';
import { DashboardService } from '../panel/dashboard.service.js';
import { claveDia, diasDelRango, HORAS_PERMANENCIA_LARGA, MS_PERMANENCIA_LARGA } from '../panel/dashboard.util.js';
import {
  documentosActuales,
  esDocumentoVigente,
  evaluarIngreso,
  ultimasVersiones,
} from '../eventos-acceso/validacion-acceso.engine.js';
import { PERFIL_LABEL, PERFILES, SIN_PERFIL, textoPerfil } from '../personas/perfiles.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { QueryReporteDto, TipoReporte } from './dto/query-reporte.dto.js';
import { textoDia, textoDuracion, textoHoras, type Celda, type Reporte } from './reporte.types.js';

/** Periodo máximo de los reportes con fechas. */
const MAX_DIAS = 366;
/**
 * Filas máximas de un reporte. En Excel alcanza para un mes de movimientos con
 * miles de personas (~75 000 filas con 2 000); en PDF, uno más largo deja de
 * ser útil (y el ZIP de documentos se arma igual que el PDF: con un tope menor).
 */
const MAX_FILAS_EXCEL = 100_000;
const MAX_FILAS_PDF = 20_000;

/** Tope de filas según el formato pedido. */
function maxFilas(query: QueryReporteDto): number {
  return query.formato === 'xlsx' ? MAX_FILAS_EXCEL : MAX_FILAS_PDF;
}

/** 75556 → "75 556" (sin depender del idioma instalado en el servidor). */
const miles = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function demasiadasFilas(filas: number, maximo: number, sugerencia = 'Acote el periodo o los filtros.') {
  const formato = maximo === MAX_FILAS_EXCEL ? 'Excel' : 'PDF';
  return new BadRequestException(
    `El reporte tiene ${miles(filas)} filas (máximo ${miles(maximo)} en ${formato}). ${sugerencia}`,
  );
}
/** Un documento vigente está "por vencer" si vence dentro de estos días (igual que el Dashboard). */
const DIAS_AVISO = 30;
const MS_POR_DIA = 24 * 60 * 60 * 1000;
/** Peso máximo de los archivos de un ZIP de documentos. */
const MAX_BYTES_ZIP = 2 * 1024 * 1024 * 1024;

/**
 * Nombre de carpeta o archivo solo con letras sin tilde, números, "_", "-" y
 * ".": los enlaces del Excel no fallan por espacios, tildes o la ñ (Excel los
 * codifica como %20 y algunos visores no los encuentran). "Pérez, José" → "Perez_Jose".
 */
export function nombreSeguro(texto: string): string {
  const limpio = texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^A-Za-z0-9.-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^[._-]+|[._-]+$/g, '');
  return (limpio || 'sin_nombre').slice(0, 80);
}

/** Ruta dentro del ZIP sin repetir: si ya existe, agrega "_2", "_3"… */
export function rutaUnica(ruta: string, usados: Set<string>): string {
  let candidata = ruta;
  for (let n = 2; usados.has(candidata.toLowerCase()); n++) {
    const punto = ruta.lastIndexOf('.');
    candidata = punto > ruta.lastIndexOf('/') ? `${ruta.slice(0, punto)}_${n}${ruta.slice(punto)}` : `${ruta}_${n}`;
  }
  usados.add(candidata.toLowerCase());
  return candidata;
}

const ESTADO_PERSONA = { activo: 'Activo', inactivo: 'Dado de baja' } as const;

/** Filtro por perfil sobre la persona ("sin_perfil": las que todavía no tienen). */
function wherePerfil(query: QueryReporteDto): Prisma.PersonaWhereInput {
  if (!query.perfil) return {};
  return { perfil: query.perfil === 'sin_perfil' ? null : query.perfil };
}

/** Línea del encabezado con el perfil elegido. */
function filtroPerfil(query: QueryReporteDto): string[] {
  if (!query.perfil) return [];
  return [`Perfil: ${query.perfil === 'sin_perfil' ? SIN_PERFIL : PERFIL_LABEL[query.perfil]}`];
}

const PERFIL_DESCRIPCION = `Cómo se clasifica a la persona: ${PERFILES.map((p) => PERFIL_LABEL[p]).join(', ')}. "${SIN_PERFIL}": registrada antes de que existiera el perfil. Solo clasifica: el molinete valida a todos igual.`;
const ACCION = {
  crear: 'Crear',
  modificar: 'Modificar',
  eliminar: 'Eliminar',
  inicio_sesion: 'Inicio de sesión',
  inicio_sesion_fallido: 'Inicio de sesión rechazado',
} as const;

/** Motivos de denegación de un evento, como en el Panel de vigilancia. */
export function motivosEvento(e: {
  denegadoNoRegistrado: boolean;
  denegadoPorBaja: boolean;
  denegadoSinDocumentos: boolean;
  denegadoPorDocumentos: boolean;
  denegadoPorAlcohol: boolean;
  denegadoSinVerificacion: boolean;
  denegadoRostroNoCoincide?: boolean;
  denegadoYaDentro?: boolean;
  denegadoSinIngreso?: boolean;
  denegadoSinFacial?: boolean;
  denegadoSinDni?: boolean;
  denegadoNoEsQuienSoplo?: boolean;
}): string {
  const motivos: string[] = [];
  if (e.denegadoNoRegistrado) motivos.push('No registrado');
  if (e.denegadoPorBaja) motivos.push('Dado de baja');
  if (e.denegadoSinDocumentos) motivos.push('Sin documentos');
  if (e.denegadoPorDocumentos) motivos.push('Documentos');
  if (e.denegadoPorAlcohol) motivos.push('Alcohol');
  if (e.denegadoSinVerificacion) motivos.push('No completó rostro y alcohol');
  if (e.denegadoRostroNoCoincide) motivos.push('Rostro no coincide');
  if (e.denegadoYaDentro) motivos.push('Ya figura dentro');
  if (e.denegadoSinIngreso) motivos.push('No registra ingreso');
  if (e.denegadoSinFacial) motivos.push('Sin prueba facial');
  if (e.denegadoSinDni) motivos.push('No pasó su DNI a tiempo');
  if (e.denegadoNoEsQuienSoplo) motivos.push('No es quien sopló');
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
    if (reporte.filas.length > maxFilas(query)) throw demasiadasFilas(reporte.filas.length, maxFilas(query));
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
      case 'horas-hombre':
        return this.horasHombre(query);
      case 'presentes':
        return this.presentes(query);
      case 'empresas-perfil':
        return this.empresasPorPerfil(query);
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
      where: { empresaId: query.empresaId, estado: query.estado, ...wherePerfil(query) },
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
        ? `Dado de baja${p.fechaBaja ? ` el ${textoDia(claveDia(p.fechaBaja))}` : ''}${p.motivoBaja ? `: ${p.motivoBaja}` : ''}`
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
        textoPerfil(p.perfil),
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
        ...filtroPerfil(query),
        ...(query.estado ? [`Estado: ${query.estado === 'activo' ? 'Activos' : 'Dados de baja'}`] : []),
        'Puede ingresar: según sus documentos a la fecha (la prueba de alcohol se hace al ingresar).',
      ],
      columnas: [
        { titulo: 'Apellidos', ancho: 20, descripcion: 'Apellidos de la persona.' },
        { titulo: 'Nombres', ancho: 16, descripcion: 'Nombres de la persona.' },
        { titulo: 'Tipo doc.', ancho: 8, descripcion: 'Tipo de documento de identidad: DNI, CE (carné de extranjería) o pasaporte.' },
        { titulo: 'N° documento', ancho: 12, descripcion: 'Número del documento de identidad (el que se pasa por el lector del molinete).' },
        { titulo: 'Empresa', ancho: 30, descripcion: 'Empresa a la que pertenece la persona.' },
        { titulo: 'RUC', ancho: 14, descripcion: 'RUC de la empresa.' },
        { titulo: 'Perfil', ancho: 18, descripcion: PERFIL_DESCRIPCION },
        { titulo: 'Estado', ancho: 12, descripcion: 'Activo: puede ingresar si cumple sus documentos. Dado de baja: ya no puede ingresar; se conserva su historial.' },
        { titulo: 'Puede ingresar', ancho: 10, descripcion: 'Sí: hoy tiene sus documentos en regla y el molinete lo dejaría pasar (la prueba de alcohol se hace al ingresar). No: ver la columna Motivo.' },
        { titulo: 'Motivo', ancho: 26, descripcion: 'Por qué no puede ingresar: dado de baja, sin documentos cargados o con documentos vencidos. Vacío si puede ingresar.' },
        { titulo: 'N° docs.', tipo: 'numero', ancho: 9, descripcion: 'Cantidad de documentos cargados de la persona (la última versión de cada uno).' },
        { titulo: 'Registrado', tipo: 'fechaHora', ancho: 18, descripcion: 'Fecha y hora en que se registró a la persona en el sistema.' },
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
    if (reporte.filas.length > MAX_FILAS_PDF) throw demasiadasFilas(reporte.filas.length, MAX_FILAS_PDF, 'Acote los filtros.');
    const peso = archivos.reduce((suma, a) => suma + statSync(a.ruta).size, 0);
    if (peso > MAX_BYTES_ZIP) {
      throw new BadRequestException(
        `Los archivos suman ${Math.round(peso / 1024 / 1024)} MB (máximo ${MAX_BYTES_ZIP / 1024 / 1024} MB). Filtre por empresa o por estado.`,
      );
    }
    return { reporte, archivos };
  }

  private async armarDocumentos(query: QueryReporteDto, conArchivos: boolean) {
    const hoy = new Date();
    const inicioDeHoy = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const anteriores = conArchivos && query.incluirAnteriores === 'true';
    const conFotos = conArchivos && query.incluirFotos === 'true';
    /** Foto de cada persona en el ZIP (una sola vez por persona), por id. */
    const fotos = new Map<number, string | null>();
    const personas = await this.prisma.persona.findMany({
      where: { empresaId: query.empresaId, ...wherePerfil(query) },
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
            textoPerfil(p.perfil),
            ESTADO_PERSONA[p.estado],
            d.tipoDocumento.nombre,
            v.version,
            v.creadoEn,
            v.fechaVencimiento,
            actual ? dias : null,
            actual ? estados[estado] : 'Reemplazado',
          ];
          if (conArchivos) {
            const carpeta = ['archivos', nombreSeguro(p.empresa.razonSocial), nombreSeguro(`${persona} (${p.numeroDocumento})`)];
            if (v.archivoUrl && existsSync(v.archivoUrl)) {
              const enZip = rutaUnica(
                [...carpeta, `${nombreSeguro(`${d.tipoDocumento.nombre} v${v.version}`)}${extname(v.archivoUrl).toLowerCase()}`].join('/'),
                usados,
              );
              archivos.push({ ruta: v.archivoUrl, enZip });
              fila.push({ texto: 'Abrir', enlace: enZip });
            } else {
              sinArchivo++;
              fila.push('No disponible');
            }
            // La foto va en la misma carpeta de la persona; en el Excel, en cada fila suya.
            if (conFotos) {
              if (!fotos.has(p.id)) {
                const conFoto = !!p.fotoUrl && existsSync(p.fotoUrl);
                const enZip = conFoto ? rutaUnica([...carpeta, `foto${extname(p.fotoUrl!).toLowerCase()}`].join('/'), usados) : null;
                if (enZip) archivos.push({ ruta: p.fotoUrl!, enZip });
                fotos.set(p.id, enZip);
              }
              const foto = fotos.get(p.id);
              fila.push(foto ? { texto: 'Abrir', enlace: foto } : 'Sin foto');
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
    const actuales = filas.filter((f) => f.fila[10] !== 'Reemplazado').length;

    const reporte: Reporte = {
      titulo: 'Documentos por persona',
      archivo: `reporte-documentos-${claveDia(hoy)}`,
      filtros: [
        ...(await this.filtroEmpresa(query.empresaId)),
        ...filtroPerfil(query),
        ...(query.estadoDocumento ? [`Estado del documento: ${estados[query.estadoDocumento]}`] : []),
        anteriores
          ? `Cada documento con todas sus versiones (las anteriores, como "Reemplazado"). Por vencer: vence en los próximos ${DIAS_AVISO} días.`
          : `Última versión de cada documento. Por vencer: vence en los próximos ${DIAS_AVISO} días.`,
        ...(conArchivos
          ? [
              `${conFotos ? 'Columnas "Archivo" y "Foto": abren' : 'Columna "Archivo": abre'} el archivo de la carpeta "archivos". Primero descomprima el ZIP (clic derecho → Extraer todo) y abra este Excel desde esa carpeta.`,
            ]
          : []),
      ],
      columnas: [
        { titulo: 'Persona', ancho: 30, descripcion: 'Apellidos y nombres de la persona.' },
        { titulo: 'N° documento', ancho: 13, descripcion: 'Número del documento de identidad (el que se pasa por el lector del molinete).' },
        { titulo: 'Empresa', ancho: 32, descripcion: 'Empresa a la que pertenece la persona.' },
        { titulo: 'Perfil', ancho: 18, descripcion: PERFIL_DESCRIPCION },
        { titulo: 'Estado de la persona', ancho: 14, descripcion: 'Activo o dado de baja.' },
        { titulo: 'Documento', ancho: 26, descripcion: 'Nombre del documento, tal como está configurado en el sistema.' },
        { titulo: 'Versión', tipo: 'numero', ancho: 8, descripcion: '1 es el primero que se cargó; cada renovación suma uno.' },
        { titulo: 'Cargado', tipo: 'fechaHora', ancho: 16, descripcion: 'Fecha y hora en que se cargó esa versión.' },
        { titulo: 'Vence', tipo: 'fecha', ancho: 12, descripcion: 'Fecha de vencimiento. Vacío si el documento no vence.' },
        { titulo: 'Días para vencer', tipo: 'numero', ancho: 11, descripcion: 'Días que faltan para que venza; si es negativo, hace cuántos días venció. Vacío si no vence o si es una versión anterior.' },
        { titulo: 'Estado', ancho: 12, descripcion: `Vigente; Por vencer: vence en los próximos ${DIAS_AVISO} días; Vencido; Reemplazado: versión anterior, ya renovada.` },
        ...(conArchivos ? [{ titulo: 'Archivo', ancho: 12, descripcion: 'Abre el archivo del documento. Funciona con el ZIP descomprimido.' }] : []),
        ...(conFotos ? [{ titulo: 'Foto', ancho: 10, descripcion: 'Abre la foto de la persona. Funciona con el ZIP descomprimido.' }] : []),
      ],
      filas: filas.map((f) => f.fila),
      resumen: [
        `Documentos: ${actuales}`,
        ...(anteriores ? [`Versiones anteriores: ${filas.length - actuales}`] : []),
        ...(query.estadoDocumento
          ? []
          : [`Vigentes: ${cuenta.vigente}`, `Por vencer: ${cuenta.por_vencer}`, `Vencidos: ${cuenta.vencido}`]),
        ...(conArchivos ? [`Archivos incluidos: ${archivos.length - [...fotos.values()].filter(Boolean).length}`] : []),
        ...(conFotos ? [`Fotos incluidas: ${[...fotos.values()].filter(Boolean).length}`] : []),
        ...(sinArchivo ? [`Sin archivo en el servidor: ${sinArchivo}`] : []),
      ],
    };
    return { reporte, archivos };
  }

  /** Historial de ingresos y salidas del periodo, en orden cronológico. */
  private async movimientos(query: QueryReporteDto): Promise<Reporte> {
    const periodo = this.periodo(query);
    const where: Prisma.EventoAccesoWhereInput = {
      fechaHora: periodo.rango,
      tipoMovimiento: query.movimiento,
      resultado: query.resultado,
      ...(query.perfil && { persona: wherePerfil(query) }),
    };
    // Se cuenta antes de cargar: un periodo demasiado grande se rechaza sin traer las filas.
    const cantidad = await this.prisma.eventoAcceso.count({ where });
    if (cantidad > maxFilas(query)) throw demasiadasFilas(cantidad, maxFilas(query));
    const eventos = await this.prisma.eventoAcceso.findMany({
      where,
      include: {
        persona: { select: { nombres: true, apellidos: true, perfil: true, empresa: { select: { razonSocial: true } } } },
        verificadoPor: { select: { correo: true } },
      },
      orderBy: [{ fechaHora: 'asc' }, { id: 'asc' }],
    });
    const contar = (mov: string, res: string) =>
      eventos.filter((e) => e.tipoMovimiento === mov && e.resultado === res).length;
    return {
      titulo: 'Ingresos y salidas',
      archivo: `reporte-ingresos-salidas-${periodo.sufijo}`,
      filtros: [
        periodo.texto,
        ...filtroPerfil(query),
        ...(query.movimiento ? [`Movimiento: ${query.movimiento === 'ingreso' ? 'Ingresos' : 'Salidas'}`] : []),
        ...(query.resultado ? [`Resultado: ${query.resultado === 'autorizado' ? 'Autorizados' : 'Denegados'}`] : []),
      ],
      columnas: [
        { titulo: 'Fecha y hora', tipo: 'fechaHora', ancho: 16, descripcion: 'Cuándo pasó el documento por el lector del molinete.' },
        { titulo: 'Movimiento', ancho: 11, descripcion: 'Ingreso o salida.' },
        { titulo: 'Resultado', ancho: 11, descripcion: 'Autorizado: el molinete se abrió. Denegado: no se abrió (ver la columna Motivo).' },
        { titulo: 'Tipo doc.', ancho: 9, descripcion: 'Tipo de documento de identidad: DNI, CE (carné de extranjería) o pasaporte.' },
        { titulo: 'N° documento', ancho: 13, descripcion: 'Número del documento que se pasó por el lector.' },
        { titulo: 'Persona', ancho: 30, descripcion: 'Apellidos y nombres de la persona. "No registrado" si el documento no está en el sistema.' },
        { titulo: 'Empresa', ancho: 32, descripcion: 'Empresa a la que pertenece la persona.' },
        { titulo: 'Perfil', ancho: 18, descripcion: PERFIL_DESCRIPCION },
        { titulo: 'Motivo', ancho: 26, descripcion: 'Por qué se denegó: no registrado, dado de baja, sin documentos, documentos vencidos, alcohol, no completó rostro y alcohol, rostro no coincide, ya figura dentro (no registró su salida), no registra ingreso, sin rostro y alcohol o no pasó su DNI a tiempo (estos dos, solo en el orden "facial primero"; el segundo, y el alcohol en ese orden, quedan sin persona porque el equipo no dice quién sopló).' },
        { titulo: 'Verificación', ancho: 30, descripcion: 'Manual: el rostro y el alcohol los verificó un vigilante porque el equipo facial falló; entre paréntesis, quién decidió. Corrección manual: el movimiento lo registró un vigilante o administrador sin pasar por el molinete (antipassback), con quién y el motivo. Facial primero: rostro y alcohol antes del DNI; el equipo no confirma que quien sopló sea el del DNI. Vacío: verificación normal.' },
        { titulo: 'Molinete', ancho: 12, descripcion: 'Molinete por el que pasó.' },
      ],
      filas: eventos.map((e) => [
        e.fechaHora,
        e.tipoMovimiento === 'ingreso' ? 'Ingreso' : 'Salida',
        e.resultado === 'autorizado' ? 'Autorizado' : 'Denegado',
        e.tipoDocumentoIdentidad,
        e.numeroDocumento,
        e.persona ? `${e.persona.apellidos}, ${e.persona.nombres}` : 'No registrado',
        e.persona?.empresa.razonSocial ?? null,
        e.persona ? textoPerfil(e.persona.perfil) : null,
        e.resultado === 'denegado' ? motivosEvento(e) || null : null,
        // Rostro y alcohol: los del equipo facial, o los que verificó un vigilante (contingencia).
        e.correccionManual
          ? `Corrección manual (${e.verificadoPor?.correo ?? '-'}): ${e.motivoCorreccion ?? ''}`
          : e.verificacionManual
            ? `Manual (${e.verificadoPor?.correo ?? 'sin decisión'})`
            : e.facialPrimero
              ? e.dniQueSoplo
                ? `Facial primero (sopló el DNI ${e.dniQueSoplo})`
                : 'Facial primero (sin confirmar quién sopló)'
              : null,
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
   * Ingresos del periodo: cada ingreso autorizado, con la primera salida
   * autorizada posterior de esa persona (si la hay). Igual que el Dashboard.
   */
  private async visitas(query: QueryReporteDto): Promise<Reporte> {
    const periodo = this.periodo(query);
    const whereIngresos: Prisma.EventoAccesoWhereInput = {
      tipoMovimiento: 'ingreso',
      resultado: 'autorizado',
      fechaHora: periodo.rango,
      personaId: { not: null },
      ...(query.perfil && { persona: wherePerfil(query) }),
    };
    const cantidad = await this.prisma.eventoAcceso.count({ where: whereIngresos });
    if (cantidad > maxFilas(query)) throw demasiadasFilas(cantidad, maxFilas(query));
    const ingresos = await this.prisma.eventoAcceso.findMany({
      where: whereIngresos,
      include: {
        persona: { select: { nombres: true, apellidos: true, numeroDocumento: true, perfil: true, empresa: { select: { razonSocial: true } } } },
      },
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
        textoPerfil(i.persona!.perfil),
        i.fechaHora,
        salida,
        textoDuracion((salida ?? ahora).getTime() - i.fechaHora.getTime()),
        salida ? 'Finalizado' : 'Presente',
      ];
    });
    return {
      titulo: 'Ingresos del periodo',
      archivo: `reporte-ingresos-${periodo.sufijo}`,
      filtros: [
        periodo.texto,
        ...filtroPerfil(query),
        'Cada ingreso autorizado, con su salida. Finalizado: registró su salida; presente: todavía no (duración hasta ahora).',
      ],
      columnas: [
        { titulo: 'Persona', ancho: 30, descripcion: 'Apellidos y nombres de la persona.' },
        { titulo: 'N° documento', ancho: 13, descripcion: 'Número del documento de identidad (el que se pasa por el lector del molinete).' },
        { titulo: 'Empresa', ancho: 34, descripcion: 'Empresa a la que pertenece la persona.' },
        { titulo: 'Perfil', ancho: 18, descripcion: PERFIL_DESCRIPCION },
        { titulo: 'Ingreso', tipo: 'fechaHora', ancho: 16, descripcion: 'Fecha y hora del ingreso por el molinete.' },
        { titulo: 'Salida', tipo: 'fechaHora', ancho: 16, descripcion: 'Fecha y hora de la salida por el molinete. Vacío si todavía está dentro.' },
        { titulo: 'Duración', ancho: 14, descripcion: 'Tiempo dentro del terminal, del ingreso a la salida (si sigue dentro, hasta la descarga del reporte). Ejemplo: 8 h 30 min; desde 48 horas, en días y horas.' },
        { titulo: 'Estado', ancho: 11, descripcion: 'Finalizado: ya salió. Presente: sigue dentro.' },
      ],
      filas,
      resumen: [`Total de ingresos: ${ingresos.length}`, `Finalizados: ${finalizadas}`, `Presentes: ${ingresos.length - finalizadas}`],
    };
  }

  /**
   * Horas-hombre del periodo (ver panel/horas-hombre.util.ts): por empresa en la
   * tabla principal, y en otra hoja el detalle por persona.
   */
  private async horasHombre(query: QueryReporteDto): Promise<Reporte> {
    const periodo = this.periodo(query);
    const filtroEmpresa = await this.filtroEmpresa(query.empresaId);
    const visitas = await this.dashboard.calcularHorasHombre(periodo.rango as { gte: Date; lt: Date }, {
      ...(query.empresaId !== undefined && { empresaId: query.empresaId }),
      ...wherePerfil(query),
    });
    const ids = [...new Set(visitas.map((v) => v.personaId))];
    const personas = await this.prisma.persona.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        numeroDocumento: true,
        perfil: true,
        empresa: { select: { id: true, razonSocial: true, ruc: true } },
      },
    });
    const porId = new Map(personas.map((p) => [p.id, p]));

    const porPersona = new Map<number, { visitas: number; ms: number }>();
    for (const v of visitas) {
      const p = porPersona.get(v.personaId) ?? porPersona.set(v.personaId, { visitas: 0, ms: 0 }).get(v.personaId)!;
      p.visitas++;
      p.ms += v.ms;
    }

    const porEmpresa = new Map<number, { razonSocial: string; ruc: string; personas: number; visitas: number; ms: number }>();
    for (const [id, t] of porPersona) {
      const e = porId.get(id)!.empresa;
      const fila = porEmpresa.get(e.id) ?? porEmpresa.set(e.id, { razonSocial: e.razonSocial, ruc: e.ruc, personas: 0, visitas: 0, ms: 0 }).get(e.id)!;
      fila.personas++;
      fila.visitas += t.visitas;
      fila.ms += t.ms;
    }

    const empresas = [...porEmpresa.values()].sort((a, b) => b.ms - a.ms || a.razonSocial.localeCompare(b.razonSocial));
    const detalle = [...porPersona.entries()]
      .map(([id, t]) => ({ p: porId.get(id)!, ...t }))
      .sort((a, b) => a.p.empresa.razonSocial.localeCompare(b.p.empresa.razonSocial) || b.ms - a.ms);
    const totalMs = visitas.reduce((suma, v) => suma + v.ms, 0);

    return {
      titulo: 'Horas-hombre',
      archivo: `reporte-horas-hombre-${periodo.sufijo}`,
      filtros: [
        periodo.texto,
        ...filtroEmpresa,
        ...filtroPerfil(query),
        'Horas-hombre: tiempo dentro del terminal, de cada ingreso a su salida por el molinete (solo movimientos autorizados). Un ingreso que cruza el periodo suma solo sus horas dentro de él.',
      ],
      columnas: [
        { titulo: 'Empresa', ancho: 34, descripcion: 'Empresa a la que pertenece la persona.' },
        { titulo: 'RUC', ancho: 13, descripcion: 'RUC de la empresa.' },
        { titulo: 'Personas', tipo: 'numero', ancho: 10, descripcion: 'Cuántas personas de la empresa entraron y salieron en el periodo.' },
        { titulo: 'Ingresos', tipo: 'numero', ancho: 9, descripcion: 'Cuántas veces entró y salió por el molinete en el periodo (cada ingreso con su salida). En la hoja por empresa, sumando a todo su personal.' },
        { titulo: 'Horas-hombre (h:mm)', tipo: 'horas', ancho: 16, descripcion: 'Tiempo total dentro del terminal en el periodo, sumando todos sus ingresos (en la hoja por empresa, de todo su personal). En horas:minutos: 61:01 = 61 horas y 1 minuto (no es 61,01). Solo cuentan los ingresos con su salida por el molinete.' },
      ],
      filas: empresas.map((e) => [e.razonSocial, e.ruc, e.personas, e.visitas, e.ms]),
      resumen: [
        `Empresas: ${empresas.length}`,
        `Personas: ${porPersona.size}`,
        `Ingresos: ${visitas.length}`,
        `Horas-hombre: ${textoHoras(totalMs)} (h:mm)`,
      ],
      secciones: [
        {
          titulo: 'Detalle por persona',
          nota: 'Cada persona con sus ingresos y horas en el periodo, por empresa.',
          columnas: [
            { titulo: 'Persona', ancho: 30, descripcion: 'Apellidos y nombres de la persona.' },
            { titulo: 'N° documento', ancho: 13, descripcion: 'Número del documento de identidad (el que se pasa por el lector del molinete).' },
            { titulo: 'Empresa', ancho: 34, descripcion: 'Empresa a la que pertenece la persona.' },
            { titulo: 'Perfil', ancho: 18, descripcion: PERFIL_DESCRIPCION },
            { titulo: 'Ingresos', tipo: 'numero', ancho: 9, descripcion: 'Cuántas veces entró y salió por el molinete en el periodo (cada ingreso con su salida). En la hoja por empresa, sumando a todo su personal.' },
            { titulo: 'Horas-hombre (h:mm)', tipo: 'horas', ancho: 16, descripcion: 'Tiempo total dentro del terminal en el periodo, sumando todos sus ingresos (en la hoja por empresa, de todo su personal). En horas:minutos: 61:01 = 61 horas y 1 minuto (no es 61,01). Solo cuentan los ingresos con su salida por el molinete.' },
          ],
          filas: detalle.map((d) => [
            `${d.p.apellidos}, ${d.p.nombres}`,
            d.p.numeroDocumento,
            d.p.empresa.razonSocial,
            textoPerfil(d.p.perfil),
            d.visitas,
            d.ms,
          ]),
        },
      ],
    };
  }

  /** Personas dentro del terminal ahora, con su tiempo dentro. */
  private async presentes(query: QueryReporteDto): Promise<Reporte> {
    const ahora = new Date();
    const { dentro } = await this.dashboard.calcularPresenciaActual(ahora);
    const personas = await this.prisma.persona.findMany({
      where: { id: { in: dentro.map((d) => d.personaId) } },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        numeroDocumento: true,
        estado: true,
        perfil: true,
        empresa: { select: { razonSocial: true } },
      },
    });
    const porId = new Map(personas.map((p) => [p.id, p]));
    // Con perfil elegido, solo los de ese perfil.
    const delPerfil = (perfil: (typeof personas)[number]['perfil']) =>
      !query.perfil || (query.perfil === 'sin_perfil' ? perfil === null : perfil === query.perfil);
    const presentes = dentro.filter((d) => porId.has(d.personaId) && delPerfil(porId.get(d.personaId)!.perfil));
    const masDe12h = presentes.filter((d) => ahora.getTime() - d.fechaHora.getTime() > MS_PERMANENCIA_LARGA).length;
    return {
      titulo: 'Personal presente',
      archivo: `reporte-presentes-${claveDia(ahora)}`,
      filtros: [...filtroPerfil(query), 'Personas cuyo último movimiento autorizado es un ingreso, de mayor a menor permanencia.'],
      columnas: [
        { titulo: 'Persona', ancho: 30, descripcion: 'Apellidos y nombres de la persona.' },
        { titulo: 'N° documento', ancho: 13, descripcion: 'Número del documento de identidad (el que se pasa por el lector del molinete).' },
        { titulo: 'Empresa', ancho: 34, descripcion: 'Empresa a la que pertenece la persona.' },
        { titulo: 'Perfil', ancho: 18, descripcion: PERFIL_DESCRIPCION },
        { titulo: 'Estado', ancho: 13, descripcion: 'Activo o dado de baja.' },
        { titulo: 'Ingreso', tipo: 'fechaHora', ancho: 16, descripcion: 'Fecha y hora de su último ingreso por el molinete.' },
        { titulo: 'Tiempo dentro', ancho: 14, descripcion: 'Tiempo desde su ingreso hasta la descarga del reporte.' },
        { titulo: `Más de ${HORAS_PERMANENCIA_LARGA} h`, ancho: 10, descripcion: `Sí, si lleva más de ${HORAS_PERMANENCIA_LARGA} horas dentro.` },
      ],
      filas: presentes.map((d) => {
        const p = porId.get(d.personaId)!;
        const ms = ahora.getTime() - d.fechaHora.getTime();
        return [
          `${p.apellidos}, ${p.nombres}`,
          p.numeroDocumento,
          p.empresa.razonSocial,
          textoPerfil(p.perfil),
          ESTADO_PERSONA[p.estado],
          d.fechaHora,
          textoDuracion(ms),
          ms > MS_PERMANENCIA_LARGA ? 'Sí' : 'No',
        ];
      }),
      resumen: [`Presentes: ${presentes.length}`, `Más de ${HORAS_PERMANENCIA_LARGA} horas: ${masDe12h}`],
    };
  }

  /**
   * Empresas con cuántas personas activas tienen de cada perfil. Con un perfil
   * elegido, solo las empresas que tienen personas de ese perfil (de más a menos).
   */
  private async empresasPorPerfil(query: QueryReporteDto): Promise<Reporte> {
    const hoy = new Date();
    const grupos = await this.prisma.persona.groupBy({
      by: ['empresaId', 'perfil'],
      where: { estado: 'activo', empresaId: query.empresaId },
      _count: { _all: true },
    });
    const empresas = await this.prisma.empresa.findMany({
      where: { id: { in: [...new Set(grupos.map((g) => g.empresaId))] } },
      select: { id: true, razonSocial: true, ruc: true },
    });
    const claves = [...PERFILES, null] as const;
    const conteo = new Map<number, Map<string | null, number>>();
    for (const g of grupos) {
      const porPerfil = conteo.get(g.empresaId) ?? conteo.set(g.empresaId, new Map()).get(g.empresaId)!;
      porPerfil.set(g.perfil, g._count._all);
    }
    const elegido = query.perfil ? (query.perfil === 'sin_perfil' ? null : query.perfil) : undefined;
    const filas = empresas
      .map((e) => {
        const porPerfil = conteo.get(e.id)!;
        const cantidades = claves.map((c) => porPerfil.get(c) ?? 0);
        return { e, cantidades, total: cantidades.reduce((suma, n) => suma + n, 0), delElegido: elegido === undefined ? 0 : (porPerfil.get(elegido) ?? 0) };
      })
      .filter((f) => elegido === undefined || f.delElegido > 0)
      .sort((a, b) => b.delElegido - a.delElegido || b.total - a.total || a.e.razonSocial.localeCompare(b.e.razonSocial));
    const totales = claves.map((_, i) => filas.reduce((suma, f) => suma + f.cantidades[i], 0));

    return {
      titulo: 'Empresas por perfil',
      archivo: `reporte-empresas-perfil-${claveDia(hoy)}`,
      filtros: [
        ...(await this.filtroEmpresa(query.empresaId)),
        ...filtroPerfil(query),
        query.perfil
          ? 'Solo las empresas con personal activo de ese perfil, de más a menos.'
          : 'Personal activo de cada empresa, por perfil.',
      ],
      columnas: [
        { titulo: 'Empresa', ancho: 34, descripcion: 'Razón social de la empresa.' },
        { titulo: 'RUC', ancho: 13, descripcion: 'RUC de la empresa.' },
        { titulo: 'Personal activo', tipo: 'numero', ancho: 12, descripcion: 'Personas activas de la empresa (sin las dadas de baja), de todos los perfiles.' },
        ...claves.map((c) => ({
          titulo: c ? PERFIL_LABEL[c] : SIN_PERFIL,
          tipo: 'numero' as const,
          ancho: 12,
          descripcion: c
            ? `Personas activas de la empresa con perfil "${PERFIL_LABEL[c]}".`
            : 'Personas activas registradas antes de que existiera el perfil: falta asignárselo en su ficha.',
        })),
      ],
      filas: filas.map((f) => [f.e.razonSocial, f.e.ruc, f.total, ...f.cantidades]),
      resumen: [
        `Empresas: ${filas.length}`,
        `Personal activo: ${totales.reduce((suma, n) => suma + n, 0)}`,
        ...claves.map((c, i) => `${c ? PERFIL_LABEL[c] : SIN_PERFIL}: ${totales[i]}`),
      ],
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
        { titulo: 'Fecha y hora', tipo: 'fechaHora', ancho: 16, descripcion: 'Cuándo se hizo el cambio.' },
        { titulo: 'Usuario', ancho: 30, descripcion: 'Correo del usuario que hizo el cambio. "Sistema" si lo hizo el propio sistema.' },
        { titulo: 'Acción', ancho: 22, descripcion: 'Crear, Modificar, Eliminar, Inicio de sesión o Inicio de sesión rechazado.' },
        { titulo: 'Dato', ancho: 20, descripcion: 'Qué se cambió: personal, empresa, documento, tipo de documento, usuario o verificación manual.' },
        { titulo: 'N° de registro', tipo: 'numero', ancho: 13, descripcion: 'Número interno del dato cambiado, para ubicarlo en el sistema.' },
        { titulo: 'IP', ancho: 16, descripcion: 'Inicios de sesión: dirección desde donde se intentó.' },
        { titulo: 'Detalle', ancho: 40, descripcion: 'Inicios de sesión rechazados: el correo escrito y el motivo (correo no registrado, contraseña incorrecta o cuenta de baja).' },
      ],
      filas: registros.map((r) => [
        r.fechaHora,
        r.usuario?.correo ?? 'Sistema',
        ACCION[r.accion],
        TABLA_LABEL[r.tablaAfectada] ?? r.tablaAfectada,
        r.registroId || null,
        r.ip,
        r.detalle,
      ]),
      resumen: [`Total: ${registros.length}`],
    };
  }
}
