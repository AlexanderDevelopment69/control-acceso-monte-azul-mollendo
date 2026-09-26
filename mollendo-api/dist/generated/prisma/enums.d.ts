export declare const EstadoEmpresa: {
    readonly activa: "activa";
    readonly inactiva: "inactiva";
};
export type EstadoEmpresa = (typeof EstadoEmpresa)[keyof typeof EstadoEmpresa];
export declare const EstadoCuenta: {
    readonly activo: "activo";
    readonly baja: "baja";
};
export type EstadoCuenta = (typeof EstadoCuenta)[keyof typeof EstadoCuenta];
export declare const RolUsuario: {
    readonly administrador: "administrador";
    readonly vigilancia: "vigilancia";
};
export type RolUsuario = (typeof RolUsuario)[keyof typeof RolUsuario];
export declare const CasoPuesto: {
    readonly visita: "visita";
    readonly personal_propio: "personal_propio";
    readonly contratista: "contratista";
    readonly tercero: "tercero";
};
export type CasoPuesto = (typeof CasoPuesto)[keyof typeof CasoPuesto];
export declare const TipoDocumentoIdentidad: {
    readonly DNI: "DNI";
    readonly CE: "CE";
    readonly PASAPORTE: "PASAPORTE";
};
export type TipoDocumentoIdentidad = (typeof TipoDocumentoIdentidad)[keyof typeof TipoDocumentoIdentidad];
export declare const EstadoPersona: {
    readonly activo: "activo";
    readonly inactivo: "inactivo";
};
export type EstadoPersona = (typeof EstadoPersona)[keyof typeof EstadoPersona];
export declare const TipoValidacionDocumento: {
    readonly fecha_vencimiento: "fecha_vencimiento";
    readonly si_no: "si_no";
    readonly vigente_por_actividad: "vigente_por_actividad";
};
export type TipoValidacionDocumento = (typeof TipoValidacionDocumento)[keyof typeof TipoValidacionDocumento];
export declare const EstadoSolicitudVisita: {
    readonly programada: "programada";
    readonly completada: "completada";
    readonly cancelada: "cancelada";
};
export type EstadoSolicitudVisita = (typeof EstadoSolicitudVisita)[keyof typeof EstadoSolicitudVisita];
export declare const TipoMovimiento: {
    readonly ingreso: "ingreso";
    readonly salida: "salida";
};
export type TipoMovimiento = (typeof TipoMovimiento)[keyof typeof TipoMovimiento];
export declare const ResultadoAcceso: {
    readonly autorizado: "autorizado";
    readonly denegado: "denegado";
};
export type ResultadoAcceso = (typeof ResultadoAcceso)[keyof typeof ResultadoAcceso];
export declare const AccionAuditoria: {
    readonly crear: "crear";
    readonly modificar: "modificar";
    readonly eliminar: "eliminar";
};
export type AccionAuditoria = (typeof AccionAuditoria)[keyof typeof AccionAuditoria];
