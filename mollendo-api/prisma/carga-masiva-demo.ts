// Carga MASIVA de demostración: agrega personal DEMO (480 por defecto, para
// llegar a ~500 con el de datos-demo.ts) con sus documentos y sus ingresos y
// salidas de los últimos 30 días (y de hoy hasta la hora actual), para ver
// cómo se comportan el portal, los reportes y el Dashboard con volumen.
//
//   docker compose -f docker-compose.prod.yml cp mollendo-api/prisma/carga-masiva-demo.ts api:/app/prisma/
//   docker compose -f docker-compose.prod.yml exec -T api npx tsx prisma/carga-masiva-demo.ts
//   (CANTIDAD=1000 para otra cantidad)
//
// Escribe directo en la base de datos: no pasa por la API, así que NO se
// registra a nadie en el G4 Pro ni se encolan comandos. Sin fotos y con los
// documentos sin archivo (el botón "Ver" no tendrá nada que abrir).
//
// Requisitos y limpieza: usa las empresas DEMO (RUC 2099999990x) ya cargadas
// con datos-demo.ts; las personas tienen números 995xxxxx y los eventos el
// molinete "DEMO", así que prisma/limpiar-demo.sh las borra con todo lo demás.
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Prisma } from '../src/generated/prisma/client.js';
import { documentosActuales, evaluarIngreso } from '../src/eventos-acceso/validacion-acceso.engine.js';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const CANTIDAD = Number(process.env.CANTIDAD ?? 480);
const PREFIJO = '995';
const MOLINETE = 'DEMO';
const DIAS = 30;

// Números pseudoaleatorios con semilla fija: la misma carga da los mismos datos.
let semilla = 20261006;
function azar(): number {
  semilla = (semilla * 1103515245 + 12345) % 2147483648;
  return semilla / 2147483648;
}
const entre = (min: number, max: number) => min + azar() * (max - min);
const elegir = <T>(lista: T[]): T => lista[Math.floor(azar() * lista.length)];

const NOMBRES = [
  'José', 'Luis', 'Carlos', 'Juan', 'Miguel', 'Pedro', 'Jorge', 'Ricardo', 'Fernando', 'Raúl', 'César', 'Walter',
  'Elmer', 'Wilber', 'Edwin', 'Hugo', 'Alfredo', 'Roberto', 'Marco Antonio', 'Juan Carlos', 'María', 'Rosa',
  'Carmen', 'Ana', 'Luz', 'Elena', 'Gladys', 'Patricia', 'Silvia', 'Yolanda', 'Norma', 'Rocío', 'Milagros',
];
const APELLIDOS = [
  'Quispe', 'Mamani', 'Condori', 'Huamán', 'Flores', 'Apaza', 'Ccori', 'Chambi', 'Ticona', 'Pari', 'Vilca', 'Coaquira',
  'Yupanqui', 'Machaca', 'Zapana', 'Calcina', 'Luque', 'Supo', 'Larico', 'Paredes', 'Rojas', 'Velásquez', 'Gómez',
  'Torres', 'Cáceres', 'Ramos', 'Arias', 'Soto', 'Mendoza', 'Choque', 'Nina', 'Huanca', 'Cutipa', 'Aguilar',
];
const BASE = ['SCTR Salud', 'SCTR Pensión', 'Inducción SSMA'];
const ESPECIFICOS = ['Licencia de conducir', 'Examen médico ocupacional', 'Certificado de trabajo en altura', 'Curso de vigilancia (SUCAMEC)'];

/** Fecha (sin hora) de dentro de `dias` días; negativa = en el pasado. */
function dentroDe(dias: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + dias);
  return d;
}

/** Fecha local de hace `dias` días a la hora indicada (horas con decimales). */
function momento(dias: number, hora: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(Math.floor(hora), Math.floor((hora % 1) * 60), Math.floor(azar() * 60), 0);
  return d;
}

