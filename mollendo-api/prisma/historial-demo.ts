// Historial de DEMOSTRACIÓN: ingresos y salidas de los últimos 30 días del
// personal DEMO (cargado antes con prisma/datos-demo.ts), para ver los
// gráficos del Dashboard con datos. La API registra cada evento con la hora
// actual, así que el historial se escribe directo en la base de datos.
//
//   npx tsx prisma/historial-demo.ts
//
// Aplica las mismas reglas que el molinete (documentos vigentes ese día, baja,
// alcohol). Los eventos quedan con el molinete "DEMO": se borran junto con el
// resto de los datos DEMO (prisma/limpiar-demo.sh). Doce personas quedan con un
// ingreso de hace 2 a 4 días sin salida (y sin movimientos hoy), para la
// permanencia mayor a 24 horas.
//
// INCLUIR_HOY=1 genera también los movimientos de hoy hasta la hora actual (en
// lugar de los de datos-demo.ts por la API, que en un servidor con un G4 Pro
// real quedarían como ingresos pendientes de verificación en el equipo).
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Prisma } from '../src/generated/prisma/client.js';
import { documentosActuales, evaluarIngreso } from '../src/eventos-acceso/validacion-acceso.engine.js';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const MOLINETE = 'DEMO';
const DIAS = 30;
/** Personas que se quedan dentro (permanencia mayor a 24 horas). */
const SE_QUEDAN = 12;
const INCLUIR_HOY = process.env.INCLUIR_HOY === '1';

// Números pseudoaleatorios con semilla fija: la misma carga da los mismos datos.
let semilla = 20260930;
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

type Evento = Prisma.EventoAccesoCreateManyInput;

async function main() {
  const inicioDeHoy = new Date();
  inicioDeHoy.setHours(0, 0, 0, 0);
  const previos = await prisma.eventoAcceso.count({ where: { torniqueteId: MOLINETE, fechaHora: { lt: inicioDeHoy } } });
  if (previos > 0) throw new Error('Ya hay historial DEMO cargado. Bórralo antes con prisma/limpiar-demo.sh.');

  const personas = await prisma.persona.findMany({
    where: { empresa: { ruc: { startsWith: '209999999' } } },
    include: { documentos: { include: { tipoDocumento: { select: { nombre: true } } } } },
    orderBy: { numeroDocumento: 'asc' },
  });
  if (personas.length === 0) throw new Error('No hay personal DEMO. Cárgalo antes con prisma/datos-demo.ts.');

  // Se quedan dentro: personal activo con los documentos al día, desde hace 2 a 4 días.
  const habilitadas = personas.filter(
    (p) => evaluarIngreso({ personaActiva: p.estado === 'activo', alcoholConforme: true, documentos: documentosActuales(p.documentos, new Date()) }).autorizado,
  );
  const diaDeEntrada = new Map(
    habilitadas.filter((_, k) => k % 4 === 1).slice(0, SE_QUEDAN).map((p, k) => [p.id, 2 + (k % 3)]),
  );
  // Sus movimientos de hoy (de datos-demo.ts) se quitan: no han salido.
  await prisma.eventoAcceso.deleteMany({
    where: { torniqueteId: MOLINETE, personaId: { in: [...diaDeEntrada.keys()] }, fechaHora: { gte: inicioDeHoy } },
  });

  const eventos: Evento[] = [];
  const base = (p: (typeof personas)[number]) => ({
    personaId: p.id,
    tipoDocumentoIdentidad: p.tipoDocumentoIdentidad,
    numeroDocumento: p.numeroDocumento,
    torniqueteId: MOLINETE,
  });

  const ahora = new Date();
  for (let dia = DIAS; dia >= (INCLUIR_HOY ? 0 : 1); dia--) {
    const domingo = momento(dia, 12).getDay() === 0;
    for (const p of personas) {
      const entradaFinal = diaDeEntrada.get(p.id);
      if (entradaFinal !== undefined && dia < entradaFinal) continue; // desde que entró no registra movimientos
      const seQueda = entradaFinal === dia;
      // Asisten 3 de cada 4 días (menos los domingos); los dados de baja, solo la primera quincena.
      if (!seQueda && azar() > (domingo ? 0.2 : 0.78)) continue;
      const activo = p.estado === 'activo' || dia > 15;
      const entrada = momento(dia, entre(6.5, 9));
      if (entrada > ahora) continue; // hoy, todavía no llega
      const resultado = evaluarIngreso({
        personaActiva: activo,
        alcoholConforme: seQueda || azar() > 0.03,
        documentos: documentosActuales(p.documentos, entrada),
      });
      eventos.push({
        ...base(p),
        tipoMovimiento: 'ingreso',
        resultado: resultado.autorizado ? 'autorizado' : 'denegado',
        denegadoPorBaja: resultado.denegadoPorBaja,
        denegadoSinDocumentos: resultado.denegadoSinDocumentos,
        denegadoPorAlcohol: resultado.denegadoPorAlcohol,
        denegadoPorDocumentos: resultado.denegadoPorDocumentos,
        fechaHora: entrada,
      });
      if (!resultado.autorizado) continue;
      if (seQueda) continue; // se queda dentro
      const salida = momento(dia, entre(15.5, 19));
      if (salida > ahora) continue; // hoy, todavía está dentro
      eventos.push({ ...base(p), tipoMovimiento: 'salida', resultado: 'autorizado', fechaHora: salida });
    }
    // Algún intento con un documento no registrado.
    if (azar() < 0.35 && momento(dia, 7) < ahora) {
      eventos.push({
        personaId: null,
        tipoDocumentoIdentidad: 'DNI',
        numeroDocumento: `9999${String(Math.floor(azar() * 10000)).padStart(4, '0')}`,
        tipoMovimiento: 'ingreso',
        resultado: 'denegado',
        denegadoNoRegistrado: true,
        torniqueteId: MOLINETE,
        fechaHora: momento(dia, entre(7, 12)),
      });
    }
  }

  await prisma.eventoAcceso.createMany({ data: eventos });
  const autorizados = eventos.filter((e) => e.tipoMovimiento === 'ingreso' && e.resultado === 'autorizado').length;
  console.log(`Historial DEMO: ${eventos.length} eventos en ${DIAS} días (${autorizados} ingresos autorizados), molinete "${MOLINETE}".`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
