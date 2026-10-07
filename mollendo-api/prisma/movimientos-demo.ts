// Movimientos de DEMOSTRACIÓN hasta hoy: completa los ingresos y salidas del
// personal DEMO desde el último día que tiene movimientos DEMO hasta hoy (a la
// hora actual), para que el Dashboard y el Panel tengan datos del día.
//
//   docker compose -f docker-compose.prod.yml cp mollendo-api/prisma/movimientos-demo.ts api:/app/prisma/
//   docker compose -f docker-compose.prod.yml exec -T api npx tsx prisma/movimientos-demo.ts
//
// Escribe directo en la base de datos (no pasa por la API ni por el G4 Pro), con
// las mismas reglas del molinete (documentos vigentes ese día, baja, alcohol).
// Un día en que la persona ya tiene movimientos se salta. Además, de quienes
// están dentro desde hoy hace más de una hora, registra la salida de una parte
// (SALIDAS_HOY, 0.35 por defecto), con una hora entre su ingreso + 1 h y ahora:
// así "Visitas finalizadas" tiene datos aunque sea temprano. Los eventos llevan
// el molinete "DEMO": se borran con prisma/limpiar-demo.sh.
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Prisma } from '../src/generated/prisma/client.js';
import { documentosActuales, evaluarIngreso } from '../src/eventos-acceso/validacion-acceso.engine.js';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const MOLINETE = 'DEMO';
/** Como mucho se completan estos días hacia atrás. */
const MAX_DIAS = 30;
/** Parte de los que están dentro desde hoy que registran su salida. */
const SALIDAS_HOY = Number(process.env.SALIDAS_HOY ?? 0.35);

let semilla = Date.now() % 2147483648;
function azar(): number {
  semilla = (semilla * 1103515245 + 12345) % 2147483648;
  return semilla / 2147483648;
}
const entre = (min: number, max: number) => min + azar() * (max - min);

/** Fecha local de hace `dias` días a la hora indicada (horas con decimales). */
function momento(dias: number, hora: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(Math.floor(hora), Math.floor((hora % 1) * 60), Math.floor(azar() * 60), 0);
  return d;
}

function inicioDelDia(dias: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  const personas = await prisma.persona.findMany({
    where: { empresa: { ruc: { startsWith: '209999999' } } },
    include: { documentos: { include: { tipoDocumento: { select: { nombre: true } } } } },
  });
  if (personas.length === 0) throw new Error('No hay personal DEMO. Cárgalo antes con prisma/datos-demo.ts.');

  // Desde el día siguiente al último con movimientos DEMO (sin contar hoy), hasta hoy.
  const ultimo = await prisma.eventoAcceso.findFirst({
    where: { torniqueteId: MOLINETE, fechaHora: { lt: inicioDelDia(0) } },
    orderBy: { fechaHora: 'desc' },
    select: { fechaHora: true },
  });
  const diasAtras = ultimo
    ? Math.min(MAX_DIAS, Math.round((inicioDelDia(0).getTime() - new Date(ultimo.fechaHora).setHours(0, 0, 0, 0)) / 86_400_000) - 1)
    : 0;

  // Quién ya tiene movimientos en cada día (no se le agregan otros).
  const existentes = await prisma.eventoAcceso.findMany({
    where: { personaId: { not: null }, fechaHora: { gte: inicioDelDia(diasAtras) } },
    select: { personaId: true, fechaHora: true },
  });
  const clave = (personaId: number, fecha: Date) => `${personaId}|${fecha.toDateString()}`;
  const conMovimientos = new Set(existentes.map((e) => clave(e.personaId!, e.fechaHora)));

  const ahora = new Date();
  const eventos: Prisma.EventoAccesoCreateManyInput[] = [];
  for (let dia = diasAtras; dia >= 0; dia--) {
    const domingo = momento(dia, 12).getDay() === 0;
    for (const p of personas) {
      if (conMovimientos.has(clave(p.id, momento(dia, 12)))) continue;
      if (azar() > (domingo ? 0.2 : 0.78)) continue; // asisten 3 de cada 4 días
      const entrada = momento(dia, entre(6.5, 9));
      if (entrada > ahora) continue; // todavía no llega
      const resultado = evaluarIngreso({
        personaActiva: p.estado === 'activo',
        alcoholConforme: azar() > 0.03,
        documentos: documentosActuales(p.documentos, entrada),
      });
      const base = { personaId: p.id, tipoDocumentoIdentidad: p.tipoDocumentoIdentidad, numeroDocumento: p.numeroDocumento, torniqueteId: MOLINETE };
      eventos.push({
        ...base,
        tipoMovimiento: 'ingreso',
        resultado: resultado.autorizado ? 'autorizado' : 'denegado',
        denegadoPorBaja: resultado.denegadoPorBaja,
        denegadoSinDocumentos: resultado.denegadoSinDocumentos,
        denegadoPorAlcohol: resultado.denegadoPorAlcohol,
        denegadoPorDocumentos: resultado.denegadoPorDocumentos,
        fechaHora: entrada,
      });
      if (!resultado.autorizado) continue;
      const salida = momento(dia, entre(15.5, 19));
      if (salida > ahora) continue; // todavía está dentro
      eventos.push({ ...base, tipoMovimiento: 'salida', resultado: 'autorizado', fechaHora: salida });
    }
  }
  for (let i = 0; i < eventos.length; i += 5000) await prisma.eventoAcceso.createMany({ data: eventos.slice(i, i + 5000) });

  // Salidas de hoy: personal DEMO cuyo último movimiento es un ingreso autorizado de hoy de hace más de una hora.
  const hoy = await prisma.eventoAcceso.findMany({
    where: { torniqueteId: MOLINETE, personaId: { not: null }, fechaHora: { gte: inicioDelDia(0) } },
    orderBy: { fechaHora: 'asc' },
  });
  const ultimoDeHoy = new Map<number, (typeof hoy)[number]>();
  for (const e of hoy) ultimoDeHoy.set(e.personaId!, e);
  const UNA_HORA = 3_600_000;
  const salidas: Prisma.EventoAccesoCreateManyInput[] = [];
  for (const e of ultimoDeHoy.values()) {
    if (e.tipoMovimiento !== 'ingreso' || e.resultado !== 'autorizado') continue;
    const desde = e.fechaHora.getTime() + UNA_HORA;
    if (desde >= ahora.getTime() || azar() > SALIDAS_HOY) continue;
    salidas.push({
      personaId: e.personaId,
      tipoDocumentoIdentidad: e.tipoDocumentoIdentidad,
      numeroDocumento: e.numeroDocumento,
      torniqueteId: MOLINETE,
      tipoMovimiento: 'salida',
      resultado: 'autorizado',
      fechaHora: new Date(entre(desde, ahora.getTime())),
    });
  }
  if (salidas.length) await prisma.eventoAcceso.createMany({ data: salidas });
  const ingresosHoy = eventos.filter((e) => e.tipoMovimiento === 'ingreso' && (e.fechaHora as Date) >= inicioDelDia(0)).length;
  console.log(
    `Movimientos DEMO: ${eventos.length} eventos en ${diasAtras + 1} día(s) hasta ahora (${ingresosHoy} ingresos hoy) y ${salidas.length} salidas de hoy, ${personas.length} personas DEMO, molinete "${MOLINETE}".`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
