/**
 * Perfiles de persona (los mismos que la API). Solo clasifican: el molinete
 * valida a todos igual, sin importar el perfil.
 */
export const PERFILES = ["planta", "contratista", "subcontratista", "conductor", "visita", "cliente"] as const;

export type Perfil = (typeof PERFILES)[number];

export const PERFIL_LABEL: Record<Perfil, string> = {
  planta: "Personal de planta",
  contratista: "Contratista",
  subcontratista: "Subcontratista / proveedor",
  conductor: "Conductor",
  visita: "Visita",
  cliente: "Cliente / mayorista",
};

/** Las personas registradas antes de que existiera el perfil. */
export const SIN_PERFIL = "Sin perfil";

export const textoPerfil = (perfil: Perfil | null | undefined) => (perfil ? PERFIL_LABEL[perfil] : SIN_PERFIL);

/** Opciones para un desplegable de perfil. */
export const OPCIONES_PERFIL = PERFILES.map((p) => ({ value: p, label: PERFIL_LABEL[p] }));
