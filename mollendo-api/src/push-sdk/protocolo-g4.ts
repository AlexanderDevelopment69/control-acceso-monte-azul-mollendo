import type { PrismaService } from '../prisma/prisma.service.js';

/**
 * Variante del firmware del G4 Pro: control de acceso (ACC) o asistencia
 * (ATT). Se cambia en el menú del equipo ("firmware type settings"; el cambio
 * borra sus usuarios). El 19/10/2026 se pasó a asistencia, la única que dice
 * quién sopló y cuánto alcohol dio (`ATTLOG`, ver asistencia.util.ts). El
 * servidor la detecta sola: el equipo la anuncia al pedir sus opciones
 * (`GET /iclock/cdata?options=all&DeviceType=att|acc`) y en asistencia envía
 * `ATTLOG`. Se guarda en los ajustes del sistema (un solo G4 Pro por sede).
 */
const CLAVE = 'protocolo_g4';
const ASISTENCIA = 'asistencia';
const ACCESO = 'acceso';

type ConAjustes = Pick<PrismaService, 'ajusteSistema'>;

/** ¿El G4 Pro está en la variante de asistencia? */
export async function leerModoAsistencia(prisma: ConAjustes): Promise<boolean> {
  return (await prisma.ajusteSistema.findUnique({ where: { clave: CLAVE } }))?.valor === ASISTENCIA;
}

/** Anota la variante que anunció el equipo. Devuelve true si cambió. */
export async function guardarModoAsistencia(prisma: ConAjustes, asistencia: boolean): Promise<boolean> {
  const valor = asistencia ? ASISTENCIA : ACCESO;
  const actual = await prisma.ajusteSistema.findUnique({ where: { clave: CLAVE } });
  if (actual?.valor === valor) return false;
  await prisma.ajusteSistema.upsert({
    where: { clave: CLAVE },
    create: { clave: CLAVE, valor, modificadoPor: 'G4 Pro' },
    update: { valor, modificadoPor: 'G4 Pro' },
  });
  return true;
}