async function main() {
  const empresas = await prisma.empresa.findMany({ where: { ruc: { startsWith: '209999999' } }, orderBy: { ruc: 'asc' } });
  if (empresas.length === 0) throw new Error('No hay empresas DEMO. Cárgalas antes con prisma/datos-demo.ts.');
  const previas = await prisma.persona.count({ where: { numeroDocumento: { startsWith: PREFIJO } } });
  if (previas > 0) throw new Error(`Ya hay ${previas} personas de la carga masiva (${PREFIJO}xxxxx). Bórralas antes con prisma/limpiar-demo.sh.`);

  // Tipos de documento (se crean si faltan).
  const tipos = new Map<string, number>();
  for (const nombre of [...BASE, ...ESPECIFICOS]) {
    const tipo =
      (await prisma.tipoDocumento.findFirst({ where: { nombre } })) ?? (await prisma.tipoDocumento.create({ data: { nombre } }));
    tipos.set(nombre, tipo.id);
  }

  // Personas: ~6 % de baja, ~5 % sin documentos, ~8 % con algo vencido, ~8 % por vencer (menos de 15 días).
  const datosPersonas: Prisma.PersonaCreateManyInput[] = [];
  const documentosPorNumero = new Map<string, { nombre: string; vence: number | null }[]>();
  for (let i = 1; i <= CANTIDAD; i++) {
    const numeroDocumento = `${PREFIJO}${String(i).padStart(5, '0')}`;
    const tirada = azar();
    datosPersonas.push({
      empresaId: empresas[i % empresas.length].id,
      tipoDocumentoIdentidad: 'DNI',
      numeroDocumento,
      nombres: elegir(NOMBRES),
      apellidos: `${elegir(APELLIDOS)} ${elegir(APELLIDOS)}`,
      estado: tirada < 0.06 ? 'inactivo' : 'activo',
    });
    if (tirada >= 0.06 && tirada < 0.11) continue; // sin documentos
    const especifico = elegir(ESPECIFICOS);
    const vence = tirada < 0.19 ? -Math.ceil(entre(1, 60)) : tirada < 0.27 ? Math.ceil(entre(0, 14)) : Math.ceil(entre(30, 400));
    documentosPorNumero.set(numeroDocumento, [
      { nombre: BASE[0], vence: Math.ceil(entre(60, 365)) },
      { nombre: BASE[1], vence: Math.ceil(entre(60, 365)) },
      { nombre: BASE[2], vence: null },
      { nombre: especifico, vence },
    ]);
  }
  await prisma.persona.createMany({ data: datosPersonas });

  const personas = await prisma.persona.findMany({ where: { numeroDocumento: { startsWith: PREFIJO } } });
  const documentos: Prisma.DocumentoPersonaCreateManyInput[] = [];
  for (const p of personas) {
    for (const d of documentosPorNumero.get(p.numeroDocumento) ?? []) {
      documentos.push({
        personaId: p.id,
        tipoDocumentoId: tipos.get(d.nombre)!,
        fechaEmision: dentroDe(-Math.ceil(entre(60, 700))),
        fechaVencimiento: d.vence === null ? null : dentroDe(d.vence),
      });
    }
  }
  await prisma.documentoPersona.createMany({ data: documentos });
  console.log(`Personal: ${personas.length} personas DEMO (${PREFIJO}xxxxx) con ${documentos.length} documentos, sin foto.`);

  // Historial: mismas reglas que el molinete (documentos vigentes ese día, baja, alcohol).
  const conDocumentos = await prisma.persona.findMany({
    where: { numeroDocumento: { startsWith: PREFIJO } },
    include: { documentos: { include: { tipoDocumento: { select: { nombre: true } } } } },
  });
  const ahora = new Date();
  const eventos: Prisma.EventoAccesoCreateManyInput[] = [];
  for (let dia = DIAS; dia >= 0; dia--) {
    const domingo = momento(dia, 12).getDay() === 0;
    for (const p of conDocumentos) {
      if (azar() > (domingo ? 0.2 : 0.78)) continue; // asisten 3 de cada 4 días
      const activo = p.estado === 'activo' || dia > 15;
      const entrada = momento(dia, entre(6.5, 9));
      if (entrada > ahora) continue;
      const resultado = evaluarIngreso({
        personaActiva: activo,
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
      if (salida > ahora) continue; // hoy, todavía está dentro
      eventos.push({ ...base, tipoMovimiento: 'salida', resultado: 'autorizado', fechaHora: salida });
    }
  }
  for (let i = 0; i < eventos.length; i += 5000) await prisma.eventoAcceso.createMany({ data: eventos.slice(i, i + 5000) });
  const autorizados = eventos.filter((e) => e.tipoMovimiento === 'ingreso' && e.resultado === 'autorizado').length;
  console.log(`Historial: ${eventos.length} eventos en ${DIAS} días más hoy (${autorizados} ingresos autorizados), molinete "${MOLINETE}".`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
