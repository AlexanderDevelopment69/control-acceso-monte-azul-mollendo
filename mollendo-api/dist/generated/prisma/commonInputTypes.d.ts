import * as $Enums from "./enums.js";
import type * as Prisma from "./internal/prismaNamespace.js";
export type IntFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntFilter<$PrismaModel> | number;
};
export type StringFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringFilter<$PrismaModel> | string;
};
export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringNullableFilter<$PrismaModel> | string | null;
};
export type EnumEstadoEmpresaFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoEmpresa | Prisma.EnumEstadoEmpresaFieldRefInput<$PrismaModel>;
    in?: $Enums.EstadoEmpresa[] | Prisma.ListEnumEstadoEmpresaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EstadoEmpresa[] | Prisma.ListEnumEstadoEmpresaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEstadoEmpresaFilter<$PrismaModel> | $Enums.EstadoEmpresa;
};
export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
};
export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeFilter<$PrismaModel> | Date | string;
};
export type SortOrderInput = {
    sort: Prisma.SortOrder;
    nulls?: Prisma.NullsOrder;
};
export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedIntFilter<$PrismaModel>;
    _max?: Prisma.NestedIntFilter<$PrismaModel>;
};
export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedStringFilter<$PrismaModel>;
    _max?: Prisma.NestedStringFilter<$PrismaModel>;
};
export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedStringNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedStringNullableFilter<$PrismaModel>;
};
export type EnumEstadoEmpresaWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoEmpresa | Prisma.EnumEstadoEmpresaFieldRefInput<$PrismaModel>;
    in?: $Enums.EstadoEmpresa[] | Prisma.ListEnumEstadoEmpresaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EstadoEmpresa[] | Prisma.ListEnumEstadoEmpresaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEstadoEmpresaWithAggregatesFilter<$PrismaModel> | $Enums.EstadoEmpresa;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumEstadoEmpresaFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumEstadoEmpresaFilter<$PrismaModel>;
};
export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedDateTimeNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedDateTimeNullableFilter<$PrismaModel>;
};
export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedDateTimeFilter<$PrismaModel>;
    _max?: Prisma.NestedDateTimeFilter<$PrismaModel>;
};
export type EnumRolUsuarioFilter<$PrismaModel = never> = {
    equals?: $Enums.RolUsuario | Prisma.EnumRolUsuarioFieldRefInput<$PrismaModel>;
    in?: $Enums.RolUsuario[] | Prisma.ListEnumRolUsuarioFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RolUsuario[] | Prisma.ListEnumRolUsuarioFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRolUsuarioFilter<$PrismaModel> | $Enums.RolUsuario;
};
export type EnumEstadoCuentaFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoCuenta | Prisma.EnumEstadoCuentaFieldRefInput<$PrismaModel>;
    in?: $Enums.EstadoCuenta[] | Prisma.ListEnumEstadoCuentaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EstadoCuenta[] | Prisma.ListEnumEstadoCuentaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEstadoCuentaFilter<$PrismaModel> | $Enums.EstadoCuenta;
};
export type EnumRolUsuarioWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RolUsuario | Prisma.EnumRolUsuarioFieldRefInput<$PrismaModel>;
    in?: $Enums.RolUsuario[] | Prisma.ListEnumRolUsuarioFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RolUsuario[] | Prisma.ListEnumRolUsuarioFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRolUsuarioWithAggregatesFilter<$PrismaModel> | $Enums.RolUsuario;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumRolUsuarioFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumRolUsuarioFilter<$PrismaModel>;
};
export type EnumEstadoCuentaWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoCuenta | Prisma.EnumEstadoCuentaFieldRefInput<$PrismaModel>;
    in?: $Enums.EstadoCuenta[] | Prisma.ListEnumEstadoCuentaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EstadoCuenta[] | Prisma.ListEnumEstadoCuentaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEstadoCuentaWithAggregatesFilter<$PrismaModel> | $Enums.EstadoCuenta;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumEstadoCuentaFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumEstadoCuentaFilter<$PrismaModel>;
};
export type EnumCasoPuestoFilter<$PrismaModel = never> = {
    equals?: $Enums.CasoPuesto | Prisma.EnumCasoPuestoFieldRefInput<$PrismaModel>;
    in?: $Enums.CasoPuesto[] | Prisma.ListEnumCasoPuestoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CasoPuesto[] | Prisma.ListEnumCasoPuestoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCasoPuestoFilter<$PrismaModel> | $Enums.CasoPuesto;
};
export type EnumCasoPuestoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CasoPuesto | Prisma.EnumCasoPuestoFieldRefInput<$PrismaModel>;
    in?: $Enums.CasoPuesto[] | Prisma.ListEnumCasoPuestoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CasoPuesto[] | Prisma.ListEnumCasoPuestoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCasoPuestoWithAggregatesFilter<$PrismaModel> | $Enums.CasoPuesto;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumCasoPuestoFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumCasoPuestoFilter<$PrismaModel>;
};
export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableFilter<$PrismaModel> | number | null;
};
export type EnumTipoDocumentoIdentidadFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoDocumentoIdentidad | Prisma.EnumTipoDocumentoIdentidadFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoDocumentoIdentidad[] | Prisma.ListEnumTipoDocumentoIdentidadFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoDocumentoIdentidad[] | Prisma.ListEnumTipoDocumentoIdentidadFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoDocumentoIdentidadFilter<$PrismaModel> | $Enums.TipoDocumentoIdentidad;
};
export type EnumEstadoPersonaFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoPersona | Prisma.EnumEstadoPersonaFieldRefInput<$PrismaModel>;
    in?: $Enums.EstadoPersona[] | Prisma.ListEnumEstadoPersonaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EstadoPersona[] | Prisma.ListEnumEstadoPersonaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEstadoPersonaFilter<$PrismaModel> | $Enums.EstadoPersona;
};
export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatNullableFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedIntNullableFilter<$PrismaModel>;
};
export type EnumTipoDocumentoIdentidadWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoDocumentoIdentidad | Prisma.EnumTipoDocumentoIdentidadFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoDocumentoIdentidad[] | Prisma.ListEnumTipoDocumentoIdentidadFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoDocumentoIdentidad[] | Prisma.ListEnumTipoDocumentoIdentidadFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoDocumentoIdentidadWithAggregatesFilter<$PrismaModel> | $Enums.TipoDocumentoIdentidad;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumTipoDocumentoIdentidadFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumTipoDocumentoIdentidadFilter<$PrismaModel>;
};
export type EnumEstadoPersonaWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoPersona | Prisma.EnumEstadoPersonaFieldRefInput<$PrismaModel>;
    in?: $Enums.EstadoPersona[] | Prisma.ListEnumEstadoPersonaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EstadoPersona[] | Prisma.ListEnumEstadoPersonaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEstadoPersonaWithAggregatesFilter<$PrismaModel> | $Enums.EstadoPersona;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumEstadoPersonaFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumEstadoPersonaFilter<$PrismaModel>;
};
export type EnumTipoValidacionDocumentoFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoValidacionDocumento | Prisma.EnumTipoValidacionDocumentoFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoValidacionDocumento[] | Prisma.ListEnumTipoValidacionDocumentoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoValidacionDocumento[] | Prisma.ListEnumTipoValidacionDocumentoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoValidacionDocumentoFilter<$PrismaModel> | $Enums.TipoValidacionDocumento;
};
export type EnumTipoValidacionDocumentoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoValidacionDocumento | Prisma.EnumTipoValidacionDocumentoFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoValidacionDocumento[] | Prisma.ListEnumTipoValidacionDocumentoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoValidacionDocumento[] | Prisma.ListEnumTipoValidacionDocumentoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoValidacionDocumentoWithAggregatesFilter<$PrismaModel> | $Enums.TipoValidacionDocumento;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumTipoValidacionDocumentoFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumTipoValidacionDocumentoFilter<$PrismaModel>;
};
export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedBoolFilter<$PrismaModel> | boolean;
};
export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedBoolFilter<$PrismaModel>;
    _max?: Prisma.NestedBoolFilter<$PrismaModel>;
};
export type EnumEstadoAprobacionDocumentoFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoAprobacionDocumento | Prisma.EnumEstadoAprobacionDocumentoFieldRefInput<$PrismaModel>;
    in?: $Enums.EstadoAprobacionDocumento[] | Prisma.ListEnumEstadoAprobacionDocumentoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EstadoAprobacionDocumento[] | Prisma.ListEnumEstadoAprobacionDocumentoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEstadoAprobacionDocumentoFilter<$PrismaModel> | $Enums.EstadoAprobacionDocumento;
};
export type EnumEstadoAprobacionDocumentoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoAprobacionDocumento | Prisma.EnumEstadoAprobacionDocumentoFieldRefInput<$PrismaModel>;
    in?: $Enums.EstadoAprobacionDocumento[] | Prisma.ListEnumEstadoAprobacionDocumentoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EstadoAprobacionDocumento[] | Prisma.ListEnumEstadoAprobacionDocumentoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEstadoAprobacionDocumentoWithAggregatesFilter<$PrismaModel> | $Enums.EstadoAprobacionDocumento;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumEstadoAprobacionDocumentoFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumEstadoAprobacionDocumentoFilter<$PrismaModel>;
};
export type EnumEstadoSolicitudVisitaFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoSolicitudVisita | Prisma.EnumEstadoSolicitudVisitaFieldRefInput<$PrismaModel>;
    in?: $Enums.EstadoSolicitudVisita[] | Prisma.ListEnumEstadoSolicitudVisitaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EstadoSolicitudVisita[] | Prisma.ListEnumEstadoSolicitudVisitaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEstadoSolicitudVisitaFilter<$PrismaModel> | $Enums.EstadoSolicitudVisita;
};
export type EnumEstadoSolicitudVisitaWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoSolicitudVisita | Prisma.EnumEstadoSolicitudVisitaFieldRefInput<$PrismaModel>;
    in?: $Enums.EstadoSolicitudVisita[] | Prisma.ListEnumEstadoSolicitudVisitaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EstadoSolicitudVisita[] | Prisma.ListEnumEstadoSolicitudVisitaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEstadoSolicitudVisitaWithAggregatesFilter<$PrismaModel> | $Enums.EstadoSolicitudVisita;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumEstadoSolicitudVisitaFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumEstadoSolicitudVisitaFilter<$PrismaModel>;
};
export type EnumTipoMovimientoFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoMovimiento | Prisma.EnumTipoMovimientoFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoMovimiento[] | Prisma.ListEnumTipoMovimientoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoMovimiento[] | Prisma.ListEnumTipoMovimientoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoMovimientoFilter<$PrismaModel> | $Enums.TipoMovimiento;
};
export type EnumResultadoAccesoFilter<$PrismaModel = never> = {
    equals?: $Enums.ResultadoAcceso | Prisma.EnumResultadoAccesoFieldRefInput<$PrismaModel>;
    in?: $Enums.ResultadoAcceso[] | Prisma.ListEnumResultadoAccesoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ResultadoAcceso[] | Prisma.ListEnumResultadoAccesoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumResultadoAccesoFilter<$PrismaModel> | $Enums.ResultadoAcceso;
};
export type EnumTipoMovimientoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoMovimiento | Prisma.EnumTipoMovimientoFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoMovimiento[] | Prisma.ListEnumTipoMovimientoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoMovimiento[] | Prisma.ListEnumTipoMovimientoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoMovimientoWithAggregatesFilter<$PrismaModel> | $Enums.TipoMovimiento;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumTipoMovimientoFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumTipoMovimientoFilter<$PrismaModel>;
};
export type EnumResultadoAccesoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ResultadoAcceso | Prisma.EnumResultadoAccesoFieldRefInput<$PrismaModel>;
    in?: $Enums.ResultadoAcceso[] | Prisma.ListEnumResultadoAccesoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ResultadoAcceso[] | Prisma.ListEnumResultadoAccesoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumResultadoAccesoWithAggregatesFilter<$PrismaModel> | $Enums.ResultadoAcceso;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumResultadoAccesoFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumResultadoAccesoFilter<$PrismaModel>;
};
export type EnumAccionAuditoriaFilter<$PrismaModel = never> = {
    equals?: $Enums.AccionAuditoria | Prisma.EnumAccionAuditoriaFieldRefInput<$PrismaModel>;
    in?: $Enums.AccionAuditoria[] | Prisma.ListEnumAccionAuditoriaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AccionAuditoria[] | Prisma.ListEnumAccionAuditoriaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAccionAuditoriaFilter<$PrismaModel> | $Enums.AccionAuditoria;
};
export type EnumAccionAuditoriaWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AccionAuditoria | Prisma.EnumAccionAuditoriaFieldRefInput<$PrismaModel>;
    in?: $Enums.AccionAuditoria[] | Prisma.ListEnumAccionAuditoriaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AccionAuditoria[] | Prisma.ListEnumAccionAuditoriaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAccionAuditoriaWithAggregatesFilter<$PrismaModel> | $Enums.AccionAuditoria;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAccionAuditoriaFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAccionAuditoriaFilter<$PrismaModel>;
};
export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntFilter<$PrismaModel> | number;
};
export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringFilter<$PrismaModel> | string;
};
export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringNullableFilter<$PrismaModel> | string | null;
};
export type NestedEnumEstadoEmpresaFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoEmpresa | Prisma.EnumEstadoEmpresaFieldRefInput<$PrismaModel>;
    in?: $Enums.EstadoEmpresa[] | Prisma.ListEnumEstadoEmpresaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EstadoEmpresa[] | Prisma.ListEnumEstadoEmpresaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEstadoEmpresaFilter<$PrismaModel> | $Enums.EstadoEmpresa;
};
export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null;
};
export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeFilter<$PrismaModel> | Date | string;
};
export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedIntFilter<$PrismaModel>;
    _max?: Prisma.NestedIntFilter<$PrismaModel>;
};
export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatFilter<$PrismaModel> | number;
};
export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedStringFilter<$PrismaModel>;
    _max?: Prisma.NestedStringFilter<$PrismaModel>;
};
export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedStringNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedStringNullableFilter<$PrismaModel>;
};
export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableFilter<$PrismaModel> | number | null;
};
export type NestedEnumEstadoEmpresaWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoEmpresa | Prisma.EnumEstadoEmpresaFieldRefInput<$PrismaModel>;
    in?: $Enums.EstadoEmpresa[] | Prisma.ListEnumEstadoEmpresaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EstadoEmpresa[] | Prisma.ListEnumEstadoEmpresaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEstadoEmpresaWithAggregatesFilter<$PrismaModel> | $Enums.EstadoEmpresa;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumEstadoEmpresaFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumEstadoEmpresaFilter<$PrismaModel>;
};
export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel> | null;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedDateTimeNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedDateTimeNullableFilter<$PrismaModel>;
};
export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedDateTimeFilter<$PrismaModel>;
    _max?: Prisma.NestedDateTimeFilter<$PrismaModel>;
};
export type NestedEnumRolUsuarioFilter<$PrismaModel = never> = {
    equals?: $Enums.RolUsuario | Prisma.EnumRolUsuarioFieldRefInput<$PrismaModel>;
    in?: $Enums.RolUsuario[] | Prisma.ListEnumRolUsuarioFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RolUsuario[] | Prisma.ListEnumRolUsuarioFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRolUsuarioFilter<$PrismaModel> | $Enums.RolUsuario;
};
export type NestedEnumEstadoCuentaFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoCuenta | Prisma.EnumEstadoCuentaFieldRefInput<$PrismaModel>;
    in?: $Enums.EstadoCuenta[] | Prisma.ListEnumEstadoCuentaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EstadoCuenta[] | Prisma.ListEnumEstadoCuentaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEstadoCuentaFilter<$PrismaModel> | $Enums.EstadoCuenta;
};
export type NestedEnumRolUsuarioWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RolUsuario | Prisma.EnumRolUsuarioFieldRefInput<$PrismaModel>;
    in?: $Enums.RolUsuario[] | Prisma.ListEnumRolUsuarioFieldRefInput<$PrismaModel>;
    notIn?: $Enums.RolUsuario[] | Prisma.ListEnumRolUsuarioFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumRolUsuarioWithAggregatesFilter<$PrismaModel> | $Enums.RolUsuario;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumRolUsuarioFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumRolUsuarioFilter<$PrismaModel>;
};
export type NestedEnumEstadoCuentaWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoCuenta | Prisma.EnumEstadoCuentaFieldRefInput<$PrismaModel>;
    in?: $Enums.EstadoCuenta[] | Prisma.ListEnumEstadoCuentaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EstadoCuenta[] | Prisma.ListEnumEstadoCuentaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEstadoCuentaWithAggregatesFilter<$PrismaModel> | $Enums.EstadoCuenta;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumEstadoCuentaFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumEstadoCuentaFilter<$PrismaModel>;
};
export type NestedEnumCasoPuestoFilter<$PrismaModel = never> = {
    equals?: $Enums.CasoPuesto | Prisma.EnumCasoPuestoFieldRefInput<$PrismaModel>;
    in?: $Enums.CasoPuesto[] | Prisma.ListEnumCasoPuestoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CasoPuesto[] | Prisma.ListEnumCasoPuestoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCasoPuestoFilter<$PrismaModel> | $Enums.CasoPuesto;
};
export type NestedEnumCasoPuestoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CasoPuesto | Prisma.EnumCasoPuestoFieldRefInput<$PrismaModel>;
    in?: $Enums.CasoPuesto[] | Prisma.ListEnumCasoPuestoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.CasoPuesto[] | Prisma.ListEnumCasoPuestoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumCasoPuestoWithAggregatesFilter<$PrismaModel> | $Enums.CasoPuesto;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumCasoPuestoFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumCasoPuestoFilter<$PrismaModel>;
};
export type NestedEnumTipoDocumentoIdentidadFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoDocumentoIdentidad | Prisma.EnumTipoDocumentoIdentidadFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoDocumentoIdentidad[] | Prisma.ListEnumTipoDocumentoIdentidadFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoDocumentoIdentidad[] | Prisma.ListEnumTipoDocumentoIdentidadFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoDocumentoIdentidadFilter<$PrismaModel> | $Enums.TipoDocumentoIdentidad;
};
export type NestedEnumEstadoPersonaFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoPersona | Prisma.EnumEstadoPersonaFieldRefInput<$PrismaModel>;
    in?: $Enums.EstadoPersona[] | Prisma.ListEnumEstadoPersonaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EstadoPersona[] | Prisma.ListEnumEstadoPersonaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEstadoPersonaFilter<$PrismaModel> | $Enums.EstadoPersona;
};
export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatNullableFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedIntNullableFilter<$PrismaModel>;
};
export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatNullableFilter<$PrismaModel> | number | null;
};
export type NestedEnumTipoDocumentoIdentidadWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoDocumentoIdentidad | Prisma.EnumTipoDocumentoIdentidadFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoDocumentoIdentidad[] | Prisma.ListEnumTipoDocumentoIdentidadFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoDocumentoIdentidad[] | Prisma.ListEnumTipoDocumentoIdentidadFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoDocumentoIdentidadWithAggregatesFilter<$PrismaModel> | $Enums.TipoDocumentoIdentidad;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumTipoDocumentoIdentidadFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumTipoDocumentoIdentidadFilter<$PrismaModel>;
};
export type NestedEnumEstadoPersonaWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoPersona | Prisma.EnumEstadoPersonaFieldRefInput<$PrismaModel>;
    in?: $Enums.EstadoPersona[] | Prisma.ListEnumEstadoPersonaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EstadoPersona[] | Prisma.ListEnumEstadoPersonaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEstadoPersonaWithAggregatesFilter<$PrismaModel> | $Enums.EstadoPersona;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumEstadoPersonaFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumEstadoPersonaFilter<$PrismaModel>;
};
export type NestedEnumTipoValidacionDocumentoFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoValidacionDocumento | Prisma.EnumTipoValidacionDocumentoFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoValidacionDocumento[] | Prisma.ListEnumTipoValidacionDocumentoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoValidacionDocumento[] | Prisma.ListEnumTipoValidacionDocumentoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoValidacionDocumentoFilter<$PrismaModel> | $Enums.TipoValidacionDocumento;
};
export type NestedEnumTipoValidacionDocumentoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoValidacionDocumento | Prisma.EnumTipoValidacionDocumentoFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoValidacionDocumento[] | Prisma.ListEnumTipoValidacionDocumentoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoValidacionDocumento[] | Prisma.ListEnumTipoValidacionDocumentoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoValidacionDocumentoWithAggregatesFilter<$PrismaModel> | $Enums.TipoValidacionDocumento;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumTipoValidacionDocumentoFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumTipoValidacionDocumentoFilter<$PrismaModel>;
};
export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedBoolFilter<$PrismaModel> | boolean;
};
export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedBoolFilter<$PrismaModel>;
    _max?: Prisma.NestedBoolFilter<$PrismaModel>;
};
export type NestedEnumEstadoAprobacionDocumentoFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoAprobacionDocumento | Prisma.EnumEstadoAprobacionDocumentoFieldRefInput<$PrismaModel>;
    in?: $Enums.EstadoAprobacionDocumento[] | Prisma.ListEnumEstadoAprobacionDocumentoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EstadoAprobacionDocumento[] | Prisma.ListEnumEstadoAprobacionDocumentoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEstadoAprobacionDocumentoFilter<$PrismaModel> | $Enums.EstadoAprobacionDocumento;
};
export type NestedEnumEstadoAprobacionDocumentoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoAprobacionDocumento | Prisma.EnumEstadoAprobacionDocumentoFieldRefInput<$PrismaModel>;
    in?: $Enums.EstadoAprobacionDocumento[] | Prisma.ListEnumEstadoAprobacionDocumentoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EstadoAprobacionDocumento[] | Prisma.ListEnumEstadoAprobacionDocumentoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEstadoAprobacionDocumentoWithAggregatesFilter<$PrismaModel> | $Enums.EstadoAprobacionDocumento;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumEstadoAprobacionDocumentoFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumEstadoAprobacionDocumentoFilter<$PrismaModel>;
};
export type NestedEnumEstadoSolicitudVisitaFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoSolicitudVisita | Prisma.EnumEstadoSolicitudVisitaFieldRefInput<$PrismaModel>;
    in?: $Enums.EstadoSolicitudVisita[] | Prisma.ListEnumEstadoSolicitudVisitaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EstadoSolicitudVisita[] | Prisma.ListEnumEstadoSolicitudVisitaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEstadoSolicitudVisitaFilter<$PrismaModel> | $Enums.EstadoSolicitudVisita;
};
export type NestedEnumEstadoSolicitudVisitaWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EstadoSolicitudVisita | Prisma.EnumEstadoSolicitudVisitaFieldRefInput<$PrismaModel>;
    in?: $Enums.EstadoSolicitudVisita[] | Prisma.ListEnumEstadoSolicitudVisitaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.EstadoSolicitudVisita[] | Prisma.ListEnumEstadoSolicitudVisitaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumEstadoSolicitudVisitaWithAggregatesFilter<$PrismaModel> | $Enums.EstadoSolicitudVisita;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumEstadoSolicitudVisitaFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumEstadoSolicitudVisitaFilter<$PrismaModel>;
};
export type NestedEnumTipoMovimientoFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoMovimiento | Prisma.EnumTipoMovimientoFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoMovimiento[] | Prisma.ListEnumTipoMovimientoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoMovimiento[] | Prisma.ListEnumTipoMovimientoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoMovimientoFilter<$PrismaModel> | $Enums.TipoMovimiento;
};
export type NestedEnumResultadoAccesoFilter<$PrismaModel = never> = {
    equals?: $Enums.ResultadoAcceso | Prisma.EnumResultadoAccesoFieldRefInput<$PrismaModel>;
    in?: $Enums.ResultadoAcceso[] | Prisma.ListEnumResultadoAccesoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ResultadoAcceso[] | Prisma.ListEnumResultadoAccesoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumResultadoAccesoFilter<$PrismaModel> | $Enums.ResultadoAcceso;
};
export type NestedEnumTipoMovimientoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoMovimiento | Prisma.EnumTipoMovimientoFieldRefInput<$PrismaModel>;
    in?: $Enums.TipoMovimiento[] | Prisma.ListEnumTipoMovimientoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.TipoMovimiento[] | Prisma.ListEnumTipoMovimientoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumTipoMovimientoWithAggregatesFilter<$PrismaModel> | $Enums.TipoMovimiento;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumTipoMovimientoFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumTipoMovimientoFilter<$PrismaModel>;
};
export type NestedEnumResultadoAccesoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ResultadoAcceso | Prisma.EnumResultadoAccesoFieldRefInput<$PrismaModel>;
    in?: $Enums.ResultadoAcceso[] | Prisma.ListEnumResultadoAccesoFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ResultadoAcceso[] | Prisma.ListEnumResultadoAccesoFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumResultadoAccesoWithAggregatesFilter<$PrismaModel> | $Enums.ResultadoAcceso;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumResultadoAccesoFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumResultadoAccesoFilter<$PrismaModel>;
};
export type NestedEnumAccionAuditoriaFilter<$PrismaModel = never> = {
    equals?: $Enums.AccionAuditoria | Prisma.EnumAccionAuditoriaFieldRefInput<$PrismaModel>;
    in?: $Enums.AccionAuditoria[] | Prisma.ListEnumAccionAuditoriaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AccionAuditoria[] | Prisma.ListEnumAccionAuditoriaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAccionAuditoriaFilter<$PrismaModel> | $Enums.AccionAuditoria;
};
export type NestedEnumAccionAuditoriaWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AccionAuditoria | Prisma.EnumAccionAuditoriaFieldRefInput<$PrismaModel>;
    in?: $Enums.AccionAuditoria[] | Prisma.ListEnumAccionAuditoriaFieldRefInput<$PrismaModel>;
    notIn?: $Enums.AccionAuditoria[] | Prisma.ListEnumAccionAuditoriaFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumAccionAuditoriaWithAggregatesFilter<$PrismaModel> | $Enums.AccionAuditoria;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumAccionAuditoriaFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumAccionAuditoriaFilter<$PrismaModel>;
};
