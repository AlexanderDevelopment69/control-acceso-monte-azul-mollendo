import { apiRequest } from "./client";
import { consulta } from "@/lib/paginaServidor";
import type { Perfil } from "@/lib/perfiles";
import type {
  FilaCargaMasiva,
  ResultadoCargaMasiva,
  RevisionCargaMasiva,
  AuditoriaEntry,
  Dashboard,
  DocumentoPersona,
  Empresa,
  EstadoSistema,
  EstadoSincronizacionG4,
  AvisosSistema,
  EventoAcceso,
  FiltrosLista,
  DecisionManual,
  EstadoVerificacionManual,
  EstadoModoIngreso,
  IngresoEnEspera,
  MarcacionG4,
  Paginado,
  Persona,
  PersonaPermanencia,
  PersonaPresente,
  ResultadoSincronizacionG4,
  ResumenPanel,
  RolUsuario,
  TipoDocumento,
} from "./types";

// ---- auth ----
/** Quien tiene la sesión abierta (la sesión misma viaja en una cookie que el portal no puede leer). */
export interface UsuarioSesion {
  id: number;
  empresaId: number;
  rol: RolUsuario;
  correo: string;
}
export interface LoginResponse {
  usuario: UsuarioSesion;
}
export const authApi = {
  /** El servidor guarda la sesión en sus cookies; el portal solo recibe quién es el usuario. */
  login: (correo: string, password: string) =>
    apiRequest<LoginResponse>("/auth/login", { method: "POST", body: { correo, password }, skipAuth: true }),
  /** Qué cookies de sesión tiene el navegador (no las valida: para no pedir /cuenta sin sesión). */
  estado: () => apiRequest<{ acceso: boolean; renovacion: boolean }>("/auth/estado", { skipAuth: true }),
  /** ¿Hay una sesión abierta? (401 si no). */
  sesion: () => apiRequest<UsuarioSesion>("/cuenta"),
  /** Borra las cookies de la sesión. */
  cerrarSesion: () => apiRequest<void>("/auth/cerrar-sesion", { method: "POST", skipAuth: true }),
  /** La sesión sigue con cookies nuevas; las de otros equipos se cierran. */
  cambiarPassword: (passwordActual: string, passwordNueva: string) =>
    apiRequest<unknown>("/cuenta/password", { method: "PATCH", body: { passwordActual, passwordNueva } }),
};

