// Semilla inicial: crea la empresa interna (OTP/MAS — operador del Terminal),
// el primer usuario de Administración (único bootstrap posible, ya que el
// resto de cuentas se crean por invitación — ver spec, sección 4.1), y dos
// cuentas de DEMOSTRACIÓN (empresa proveedora + vigilancia) para poder
// probar los 3 roles sin tener que pasar por el flujo de invitación por
// correo. Las cuentas demo no deben usarse en producción.
import 'dotenv/config';
import { hash } from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const ADMIN_RUC = process.env.ADMIN_SEED_RUC ?? '00000000000';
const ADMIN_CORREO = process.env.ADMIN_SEED_EMAIL ?? 'admin@mollendo.local';
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD ?? 'Cambiar123!';

const VIGILANCIA_CORREO = process.env.VIGILANCIA_SEED_EMAIL ?? 'vigilancia@mollendo.local';
const VIGILANCIA_PASSWORD = process.env.VIGILANCIA_SEED_PASSWORD ?? 'Cambiar123!';

const EMPRESA_DEMO_RUC = process.env.EMPRESA_DEMO_RUC ?? '20000000001';
const EMPRESA_DEMO_CORREO = process.env.EMPRESA_DEMO_EMAIL ?? 'empresa@mollendo.local';
const EMPRESA_DEMO_PASSWORD = process.env.EMPRESA_DEMO_PASSWORD ?? 'Cambiar123!';

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
      rol: 'administracion',
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

  // Empresa proveedora de demostración, con su propio usuario ya activo
  // (en producción esta cuenta nacería por invitación, no por seed).
  const empresaDemo = await prisma.empresa.upsert({
    where: { ruc: EMPRESA_DEMO_RUC },
    update: {},
    create: {
      ruc: EMPRESA_DEMO_RUC,
      razonSocial: 'Empresa Demo SAC',
      correoContacto: EMPRESA_DEMO_CORREO,
      estado: 'activa',
    },
  });

  const empresaDemoPasswordHash = await hash(EMPRESA_DEMO_PASSWORD, 10);
  await prisma.usuario.upsert({
    where: { correo: EMPRESA_DEMO_CORREO },
    update: {},
    create: {
      empresaId: empresaDemo.id,
      rol: 'empresa',
      correo: EMPRESA_DEMO_CORREO,
      passwordHash: empresaDemoPasswordHash,
      estadoCuenta: 'activo',
    },
  });

  console.log('Cuentas listas:');
  console.log(`  Administración: ${ADMIN_CORREO} / ${process.env.ADMIN_SEED_PASSWORD ? '(definida en .env)' : ADMIN_PASSWORD}`);
  console.log(`  Vigilancia:     ${VIGILANCIA_CORREO} / ${process.env.VIGILANCIA_SEED_PASSWORD ? '(definida en .env)' : VIGILANCIA_PASSWORD}`);
  console.log(`  Empresa (demo): ${EMPRESA_DEMO_CORREO} / ${process.env.EMPRESA_DEMO_PASSWORD ? '(definida en .env)' : EMPRESA_DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
