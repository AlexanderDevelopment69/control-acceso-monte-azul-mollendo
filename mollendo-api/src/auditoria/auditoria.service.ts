import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AccionAuditoria } from '../generated/prisma/enums.js';
import type { Prisma } from '../generated/prisma/client.js';
import { paginacion, palabras, rangoDeDias, type Paginado } from '../common/paginacion.js';
import type { QueryAuditoriaDto } from './dto/query-auditoria.dto.js';

interface RegistrarAuditoriaParams {
  usuarioId: number | null;
  tablaAfectada: string;
  registroId: number;
  accion: AccionAuditoria;
  /** Inicios de sesión: IP y detalle del intento. */
  ip?: string | null;
  detalle?: string | null;
}

// Cómo se muestra cada tabla en el portal; la búsqueda también encuentra por estos nombres.
export const TABLA_LABEL: Record<string, string> = {
  persona: 'Personal',
  empresa: 'Empresa',
  documento_persona: 'Documento',
  tipo_documento: 'Tipo de documento',
  usuario: 'Usuario',
  periodo_verificacion_manual: 'Verificación manual',
  tarjeta_contingencia: 'Tarjeta de contingencia',
  ajuste_sistema: 'Orden de ingreso',
  evento_acceso: 'Ingreso o salida (corrección manual)',
  equipo: 'Equipos',
};

/** Tablas cuyo nombre visible contiene la palabra (sin distinguir mayúsculas ni tildes). */
function tablasQueCoinciden(palabra: string): string[] {
  const normalizar = (t: string) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const p = normalizar(palabra);
  return Object.entries(TABLA_LABEL)
    .filter(([tabla, label]) => normalizar(label).includes(p) || tabla.includes(p))
    .map(([tabla]) => tabla);
}

@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  async registrar(params: RegistrarAuditoriaParams): Promise<void> {
    await this.prisma.auditoria.create({ data: params });
  }

  /** Más recientes primero, paginado. Cada palabra de la búsqueda debe coincidir con el usuario o con el tipo de dato. */
  async findAll(query: QueryAuditoriaDto) {
    const { pagina, porPagina, skip, take } = paginacion(query);
    const where: Prisma.AuditoriaWhereInput = {
      tablaAfectada: query.tablaAfectada,
      registroId: query.registroId,
      fechaHora: rangoDeDias(query.desde, query.hasta),
      AND: palabras(query.busqueda).map((palabra) => ({
        OR: [
          { usuario: { correo: { contains: palabra, mode: 'insensitive' as const } } },
          { tablaAfectada: { in: tablasQueCoinciden(palabra) } },
        ],
      })),
    };
    const [datos, total] = await Promise.all([
      this.prisma.auditoria.findMany({
        where,
        include: { usuario: { select: { id: true, correo: true, rol: true } } },
        orderBy: [{ fechaHora: 'desc' }, { id: 'desc' }],
        skip,
        take,
      }),
      this.prisma.auditoria.count({ where }),
    ]);
    return { datos, total, pagina, porPagina } satisfies Paginado<(typeof datos)[number]>;
  }
}