// ---- empresas ----
export const empresasApi = {
  list: (params?: { estado?: string; busqueda?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest<Empresa[]>(`/empresas${qs ? `?${qs}` : ""}`);
  },
  create: (data: { ruc: string; razonSocial: string; correoContacto: string; telefonoContacto?: string }) =>
    apiRequest<Empresa>("/empresas", { method: "POST", body: data }),
  /** Corrige sus datos o la activa / desactiva (solo se envía lo que cambia). */
  update: (
    id: number,
    data: Partial<{ ruc: string; razonSocial: string; correoContacto: string; telefonoContacto: string; estado: "activa" | "inactiva" }>,
  ) => apiRequest<Empresa>(`/empresas/${id}`, { method: "PATCH", body: data }),
  /** Solo empresas sin personal ni usuarios (creadas por error); las demás se desactivan. */
  remove: (id: number) => apiRequest<{ id: number; razonSocial: string }>(`/empresas/${id}`, { method: "DELETE" }),
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
    perfil: Perfil;
    tipoDocumentoIdentidad: string;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
  }) => apiRequest<Persona>("/personas", { method: "POST", body: data }),
  /** Carga masiva: plantilla de Excel para llenar. */
  plantillaCarga: () => apiRequest<{ blob: Blob; nombre: string }>("/personas/carga-masiva/plantilla", { responseType: "archivo" }),
  /** Carga masiva: revisa el Excel sin guardar nada. */
  revisarCarga: (archivo: File) => {
    const formData = new FormData();
    formData.append("archivo", archivo);
    return apiRequest<RevisionCargaMasiva>("/personas/carga-masiva/revisar", { method: "POST", body: formData, isFormData: true });
  },
  /** Carga masiva: registra las filas listas. */
  registrarCarga: (personas: NonNullable<FilaCargaMasiva["persona"]>[]) =>
    apiRequest<ResultadoCargaMasiva>("/personas/carga-masiva", { method: "POST", body: { personas } }),
  /** Carga masiva: Excel con las filas con error y su motivo, para corregirlas. */
  erroresCarga: (filas: (Omit<FilaCargaMasiva, "estado" | "motivos" | "persona"> & { motivo: string })[]) =>
    apiRequest<{ blob: Blob; nombre: string }>("/personas/carga-masiva/errores", { method: "POST", body: { filas }, responseType: "archivo" }),
  /** Foto para el reconocimiento facial del terminal (reemplaza la anterior). */
  subirFoto: (id: number, foto: File) => {
    const formData = new FormData();
    formData.append("foto", foto);
    return apiRequest<Persona>(`/personas/${id}/foto`, { method: "POST", body: formData, isFormData: true });
  },
  foto: (id: number) => apiRequest<Blob>(`/personas/${id}/foto`, { responseType: "blob" }),
  /** Corrige los datos de la persona (solo se envía lo que cambió). */
  update: (
    id: number,
    data: {
      perfil?: Perfil;
      empresaId?: number;
      tipoDocumentoIdentidad?: Persona["tipoDocumentoIdentidad"];
      numeroDocumento?: string;
      nombres?: string;
      apellidos?: string;
    },
  ) => apiRequest<Persona>(`/personas/${id}`, { method: "PATCH", body: data }),
  /** Al dar de baja se puede indicar el motivo (opcional). */
  updateEstado: (id: number, estado: "activo" | "inactivo", motivo?: string) =>
    apiRequest<Persona>(`/personas/${id}/estado`, { method: "PATCH", body: { estado, motivo } }),
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
  /** DNI en regla esperando el rostro y el alcohol del G4 Pro, o al vigilante. */
  enEspera: () => apiRequest<IngresoEnEspera[]>("/eventos-acceso/en-espera"),
  /** Verificación manual (contingencia por falla del equipo facial). */
  verificacionManual: () => apiRequest<EstadoVerificacionManual>("/eventos-acceso/verificacion-manual"),
  activarVerificacionManual: (motivo: string) =>
    apiRequest<EstadoVerificacionManual>("/eventos-acceso/verificacion-manual", { method: "POST", body: { motivo } }),
  terminarVerificacionManual: () =>
    apiRequest<EstadoVerificacionManual>("/eventos-acceso/verificacion-manual", { method: "DELETE" }),
  /** Orden del ingreso (facial primero, en prueba); solo el administrador lo cambia. */
  modoIngreso: () => apiRequest<EstadoModoIngreso>("/eventos-acceso/modo-ingreso"),
  cambiarModoIngreso: (facialPrimero: boolean) =>
    apiRequest<EstadoModoIngreso>("/eventos-acceso/modo-ingreso", { method: "PUT", body: { facialPrimero } }),
  /** Decisión del vigilante sobre la persona en su turno. */
  decidir: (id: number, decision: DecisionManual) =>
    apiRequest<{ ok: true }>(`/eventos-acceso/en-espera/${id}/decision`, { method: "POST", body: { decision } }),
  /** Corrección manual del antipassback: registra la salida o el ingreso de una persona (no abre el molinete). */
  corregir: (personaId: number, tipoMovimiento: "ingreso" | "salida", motivo: string) =>
    apiRequest<{ eventoId: number }>("/eventos-acceso/correccion", { method: "POST", body: { personaId, tipoMovimiento, motivo } }),
};

// ---- reportes ----
export type TipoReporte =
  | "personal"
  | "documentos"
  | "movimientos"
  | "visitas"
  | "horas-hombre"
  | "presentes"
  | "empresas-perfil"
  | "auditoria";
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
  /** Todas las personas dentro ahora, de mayor a menor tiempo dentro. */
  presentes: () => apiRequest<{ generadoEn: string; datos: PersonaPresente[] }>("/panel/dashboard/presentes"),
  permanencia: (params: { pagina?: number; porPagina?: number } = {}) =>
    apiRequest<Paginado<PersonaPermanencia>>(`/panel/dashboard/permanencia${consulta(params)}`),
  estadoSistema: () => apiRequest<EstadoSistema>("/panel/estado-sistema"),
  /** Lo que está caído, para la franja de arriba (administrador y vigilancia). */
  avisos: () => apiRequest<AvisosSistema>("/panel/avisos"),
  /** ¿Responde el servidor? (público, sin sesión). */
  health: () => apiRequest<{ status: string }>("/health", { skipAuth: true }),
};

// ---- integraciones ----
export const integracionesApi = {
  /** Deja los G4 Pro iguales al sistema; con simular, solo informa qué haría. */
  sincronizarG4: (simular: boolean) =>
    apiRequest<ResultadoSincronizacionG4>(`/integraciones/g4pro/sincronizar${simular ? "?simular=true" : ""}`, {
      method: "POST",
    }),
  /** Activa (hora 0..23) o desactiva (null) la sincronización diaria; devuelve el estado nuevo. */
  sincronizacionDiaria: (hora: number | null) =>
    apiRequest<EstadoSincronizacionG4>("/integraciones/g4pro/sincronizacion-diaria", {
      method: "PUT",
      body: { hora },
    }),
  /** Monitor del G4 Pro: las últimas pruebas de rostro y alcohol, la más reciente primero. */
  marcacionesG4: () => apiRequest<MarcacionG4[]>("/integraciones/g4pro/marcaciones"),
};

// ---- auditoria ----
export const auditoriaApi = {
  /** Paginada en el servidor, más recientes primero. */
  list: (params: FiltrosLista & { tablaAfectada?: string; registroId?: number } = {}) =>
    apiRequest<Paginado<AuditoriaEntry>>(`/auditoria${consulta({ ...params })}`),
};

export type { RolUsuario };
