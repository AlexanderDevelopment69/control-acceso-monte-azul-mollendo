import { Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { ListaPaginadaDto, paginacion, Paginado, palabras, rangoDeDias } from '../common/paginacion.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { alcoholConforme, leerRegistroAsistencia } from '../push-sdk/asistencia.util.js';
import { motivosEvento } from '../reportes/reportes.service.js';
import { versionFoto } from '../common/archivos-persona.util.js';

/** Una prueba del G4 Pro (rostro y alcohol) para el monitor de Sistema y APIs. */
export interface MarcacionG4 {
  id: number;
  serialNumber: string;
  /** Número de la marcación en el equipo (sube de uno en uno). */
  numero: number | null;
  /** Pruebas que no llegaron entre la anterior y esta (salto en el número). */
  faltanAntes: number;
  dni: string | null;
  persona: { id: number; nombres: string; apellidos: string; tieneFoto: boolean; fotoVersion: string | null } | null;
  /** Hora de la prueba según el reloj del equipo. */
  horaPrueba: string | null;
  /** Hora en que llegó al servidor. */
  llegada: string;
  /** Segundos entre la prueba y su llegada. */
  demoraSegundos: number | null;
  alcohol: string | null;
  aprobado: boolean | null;
  /** Qué hizo el sistema con la prueba al llegar. */
  decision: string | null;
  /** El ingreso en que terminó, si terminó en uno. */
  ingreso: { id: number; resultado: string; motivo: string; fechaHora: string } | null;
}

/**
 * Monitor del G4 Pro en asistencia: las pruebas que mandó (`ATTLOG`), con
 * quién la hizo, cuánto tardó en llegar, el grado y qué hizo el sistema con
 * ella. Por día y por página, como el Panel; la más reciente primero.
 */
@Injectable()
export class MonitorG4Service {
  constructor(private readonly prisma: PrismaService) {}

  async listar(query: ListaPaginadaDto): Promise<Paginado<MarcacionG4>> {
    const { pagina, porPagina, skip, take } = paginacion(query);
    const buscadas = palabras(query.busqueda);
    // El DNI va al comienzo de la línea del equipo; por nombre, se busca el DNI de las personas que coinciden.
    const filtros = await Promise.all(
      buscadas.map(async (palabra) => {
        const personas = await this.prisma.persona.findMany({
          where: {
            OR: [
              { nombres: { contains: palabra, mode: 'insensitive' } },
              { apellidos: { contains: palabra, mode: 'insensitive' } },
            ],
          },
          select: { numeroDocumento: true },
          take: 200,
        });
        return {
          OR: [{ crudo: { startsWith: palabra } }, ...personas.map((p) => ({ crudo: { startsWith: `${p.numeroDocumento}	` } }))],
        };
      }),
    );
    const where: Prisma.VerificacionDispositivoWhereInput = {
      tabla: 'attlog',
      creadoEn: rangoDeDias(query.desde, query.hasta),
      AND: filtros,
    };
    const [filas, total] = await Promise.all([
      this.prisma.verificacionDispositivo.findMany({
        where,
        orderBy: { id: 'desc' },
        skip,
        take,
        include: { dispositivo: { select: { serialNumber: true } }, eventoAcceso: true },
      }),
      this.prisma.verificacionDispositivo.count({ where }),
    ]);

    // Pruebas que no llegaron: se compara cada número con la prueba anterior del mismo equipo, aunque
    // sea de otra página u otro día. Con una búsqueda no se marca (las de otras personas no se ven).
    const anteriores = buscadas.length ? [] : await this.anterioresPorEquipo(filas);
    const lineas = [...filas, ...anteriores];
    const registros = new Map(lineas.map((f) => [f.id, leerRegistroAsistencia(f.crudo)]));
    const dnis = [...new Set([...registros.values()].map((r) => r?.pin).filter((p): p is string => !!p))];
    const personas = await this.prisma.persona.findMany({
      where: { numeroDocumento: { in: dnis } },
      select: { id: true, numeroDocumento: true, nombres: true, apellidos: true, fotoUrl: true },
    });
    const porDni = new Map(personas.map((p) => [p.numeroDocumento, p]));

    const datos = filas.map((f, i) => {
      const registro = registros.get(f.id);
      const persona = registro ? porDni.get(registro.pin) : undefined;
      const previa = buscadas.length ? undefined : lineas.slice(i + 1).find((o) => o.dispositivoId === f.dispositivoId);
      const numeroAnterior = previa ? (registros.get(previa.id)?.numero ?? null) : null;
      const numero = registro?.numero ?? null;
      const evento = f.eventoAcceso;
      return {
        id: f.id,
        serialNumber: f.dispositivo.serialNumber,
        numero,
        faltanAntes: numero !== null && numeroAnterior !== null && numero > numeroAnterior + 1 ? numero - numeroAnterior - 1 : 0,
        dni: registro?.pin ?? null,
        persona: persona
          ? { id: persona.id, nombres: persona.nombres, apellidos: persona.apellidos, tieneFoto: !!persona.fotoUrl, fotoVersion: versionFoto(persona.fotoUrl) }
          : null,
        horaPrueba: f.horaDispositivo?.toISOString() ?? null,
        llegada: f.creadoEn.toISOString(),
        // Segundos enteros, como se ven las horas (la llegada trae milésimas): 18:24:26 → 18:24:37,6 son 11 s.
        demoraSegundos: f.horaDispositivo ? Math.floor((f.creadoEn.getTime() - f.horaDispositivo.getTime()) / 1000) : null,
        alcohol: registro?.alcohol ?? null,
        aprobado: registro?.alcohol ? alcoholConforme(registro.alcohol) : null,
        decision: f.decision,
        ingreso: evento
          ? { id: evento.id, resultado: evento.resultado, motivo: motivosEvento(evento), fechaHora: evento.fechaHora.toISOString() }
          : null,
      };
    });
    return { datos, total, pagina, porPagina };
  }

  /** Por cada equipo de la página, su prueba anterior a la más antigua que se muestra. */
  private async anterioresPorEquipo(filas: { id: number; dispositivoId: number }[]) {
    const masAntigua = new Map<number, number>();
    for (const f of filas) masAntigua.set(f.dispositivoId, f.id); // vienen de la más nueva a la más antigua
    const anteriores = await Promise.all(
      [...masAntigua].map(([dispositivoId, id]) =>
        this.prisma.verificacionDispositivo.findFirst({
          where: { tabla: 'attlog', dispositivoId, id: { lt: id } },
          orderBy: { id: 'desc' },
          select: { id: true, dispositivoId: true, crudo: true },
        }),
      ),
    );
    return anteriores.filter((a) => a !== null);
  }
}
