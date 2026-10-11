// Carga datos de DEMOSTRACIÓN a través de la API (como lo haría el portal):
// 6 empresas "DEMO", 56 personas con foto y documentos, y los ingresos y
// salidas de hoy. Para llenar los gráficos del Dashboard con los últimos 30
// días, después correr prisma/historial-demo.ts (ver ese archivo).
// Todo es identificable para poder borrarlo después (ver prisma/limpiar-demo.sh):
//   - empresas con RUC 2099999990x y razón social que empieza con "DEMO"
//   - personas con número de documento que empieza con "99"
//   - eventos con el molinete "DEMO"
//
// Uso (desde la PC, contra el servidor):
//   API_URL=http://100.78.153.33:3000/api/v1 ADMIN_PASSWORD=... DEVICE_API_KEY=... npx tsx prisma/datos-demo.ts
import { crc32, deflateSync } from 'node:zlib';

const API_URL = process.env.API_URL ?? 'http://localhost:3001/api/v1';
const ADMIN_CORREO = process.env.ADMIN_CORREO ?? 'admin@mollendo.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';
const DEVICE_API_KEY = process.env.DEVICE_API_KEY ?? '';
const SIN_FOTOS = process.env.SIN_FOTOS === '1';
const MOLINETE = 'DEMO';

let token = '';

