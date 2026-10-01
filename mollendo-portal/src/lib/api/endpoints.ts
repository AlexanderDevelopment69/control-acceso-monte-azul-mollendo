import { apiRequest } from "./client";
import { consulta } from "@/lib/paginaServidor";
import type {
  AuditoriaEntry,
  Dashboard,
  PersonaPermanencia,
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
  /** Archivo de una versión del documento (PDF, imagen o Word), con su nombre. */
  archivo: (personaId: number, documentoId: number) =>
    apiRequest<{ blob: Blob; nombre: string }>(`/personas/${personaId}/documentos/${documentoId}/archivo`, {
      responseType: "archivo",
    }),
  /** Elimina el documento completo (todas sus versiones) de la persona. */
  eliminar: (personaId: number, tipoDocumentoId: number) =>
    apiRequest<{ eliminados: number }>(`/personas/${personaId}/documentos/${tipoDocumentoId}`, { method: "DELETE" }),
};

// ---- eventos-acceso ----
export const eventosAccesoApi = {
  /** Historial paginado en el servidor, más recientes primero. */
  list: (params: FiltrosLista & { personaId?: number; resultado?: string } = {}) =>
    apiRequest<Paginado<EventoAcceso>>(`/eventos-acceso${consulta({ ...params })}`),
};

// ---- reportes ----
export type TipoReporte = "personal" | "documentos" | "movimientos" | "visitas" | "presentes" | "auditoria";
export const reportesApi = {
  /** Descarga un reporte en Excel o PDF, con los filtros indicados. */
  descargar: (tipo: TipoReporte, params: Record<string, string | number | undefined>) =>
    apiRequest<{ blob: Blob; nombre: string }>(`/reportes/${tipo}${consulta(params)}`, { responseType: "archivo" }),
};

// ---- panel ----
export const panelApi = {
  resumen: () => apiRequest<ResumenPanel>("/panel/resumen"),
  dashboard: (params: { desde?: string; hasta?: string } = {}) =>
    apiRequest<Dashboard>(`/panel/dashboard${consulta(params)}`),
  permanencia: (params: { pagina?: number; porPagina?: number } = {}) =>
    apiRequest<Paginado<PersonaPermanencia>>(`/panel/dashboard/permanencia${consulta(params)}`),
  estadoSistema: () => apiRequest<EstadoSistema>("/panel/estado-sistema"),
};

// ---- auditoria ----
export const auditoriaApi = {
  /** Paginada en el servidor, más recientes primero. */
  list: (params: FiltrosLista & { tablaAfectada?: string; registroId?: number } = {}) =>
    apiRequest<Paginado<AuditoriaEntry>>(`/auditoria${consulta({ ...params })}`),
};

export type { RolUsuario };
