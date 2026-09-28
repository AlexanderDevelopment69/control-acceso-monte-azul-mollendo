// Simulador de garita: envía ingresos y salidas al backend, como lo harían los
// equipos (lector de DNI, G4 Pro + alcoholímetro), para ver el Panel de
// vigilancia en vivo sin tener los equipos conectados.
//
//   npm run simular                  20 eventos, uno cada 4 s
//   npm run simular -- --cada=2 --cantidad=50
//   npm run simular -- --limpiar     borra los eventos que creó el simulador
//
// Usa el personal ya registrado. Los eventos quedan en el historial marcados
// con el molinete "SIMULACION", para poder borrarlos después con --limpiar.
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { documentosActuales, evaluarIngreso } from '../src/eventos-acceso/validacion-acceso.engine.js';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const MOLINETE = 'SIMULACION';
const API_URL = process.env.API_URL ?? `http://localhost:${process.env.PORT ?? 3001}/api/v1`;

function argumento(nombre: string, porDefecto: number): number {
  const arg = process.argv.find((a) => a.startsWith(`--${nombre}=`));
  const valor = arg ? Number(arg.split('=')[1]) : porDefecto;
  return Number.isFinite(valor) && valor > 0 ? valor : porDefecto;
}

type Persona = { tipoDocumentoIdentidad: 'DNI' | 'CE' | 'PASAPORTE'; numeroDocumento: string; nombre: string };
type Paso = { movimiento: 'ingreso' | 'salida'; persona: Persona; alcoholConforme?: boolean; caso: string };

const elegir = <T>(lista: T[]): T => lista[Math.floor(Math.random() * lista.length)];

async function cargarPersonal() {
  const personas = await prisma.persona.findMany({
    include: { documentos: { include: { tipoDocumento: { select: { nombre: true } } } } },
  });
  const habilitados: Persona[] = [];
  const conProblemas: Persona[] = [];
  const deBaja: Persona[] = [];
  for (const p of personas) {
    const persona: Persona = {
      tipoDocumentoIdentidad: p.tipoDocumentoIdentidad,
      numeroDocumento: p.numeroDocumento,
      nombre: `${p.nombres} ${p.apellidos}`,
    };
    if (p.estado !== 'activo') {
      deBaja.push(persona);
      continue;
    }
    const resultado = evaluarIngreso({
      personaActiva: true,
      alcoholConforme: true,
      documentos: documentosActuales(p.documentos, new Date()),
    });
    (resultado.autorizado ? habilitados : conProblemas).push(persona);
  }
  return { habilitados, conProblemas, deBaja };
}

async function dniNoRegistrado(): Promise<Persona> {
  for (;;) {
    const numero = String(Math.floor(10000000 + Math.random() * 89999999));
    const existe = await prisma.persona.findFirst({ where: { numeroDocumento: numero } });
    if (!existe) return { tipoDocumentoIdentidad: 'DNI', numeroDocumento: numero, nombre: '(no registrado)' };
  }
}

/** Arma la secuencia: sobre todo ingresos y salidas normales, con algunos casos de denegación. */
async function armarPasos(cantidad: number): Promise<Paso[]> {
  const { habilitados, conProblemas, deBaja } = await cargarPersonal();
  if (habilitados.length === 0 && conProblemas.length === 0 && deBaja.length === 0) {
    throw new Error('No hay personal registrado: registre al menos una persona en el portal.');
  }

  const adentro = new Set<Persona>();
  const pasos: Paso[] = [];
  while (pasos.length < cantidad) {
    const dado = Math.random();
    if (dado < 0.12 && conProblemas.length > 0) {
      pasos.push({ movimiento: 'ingreso', persona: elegir(conProblemas), alcoholConforme: true, caso: 'documentos' });
    } else if (dado < 0.2 && habilitados.some((p) => !adentro.has(p))) {
      // Solo a quien está afuera: quien ya ingresó no vuelve a pasar por la prueba.
      const afuera = habilitados.filter((p) => !adentro.has(p));
      pasos.push({ movimiento: 'ingreso', persona: elegir(afuera), alcoholConforme: false, caso: 'alcohol' });
    } else if (dado < 0.26 && deBaja.length > 0) {
      pasos.push({ movimiento: 'ingreso', persona: elegir(deBaja), alcoholConforme: true, caso: 'de baja' });
    } else if (dado < 0.32) {
      pasos.push({ movimiento: 'ingreso', persona: await dniNoRegistrado(), alcoholConforme: true, caso: 'no registrado' });
    } else if (adentro.size > 0 && (dado > 0.7 || habilitados.every((p) => adentro.has(p)))) {
      const persona = elegir([...adentro]);
      adentro.delete(persona);
      pasos.push({ movimiento: 'salida', persona, caso: 'salida' });
    } else if (habilitados.length > 0) {
      const afuera = habilitados.filter((p) => !adentro.has(p));
      const persona = elegir(afuera.length > 0 ? afuera : habilitados);
      adentro.add(persona);
      pasos.push({ movimiento: 'ingreso', persona, alcoholConforme: true, caso: 'normal' });
    }
  }
  return pasos;
}

async function enviar(paso: Paso) {
  const cuerpo = {
    tipoDocumentoIdentidad: paso.persona.tipoDocumentoIdentidad,
    numeroDocumento: paso.persona.numeroDocumento,
    torniqueteId: MOLINETE,
    ...(paso.movimiento === 'ingreso' && { alcoholConforme: paso.alcoholConforme }),
  };
  const res = await fetch(`${API_URL}/eventos-acceso/${paso.movimiento}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.DEVICE_API_KEY ?? '' },
    body: JSON.stringify(cuerpo),
  });
  const datos = (await res.json()) as { resultado?: string; message?: string };
  if (!res.ok) throw new Error(`El backend respondió ${res.status}: ${datos.message ?? ''}`);
  return datos.resultado ?? '?';
}

async function limpiar() {
  const { count } = await prisma.eventoAcceso.deleteMany({ where: { torniqueteId: MOLINETE } });
  console.log(`Se borraron ${count} eventos del simulador.`);
}

async function main() {
  if (process.argv.includes('--limpiar')) {
    await limpiar();
    return;
  }
  if (!process.env.DEVICE_API_KEY) throw new Error('Falta DEVICE_API_KEY en el .env');

  const cada = argumento('cada', 4);
  const cantidad = argumento('cantidad', 20);
  const pasos = await armarPasos(cantidad);
  console.log(`Simulando ${cantidad} eventos, uno cada ${cada} s, contra ${API_URL}. Ctrl+C para detener.\n`);

  for (const [i, paso] of pasos.entries()) {
    const resultado = await enviar(paso);
    const hora = new Date().toLocaleTimeString('es-PE');
    const detalle = paso.caso === 'normal' || paso.caso === 'salida' ? '' : `  (${paso.caso})`;
    console.log(
      `${hora}  ${paso.movimiento.padEnd(7)} ${paso.persona.numeroDocumento}  ${paso.persona.nombre.padEnd(30)} ${resultado}${detalle}`,
    );
    if (i < pasos.length - 1) await new Promise((r) => setTimeout(r, cada * 1000));
  }
  console.log('\nListo. Para borrar estos eventos del historial: npm run simular -- --limpiar');
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
