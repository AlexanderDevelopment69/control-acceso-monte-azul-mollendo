import * as runtime from "@prisma/client/runtime/index-browser";
export const Decimal = runtime.Decimal;
export const NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
export const DbNull = runtime.DbNull;
export const JsonNull = runtime.JsonNull;
export const AnyNull = runtime.AnyNull;
export const ModelName = {
    Empresa: 'Empresa',
    Usuario: 'Usuario',
    Puesto: 'Puesto',
    Persona: 'Persona',
    TipoDocumento: 'TipoDocumento',
    RequisitoPorPuesto: 'RequisitoPorPuesto',
    DocumentoPersona: 'DocumentoPersona',
    SolicitudVisita: 'SolicitudVisita',
    EventoAcceso: 'EventoAcceso',
    Auditoria: 'Auditoria'
};
export const TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
export const EmpresaScalarFieldEnum = {
    id: 'id',
    ruc: 'ruc',
    razonSocial: 'razonSocial',
    correoContacto: 'correoContacto',
    telefonoContacto: 'telefonoContacto',
    estado: 'estado',
    contratoVigenciaInicio: 'contratoVigenciaInicio',
    contratoVigenciaFin: 'contratoVigenciaFin',
    creadoEn: 'creadoEn',
    actualizadoEn: 'actualizadoEn'
};
export const UsuarioScalarFieldEnum = {
    id: 'id',
    empresaId: 'empresaId',
    rol: 'rol',
    correo: 'correo',
    passwordHash: 'passwordHash',
    estadoCuenta: 'estadoCuenta',
    tokenInvitacion: 'tokenInvitacion',
    tokenExpira: 'tokenExpira',
    creadoEn: 'creadoEn'
};
export const PuestoScalarFieldEnum = {
    id: 'id',
    nombre: 'nombre',
    caso: 'caso'
};
export const PersonaScalarFieldEnum = {
    id: 'id',
    empresaId: 'empresaId',
    puestoId: 'puestoId',
    tipoDocumentoIdentidad: 'tipoDocumentoIdentidad',
    numeroDocumento: 'numeroDocumento',
    nombres: 'nombres',
    apellidos: 'apellidos',
    area: 'area',
    estado: 'estado',
    creadoEn: 'creadoEn'
};
export const TipoDocumentoScalarFieldEnum = {
    id: 'id',
    nombre: 'nombre',
    tipoValidacion: 'tipoValidacion'
};
export const RequisitoPorPuestoScalarFieldEnum = {
    puestoId: 'puestoId',
    tipoDocumentoId: 'tipoDocumentoId',
    obligatorio: 'obligatorio'
};
export const DocumentoPersonaScalarFieldEnum = {
    id: 'id',
    personaId: 'personaId',
    tipoDocumentoId: 'tipoDocumentoId',
    fechaEmision: 'fechaEmision',
    fechaVencimiento: 'fechaVencimiento',
    archivoUrl: 'archivoUrl',
    vigente: 'vigente',
    estadoAprobacion: 'estadoAprobacion',
    version: 'version',
    creadoEn: 'creadoEn'
};
export const SolicitudVisitaScalarFieldEnum = {
    id: 'id',
    personaId: 'personaId',
    empresaId: 'empresaId',
    personaVisitada: 'personaVisitada',
    motivo: 'motivo',
    fechaHoraProgramada: 'fechaHoraProgramada',
    estado: 'estado',
    creadoEn: 'creadoEn'
};
export const EventoAccesoScalarFieldEnum = {
    id: 'id',
    personaId: 'personaId',
    tipoMovimiento: 'tipoMovimiento',
    resultado: 'resultado',
    denegadoPorBaja: 'denegadoPorBaja',
    denegadoPorAlcohol: 'denegadoPorAlcohol',
    denegadoPorDocumentos: 'denegadoPorDocumentos',
    denegadoSinIngresoPrevio: 'denegadoSinIngresoPrevio',
    fechaHora: 'fechaHora',
    torniqueteId: 'torniqueteId'
};
export const AuditoriaScalarFieldEnum = {
    id: 'id',
    usuarioId: 'usuarioId',
    tablaAfectada: 'tablaAfectada',
    registroId: 'registroId',
    accion: 'accion',
    fechaHora: 'fechaHora'
};
export const SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
export const QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
export const NullsOrder = {
    first: 'first',
    last: 'last'
};
//# sourceMappingURL=prismaNamespaceBrowser.js.map