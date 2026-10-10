// Archivo de ejemplo para los documentos DEMO sin archivo (los de la carga
// masiva, prisma/carga-masiva-demo.ts): así "Ver" abre algo en lugar de "El
// archivo del documento no está disponible".
//
//   docker compose cp ../../mollendo-api/prisma/archivos-demo.ts api:/app/prisma/
//   docker compose exec -T api npx tsx prisma/archivos-demo.ts
//
// Es un PDF de una página ("Documento de prueba"). Se guarda una sola vez y cada
// documento recibe un enlace duro (hard link) a él en la carpeta de su persona:
// ocupa lo de un archivo, y si se borra o reemplaza un documento solo se quita
// su enlace, sin afectar a los demás. Solo toca documentos de empresas DEMO sin
// archivo; limpiar-demo.sh los borra junto con las carpetas de esas personas.
import 'dotenv/config';
import { copyFileSync, existsSync, linkSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const RAIZ = resolve(process.env.DOCUMENTOS_STORAGE_PATH ?? './storage/documentos');

/** PDF mínimo de una página con un texto (con su tabla de referencias correcta). */
function pdfDePrueba(): Buffer {
  const texto = [
    'BT /F1 22 Tf 72 720 Td (Documento de prueba) Tj ET',
    'BT /F1 12 Tf 72 690 Td (Datos de demostracion del sistema de control de accesos.) Tj ET',
    'BT /F1 12 Tf 72 670 Td (No corresponde a ninguna persona real.) Tj ET',
  ].join('\n');
  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${texto.length} >>\nstream\n${texto}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const posiciones: number[] = [];
  objetos.forEach((o, i) => {
    posiciones.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  for (const p of posiciones) pdf += `${String(p).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, 'latin1');
}

async function main() {
  const original = join(RAIZ, 'demo-documento-prueba.pdf');
  mkdirSync(RAIZ, { recursive: true });
  if (!existsSync(original)) writeFileSync(original, pdfDePrueba());

  const documentos = await prisma.documentoPersona.findMany({
    where: { archivoUrl: null, persona: { empresa: { ruc: { startsWith: '209999999' } } } },
    select: { id: true, personaId: true },
  });
  let enlazados = 0;
  for (let i = 0; i < documentos.length; i += 500) {
    const tanda = documentos.slice(i, i + 500);
    const cambios = tanda.map((d) => {
      const carpeta = join(RAIZ, `persona-${d.personaId}`);
      mkdirSync(carpeta, { recursive: true });
      const ruta = join(carpeta, `documento-demo-${d.id}.pdf`);
      if (!existsSync(ruta)) {
        try {
          linkSync(original, ruta);
          enlazados++;
        } catch {
          copyFileSync(original, ruta); // si el sistema de archivos no admite enlaces duros
        }
      }
      return prisma.documentoPersona.update({ where: { id: d.id }, data: { archivoUrl: ruta } });
    });
    await prisma.$transaction(cambios);
  }
  console.log(`Archivo de prueba asignado a ${documentos.length} documentos DEMO (${enlazados} con enlace al mismo archivo), en ${RAIZ}.`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
