import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type UsuarioModel = runtime.Types.Result.DefaultSelection<Prisma.$UsuarioPayload>;
export type AggregateUsuario = {
    _count: UsuarioCountAggregateOutputType | null;
    _avg: UsuarioAvgAggregateOutputType | null;
    _sum: UsuarioSumAggregateOutputType | null;
    _min: UsuarioMinAggregateOutputType | null;
    _max: UsuarioMaxAggregateOutputType | null;
};
export type UsuarioAvgAggregateOutputType = {
    id: number | null;
    empresaId: number | null;
};
export type UsuarioSumAggregateOutputType = {
    id: number | null;
    empresaId: number | null;
};
export type UsuarioMinAggregateOutputType = {
    id: number | null;
    empresaId: number | null;
    rol: $Enums.RolUsuario | null;
    correo: string | null;
    passwordHash: string | null;
    estadoCuenta: $Enums.EstadoCuenta | null;
    tokenInvitacion: string | null;
    tokenExpira: Date | null;
    creadoEn: Date | null;
};
export type UsuarioMaxAggregateOutputType = {
    id: number | null;
    empresaId: number | null;
    rol: $Enums.RolUsuario | null;
    correo: string | null;
    passwordHash: string | null;
    estadoCuenta: $Enums.EstadoCuenta | null;
    tokenInvitacion: string | null;
    tokenExpira: Date | null;
    creadoEn: Date | null;
};
export type UsuarioCountAggregateOutputType = {
    id: number;
    empresaId: number;
    rol: number;
    correo: number;
    passwordHash: number;
    estadoCuenta: number;
    tokenInvitacion: number;
    tokenExpira: number;
    creadoEn: number;
    _all: number;
};
export type UsuarioAvgAggregateInputType = {
    id?: true;
    empresaId?: true;
};
export type UsuarioSumAggregateInputType = {
    id?: true;
    empresaId?: true;
};
export type UsuarioMinAggregateInputType = {
    id?: true;
    empresaId?: true;
    rol?: true;
    correo?: true;
    passwordHash?: true;
    estadoCuenta?: true;
    tokenInvitacion?: true;
    tokenExpira?: true;
    creadoEn?: true;
};
export type UsuarioMaxAggregateInputType = {
    id?: true;
    empresaId?: true;
    rol?: true;
    correo?: true;
    passwordHash?: true;
    estadoCuenta?: true;
    tokenInvitacion?: true;
    tokenExpira?: true;
    creadoEn?: true;
};
export type UsuarioCountAggregateInputType = {
    id?: true;
    empresaId?: true;
    rol?: true;
    correo?: true;
    passwordHash?: true;
    estadoCuenta?: true;
    tokenInvitacion?: true;
    tokenExpira?: true;
    creadoEn?: true;
    _all?: true;
};
export type UsuarioAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UsuarioWhereInput;
    orderBy?: Prisma.UsuarioOrderByWithRelationInput | Prisma.UsuarioOrderByWithRelationInput[];
    cursor?: Prisma.UsuarioWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | UsuarioCountAggregateInputType;
    _avg?: UsuarioAvgAggregateInputType;
    _sum?: UsuarioSumAggregateInputType;
    _min?: UsuarioMinAggregateInputType;
    _max?: UsuarioMaxAggregateInputType;
};
export type GetUsuarioAggregateType<T extends UsuarioAggregateArgs> = {
    [P in keyof T & keyof AggregateUsuario]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateUsuario[P]> : Prisma.GetScalarType<T[P], AggregateUsuario[P]>;
};
export type UsuarioGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UsuarioWhereInput;
    orderBy?: Prisma.UsuarioOrderByWithAggregationInput | Prisma.UsuarioOrderByWithAggregationInput[];
    by: Prisma.UsuarioScalarFieldEnum[] | Prisma.UsuarioScalarFieldEnum;
    having?: Prisma.UsuarioScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UsuarioCountAggregateInputType | true;
    _avg?: UsuarioAvgAggregateInputType;
    _sum?: UsuarioSumAggregateInputType;
    _min?: UsuarioMinAggregateInputType;
    _max?: UsuarioMaxAggregateInputType;
};
export type UsuarioGroupByOutputType = {
    id: number;
    empresaId: number;
    rol: $Enums.RolUsuario;
    correo: string;
    passwordHash: string | null;
    estadoCuenta: $Enums.EstadoCuenta;
    tokenInvitacion: string | null;
    tokenExpira: Date | null;
    creadoEn: Date;
    _count: UsuarioCountAggregateOutputType | null;
    _avg: UsuarioAvgAggregateOutputType | null;
    _sum: UsuarioSumAggregateOutputType | null;
    _min: UsuarioMinAggregateOutputType | null;
    _max: UsuarioMaxAggregateOutputType | null;
};
export type GetUsuarioGroupByPayload<T extends UsuarioGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<UsuarioGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof UsuarioGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], UsuarioGroupByOutputType[P]> : Prisma.GetScalarType<T[P], UsuarioGroupByOutputType[P]>;
}>>;
export type UsuarioWhereInput = {
    AND?: Prisma.UsuarioWhereInput | Prisma.UsuarioWhereInput[];
    OR?: Prisma.UsuarioWhereInput[];
    NOT?: Prisma.UsuarioWhereInput | Prisma.UsuarioWhereInput[];
    id?: Prisma.IntFilter<"Usuario"> | number;
    empresaId?: Prisma.IntFilter<"Usuario"> | number;
    rol?: Prisma.EnumRolUsuarioFilter<"Usuario"> | $Enums.RolUsuario;
    correo?: Prisma.StringFilter<"Usuario"> | string;
    passwordHash?: Prisma.StringNullableFilter<"Usuario"> | string | null;
    estadoCuenta?: Prisma.EnumEstadoCuentaFilter<"Usuario"> | $Enums.EstadoCuenta;
    tokenInvitacion?: Prisma.StringNullableFilter<"Usuario"> | string | null;
    tokenExpira?: Prisma.DateTimeNullableFilter<"Usuario"> | Date | string | null;
    creadoEn?: Prisma.DateTimeFilter<"Usuario"> | Date | string;
    empresa?: Prisma.XOR<Prisma.EmpresaScalarRelationFilter, Prisma.EmpresaWhereInput>;
    auditorias?: Prisma.AuditoriaListRelationFilter;
};
export type UsuarioOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    empresaId?: Prisma.SortOrder;
    rol?: Prisma.SortOrder;
    correo?: Prisma.SortOrder;
    passwordHash?: Prisma.SortOrderInput | Prisma.SortOrder;
    estadoCuenta?: Prisma.SortOrder;
    tokenInvitacion?: Prisma.SortOrderInput | Prisma.SortOrder;
    tokenExpira?: Prisma.SortOrderInput | Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
    empresa?: Prisma.EmpresaOrderByWithRelationInput;
    auditorias?: Prisma.AuditoriaOrderByRelationAggregateInput;
};
export type UsuarioWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    correo?: string;
    AND?: Prisma.UsuarioWhereInput | Prisma.UsuarioWhereInput[];
    OR?: Prisma.UsuarioWhereInput[];
    NOT?: Prisma.UsuarioWhereInput | Prisma.UsuarioWhereInput[];
    empresaId?: Prisma.IntFilter<"Usuario"> | number;
    rol?: Prisma.EnumRolUsuarioFilter<"Usuario"> | $Enums.RolUsuario;
    passwordHash?: Prisma.StringNullableFilter<"Usuario"> | string | null;
    estadoCuenta?: Prisma.EnumEstadoCuentaFilter<"Usuario"> | $Enums.EstadoCuenta;
    tokenInvitacion?: Prisma.StringNullableFilter<"Usuario"> | string | null;
    tokenExpira?: Prisma.DateTimeNullableFilter<"Usuario"> | Date | string | null;
    creadoEn?: Prisma.DateTimeFilter<"Usuario"> | Date | string;
    empresa?: Prisma.XOR<Prisma.EmpresaScalarRelationFilter, Prisma.EmpresaWhereInput>;
    auditorias?: Prisma.AuditoriaListRelationFilter;
}, "id" | "correo">;
export type UsuarioOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    empresaId?: Prisma.SortOrder;
    rol?: Prisma.SortOrder;
    correo?: Prisma.SortOrder;
    passwordHash?: Prisma.SortOrderInput | Prisma.SortOrder;
    estadoCuenta?: Prisma.SortOrder;
    tokenInvitacion?: Prisma.SortOrderInput | Prisma.SortOrder;
    tokenExpira?: Prisma.SortOrderInput | Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
    _count?: Prisma.UsuarioCountOrderByAggregateInput;
    _avg?: Prisma.UsuarioAvgOrderByAggregateInput;
    _max?: Prisma.UsuarioMaxOrderByAggregateInput;
    _min?: Prisma.UsuarioMinOrderByAggregateInput;
    _sum?: Prisma.UsuarioSumOrderByAggregateInput;
};
export type UsuarioScalarWhereWithAggregatesInput = {
    AND?: Prisma.UsuarioScalarWhereWithAggregatesInput | Prisma.UsuarioScalarWhereWithAggregatesInput[];
    OR?: Prisma.UsuarioScalarWhereWithAggregatesInput[];
    NOT?: Prisma.UsuarioScalarWhereWithAggregatesInput | Prisma.UsuarioScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Usuario"> | number;
    empresaId?: Prisma.IntWithAggregatesFilter<"Usuario"> | number;
    rol?: Prisma.EnumRolUsuarioWithAggregatesFilter<"Usuario"> | $Enums.RolUsuario;
    correo?: Prisma.StringWithAggregatesFilter<"Usuario"> | string;
    passwordHash?: Prisma.StringNullableWithAggregatesFilter<"Usuario"> | string | null;
    estadoCuenta?: Prisma.EnumEstadoCuentaWithAggregatesFilter<"Usuario"> | $Enums.EstadoCuenta;
    tokenInvitacion?: Prisma.StringNullableWithAggregatesFilter<"Usuario"> | string | null;
    tokenExpira?: Prisma.DateTimeNullableWithAggregatesFilter<"Usuario"> | Date | string | null;
    creadoEn?: Prisma.DateTimeWithAggregatesFilter<"Usuario"> | Date | string;
};
export type UsuarioCreateInput = {
    rol: $Enums.RolUsuario;
    correo: string;
    passwordHash?: string | null;
    estadoCuenta?: $Enums.EstadoCuenta;
    tokenInvitacion?: string | null;
    tokenExpira?: Date | string | null;
    creadoEn?: Date | string;
    empresa: Prisma.EmpresaCreateNestedOneWithoutUsuariosInput;
    auditorias?: Prisma.AuditoriaCreateNestedManyWithoutUsuarioInput;
};
export type UsuarioUncheckedCreateInput = {
    id?: number;
    empresaId: number;
    rol: $Enums.RolUsuario;
    correo: string;
    passwordHash?: string | null;
    estadoCuenta?: $Enums.EstadoCuenta;
    tokenInvitacion?: string | null;
    tokenExpira?: Date | string | null;
    creadoEn?: Date | string;
    auditorias?: Prisma.AuditoriaUncheckedCreateNestedManyWithoutUsuarioInput;
};
export type UsuarioUpdateInput = {
    rol?: Prisma.EnumRolUsuarioFieldUpdateOperationsInput | $Enums.RolUsuario;
    correo?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estadoCuenta?: Prisma.EnumEstadoCuentaFieldUpdateOperationsInput | $Enums.EstadoCuenta;
    tokenInvitacion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tokenExpira?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    empresa?: Prisma.EmpresaUpdateOneRequiredWithoutUsuariosNestedInput;
    auditorias?: Prisma.AuditoriaUpdateManyWithoutUsuarioNestedInput;
};
export type UsuarioUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    empresaId?: Prisma.IntFieldUpdateOperationsInput | number;
    rol?: Prisma.EnumRolUsuarioFieldUpdateOperationsInput | $Enums.RolUsuario;
    correo?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estadoCuenta?: Prisma.EnumEstadoCuentaFieldUpdateOperationsInput | $Enums.EstadoCuenta;
    tokenInvitacion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tokenExpira?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    auditorias?: Prisma.AuditoriaUncheckedUpdateManyWithoutUsuarioNestedInput;
};
export type UsuarioCreateManyInput = {
    id?: number;
    empresaId: number;
    rol: $Enums.RolUsuario;
    correo: string;
    passwordHash?: string | null;
    estadoCuenta?: $Enums.EstadoCuenta;
    tokenInvitacion?: string | null;
    tokenExpira?: Date | string | null;
    creadoEn?: Date | string;
};
export type UsuarioUpdateManyMutationInput = {
    rol?: Prisma.EnumRolUsuarioFieldUpdateOperationsInput | $Enums.RolUsuario;
    correo?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estadoCuenta?: Prisma.EnumEstadoCuentaFieldUpdateOperationsInput | $Enums.EstadoCuenta;
    tokenInvitacion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tokenExpira?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UsuarioUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    empresaId?: Prisma.IntFieldUpdateOperationsInput | number;
    rol?: Prisma.EnumRolUsuarioFieldUpdateOperationsInput | $Enums.RolUsuario;
    correo?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estadoCuenta?: Prisma.EnumEstadoCuentaFieldUpdateOperationsInput | $Enums.EstadoCuenta;
    tokenInvitacion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tokenExpira?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UsuarioListRelationFilter = {
    every?: Prisma.UsuarioWhereInput;
    some?: Prisma.UsuarioWhereInput;
    none?: Prisma.UsuarioWhereInput;
};
export type UsuarioOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type UsuarioCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    empresaId?: Prisma.SortOrder;
    rol?: Prisma.SortOrder;
    correo?: Prisma.SortOrder;
    passwordHash?: Prisma.SortOrder;
    estadoCuenta?: Prisma.SortOrder;
    tokenInvitacion?: Prisma.SortOrder;
    tokenExpira?: Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
};
export type UsuarioAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    empresaId?: Prisma.SortOrder;
};
export type UsuarioMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    empresaId?: Prisma.SortOrder;
    rol?: Prisma.SortOrder;
    correo?: Prisma.SortOrder;
    passwordHash?: Prisma.SortOrder;
    estadoCuenta?: Prisma.SortOrder;
    tokenInvitacion?: Prisma.SortOrder;
    tokenExpira?: Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
};
export type UsuarioMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    empresaId?: Prisma.SortOrder;
    rol?: Prisma.SortOrder;
    correo?: Prisma.SortOrder;
    passwordHash?: Prisma.SortOrder;
    estadoCuenta?: Prisma.SortOrder;
    tokenInvitacion?: Prisma.SortOrder;
    tokenExpira?: Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
};
export type UsuarioSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    empresaId?: Prisma.SortOrder;
};
export type UsuarioNullableScalarRelationFilter = {
    is?: Prisma.UsuarioWhereInput | null;
    isNot?: Prisma.UsuarioWhereInput | null;
};
export type UsuarioCreateNestedManyWithoutEmpresaInput = {
    create?: Prisma.XOR<Prisma.UsuarioCreateWithoutEmpresaInput, Prisma.UsuarioUncheckedCreateWithoutEmpresaInput> | Prisma.UsuarioCreateWithoutEmpresaInput[] | Prisma.UsuarioUncheckedCreateWithoutEmpresaInput[];
    connectOrCreate?: Prisma.UsuarioCreateOrConnectWithoutEmpresaInput | Prisma.UsuarioCreateOrConnectWithoutEmpresaInput[];
    createMany?: Prisma.UsuarioCreateManyEmpresaInputEnvelope;
    connect?: Prisma.UsuarioWhereUniqueInput | Prisma.UsuarioWhereUniqueInput[];
};
export type UsuarioUncheckedCreateNestedManyWithoutEmpresaInput = {
    create?: Prisma.XOR<Prisma.UsuarioCreateWithoutEmpresaInput, Prisma.UsuarioUncheckedCreateWithoutEmpresaInput> | Prisma.UsuarioCreateWithoutEmpresaInput[] | Prisma.UsuarioUncheckedCreateWithoutEmpresaInput[];
    connectOrCreate?: Prisma.UsuarioCreateOrConnectWithoutEmpresaInput | Prisma.UsuarioCreateOrConnectWithoutEmpresaInput[];
    createMany?: Prisma.UsuarioCreateManyEmpresaInputEnvelope;
    connect?: Prisma.UsuarioWhereUniqueInput | Prisma.UsuarioWhereUniqueInput[];
};
export type UsuarioUpdateManyWithoutEmpresaNestedInput = {
    create?: Prisma.XOR<Prisma.UsuarioCreateWithoutEmpresaInput, Prisma.UsuarioUncheckedCreateWithoutEmpresaInput> | Prisma.UsuarioCreateWithoutEmpresaInput[] | Prisma.UsuarioUncheckedCreateWithoutEmpresaInput[];
    connectOrCreate?: Prisma.UsuarioCreateOrConnectWithoutEmpresaInput | Prisma.UsuarioCreateOrConnectWithoutEmpresaInput[];
    upsert?: Prisma.UsuarioUpsertWithWhereUniqueWithoutEmpresaInput | Prisma.UsuarioUpsertWithWhereUniqueWithoutEmpresaInput[];
    createMany?: Prisma.UsuarioCreateManyEmpresaInputEnvelope;
    set?: Prisma.UsuarioWhereUniqueInput | Prisma.UsuarioWhereUniqueInput[];
    disconnect?: Prisma.UsuarioWhereUniqueInput | Prisma.UsuarioWhereUniqueInput[];
    delete?: Prisma.UsuarioWhereUniqueInput | Prisma.UsuarioWhereUniqueInput[];
    connect?: Prisma.UsuarioWhereUniqueInput | Prisma.UsuarioWhereUniqueInput[];
    update?: Prisma.UsuarioUpdateWithWhereUniqueWithoutEmpresaInput | Prisma.UsuarioUpdateWithWhereUniqueWithoutEmpresaInput[];
    updateMany?: Prisma.UsuarioUpdateManyWithWhereWithoutEmpresaInput | Prisma.UsuarioUpdateManyWithWhereWithoutEmpresaInput[];
    deleteMany?: Prisma.UsuarioScalarWhereInput | Prisma.UsuarioScalarWhereInput[];
};
export type UsuarioUncheckedUpdateManyWithoutEmpresaNestedInput = {
    create?: Prisma.XOR<Prisma.UsuarioCreateWithoutEmpresaInput, Prisma.UsuarioUncheckedCreateWithoutEmpresaInput> | Prisma.UsuarioCreateWithoutEmpresaInput[] | Prisma.UsuarioUncheckedCreateWithoutEmpresaInput[];
    connectOrCreate?: Prisma.UsuarioCreateOrConnectWithoutEmpresaInput | Prisma.UsuarioCreateOrConnectWithoutEmpresaInput[];
    upsert?: Prisma.UsuarioUpsertWithWhereUniqueWithoutEmpresaInput | Prisma.UsuarioUpsertWithWhereUniqueWithoutEmpresaInput[];
    createMany?: Prisma.UsuarioCreateManyEmpresaInputEnvelope;
    set?: Prisma.UsuarioWhereUniqueInput | Prisma.UsuarioWhereUniqueInput[];
    disconnect?: Prisma.UsuarioWhereUniqueInput | Prisma.UsuarioWhereUniqueInput[];
    delete?: Prisma.UsuarioWhereUniqueInput | Prisma.UsuarioWhereUniqueInput[];
    connect?: Prisma.UsuarioWhereUniqueInput | Prisma.UsuarioWhereUniqueInput[];
    update?: Prisma.UsuarioUpdateWithWhereUniqueWithoutEmpresaInput | Prisma.UsuarioUpdateWithWhereUniqueWithoutEmpresaInput[];
    updateMany?: Prisma.UsuarioUpdateManyWithWhereWithoutEmpresaInput | Prisma.UsuarioUpdateManyWithWhereWithoutEmpresaInput[];
    deleteMany?: Prisma.UsuarioScalarWhereInput | Prisma.UsuarioScalarWhereInput[];
};
export type EnumRolUsuarioFieldUpdateOperationsInput = {
    set?: $Enums.RolUsuario;
};
export type EnumEstadoCuentaFieldUpdateOperationsInput = {
    set?: $Enums.EstadoCuenta;
};
export type UsuarioCreateNestedOneWithoutAuditoriasInput = {
    create?: Prisma.XOR<Prisma.UsuarioCreateWithoutAuditoriasInput, Prisma.UsuarioUncheckedCreateWithoutAuditoriasInput>;
    connectOrCreate?: Prisma.UsuarioCreateOrConnectWithoutAuditoriasInput;
    connect?: Prisma.UsuarioWhereUniqueInput;
};
export type UsuarioUpdateOneWithoutAuditoriasNestedInput = {
    create?: Prisma.XOR<Prisma.UsuarioCreateWithoutAuditoriasInput, Prisma.UsuarioUncheckedCreateWithoutAuditoriasInput>;
    connectOrCreate?: Prisma.UsuarioCreateOrConnectWithoutAuditoriasInput;
    upsert?: Prisma.UsuarioUpsertWithoutAuditoriasInput;
    disconnect?: Prisma.UsuarioWhereInput | boolean;
    delete?: Prisma.UsuarioWhereInput | boolean;
    connect?: Prisma.UsuarioWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UsuarioUpdateToOneWithWhereWithoutAuditoriasInput, Prisma.UsuarioUpdateWithoutAuditoriasInput>, Prisma.UsuarioUncheckedUpdateWithoutAuditoriasInput>;
};
export type UsuarioCreateWithoutEmpresaInput = {
    rol: $Enums.RolUsuario;
    correo: string;
    passwordHash?: string | null;
    estadoCuenta?: $Enums.EstadoCuenta;
    tokenInvitacion?: string | null;
    tokenExpira?: Date | string | null;
    creadoEn?: Date | string;
    auditorias?: Prisma.AuditoriaCreateNestedManyWithoutUsuarioInput;
};
export type UsuarioUncheckedCreateWithoutEmpresaInput = {
    id?: number;
    rol: $Enums.RolUsuario;
    correo: string;
    passwordHash?: string | null;
    estadoCuenta?: $Enums.EstadoCuenta;
    tokenInvitacion?: string | null;
    tokenExpira?: Date | string | null;
    creadoEn?: Date | string;
    auditorias?: Prisma.AuditoriaUncheckedCreateNestedManyWithoutUsuarioInput;
};
export type UsuarioCreateOrConnectWithoutEmpresaInput = {
    where: Prisma.UsuarioWhereUniqueInput;
    create: Prisma.XOR<Prisma.UsuarioCreateWithoutEmpresaInput, Prisma.UsuarioUncheckedCreateWithoutEmpresaInput>;
};
export type UsuarioCreateManyEmpresaInputEnvelope = {
    data: Prisma.UsuarioCreateManyEmpresaInput | Prisma.UsuarioCreateManyEmpresaInput[];
    skipDuplicates?: boolean;
};
export type UsuarioUpsertWithWhereUniqueWithoutEmpresaInput = {
    where: Prisma.UsuarioWhereUniqueInput;
    update: Prisma.XOR<Prisma.UsuarioUpdateWithoutEmpresaInput, Prisma.UsuarioUncheckedUpdateWithoutEmpresaInput>;
    create: Prisma.XOR<Prisma.UsuarioCreateWithoutEmpresaInput, Prisma.UsuarioUncheckedCreateWithoutEmpresaInput>;
};
export type UsuarioUpdateWithWhereUniqueWithoutEmpresaInput = {
    where: Prisma.UsuarioWhereUniqueInput;
    data: Prisma.XOR<Prisma.UsuarioUpdateWithoutEmpresaInput, Prisma.UsuarioUncheckedUpdateWithoutEmpresaInput>;
};
export type UsuarioUpdateManyWithWhereWithoutEmpresaInput = {
    where: Prisma.UsuarioScalarWhereInput;
    data: Prisma.XOR<Prisma.UsuarioUpdateManyMutationInput, Prisma.UsuarioUncheckedUpdateManyWithoutEmpresaInput>;
};
export type UsuarioScalarWhereInput = {
    AND?: Prisma.UsuarioScalarWhereInput | Prisma.UsuarioScalarWhereInput[];
    OR?: Prisma.UsuarioScalarWhereInput[];
    NOT?: Prisma.UsuarioScalarWhereInput | Prisma.UsuarioScalarWhereInput[];
    id?: Prisma.IntFilter<"Usuario"> | number;
    empresaId?: Prisma.IntFilter<"Usuario"> | number;
    rol?: Prisma.EnumRolUsuarioFilter<"Usuario"> | $Enums.RolUsuario;
    correo?: Prisma.StringFilter<"Usuario"> | string;
    passwordHash?: Prisma.StringNullableFilter<"Usuario"> | string | null;
    estadoCuenta?: Prisma.EnumEstadoCuentaFilter<"Usuario"> | $Enums.EstadoCuenta;
    tokenInvitacion?: Prisma.StringNullableFilter<"Usuario"> | string | null;
    tokenExpira?: Prisma.DateTimeNullableFilter<"Usuario"> | Date | string | null;
    creadoEn?: Prisma.DateTimeFilter<"Usuario"> | Date | string;
};
export type UsuarioCreateWithoutAuditoriasInput = {
    rol: $Enums.RolUsuario;
    correo: string;
    passwordHash?: string | null;
    estadoCuenta?: $Enums.EstadoCuenta;
    tokenInvitacion?: string | null;
    tokenExpira?: Date | string | null;
    creadoEn?: Date | string;
    empresa: Prisma.EmpresaCreateNestedOneWithoutUsuariosInput;
};
export type UsuarioUncheckedCreateWithoutAuditoriasInput = {
    id?: number;
    empresaId: number;
    rol: $Enums.RolUsuario;
    correo: string;
    passwordHash?: string | null;
    estadoCuenta?: $Enums.EstadoCuenta;
    tokenInvitacion?: string | null;
    tokenExpira?: Date | string | null;
    creadoEn?: Date | string;
};
export type UsuarioCreateOrConnectWithoutAuditoriasInput = {
    where: Prisma.UsuarioWhereUniqueInput;
    create: Prisma.XOR<Prisma.UsuarioCreateWithoutAuditoriasInput, Prisma.UsuarioUncheckedCreateWithoutAuditoriasInput>;
};
export type UsuarioUpsertWithoutAuditoriasInput = {
    update: Prisma.XOR<Prisma.UsuarioUpdateWithoutAuditoriasInput, Prisma.UsuarioUncheckedUpdateWithoutAuditoriasInput>;
    create: Prisma.XOR<Prisma.UsuarioCreateWithoutAuditoriasInput, Prisma.UsuarioUncheckedCreateWithoutAuditoriasInput>;
    where?: Prisma.UsuarioWhereInput;
};
export type UsuarioUpdateToOneWithWhereWithoutAuditoriasInput = {
    where?: Prisma.UsuarioWhereInput;
    data: Prisma.XOR<Prisma.UsuarioUpdateWithoutAuditoriasInput, Prisma.UsuarioUncheckedUpdateWithoutAuditoriasInput>;
};
export type UsuarioUpdateWithoutAuditoriasInput = {
    rol?: Prisma.EnumRolUsuarioFieldUpdateOperationsInput | $Enums.RolUsuario;
    correo?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estadoCuenta?: Prisma.EnumEstadoCuentaFieldUpdateOperationsInput | $Enums.EstadoCuenta;
    tokenInvitacion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tokenExpira?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    empresa?: Prisma.EmpresaUpdateOneRequiredWithoutUsuariosNestedInput;
};
export type UsuarioUncheckedUpdateWithoutAuditoriasInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    empresaId?: Prisma.IntFieldUpdateOperationsInput | number;
    rol?: Prisma.EnumRolUsuarioFieldUpdateOperationsInput | $Enums.RolUsuario;
    correo?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estadoCuenta?: Prisma.EnumEstadoCuentaFieldUpdateOperationsInput | $Enums.EstadoCuenta;
    tokenInvitacion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tokenExpira?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UsuarioCreateManyEmpresaInput = {
    id?: number;
    rol: $Enums.RolUsuario;
    correo: string;
    passwordHash?: string | null;
    estadoCuenta?: $Enums.EstadoCuenta;
    tokenInvitacion?: string | null;
    tokenExpira?: Date | string | null;
    creadoEn?: Date | string;
};
export type UsuarioUpdateWithoutEmpresaInput = {
    rol?: Prisma.EnumRolUsuarioFieldUpdateOperationsInput | $Enums.RolUsuario;
    correo?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estadoCuenta?: Prisma.EnumEstadoCuentaFieldUpdateOperationsInput | $Enums.EstadoCuenta;
    tokenInvitacion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tokenExpira?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    auditorias?: Prisma.AuditoriaUpdateManyWithoutUsuarioNestedInput;
};
export type UsuarioUncheckedUpdateWithoutEmpresaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    rol?: Prisma.EnumRolUsuarioFieldUpdateOperationsInput | $Enums.RolUsuario;
    correo?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estadoCuenta?: Prisma.EnumEstadoCuentaFieldUpdateOperationsInput | $Enums.EstadoCuenta;
    tokenInvitacion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tokenExpira?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    auditorias?: Prisma.AuditoriaUncheckedUpdateManyWithoutUsuarioNestedInput;
};
export type UsuarioUncheckedUpdateManyWithoutEmpresaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    rol?: Prisma.EnumRolUsuarioFieldUpdateOperationsInput | $Enums.RolUsuario;
    correo?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estadoCuenta?: Prisma.EnumEstadoCuentaFieldUpdateOperationsInput | $Enums.EstadoCuenta;
    tokenInvitacion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    tokenExpira?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UsuarioCountOutputType = {
    auditorias: number;
};
export type UsuarioCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    auditorias?: boolean | UsuarioCountOutputTypeCountAuditoriasArgs;
};
export type UsuarioCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioCountOutputTypeSelect<ExtArgs> | null;
};
export type UsuarioCountOutputTypeCountAuditoriasArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AuditoriaWhereInput;
};
export type UsuarioSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    empresaId?: boolean;
    rol?: boolean;
    correo?: boolean;
    passwordHash?: boolean;
    estadoCuenta?: boolean;
    tokenInvitacion?: boolean;
    tokenExpira?: boolean;
    creadoEn?: boolean;
    empresa?: boolean | Prisma.EmpresaDefaultArgs<ExtArgs>;
    auditorias?: boolean | Prisma.Usuario$auditoriasArgs<ExtArgs>;
    _count?: boolean | Prisma.UsuarioCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["usuario"]>;
