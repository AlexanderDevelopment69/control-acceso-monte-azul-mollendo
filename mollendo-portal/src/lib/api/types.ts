export type RolUsuario = "administracion" | "empresa" | "vigilancia";

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

export interface Puesto {
  id: number;
  nombre: string;
  caso: "visita" | "personal_propio" | "contratista" | "tercero";
}

export interface TipoDocumento {
  id: number;
  nombre: string;
  tipoValidacion: "fecha_vencimiento" | "si_no" | "vigente_por_actividad";
}

export interface RequisitoPorPuesto {
  puestoId: number;
  tipoDocumentoId: number;
  obligatorio: boolean;
  tipoDocumento: TipoDocumento;
}

export interface Persona {
  id: number;
  empresaId: number;
  puestoId: number | null;
  tipoDocumentoIdentidad: "DNI" | "CE" | "PASAPORTE";
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  area: string | null;
  estado: "activo" | "inactivo";
  creadoEn: string;
  empresa?: { id: number; razonSocial: string };
  puesto?: Puesto | null;
  documentos?: DocumentoPersona[];
}

export interface DocumentoPersona {
  id: number;
  personaId: number;
  tipoDocumentoId: number;
  fechaEmision: string | null;
  fechaVencimiento: string | null;
  archivoUrl: string | null;
  vigente: boolean;
  estadoAprobacion: "pendiente" | "aprobado" | "rechazado";
  version: number;
  creadoEn: string;
  tipoDocumento?: TipoDocumento;
}

export interface SolicitudVisita {
  id: number;
  personaId: number;
  empresaId: number;
  personaVisitada: string;
  motivo: string;
  fechaHoraProgramada: string;
  estado: "programada" | "completada" | "cancelada";
  creadoEn: string;
  persona?: { id: number; nombres: string; apellidos: string };
}

export interface EventoAcceso {
  id: number;
  personaId: number;
  tipoMovimiento: "ingreso" | "salida";
  resultado: "autorizado" | "denegado";
  denegadoPorBaja: boolean;
  denegadoPorAlcohol: boolean;
  denegadoPorDocumentos: boolean;
  denegadoSinIngresoPrevio: boolean;
  fechaHora: string;
  torniqueteId: string | null;
  persona?: { id: number; nombres: string; apellidos: string; empresaId: number };
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
  integraciones: { smtpConfigurado: boolean; claveEquiposConfigurada: boolean };
  websocket: { namespace: string };
}

export interface AuditoriaEntry {
  id: number;
  usuarioId: number | null;
  tablaAfectada: string;
  registroId: number;
  accion: "crear" | "modificar" | "aprobar" | "eliminar";
  fechaHora: string;
  usuario?: { id: number; correo: string; rol: RolUsuario } | null;
}
