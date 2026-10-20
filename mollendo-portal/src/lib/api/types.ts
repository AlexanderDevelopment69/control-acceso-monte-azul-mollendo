import type { Perfil } from "@/lib/perfiles";

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
  /** Personas activas de la empresa (viene en la lista de empresas). */
  personalActivo?: number;
  /** Sin ninguna persona (ni dada de baja) ni usuarios: se puede eliminar (viene en la lista). */
  eliminable?: boolean;
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
  /** null: registrada antes de que existiera el perfil ("Sin perfil"). */
  perfil: Perfil | null;
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
  /** La decide un vigilante (verificación manual, equipo facial fuera de servicio), no el G4 Pro. */
  manual?: boolean;
  /** Orden "facial primero": alguien aprobó rostro y alcohol (quién, si ya se sabe, va en nombres y numeroDocumento); falta su DNI (`hasta` es el plazo). */
  esperaDni?: boolean;
}

/** Orden del ingreso: primero el DNI (normal) o primero rostro y alcohol (en prueba). */
export interface EstadoModoIngreso {
  facialPrimero: boolean;
  desde: string | null;
  cambiadoPor: string | null;
}

/** Verificación manual vigente (contingencia por falla del equipo facial). */
export interface EstadoVerificacionManual {
  activa: boolean;
  periodo: { id: number; motivo: string; desde: string; activadaPor: string | null } | null;
}

export type DecisionManual = "apto" | "alcohol" | "no-es-la-persona";

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
  /** Verificación manual: el vigilante indicó que el rostro no es el de la foto. */
  denegadoRostroNoCoincide?: boolean;
  /** Antipassback: quiso ingresar sin haber registrado su salida. */
  denegadoYaDentro?: boolean;
  /** Antipassback: quiso salir sin ingreso registrado. */
  denegadoSinIngreso?: boolean;
  /** Orden "facial primero": pasó su DNI sin una aprobación de rostro y alcohol en los 20 s anteriores. */
  denegadoSinFacial?: boolean;
  /** Orden "facial primero": alguien aprobó rostro y alcohol, pero nadie pasó su DNI a tiempo (sin persona). */
  denegadoSinDni?: boolean;
  /** Orden "facial primero": rostro y alcohol antes del DNI. */
  facialPrimero?: boolean;
  /** Orden "facial primero": DNI de quien sopló según el equipo (null: no se pudo confirmar). */
  dniQueSoplo?: string | null;
  /** Orden "facial primero": el equipo dice que sopló otra persona que la del DNI. */
  denegadoNoEsQuienSoplo?: boolean;
  /** Movimiento registrado a mano por un vigilante o administrador (no pasó por el molinete). */
  correccionManual?: boolean;
  motivoCorreccion?: string | null;
  /** Rostro y alcohol los verificó un vigilante (equipo facial fuera de servicio). */
  verificacionManual?: boolean;
  verificadoPor?: { id: number; correo: string } | null;
  fechaHora: string;
  torniqueteId: string | null;
  persona?: {
    id: number;
    nombres: string;
    apellidos: string;
    empresaId: number;
    tipoDocumentoIdentidad: "DNI" | "CE" | "PASAPORTE";
    numeroDocumento: string;
    perfil?: Perfil | null;
  };
}

export interface ResumenPanel {
  denegacionesHoy: number;
  alcoholNoConformeHoy: number;
  documentosVencidos: number;
}

/**
 * Indicadores del dashboard (GET /panel/dashboard). Cada ingreso autorizado de
 * una persona cuenta como un ingreso (los campos se llaman "visitas" por historia:
 * el cliente los llamaba así hasta que "Visita" pasó a ser un perfil, 16/10/2026).
 */
export interface Dashboard {
  periodo: { desde: string; hasta: string };
  generadoEn: string;
  /** masDe12h: presentes que ingresaron hace más de 12 horas (permanencia larga). */
  presencia: { presentes: number; masDe12h: number };
  visitas: { total: number; finalizadas: number; presentes: number };
  /** Horas-hombre del periodo (gráfico por empresa): de cada ingreso a su salida (solo los que tienen salida). */
  horasHombre?: { horas: number; visitas: number; porEmpresa: { empresa: string; horas: number }[] };
  /** Ingresos autorizados del periodo por perfil (solo los perfiles con ingresos). */
  porPerfil?: { perfil: string; ingresos: number }[];
  movimientos: {
    totales: { ingresosAutorizados: number; ingresosDenegados: number; salidasAutorizadas: number; salidasDenegadas: number };
    motivos: {
      noRegistrado: number;
      dadoDeBaja: number;
      sinDocumentos: number;
      documentos: number;
      alcohol: number;
      sinVerificacion: number;
      rostroNoCoincide?: number;
      yaDentro?: number;
      sinIngreso?: number;
    };
    tendencia: { dia: string; ingresos: number; denegados: number; salidas: number }[];
  };
  personal: { total: number; activos: number; dadosDeBaja: number };
  porEmpresa: { empresa: string; activos: number }[];
  documentos: { vigentes: number; porVencer: number; vencidos: number; diasAviso: number };
}

