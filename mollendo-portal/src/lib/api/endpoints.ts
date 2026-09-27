import { apiRequest } from "./client";
import type {
  AuditoriaEntry,
  DocumentoPersona,
  Empresa,
  EstadoSistema,
  EventoAcceso,
  Persona,
  ResumenPanel,
  RolUsuario,
  TipoDocumento,
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
  create: (data: { ruc: string; razonSocial: string; correoContacto: string; telefonoContacto?: string }) =>
    apiRequest<Empresa>("/empresas", { method: "POST", body: data }),
};

// ---- personas ----
export const personasApi = {
  list: (params?: { empresaId?: number; estado?: string }) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params ?? {}).map(([k, v]) => [k, String(v)])),
    ).toString();
    return apiRequest<Persona[]>(`/personas${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => apiRequest<Persona>(`/personas/${id}`),
  create: (data: {
    empresaId: number;
    tipoDocumentoIdentidad: string;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
  }) => apiRequest<Persona>("/personas", { method: "POST", body: data }),
  /** Foto para el reconocimiento facial del terminal (reemplaza la anterior). */
  subirFoto: (id: number, foto: File) => {
    const formData = new FormData();
    formData.append("foto", foto);
    return apiRequest<Persona>(`/personas/${id}/foto`, { method: "POST", body: formData, isFormData: true });
  },
  foto: (id: number) => apiRequest<Blob>(`/personas/${id}/foto`, { responseType: "blob" }),
  updateEstado: (id: number, estado: "activo" | "inactivo") =>
    apiRequest<Persona>(`/personas/${id}/estado`, { method: "PATCH", body: { estado } }),
};

// ---- tipos-documento ----
export const tiposDocumentoApi = {
  list: () => apiRequest<TipoDocumento[]>("/tipos-documento"),
  /** Si el nombre ya existe, devuelve el existente. */
  create: (data: { nombre: string }) =>
    apiRequest<TipoDocumento>("/tipos-documento", { method: "POST", body: data }),
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
