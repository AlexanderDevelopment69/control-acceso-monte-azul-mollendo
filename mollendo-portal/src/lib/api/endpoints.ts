import { apiRequest } from "./client";
import type {
  AuditoriaEntry,
  DocumentoPersona,
  Empresa,
  EstadoSistema,
  EventoAcceso,
  Persona,
  Puesto,
  RequisitoPorPuesto,
  ResumenPanel,
  RolUsuario,
  SolicitudVisita,
  TipoDocumento,
  Usuario,
} from "./types";

// ---- auth ----
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}
export const authApi = {
  login: (correo: string, password: string) =>
    apiRequest<LoginResponse>("/auth/login", { method: "POST", body: { correo, password }, skipAuth: true }),
};

// ---- empresas ----
export const empresasApi = {
  list: (params?: { estado?: string; busqueda?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest<Empresa[]>(`/empresas${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => apiRequest<Empresa>(`/empresas/${id}`),
  create: (data: { ruc: string; razonSocial: string; correoContacto: string; telefonoContacto?: string }) =>
    apiRequest<Empresa>("/empresas", { method: "POST", body: data }),
  update: (id: number, data: Partial<Empresa>) =>
    apiRequest<Empresa>(`/empresas/${id}`, { method: "PATCH", body: data }),
};

// ---- personas ----
export const personasApi = {
  list: (params?: { empresaId?: number; puestoId?: number; estado?: string }) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params ?? {}).map(([k, v]) => [k, String(v)])),
    ).toString();
    return apiRequest<Persona[]>(`/personas${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => apiRequest<Persona>(`/personas/${id}`),
  create: (data: {
    empresaId: number;
    puestoId?: number;
    tipoDocumentoIdentidad: string;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    area?: string;
  }) => apiRequest<Persona>("/personas", { method: "POST", body: data }),
  update: (
    id: number,
    data: Partial<Pick<Persona, "empresaId" | "puestoId" | "nombres" | "apellidos" | "area">>,
  ) =>
    apiRequest<Persona>(`/personas/${id}`, { method: "PATCH", body: data }),
  updateEstado: (id: number, estado: "activo" | "inactivo") =>
    apiRequest<Persona>(`/personas/${id}/estado`, { method: "PATCH", body: { estado } }),
};

// ---- tipos-documento ----
export const tiposDocumentoApi = {
  list: () => apiRequest<TipoDocumento[]>("/tipos-documento"),
  create: (data: { nombre: string; tipoValidacion: string }) =>
    apiRequest<TipoDocumento>("/tipos-documento", { method: "POST", body: data }),
};

// ---- puestos ----
export const puestosApi = {
  list: () => apiRequest<Puesto[]>("/puestos"),
  create: (data: { nombre: string; caso: string }) => apiRequest<Puesto>("/puestos", { method: "POST", body: data }),
  requisitos: (puestoId: number) => apiRequest<RequisitoPorPuesto[]>(`/puestos/${puestoId}/requisitos`),
  setRequisitos: (puestoId: number, requisitos: { tipoDocumentoId: number; obligatorio: boolean }[]) =>
    apiRequest<RequisitoPorPuesto[]>(`/puestos/${puestoId}/requisitos`, {
      method: "POST",
      body: { requisitos },
    }),
};

// ---- documentos ----
export const documentosApi = {
  historial: (personaId: number) => apiRequest<DocumentoPersona[]>(`/personas/${personaId}/documentos`),
  subir: (personaId: number, formData: FormData) =>
    apiRequest<DocumentoPersona>(`/personas/${personaId}/documentos`, {
      method: "POST",
      body: formData,
      isFormData: true,
    }),
};

// ---- solicitudes-visita ----
export const solicitudesVisitaApi = {
  list: (params?: { empresaId?: number; personaId?: number; desde?: string; hasta?: string }) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params ?? {}).map(([k, v]) => [k, String(v)])),
    ).toString();
    return apiRequest<SolicitudVisita[]>(`/solicitudes-visita${qs ? `?${qs}` : ""}`);
  },
  create: (data: { personaId: number; personaVisitada: string; motivo: string; fechaHoraProgramada: string }) =>
    apiRequest<SolicitudVisita>("/solicitudes-visita", { method: "POST", body: data }),
  update: (id: number, data: { fechaHoraProgramada?: string; estado?: string }) =>
    apiRequest<SolicitudVisita>(`/solicitudes-visita/${id}`, { method: "PATCH", body: data }),
};

// ---- eventos-acceso ----
export const eventosAccesoApi = {
  list: (params?: { personaId?: number; resultado?: string; desde?: string; hasta?: string }) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params ?? {}).map(([k, v]) => [k, String(v)])),
    ).toString();
    return apiRequest<EventoAcceso[]>(`/eventos-acceso${qs ? `?${qs}` : ""}`);
  },
};

// ---- panel ----
export const panelApi = {
  resumen: () => apiRequest<ResumenPanel>("/panel/resumen"),
  estadoSistema: () => apiRequest<EstadoSistema>("/panel/estado-sistema"),
};

// ---- usuarios (solo administrador) ----
export const usuariosApi = {
  list: () => apiRequest<Usuario[]>("/usuarios"),
  create: (data: { correo: string; rol: RolUsuario; password: string }) =>
    apiRequest<Usuario>("/usuarios", { method: "POST", body: data }),
  update: (id: number, data: { estadoCuenta?: "activo" | "baja"; password?: string }) =>
    apiRequest<Usuario>(`/usuarios/${id}`, { method: "PATCH", body: data }),
};

// ---- auditoria ----
export const auditoriaApi = {
  list: (params?: { tablaAfectada?: string; registroId?: number }) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params ?? {}).map(([k, v]) => [k, String(v)])),
    ).toString();
    return apiRequest<AuditoriaEntry[]>(`/auditoria${qs ? `?${qs}` : ""}`);
  },
};

export type { RolUsuario };