/** Persona dentro del terminal ahora (GET /panel/dashboard/presentes). */
export interface PersonaPresente {
  personaId: number;
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  perfil: Perfil | null;
  empresa: string;
  ingreso: string;
}

/** Persona con permanencia mayor a 12 horas (GET /panel/dashboard/permanencia, paginado). */
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
  /** IP del equipo en la red de la garita (la que informa al registrarse). */
  ipLocal?: string | null;
}

export interface EstadoSistema {
  api: {
    estado: "up";
    entorno: string;
    uptimeSegundos: number;
    nodeVersion: string;
    /** ¿Está publicada la documentación Swagger (/api/docs)? En la nube va apagada. */
    swagger: boolean;
    fecha: string;
  };
  baseDeDatos: { estado: "up" | "down"; latenciaMs: number };
  /** terminalesPermitidos: números de serie del G4 Pro aceptados (vacío = cualquiera). */
  integraciones: { claveEquiposConfigurada: boolean; terminalesPermitidos: string[] };
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
  /** Personas con datos cambiados a mano en el equipo (contraseña, administrador…), corregidas. Falta en las anteriores al 18/10/2026. */
  corregidas?: number;
  usuariosABorrar: string[];
  /** Usuarios y rostros que tenía cada equipo al consultarlo (antes de los cambios). */
  porEquipo: { serialNumber: string; usuarios: number; conRostro: number; sinRostro: string[] }[];
}

/** Una prueba de rostro y alcohol del G4 Pro y qué hizo el sistema con ella (monitor de Sistema y APIs). */
export interface MarcacionG4 {
  id: number;
  serialNumber: string;
  /** Número de la marcación en el equipo (sube de uno en uno). */
  numero: number | null;
  /** Pruebas que no llegaron entre la anterior y esta. */
  faltanAntes: number;
  dni: string | null;
  persona: { id: number; nombres: string; apellidos: string; tieneFoto: boolean } | null;
  /** Hora de la prueba según el reloj del equipo. */
  horaPrueba: string | null;
  /** Hora en que llegó al servidor. */
  llegada: string;
  demoraSegundos: number | null;
  alcohol: string | null;
  aprobado: boolean | null;
  decision: string | null;
  ingreso: { id: number; resultado: "autorizado" | "denegado"; motivo: string; fechaHora: string } | null;
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
  /** Hora del respaldo diario (HH:MM) y días que se guardan, según la configuración del servidor. */
  hora: string;
  dias: number;
}

export interface AuditoriaEntry {
  id: number;
  usuarioId: number | null;
  tablaAfectada: string;
  registroId: number;
  accion: "crear" | "modificar" | "eliminar" | "inicio_sesion" | "inicio_sesion_fallido";
  fechaHora: string;
  /** Inicios de sesión: IP y, si se rechazó, el correo escrito y el motivo ("correo · motivo"). */
  ip?: string | null;
  detalle?: string | null;
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
    /** IP de la mini PC en la red de la garita. */
    ipLocal?: string | null;
  } | null;
}

/** Carga masiva de personal: una fila del Excel ya revisada por el servidor. */
export interface FilaCargaMasiva {
  fila: number;
  perfil: string;
  empresa: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  /** lista: se registrará; existe: ya está registrado (se omite); error: hay que corregirla. */
  estado: "lista" | "existe" | "error";
  motivos: string[];
  /** Columnas con error (se pintan en el Excel de filas con error). */
  campos: ("perfil" | "empresa" | "tipoDocumento" | "numeroDocumento" | "nombres" | "apellidos")[];
  persona?: {
    empresaId: number;
    perfil: Perfil;
    tipoDocumentoIdentidad: "DNI" | "CE" | "PASAPORTE";
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
  };
}

export interface RevisionCargaMasiva {
  filas: FilaCargaMasiva[];
  resumen: { total: number; listas: number; existentes: number; errores: number };
}

export interface ResultadoCargaMasiva {
  registradas: number;
  omitidas: { numeroDocumento: string; motivo: string }[];
}
