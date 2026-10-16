// Asigna perfil a las personas DEMO que no lo tienen (las cargadas antes de
// que existiera el perfil), con la misma regla que datos-demo.ts y
// carga-masiva-demo.ts (ver perfil-demo.ts). No toca a nadie más.
//
//   docker compose exec -T api npx tsx prisma/perfiles-demo.ts
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { perfilDemo } from './perfil-demo.js';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const personas = await prisma.persona.findMany({
    where: { perfil: null, numeroDocumento: { startsWith: '99' }, empresa: { ruc: { startsWith: '209999999' } } },
    select: { id: true, numeroDocumento: true, empresa: { select: { ruc: true } } },
  });
  const grupos = new Map<string, number[]>();
  for (const p of personas) {
    const perfil = perfilDemo(p.empresa.ruc, p.numeroDocumento);
    grupos.set(perfil, [...(grupos.get(perfil) ?? []), p.id]);
  }
  for (const [perfil, ids] of grupos) {
    await prisma.persona.updateMany({ where: { id: { in: ids } }, data: { perfil: perfil as never } });
    console.log(`${perfil}: ${ids.length}`);
  }
  console.log(`Personas DEMO con perfil asignado: ${personas.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
