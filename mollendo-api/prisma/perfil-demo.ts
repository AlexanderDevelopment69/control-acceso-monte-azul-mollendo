// Perfil de las personas DEMO según su empresa (por el final del RUC), con
// algunas visitas: así la lista, el Dashboard y los reportes tienen de todos.
import type { PerfilPersona } from '../src/generated/prisma/client.js';

const POR_EMPRESA: Record<string, PerfilPersona> = {
  '01': 'conductor', // Transportes del Sur
  '02': 'contratista', // Servicios Portuarios
  '03': 'contratista', // Mantenimiento Industrial
  '04': 'subcontratista', // Seguridad Integral
  '05': 'contratista', // Estiba y Desestiba
  '06': 'subcontratista', // Limpieza y Servicios Generales
};

/** Perfil de una persona DEMO: por su empresa, y 1 de cada 20 (por su número) visita. */
export function perfilDemo(rucEmpresa: string, numeroDocumento: string): PerfilPersona {
  if (Number(numeroDocumento.slice(-2)) % 20 === 7) return 'visita';
  return POR_EMPRESA[rucEmpresa.slice(-2)] ?? 'contratista';
}