async function api<T>(ruta: string, opciones: { method?: string; json?: unknown; form?: FormData; clave?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (opciones.clave) headers['x-api-key'] = DEVICE_API_KEY;
  else headers.Authorization = `Bearer ${token}`;
  if (opciones.json !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API_URL}${ruta}`, {
    method: opciones.method ?? 'GET',
    headers,
    body: opciones.form ?? (opciones.json !== undefined ? JSON.stringify(opciones.json) : undefined),
  });
  const datos = (await res.json().catch(() => ({}))) as T & { message?: unknown };
  if (!res.ok) throw new Error(`${opciones.method ?? 'GET'} ${ruta} → ${res.status}: ${JSON.stringify(datos.message)}`);
  return datos;
}

// ---------------------------------------------------------------- archivos

/** Foto de ejemplo: PNG con fondo de color y una silueta, sin librerías externas. */
function fotoPng(color: [number, number, number]): Buffer {
  const ancho = 240;
  const alto = 300;
  const filas: Buffer[] = [];
  for (let y = 0; y < alto; y++) {
    const fila = Buffer.alloc(1 + ancho * 3); // byte 0 = filtro "ninguno"
    for (let x = 0; x < ancho; x++) {
      const cabeza = (x - 120) ** 2 + (y - 110) ** 2 < 48 ** 2;
      const cuerpo = (x - 120) ** 2 / 95 ** 2 + (y - 300) ** 2 / 120 ** 2 < 1;
      const [r, g, b] = cabeza || cuerpo ? [245, 245, 245] : color;
      fila.writeUInt8(r, 1 + x * 3);
      fila.writeUInt8(g, 2 + x * 3);
      fila.writeUInt8(b, 3 + x * 3);
    }
    filas.push(fila);
  }
  const bloque = (tipo: string, datos: Buffer) => {
    const largo = Buffer.alloc(4);
    largo.writeUInt32BE(datos.length);
    const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(cuerpo));
    return Buffer.concat([largo, cuerpo, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr.writeUInt8(8, 8); // bits por canal
  ihdr.writeUInt8(2, 9); // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloque('IHDR', ihdr),
    bloque('IDAT', deflateSync(Buffer.concat(filas))),
    bloque('IEND', Buffer.alloc(0)),
  ]);
}

/** PDF de una página con el nombre del documento. */
function documentoPdf(titulo: string, persona: string): Buffer {
  const texto = `${titulo} - ${persona} - DOCUMENTO DE DEMOSTRACION`.replace(/[()\\]/g, '');
  const contenido = `BT /F1 14 Tf 60 760 Td (${texto}) Tj ET`;
  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const posiciones: number[] = [];
  objetos.forEach((obj, i) => {
    posiciones.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  pdf += posiciones.map((p) => `${String(p).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, 'latin1');
}

// ---------------------------------------------------------------- datos

const EMPRESAS = [
  { ruc: '20999999901', razonSocial: 'DEMO Transportes del Sur S.A.C.', correoContacto: 'contacto@demo-transportes.pe' },
  { ruc: '20999999902', razonSocial: 'DEMO Servicios Portuarios Islay S.A.', correoContacto: 'rrhh@demo-portuarios.pe' },
  { ruc: '20999999903', razonSocial: 'DEMO Mantenimiento Industrial E.I.R.L.', correoContacto: 'operaciones@demo-mantenimiento.pe' },
  { ruc: '20999999904', razonSocial: 'DEMO Seguridad Integral Mollendo S.A.C.', correoContacto: 'gerencia@demo-seguridad.pe' },
  { ruc: '20999999905', razonSocial: 'DEMO Estiba y Desestiba Matarani S.A.C.', correoContacto: 'personal@demo-estiba.pe' },
  { ruc: '20999999906', razonSocial: 'DEMO Limpieza y Servicios Generales Islay E.I.R.L.', correoContacto: 'administracion@demo-limpieza.pe' },
];

/** Días desde hoy (negativo = en el pasado), en formato AAAA-MM-DD. */
function fecha(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type Doc = { nombre: string; vence: number | null };
const normal = (extra: Doc[] = []): Doc[] => [
  { nombre: 'SCTR Salud', vence: 150 },
  { nombre: 'SCTR Pensión', vence: 150 },
  { nombre: 'Inducción SSMA', vence: 280 },
  ...extra,
];

type PersonaDemo = {
  empresa: number;
  tipo?: 'DNI' | 'CE';
  numero: string;
  nombres: string;
  apellidos: string;
  documentos: Doc[];
  baja?: boolean;
};

const PERSONAS: PersonaDemo[] = [
  { empresa: 0, numero: '99010001', nombres: 'Jorge Luis', apellidos: 'Apaza Condori', documentos: normal([{ nombre: 'Licencia de conducir', vence: 600 }]) },
  { empresa: 0, numero: '99010002', nombres: 'Víctor Hugo', apellidos: 'Chambi Quispe', documentos: normal([{ nombre: 'Licencia de conducir', vence: 420 }]) },
  { empresa: 0, numero: '99010003', nombres: 'Edwin', apellidos: 'Flores Ticona', documentos: normal([{ nombre: 'Licencia de conducir', vence: -12 }]) },
  { empresa: 0, numero: '99010004', nombres: 'Raúl Ernesto', apellidos: 'Cutipa Mamani', documentos: normal([{ nombre: 'Licencia de conducir', vence: 5 }]) },
  { empresa: 0, numero: '99010005', nombres: 'Santiago', apellidos: 'Huanca Pari', documentos: normal() },
  { empresa: 1, numero: '99020001', nombres: 'María Elena', apellidos: 'Coaquira Llave', documentos: normal([{ nombre: 'Examen médico ocupacional', vence: 200 }]) },
  { empresa: 1, numero: '99020002', nombres: 'Wilber', apellidos: 'Nina Choquehuanca', documentos: normal([{ nombre: 'Examen médico ocupacional', vence: 90 }]) },
  { empresa: 1, numero: '99020003', nombres: 'Rosa Luz', apellidos: 'Yupanqui Soto', documentos: [{ nombre: 'SCTR Salud', vence: -30 }, { nombre: 'SCTR Pensión', vence: -30 }, { nombre: 'Inducción SSMA', vence: 100 }] },
  { empresa: 1, numero: '99020004', nombres: 'Alberto', apellidos: 'Machaca Vilca', documentos: normal([{ nombre: 'Examen médico ocupacional', vence: 330 }]) },
  { empresa: 1, numero: '99020005', nombres: 'Gladys', apellidos: 'Ramos Cáceres', documentos: normal(), baja: true },
  { empresa: 1, numero: '99020006', nombres: 'Percy', apellidos: 'Zapana Arias', documentos: normal([{ nombre: 'Examen médico ocupacional', vence: 0 }]) },
  { empresa: 2, numero: '99030001', nombres: 'Hernán', apellidos: 'Calcina Mendoza', documentos: normal([{ nombre: 'Certificado de trabajo en altura', vence: 180 }]) },
  { empresa: 2, numero: '99030002', nombres: 'Freddy', apellidos: 'Pacheco Luque', documentos: normal([{ nombre: 'Certificado de trabajo en altura', vence: -3 }]) },
  { empresa: 2, numero: '99030003', nombres: 'Juan Carlos', apellidos: 'Ccori Huamaní', documentos: normal([{ nombre: 'Certificado de trabajo en altura', vence: 240 }]) },
  { empresa: 2, numero: '99030004', nombres: 'Elmer', apellidos: 'Supo Ancco', documentos: [] },
  { empresa: 2, tipo: 'CE', numero: '99CE00451', nombres: 'Andrés Felipe', apellidos: 'Restrepo Gómez', documentos: normal() },
  { empresa: 3, numero: '99040001', nombres: 'Lucía', apellidos: 'Mamani Arapa', documentos: normal([{ nombre: 'Curso de vigilancia (SUCAMEC)', vence: 365 }]) },
  { empresa: 3, numero: '99040002', nombres: 'Óscar', apellidos: 'Velásquez Rojas', documentos: normal([{ nombre: 'Curso de vigilancia (SUCAMEC)', vence: 25 }]) },
  { empresa: 3, numero: '99040003', nombres: 'Teodoro', apellidos: 'Quispe Larico', documentos: normal([{ nombre: 'Curso de vigilancia (SUCAMEC)', vence: 400 }]), baja: true },
  { empresa: 3, numero: '99040004', nombres: 'Karina', apellidos: 'Aguilar Paredes', documentos: [{ nombre: 'SCTR Salud', vence: null }, { nombre: 'Inducción SSMA', vence: null }] },
];

// 36 personas más, generadas: repartidas en las 6 empresas, con algunos
// documentos vencidos o por vencer y una de baja.
const NOMBRES = ['Luis', 'Carmen', 'Julio César', 'Yessica', 'Marco Antonio', 'Pilar', 'Roberto', 'Nancy', 'Fidel', 'Silvia', 'Ángel', 'Maribel'];
const APELLIDOS = ['Aquino', 'Benavides', 'Cahuana', 'Delgado', 'Escobar', 'Gutiérrez', 'Huarca', 'Illanes', 'Jiménez', 'Lazo', 'Medina', 'Núñez', 'Ortiz', 'Pinto', 'Rivera', 'Salas', 'Torres', 'Valdivia'];
for (let i = 0; i < 36; i++) {
  const vencido = i % 11 === 4;
  const porVencer = i % 7 === 2;
  PERSONAS.push({
    empresa: i % 6,
    numero: `9905${String(i + 1).padStart(4, '0')}`,
    nombres: NOMBRES[i % NOMBRES.length],
    apellidos: `${APELLIDOS[i % APELLIDOS.length]} ${APELLIDOS[(i * 5 + 3) % APELLIDOS.length]}`,
    documentos: normal([{ nombre: 'Examen médico ocupacional', vence: vencido ? -8 : porVencer ? 12 : 200 + i * 3 }]),
    baja: i === 30,
  });
}

const COLORES: [number, number, number][] = [
  [52, 101, 164], [78, 154, 6], [196, 160, 0], [117, 80, 123], [204, 0, 0], [6, 152, 154], [206, 92, 0], [85, 87, 83],
];

// ---------------------------------------------------------------- carga

async function main() {
  if (!ADMIN_PASSWORD) throw new Error('Falta ADMIN_PASSWORD');

  token = (await api<{ accessToken: string }>('/auth/login', { method: 'POST', json: { correo: ADMIN_CORREO, password: ADMIN_PASSWORD } })).accessToken;

  const existentes = await api<{ id: number; ruc: string }[]>('/empresas');
  if (existentes.some((e) => e.ruc.startsWith('209999999'))) {
    throw new Error('Ya hay datos DEMO cargados. Bórralos antes con prisma/limpiar-demo.sh.');
  }

  const empresas: number[] = [];
  for (const e of EMPRESAS) {
    empresas.push((await api<{ id: number }>('/empresas', { method: 'POST', json: e })).id);
    console.log(`Empresa: ${e.razonSocial}`);
  }

  const tipos = new Map<string, number>();
  const creadas: { persona: PersonaDemo; id: number }[] = [];
  for (const [i, p] of PERSONAS.entries()) {
    const { id } = await api<{ id: number }>('/personas', {
      method: 'POST',
      json: { empresaId: empresas[p.empresa], tipoDocumentoIdentidad: p.tipo ?? 'DNI', numeroDocumento: p.numero, nombres: p.nombres, apellidos: p.apellidos },
    });
    const nombre = `${p.nombres} ${p.apellidos}`;

    // SIN_FOTOS=1 en un servidor con un G4 Pro real: cada foto se registra en el equipo.
    if (!SIN_FOTOS) {
      const foto = new FormData();
      foto.append('foto', new Blob([new Uint8Array(fotoPng(COLORES[i % COLORES.length]))], { type: 'image/png' }), `foto-${p.numero}.png`);
      await api(`/personas/${id}/foto`, { method: 'POST', form: foto });
    }

    for (const d of p.documentos) {
      if (!tipos.has(d.nombre)) {
        tipos.set(d.nombre, (await api<{ id: number }>('/tipos-documento', { method: 'POST', json: { nombre: d.nombre } })).id);
      }
      const form = new FormData();
      form.append('tipoDocumentoId', String(tipos.get(d.nombre)));
      if (d.vence !== null) form.append('fechaVencimiento', fecha(d.vence));
      // Los vencidos de la demo van a propósito (la API rechaza fechas pasadas si no).
      if (d.vence !== null && d.vence < 0) form.append('permitirVencido', 'true');
      form.append('archivo', new Blob([new Uint8Array(documentoPdf(d.nombre, nombre))], { type: 'application/pdf' }), `${d.nombre}.pdf`);
      await api(`/personas/${id}/documentos`, { method: 'POST', form });
    }

    if (p.baja) await api(`/personas/${id}/estado`, { method: 'PATCH', json: { estado: 'inactivo' } });
    creadas.push({ persona: p, id });
    console.log(`Persona: ${nombre} (${p.numero}) · ${p.documentos.length} documentos${p.baja ? ' · de baja' : ''}`);
  }

  if (!DEVICE_API_KEY) {
    console.log('\nSin DEVICE_API_KEY: no se cargan ingresos ni salidas.');
    return;
  }

  // Movimientos del día: ingresos de todos, algunos denegados, y salidas de varios.
  let eventos = 0;
  const mover = async (p: PersonaDemo, movimiento: 'ingreso' | 'salida', alcoholConforme = true) => {
    await api(`/eventos-acceso/${movimiento}`, {
      method: 'POST',
      clave: true,
      json: {
        tipoDocumentoIdentidad: p.tipo ?? 'DNI',
        numeroDocumento: p.numero,
        torniqueteId: MOLINETE,
        ...(movimiento === 'ingreso' && { alcoholConforme }),
      },
    });
    eventos++;
  };
  const noRegistrado = { empresa: 0, numero: '99999901', nombres: '', apellidos: '', documentos: [] } as PersonaDemo;

  // Hoy ingresa 4 de cada 5 personas; un tercio de ellas ya salió.
  const ingresaron = creadas.filter((_, i) => i % 5 !== 4);
  for (const { persona } of ingresaron) await mover(persona, 'ingreso');
  await mover(creadas[1].persona, 'ingreso', false); // alcohol
  await mover(creadas[11].persona, 'ingreso', false); // alcohol
  await mover(noRegistrado, 'ingreso');
  for (const [i, { persona }] of ingresaron.entries()) if (i % 3 === 0) await mover(persona, 'salida');
  await mover(creadas[9].persona, 'salida'); // de baja: puede salir
  await mover({ ...noRegistrado, numero: '99999902' }, 'salida');
  console.log(`\nMovimientos: ${eventos} (molinete "${MOLINETE}")`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