export type UsuarioSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    empresaId?: boolean;
    rol?: boolean;
    correo?: boolean;
    passwordHash?: boolean;
    estadoCuenta?: boolean;
    tokenInvitacion?: boolean;
    tokenExpira?: boolean;
    creadoEn?: boolean;
    empresa?: boolean | Prisma.EmpresaDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["usuario"]>;
export type UsuarioSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    empresaId?: boolean;
    rol?: boolean;
    correo?: boolean;
    passwordHash?: boolean;
    estadoCuenta?: boolean;
    tokenInvitacion?: boolean;
    tokenExpira?: boolean;
    creadoEn?: boolean;
    empresa?: boolean | Prisma.EmpresaDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["usuario"]>;
export type UsuarioSelectScalar = {
    id?: boolean;
    empresaId?: boolean;
    rol?: boolean;
    correo?: boolean;
    passwordHash?: boolean;
    estadoCuenta?: boolean;
    tokenInvitacion?: boolean;
    tokenExpira?: boolean;
    creadoEn?: boolean;
};
export type UsuarioOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "empresaId" | "rol" | "correo" | "passwordHash" | "estadoCuenta" | "tokenInvitacion" | "tokenExpira" | "creadoEn", ExtArgs["result"]["usuario"]>;
export type UsuarioInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    empresa?: boolean | Prisma.EmpresaDefaultArgs<ExtArgs>;
    auditorias?: boolean | Prisma.Usuario$auditoriasArgs<ExtArgs>;
    _count?: boolean | Prisma.UsuarioCountOutputTypeDefaultArgs<ExtArgs>;
};
export type UsuarioIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    empresa?: boolean | Prisma.EmpresaDefaultArgs<ExtArgs>;
};
export type UsuarioIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    empresa?: boolean | Prisma.EmpresaDefaultArgs<ExtArgs>;
};
export type $UsuarioPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Usuario";
    objects: {
        empresa: Prisma.$EmpresaPayload<ExtArgs>;
        auditorias: Prisma.$AuditoriaPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        empresaId: number;
        rol: $Enums.RolUsuario;
        correo: string;
        passwordHash: string | null;
        estadoCuenta: $Enums.EstadoCuenta;
        tokenInvitacion: string | null;
        tokenExpira: Date | null;
        creadoEn: Date;
    }, ExtArgs["result"]["usuario"]>;
    composites: {};
};
export type UsuarioGetPayload<S extends boolean | null | undefined | UsuarioDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$UsuarioPayload, S>;
export type UsuarioCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<UsuarioFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: UsuarioCountAggregateInputType | true;
};
export interface UsuarioDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Usuario'];
        meta: {
            name: 'Usuario';
        };
    };
    findUnique<T extends UsuarioFindUniqueArgs>(args: Prisma.SelectSubset<T, UsuarioFindUniqueArgs<ExtArgs>>): Prisma.Prisma__UsuarioClient<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends UsuarioFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, UsuarioFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__UsuarioClient<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends UsuarioFindFirstArgs>(args?: Prisma.SelectSubset<T, UsuarioFindFirstArgs<ExtArgs>>): Prisma.Prisma__UsuarioClient<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends UsuarioFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, UsuarioFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__UsuarioClient<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends UsuarioFindManyArgs>(args?: Prisma.SelectSubset<T, UsuarioFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends UsuarioCreateArgs>(args: Prisma.SelectSubset<T, UsuarioCreateArgs<ExtArgs>>): Prisma.Prisma__UsuarioClient<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends UsuarioCreateManyArgs>(args?: Prisma.SelectSubset<T, UsuarioCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends UsuarioCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, UsuarioCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends UsuarioDeleteArgs>(args: Prisma.SelectSubset<T, UsuarioDeleteArgs<ExtArgs>>): Prisma.Prisma__UsuarioClient<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends UsuarioUpdateArgs>(args: Prisma.SelectSubset<T, UsuarioUpdateArgs<ExtArgs>>): Prisma.Prisma__UsuarioClient<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends UsuarioDeleteManyArgs>(args?: Prisma.SelectSubset<T, UsuarioDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends UsuarioUpdateManyArgs>(args: Prisma.SelectSubset<T, UsuarioUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends UsuarioUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, UsuarioUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends UsuarioUpsertArgs>(args: Prisma.SelectSubset<T, UsuarioUpsertArgs<ExtArgs>>): Prisma.Prisma__UsuarioClient<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends UsuarioCountArgs>(args?: Prisma.Subset<T, UsuarioCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], UsuarioCountAggregateOutputType> : number>;
    aggregate<T extends UsuarioAggregateArgs>(args: Prisma.Subset<T, UsuarioAggregateArgs>): Prisma.PrismaPromise<GetUsuarioAggregateType<T>>;
    groupBy<T extends UsuarioGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: UsuarioGroupByArgs['orderBy'];
    } : {
        orderBy?: UsuarioGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, UsuarioGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsuarioGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: UsuarioFieldRefs;
}
export interface Prisma__UsuarioClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    empresa<T extends Prisma.EmpresaDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EmpresaDefaultArgs<ExtArgs>>): Prisma.Prisma__EmpresaClient<runtime.Types.Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    auditorias<T extends Prisma.Usuario$auditoriasArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Usuario$auditoriasArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AuditoriaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface UsuarioFieldRefs {
    readonly id: Prisma.FieldRef<"Usuario", 'Int'>;
    readonly empresaId: Prisma.FieldRef<"Usuario", 'Int'>;
    readonly rol: Prisma.FieldRef<"Usuario", 'RolUsuario'>;
    readonly correo: Prisma.FieldRef<"Usuario", 'String'>;
    readonly passwordHash: Prisma.FieldRef<"Usuario", 'String'>;
    readonly estadoCuenta: Prisma.FieldRef<"Usuario", 'EstadoCuenta'>;
    readonly tokenInvitacion: Prisma.FieldRef<"Usuario", 'String'>;
    readonly tokenExpira: Prisma.FieldRef<"Usuario", 'DateTime'>;
    readonly creadoEn: Prisma.FieldRef<"Usuario", 'DateTime'>;
}
export type UsuarioFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelect<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    include?: Prisma.UsuarioInclude<ExtArgs> | null;
    where: Prisma.UsuarioWhereUniqueInput;
};
export type UsuarioFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelect<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    include?: Prisma.UsuarioInclude<ExtArgs> | null;
    where: Prisma.UsuarioWhereUniqueInput;
};
export type UsuarioFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelect<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    include?: Prisma.UsuarioInclude<ExtArgs> | null;
    where?: Prisma.UsuarioWhereInput;
    orderBy?: Prisma.UsuarioOrderByWithRelationInput | Prisma.UsuarioOrderByWithRelationInput[];
    cursor?: Prisma.UsuarioWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UsuarioScalarFieldEnum | Prisma.UsuarioScalarFieldEnum[];
};
export type UsuarioFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelect<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    include?: Prisma.UsuarioInclude<ExtArgs> | null;
    where?: Prisma.UsuarioWhereInput;
    orderBy?: Prisma.UsuarioOrderByWithRelationInput | Prisma.UsuarioOrderByWithRelationInput[];
    cursor?: Prisma.UsuarioWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UsuarioScalarFieldEnum | Prisma.UsuarioScalarFieldEnum[];
};
export type UsuarioFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelect<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    include?: Prisma.UsuarioInclude<ExtArgs> | null;
    where?: Prisma.UsuarioWhereInput;
    orderBy?: Prisma.UsuarioOrderByWithRelationInput | Prisma.UsuarioOrderByWithRelationInput[];
    cursor?: Prisma.UsuarioWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UsuarioScalarFieldEnum | Prisma.UsuarioScalarFieldEnum[];
};
export type UsuarioCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelect<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    include?: Prisma.UsuarioInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UsuarioCreateInput, Prisma.UsuarioUncheckedCreateInput>;
};
export type UsuarioCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.UsuarioCreateManyInput | Prisma.UsuarioCreateManyInput[];
    skipDuplicates?: boolean;
};
export type UsuarioCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    data: Prisma.UsuarioCreateManyInput | Prisma.UsuarioCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.UsuarioIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type UsuarioUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelect<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    include?: Prisma.UsuarioInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UsuarioUpdateInput, Prisma.UsuarioUncheckedUpdateInput>;
    where: Prisma.UsuarioWhereUniqueInput;
};
export type UsuarioUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.UsuarioUpdateManyMutationInput, Prisma.UsuarioUncheckedUpdateManyInput>;
    where?: Prisma.UsuarioWhereInput;
    limit?: number;
};
export type UsuarioUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UsuarioUpdateManyMutationInput, Prisma.UsuarioUncheckedUpdateManyInput>;
    where?: Prisma.UsuarioWhereInput;
    limit?: number;
    include?: Prisma.UsuarioIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type UsuarioUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelect<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    include?: Prisma.UsuarioInclude<ExtArgs> | null;
    where: Prisma.UsuarioWhereUniqueInput;
    create: Prisma.XOR<Prisma.UsuarioCreateInput, Prisma.UsuarioUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.UsuarioUpdateInput, Prisma.UsuarioUncheckedUpdateInput>;
};
export type UsuarioDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelect<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    include?: Prisma.UsuarioInclude<ExtArgs> | null;
    where: Prisma.UsuarioWhereUniqueInput;
};
export type UsuarioDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UsuarioWhereInput;
    limit?: number;
};
export type Usuario$auditoriasArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditoriaSelect<ExtArgs> | null;
    omit?: Prisma.AuditoriaOmit<ExtArgs> | null;
    include?: Prisma.AuditoriaInclude<ExtArgs> | null;
    where?: Prisma.AuditoriaWhereInput;
    orderBy?: Prisma.AuditoriaOrderByWithRelationInput | Prisma.AuditoriaOrderByWithRelationInput[];
    cursor?: Prisma.AuditoriaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AuditoriaScalarFieldEnum | Prisma.AuditoriaScalarFieldEnum[];
};
export type UsuarioDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UsuarioSelect<ExtArgs> | null;
    omit?: Prisma.UsuarioOmit<ExtArgs> | null;
    include?: Prisma.UsuarioInclude<ExtArgs> | null;
};
