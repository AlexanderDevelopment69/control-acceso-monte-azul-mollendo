/**
 * Documentos del personal: lista fija (22/10/2026; la misma que la API,
 * mollendo-api/src/tipos-documento/documentos-personal.ts).
 */
export const DOCUMENTOS_PERSONAL = [
  "SCTR Salud y Pensión",
  "Certificado de Aptitud Médico Ocupacional (CAMO)",
  "Certificado de Inducción SSMA – Visitas",
  "Certificado de Inducción SSMA – Contratistas",
  "Certificado de Inducción SSMA – Personal de Planta",
] as const;

/** Opciones para el desplegable "Nombre del documento". */
export const OPCIONES_DOCUMENTO = DOCUMENTOS_PERSONAL.map((d) => ({ value: d, label: d }));
