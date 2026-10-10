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

export interface Persona {
  id: number;
  empresaId: number;
  tipoDocumentoIdentidad: "DNI" | "CE" | "PASAPORTE";
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  /** Ruta de la foto para reconocimiento facial; null = sin foto. */
  fotoUrl: string | null;
  estado: "activo" | "inactivo";
  /** Por qué se la dio de baja y cuándo (solo si está de baja; las bajas antiguas pueden no tenerlo). */
  motivoBaja?: string | null;
  fechaBaja?: string | null;
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

/**
 * DNI en regla esperando el rostro y el alcohol del G4 Pro (hasta `hasta`).
 * `enCola`: otra persona está en su turno (se habilita a una a la vez); entonces `hasta` es null.
 */
export interface IngresoEnEspera {
  id: number;
  personaId: number;
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  empresa: string | null;
  /** Si tiene foto: se muestra para que el vigilante la compare con quien está frente al terminal. */
  tieneFoto: boolean;
  torniqueteId: string | null;
  desde: string;
  hasta: string | null;
  enCola: boolean;
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
  /** Pasó su DNI en regla pero no completó rostro y alcohol a tiempo. */
  denegadoSinVerificacion: boolean;
  denegadoPorDocumentos: boolean;
  fechaHora: string;
  torniqueteId: string | null;
  persona?: {
    id: number;
    nombres: string;
    apellidos: string;
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

/**
 * Indicadores del dashboard (GET /panel/dashboard). Cada ingreso autorizado de
 * una persona cuenta como una visita (el cliente llama visitas a todos los accesos).
 */
export interface Dashboard {
  periodo: { desde: string; hasta: string };
  generadoEn: string;
  presencia: { presentes: number; masDe24h: number };
  visitas: { total: number; finalizadas: number; presentes: number };
  movimientos: {
    totales: { ingresosAutorizados: number; ingresosDenegados: number; salidasAutorizadas: number; salidasDenegadas: number };
    motivos: { noRegistrado: number; dadoDeBaja: number; sinDocumentos: number; documentos: number; alcohol: number; sinVerificacion: number };
    tendencia: { dia: string; ingresos: number; denegados: number; salidas: number }[];
  };
  personal: { total: number; activos: number; dadosDeBaja: number };
  porEmpresa: { empresa: string; activos: number }[];
  documentos: { vigentes: number; porVencer: number; vencidos: number; diasAviso: number };
}

/** Persona con permanencia mayor a 24 horas (GET /panel/dashboard/permanencia, paginado). */
export interface PersonaPermanencia {
  personaId: number;
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  empresa: string;
  ingreso: string;
}

export interface EstadoDispositivo {
  serialNumber: string;
  enLinea: boolean;
  ultimaActividad: string | null;
  ipAddress: string | null;
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
  equipos: { total: number; enLinea: number; dispositivos: EstadoDispositivo[] };
  lectoresDni: { ingreso: EstadoLectorDni; salida: EstadoLectorDni };
  releMolinetes: EstadoReleUsb;
  sincronizacionG4: EstadoSincronizacionG4;
  /** Controlador (mini PC conectada por internet) cuando el servidor está en la nube. */
  controladorGarita?: EstadoControladorGarita;
  respaldos: EstadoRespaldos;
  websocket: { namespace: string };
}

/** Algo caído de "Sistema y APIs", para la franja de arriba (ver mollendo-api/src/panel/avisos-sistema.ts). */
export interface AvisoSistema {
  tipo: "base-de-datos" | "clave" | "respaldos" | "controlador" | "terminal" | "lector" | "rele" | "aviso" | "servidor";
  equipo: string;
  estado: string;
  impacto: string;
  desde: string | null;
  gravedad: "critico" | "advertencia";
}

export interface AvisosSistema {
  fecha: string;
  avisos: AvisoSistema[];
}

/** Resultado de una sincronización con los G4 Pro (manual o diaria). */
export interface ResultadoSincronizacionG4 {
  simulacion: boolean;
  origen: "manual" | "diaria";
  fecha: string;
  error: string | null;
  equipos: number;
  equiposSinRespuesta: number;
  agregadas: number;
  borradas: number;
  permisosQuitados: number;
  usuariosABorrar: string[];
  /** Usuarios y rostros que tenía cada equipo al consultarlo (antes de los cambios). */
  porEquipo: { serialNumber: string; usuarios: number; conRostro: number; sinRostro: string[] }[];
}

export interface EstadoSincronizacionG4 {
  diaria: { activa: boolean; hora: number | null };
  enCurso: boolean;
  ultima: ResultadoSincronizacionG4 | null;
}

/** Relé USB que abre un molinete: si su módulo está conectado, cuál es y la última apertura. */
export interface EstadoReleMolinete {
  conectado: boolean;
  serie: string | null;
  canal: number;
  ultimoPulso: string | null;
  error: string | null;
}

export type EstadoReleUsb = {
  ingreso: EstadoReleMolinete;
  salida: EstadoReleMolinete;
  /** Relés de aviso de ingreso y de salida denegados (contacto seco), si están configurados. */
  avisoIngreso?: EstadoReleMolinete;
  avisoSalida?: EstadoReleMolinete;
};

/** Lector de DNI por RS232: si está configurado en el servidor, si el puerto está abierto y su última lectura. */
export interface EstadoLectorDni {
  configurado: boolean;
  conectado: boolean;
  ultimaLectura: string | null;
  error: string | null;
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

/** Controlador: si los molinetes se abren a distancia, si está conectado y lo que informa. */
export interface EstadoControladorGarita {
  remoto: boolean;
  conectado: boolean;
  desde: string | null;
  direccion: string | null;
  ultimoReporte: string | null;
  estado: {
    listaPersonal: { personas: number; actualizado: string | null };
    salidasPendientes: number;
  } | null;
}
