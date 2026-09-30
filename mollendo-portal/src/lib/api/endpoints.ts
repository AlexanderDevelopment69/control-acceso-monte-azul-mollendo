import { apiRequest } from "./client";
import { consulta } from "@/lib/paginaServidor";
import type {
  AuditoriaEntry,
  DocumentoPersona,
  Empresa,
  EstadoSistema,
  EventoAcceso,
  FiltrosLista,
  Paginado,
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
  /** Devuelve tokens nuevos: los anteriores dejan de valer (se cierran las otras sesiones). */
  cambiarPassword: (passwordActual: string, passwordNueva: string) =>
    apiRequest<LoginResponse>("/cuenta/password", { method: "PATCH", body: { passwordActual, passwordNueva } }),
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
  list: (params?: { empresaId?: number; estado?: string; tipoPersona?: string }) => {
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
    tipoPersona: string;
  }) => apiRequest<Persona>("/personas", { method: "POST", body: data }),
  update: (id: number, data: { tipoPersona?: string }) =>
    apiRequest<Persona>(`/personas/${id}`, { method: "PATCH", body: data }),
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
  /** Elimina el documento completo (todas sus versiones) de la persona. */
  eliminar: (personaId: number, tipoDocumentoId: number) =>
    apiRequest<{ eliminados: number }>(`/personas/${personaId}/documentos/${tipoDocumentoId}`, { method: "DELETE" }),
};

// ---- eventos-acceso ----
export const eventosAccesoApi = {
  /** Historial paginado en el servidor, más recientes primero. */
  list: (params: FiltrosLista & { personaId?: number; resultado?: string; tipoPersona?: string } = {}) =>
    apiRequest<Paginado<EventoAcceso>>(`/eventos-acceso${consulta({ ...params })}`),
};

// ---- panel ----
export const panelApi = {
  resumen: () => apiRequest<ResumenPanel>("/panel/resumen"),
  estadoSistema: () => apiRequest<EstadoSistema>("/panel/estado-sistema"),
};

// ---- auditoria ----
export const auditoriaApi = {
  /** Paginada en el servidor, más recientes primero. */
  list: (params: FiltrosLista & { tablaAfectada?: string; registroId?: number } = {}) =>
    apiRequest<Paginado<AuditoriaEntry>>(`/auditoria${consulta({ ...params })}`),
};

export type { RolUsuario };
