// Semilla inicial (alcance base): crea la empresa interna (OTP/MAS — operador
// del Terminal), el administrador único, una cuenta de Vigilancia y la de Soporte
// (equipo técnico; solo si SOPORTE_SEED_PASSWORD está definida). Luego el
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

const SOPORTE_CORREO = process.env.SOPORTE_SEED_EMAIL || 'soporte@monteazulsur.com.pe';
const SOPORTE_PASSWORD = process.env.SOPORTE_SEED_PASSWORD;

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

  // Soporte: sin contraseña en .env no se crea (nunca con una contraseña de ejemplo).
  if (SOPORTE_PASSWORD) {
    await prisma.usuario.upsert({
      where: { correo: SOPORTE_CORREO },
      update: {},
      create: {
        empresaId: empresaInterna.id,
        rol: 'soporte',
        correo: SOPORTE_CORREO,
        passwordHash: await hash(SOPORTE_PASSWORD, 10),
        estadoCuenta: 'activo',
      },
    });
  }

  console.log('Cuentas listas:');
  console.log(`  Administrador:  ${ADMIN_CORREO} / ${process.env.ADMIN_SEED_PASSWORD ? '(definida en .env)' : ADMIN_PASSWORD}`);
  console.log(`  Vigilancia:     ${VIGILANCIA_CORREO} / ${process.env.VIGILANCIA_SEED_PASSWORD ? '(definida en .env)' : VIGILANCIA_PASSWORD}`);
  console.log(`  Soporte:        ${SOPORTE_PASSWORD ? `${SOPORTE_CORREO} / (definida en .env)` : 'no se creó (falta SOPORTE_SEED_PASSWORD en .env)'}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
