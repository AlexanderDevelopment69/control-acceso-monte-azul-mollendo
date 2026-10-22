// Semilla inicial (alcance base): crea la empresa interna (OTP/MAS — operador
// del Terminal), el administrador único y una cuenta de Vigilancia. Luego el
// administrador puede crear más cuentas desde Configuración → Usuarios. Las
// empresas proveedoras reales las carga el administrador desde el portal.
import 'dotenv/config';
import { hash } from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const ADMIN_RUC = process.env.ADMIN_SEED_RUC || '00000000000';
const ADMIN_CORREO = process.env.ADMIN_SEED_EMAIL || 'admin@monteazulsur.com.pe';
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'Cambiar123!';

const VIGILANCIA_CORREO = process.env.VIGILANCIA_SEED_EMAIL || 'vigilancia@monteazulsur.com.pe';
const VIGILANCIA_PASSWORD = process.env.VIGILANCIA_SEED_PASSWORD || 'Cambiar123!';

async function main() {
  const empresaInterna = await prisma.empresa.upsert({
    where: { ruc: ADMIN_RUC },
    update: {},
    create: {
      ruc: ADMIN_RUC,
      razonSocial: 'OTP/MAS — Administración Terminal de Mollendo',
      correoContacto: ADMIN_CORREO,
      estado: 'activa',
    },
  });

  const adminPasswordHash = await hash(ADMIN_PASSWORD, 10);
  await prisma.usuario.upsert({
    where: { correo: ADMIN_CORREO },
    update: {},
    create: {
      empresaId: empresaInterna.id,
      rol: 'administrador',
      correo: ADMIN_CORREO,
      passwordHash: adminPasswordHash,
      estadoCuenta: 'activo',
    },
  });

  // Vigilancia también es personal interno de OTP/MAS, no una empresa proveedora.
  const vigilanciaPasswordHash = await hash(VIGILANCIA_PASSWORD, 10);
  await prisma.usuario.upsert({
    where: { correo: VIGILANCIA_CORREO },
    update: {},
    create: {
      empresaId: empresaInterna.id,
      rol: 'vigilancia',
      correo: VIGILANCIA_CORREO,
      passwordHash: vigilanciaPasswordHash,
      estadoCuenta: 'activo',
    },
  });


  console.log('Cuentas listas:');
  console.log(`  Administrador:  ${ADMIN_CORREO} / ${process.env.ADMIN_SEED_PASSWORD ? '(definida en .env)' : ADMIN_PASSWORD}`);
  console.log(`  Vigilancia:     ${VIGILANCIA_CORREO} / ${process.env.VIGILANCIA_SEED_PASSWORD ? '(definida en .env)' : VIGILANCIA_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
