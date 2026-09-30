export type RolUsuario = "administrador" | "vigilancia";

export interface Empresa {
  id: number;
  ruc: string;
  razonSocial: string;
  correoContacto: string;
  telefonoContacto: string | null;
  estado: "activa" | "inactiva";
  contratoVigenciaInicio: string | null;
  contratoVigenciaFin: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface TipoDocumento {
  id: number;
  nombre: string;
}

/** Distingue a las visitas del resto del personal. */
export type TipoPersona = "personal" | "visita";

export const TIPOS_PERSONA: { value: TipoPersona; label: string }[] = [
  { value: "personal", label: "Personal" },
  { value: "visita", label: "Visita" },
];

/** Opciones de los filtros por tipo ("" = sin filtrar). */
export const FILTRO_TIPO_PERSONA: { value: string; label: string }[] = [
  { value: "", label: "Personal y visitas" },
  { value: "personal", label: "Solo personal" },
  { value: "visita", label: "Solo visitas" },
];

export const etiquetaTipoPersona = (tipo: TipoPersona) =>
  TIPOS_PERSONA.find((t) => t.value === tipo)?.label ?? tipo;

export interface Persona {
  id: number;
  empresaId: number;
  tipoDocumentoIdentidad: "DNI" | "CE" | "PASAPORTE";
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  tipoPersona: TipoPersona;
  /** Ruta de la foto para reconocimiento facial; null = sin foto. */
  fotoUrl: string | null;
  estado: "activo" | "inactivo";
  creadoEn: string;
  empresa?: { id: number; razonSocial: string };
  documentos?: DocumentoPersona[];
  /** ¿Podría ingresar hoy (suponiendo alcohol conforme)? Mismo motor que el molinete. */
  cumplimiento?: Cumplimiento;
  /** Solo en el detalle: última versión de cada documento (lo que cuenta en garita). */
  documentosActuales?: DocumentoActual[];
}

export interface Cumplimiento {
  habilitado: boolean;
  dadoDeBaja: boolean;
  sinDocumentos: boolean;
  documentosVencidos: string[];
}

export interface DocumentoActual {
  id: number;
  tipoDocumentoId: number;
  nombre: string;
  version: number;
  fechaVencimiento: string | null;
  creadoEn: string;
  vigente: boolean;
}

export interface DocumentoPersona {
  id: number;
  personaId: number;
  tipoDocumentoId: number;
  fechaEmision: string | null;
  fechaVencimiento: string | null;
  archivoUrl: string | null;
  version: number;
  creadoEn: string;
  tipoDocumento?: TipoDocumento;
}

export interface EventoAcceso {
  id: number;
  /** null si el documento no estaba registrado. */
  personaId: number | null;
  /** Documento con el que se identificó (lo que leyó el equipo). */
  tipoDocumentoIdentidad: "DNI" | "CE" | "PASAPORTE" | null;
  numeroDocumento: string | null;
  tipoMovimiento: "ingreso" | "salida";
  resultado: "autorizado" | "denegado";
  denegadoNoRegistrado: boolean;
  denegadoPorBaja: boolean;
  denegadoSinDocumentos: boolean;
  denegadoPorAlcohol: boolean;
  denegadoPorDocumentos: boolean;
  fechaHora: string;
  torniqueteId: string | null;
  persona?: {
    id: number;
    nombres: string;
    apellidos: string;
    tipoPersona: TipoPersona;
    empresaId: number;
    tipoDocumentoIdentidad: "DNI" | "CE" | "PASAPORTE";
    numeroDocumento: string;
  };
}

export interface ResumenPanel {
  denegacionesHoy: number;
  alcoholNoConformeHoy: number;
  documentosVencidos: number;
}

export interface EstadoSistema {
  api: {
    estado: "up";
    entorno: string;
    uptimeSegundos: number;
    nodeVersion: string;
    fecha: string;
  };
  baseDeDatos: { estado: "up" | "down"; latenciaMs: number };
  integraciones: { claveEquiposConfigurada: boolean };
  respaldos: EstadoRespaldos;
  websocket: { namespace: string };
}

export interface ResumenRespaldo {
  archivo: string;
  fecha: string;
  tamanoBytes: number;
}

/** Respaldos del servidor; `disponible` es false fuera de la mini PC (p. ej. en desarrollo). */
export interface EstadoRespaldos {
  disponible: boolean;
  ultimoAutomatico: ResumenRespaldo | null;
  ultimoPrevioActualizacion: ResumenRespaldo | null;
  cantidad: number;
}

export interface AuditoriaEntry {
  id: number;
  usuarioId: number | null;
  tablaAfectada: string;
  registroId: number;
  accion: "crear" | "modificar" | "eliminar";
  fechaHora: string;
  usuario?: { id: number; correo: string; rol: RolUsuario } | null;
}

/** Lista paginada en el servidor (Panel de vigilancia, Auditoría). */
export interface Paginado<T> {
  datos: T[];
  total: number;
  pagina: number;
  porPagina: number;
}

/** Filtros de las listas paginadas: página, tamaño, búsqueda y rango de días (AAAA-MM-DD). */
export interface FiltrosLista {
  pagina?: number;
  porPagina?: number;
  busqueda?: string;
  desde?: string;
  hasta?: string;
}
