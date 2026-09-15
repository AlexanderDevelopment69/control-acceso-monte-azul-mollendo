import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly Empresa: "Empresa";
    readonly Usuario: "Usuario";
    readonly Puesto: "Puesto";
    readonly Persona: "Persona";
    readonly TipoDocumento: "TipoDocumento";
    readonly RequisitoPorPuesto: "RequisitoPorPuesto";
    readonly DocumentoPersona: "DocumentoPersona";
    readonly SolicitudVisita: "SolicitudVisita";
    readonly EventoAcceso: "EventoAcceso";
    readonly Auditoria: "Auditoria";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const EmpresaScalarFieldEnum: {
    readonly id: "id";
    readonly ruc: "ruc";
    readonly razonSocial: "razonSocial";
    readonly correoContacto: "correoContacto";
    readonly telefonoContacto: "telefonoContacto";
    readonly estado: "estado";
    readonly contratoVigenciaInicio: "contratoVigenciaInicio";
    readonly contratoVigenciaFin: "contratoVigenciaFin";
    readonly creadoEn: "creadoEn";
    readonly actualizadoEn: "actualizadoEn";
};
export type EmpresaScalarFieldEnum = (typeof EmpresaScalarFieldEnum)[keyof typeof EmpresaScalarFieldEnum];
export declare const UsuarioScalarFieldEnum: {
    readonly id: "id";
    readonly empresaId: "empresaId";
    readonly rol: "rol";
    readonly correo: "correo";
    readonly passwordHash: "passwordHash";
    readonly estadoCuenta: "estadoCuenta";
    readonly tokenInvitacion: "tokenInvitacion";
    readonly tokenExpira: "tokenExpira";
    readonly creadoEn: "creadoEn";
};
export type UsuarioScalarFieldEnum = (typeof UsuarioScalarFieldEnum)[keyof typeof UsuarioScalarFieldEnum];
export declare const PuestoScalarFieldEnum: {
    readonly id: "id";
    readonly nombre: "nombre";
    readonly caso: "caso";
};
export type PuestoScalarFieldEnum = (typeof PuestoScalarFieldEnum)[keyof typeof PuestoScalarFieldEnum];
export declare const PersonaScalarFieldEnum: {
    readonly id: "id";
    readonly empresaId: "empresaId";
    readonly puestoId: "puestoId";
    readonly tipoDocumentoIdentidad: "tipoDocumentoIdentidad";
    readonly numeroDocumento: "numeroDocumento";
    readonly nombres: "nombres";
    readonly apellidos: "apellidos";
    readonly area: "area";
    readonly estado: "estado";
    readonly creadoEn: "creadoEn";
};
export type PersonaScalarFieldEnum = (typeof PersonaScalarFieldEnum)[keyof typeof PersonaScalarFieldEnum];
export declare const TipoDocumentoScalarFieldEnum: {
    readonly id: "id";
    readonly nombre: "nombre";
    readonly tipoValidacion: "tipoValidacion";
};
export type TipoDocumentoScalarFieldEnum = (typeof TipoDocumentoScalarFieldEnum)[keyof typeof TipoDocumentoScalarFieldEnum];
export declare const RequisitoPorPuestoScalarFieldEnum: {
    readonly puestoId: "puestoId";
    readonly tipoDocumentoId: "tipoDocumentoId";
    readonly obligatorio: "obligatorio";
};
export type RequisitoPorPuestoScalarFieldEnum = (typeof RequisitoPorPuestoScalarFieldEnum)[keyof typeof RequisitoPorPuestoScalarFieldEnum];
export declare const DocumentoPersonaScalarFieldEnum: {
    readonly id: "id";
    readonly personaId: "personaId";
    readonly tipoDocumentoId: "tipoDocumentoId";
    readonly fechaEmision: "fechaEmision";
    readonly fechaVencimiento: "fechaVencimiento";
    readonly archivoUrl: "archivoUrl";
    readonly vigente: "vigente";
    readonly estadoAprobacion: "estadoAprobacion";
    readonly version: "version";
    readonly creadoEn: "creadoEn";
};
export type DocumentoPersonaScalarFieldEnum = (typeof DocumentoPersonaScalarFieldEnum)[keyof typeof DocumentoPersonaScalarFieldEnum];
export declare const SolicitudVisitaScalarFieldEnum: {
    readonly id: "id";
    readonly personaId: "personaId";
    readonly empresaId: "empresaId";
    readonly personaVisitada: "personaVisitada";
    readonly motivo: "motivo";
    readonly fechaHoraProgramada: "fechaHoraProgramada";
    readonly estado: "estado";
    readonly creadoEn: "creadoEn";
};
export type SolicitudVisitaScalarFieldEnum = (typeof SolicitudVisitaScalarFieldEnum)[keyof typeof SolicitudVisitaScalarFieldEnum];
export declare const EventoAccesoScalarFieldEnum: {
    readonly id: "id";
    readonly personaId: "personaId";
    readonly tipoMovimiento: "tipoMovimiento";
    readonly resultado: "resultado";
    readonly denegadoPorBaja: "denegadoPorBaja";
    readonly denegadoPorAlcohol: "denegadoPorAlcohol";
    readonly denegadoPorDocumentos: "denegadoPorDocumentos";
    readonly denegadoSinIngresoPrevio: "denegadoSinIngresoPrevio";
    readonly fechaHora: "fechaHora";
    readonly torniqueteId: "torniqueteId";
};
export type EventoAccesoScalarFieldEnum = (typeof EventoAccesoScalarFieldEnum)[keyof typeof EventoAccesoScalarFieldEnum];
export declare const AuditoriaScalarFieldEnum: {
    readonly id: "id";
    readonly usuarioId: "usuarioId";
    readonly tablaAfectada: "tablaAfectada";
    readonly registroId: "registroId";
    readonly accion: "accion";
    readonly fechaHora: "fechaHora";
};
export type AuditoriaScalarFieldEnum = (typeof AuditoriaScalarFieldEnum)[keyof typeof AuditoriaScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
