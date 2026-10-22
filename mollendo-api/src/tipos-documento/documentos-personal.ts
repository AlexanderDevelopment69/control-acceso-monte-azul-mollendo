/**
 * Documentos del personal: lista fija (pedido del usuario, 22/10/2026). Al
 * subir uno solo se aceptan estos nombres; los que se escribieron a mano antes
 * siguen valiendo (y se renuevan con su nombre). La misma lista está en el
 * portal (mollendo-portal/src/lib/documentos.ts).
 */
export const DOCUMENTOS_PERSONAL = [
  'SCTR Salud y Pensión',
  'Certificado de Aptitud Médico Ocupacional (CAMO)',
  'Certificado de Inducción SSMA – Visitas',
  'Certificado de Inducción SSMA – Contratistas',
  'Certificado de Inducción SSMA – Personal de Planta',
] as const;

/** El nombre de la lista que corresponde (sin distinguir mayúsculas ni espacios de más), o null. */
export function documentoDeLaLista(nombre: string): string | null {
  const buscado = nombre.replace(/\s+/g, ' ').trim().toLocaleLowerCase('es');
  return DOCUMENTOS_PERSONAL.find((d) => d.toLocaleLowerCase('es') === buscado) ?? null;
}
