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
// SN de un equipo falso: el ingreso ya no decide todo en una sola llamada
// (ver push-sdk/) -- después del DNI hay que simular también el rtlog que
// mandaría el G4 Pro, como si este fuera el equipo real.
const SIM_SN = 'SIMULADOR';
const HOST = process.env.API_URL?.replace(/\/api\/v1$/, '') ?? `http://localhost:${process.env.PORT ?? 3001}`;
const API_URL = `${HOST}/api/v1`;

function argumento(nombre: string, porDefecto: number): number {
  const arg = process.argv.find((a) => a.startsWith(`--${nombre}=`));
  const valor = arg ? Number(arg.split('=')[1]) : porDefecto;
  return Number.isFinite(valor) && valor > 0 ? valor : porDefecto;
}

type Persona = { tipoDocumentoIdentidad: 'DNI' | 'CE' | 'PASAPORTE'; numeroDocumento: string; nombre: string };
type Paso = { movimiento: 'ingreso' | 'salida'; persona: Persona; caso: string };

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
      pasos.push({ movimiento: 'ingreso', persona: elegir(conProblemas), caso: 'documentos' });
    } else if (dado < 0.2 && habilitados.some((p) => !adentro.has(p))) {
      // Solo a quien está afuera: quien ya ingresó no vuelve a pasar por la prueba.
      const afuera = habilitados.filter((p) => !adentro.has(p));
      pasos.push({ movimiento: 'ingreso', persona: elegir(afuera), caso: 'alcohol' });
    } else if (dado < 0.26 && deBaja.length > 0) {
      pasos.push({ movimiento: 'ingreso', persona: elegir(deBaja), caso: 'de baja' });
    } else if (dado < 0.32) {
      pasos.push({ movimiento: 'ingreso', persona: await dniNoRegistrado(), caso: 'no registrado' });
    } else if (adentro.size > 0 && (dado > 0.7 || habilitados.every((p) => adentro.has(p)))) {
      const persona = elegir([...adentro]);
      adentro.delete(persona);
      pasos.push({ movimiento: 'salida', persona, caso: 'salida' });
    } else if (habilitados.length > 0) {
      const afuera = habilitados.filter((p) => !adentro.has(p));
      const persona = elegir(afuera.length > 0 ? afuera : habilitados);
      adentro.add(persona);
      pasos.push({ movimiento: 'ingreso', persona, caso: 'normal' });
    }
  }
  return pasos;
}

function formatoFechaDispositivo(fecha: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())} ${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())}`;
}

/**
 * Simula el table=rtlog que mandaría el G4 Pro tras el DNI (ver
 * push-sdk/push-sdk.controller.ts). `event=0` es la única verificación
 * exitosa confirmada con el equipo real; cualquier otro código se usa acá
 * solo para simular un rechazo, su significado real todavía no está
 * confirmado (ver docs/g4pro/Historial_Integracion_G4Pro.md, Parte A, pendiente #3).
 */
async function simularResultadoG4Pro(autorizado: boolean) {
  const linea = [
    `time=${formatoFechaDispositivo(new Date())}`,
    'pin=0',
    'cardno=0',
    'eventaddr=1',
    `event=${autorizado ? '0' : '1'}`,
    'inoutstatus=0',
    'verifytype=15',
    'index=0',
    'sitecode=0',
    'linkid=0',
    'maskflag=255',
    'temperature=0',
    'convtemperature=0',
    'Concentration=0',
    'SleepTime=0',
    'HealthStatus=0',
    'PlateNumber=0',
  ].join('\t');
  await fetch(`${HOST}/iclock/cdata?SN=${SIM_SN}&table=rtlog`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: linea,
  });
}

async function enviar(paso: Paso) {
  const cuerpo = {
    tipoDocumentoIdentidad: paso.persona.tipoDocumentoIdentidad,
    numeroDocumento: paso.persona.numeroDocumento,
    torniqueteId: MOLINETE,
  };
  const res = await fetch(`${API_URL}/eventos-acceso/${paso.movimiento}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.DEVICE_API_KEY ?? '' },
    body: JSON.stringify(cuerpo),
  });
  const datos = (await res.json()) as {
    resultado?: string;
    estado?: string;
    message?: string;
    persona?: { id: number } | null;
  };
  if (!res.ok) throw new Error(`El backend respondió ${res.status}: ${datos.message ?? ''}`);

  // Documentos no en regla (o de baja, o no registrado): el backend ya deniega
  // ahí mismo, sin llegar al G4 Pro -- resultado inmediato, igual que antes.
  if (datos.estado !== 'pendiente_verificacion') {
    return datos.resultado ?? '?';
  }

  // Documentos en regla: falta el resultado del G4 Pro (rostro + alcohol),
  // que en la vida real llega solo, segundos después. Acá se simula de una.
  await simularResultadoG4Pro(paso.caso !== 'alcohol');

  // La correlación (EventosAccesoService, evento 'dispositivo.rtlog') corre
  // async respecto al "OK" que responde /iclock/cdata -- a propósito, para no
  // acoplar los módulos -- así que puede no estar lista todavía. Reintenta
  // unas pocas veces en vez de asumir que ya pasó.
  for (let intento = 0; intento < 10; intento++) {
    const eventoFinal = await prisma.eventoAcceso.findFirst({
      where: { personaId: datos.persona!.id, torniqueteId: MOLINETE },
      orderBy: { id: 'desc' },
    });
    if (eventoFinal) return eventoFinal.resultado;
    await new Promise((r) => setTimeout(r, 100));
  }
  return '?';
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
