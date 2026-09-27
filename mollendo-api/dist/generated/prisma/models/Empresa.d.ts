import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type EmpresaModel = runtime.Types.Result.DefaultSelection<Prisma.$EmpresaPayload>;
export type AggregateEmpresa = {
    _count: EmpresaCountAggregateOutputType | null;
    _avg: EmpresaAvgAggregateOutputType | null;
    _sum: EmpresaSumAggregateOutputType | null;
    _min: EmpresaMinAggregateOutputType | null;
    _max: EmpresaMaxAggregateOutputType | null;
};
export type EmpresaAvgAggregateOutputType = {
    id: number | null;
};
export type EmpresaSumAggregateOutputType = {
    id: number | null;
};
export type EmpresaMinAggregateOutputType = {
    id: number | null;
    ruc: string | null;
    razonSocial: string | null;
    correoContacto: string | null;
    telefonoContacto: string | null;
    estado: $Enums.EstadoEmpresa | null;
    contratoVigenciaInicio: Date | null;
    contratoVigenciaFin: Date | null;
    creadoEn: Date | null;
    actualizadoEn: Date | null;
};
export type EmpresaMaxAggregateOutputType = {
    id: number | null;
    ruc: string | null;
    razonSocial: string | null;
    correoContacto: string | null;
    telefonoContacto: string | null;
    estado: $Enums.EstadoEmpresa | null;
    contratoVigenciaInicio: Date | null;
    contratoVigenciaFin: Date | null;
    creadoEn: Date | null;
    actualizadoEn: Date | null;
};
export type EmpresaCountAggregateOutputType = {
    id: number;
    ruc: number;
    razonSocial: number;
    correoContacto: number;
    telefonoContacto: number;
    estado: number;
    contratoVigenciaInicio: number;
    contratoVigenciaFin: number;
    creadoEn: number;
    actualizadoEn: number;
    _all: number;
};
export type EmpresaAvgAggregateInputType = {
    id?: true;
};
export type EmpresaSumAggregateInputType = {
    id?: true;
};
export type EmpresaMinAggregateInputType = {
    id?: true;
    ruc?: true;
    razonSocial?: true;
    correoContacto?: true;
    telefonoContacto?: true;
    estado?: true;
    contratoVigenciaInicio?: true;
    contratoVigenciaFin?: true;
    creadoEn?: true;
    actualizadoEn?: true;
};
export type EmpresaMaxAggregateInputType = {
    id?: true;
    ruc?: true;
    razonSocial?: true;
    correoContacto?: true;
    telefonoContacto?: true;
    estado?: true;
    contratoVigenciaInicio?: true;
    contratoVigenciaFin?: true;
    creadoEn?: true;
    actualizadoEn?: true;
};
export type EmpresaCountAggregateInputType = {
    id?: true;
    ruc?: true;
    razonSocial?: true;
    correoContacto?: true;
    telefonoContacto?: true;
    estado?: true;
    contratoVigenciaInicio?: true;
    contratoVigenciaFin?: true;
    creadoEn?: true;
    actualizadoEn?: true;
    _all?: true;
};
export type EmpresaAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EmpresaWhereInput;
    orderBy?: Prisma.EmpresaOrderByWithRelationInput | Prisma.EmpresaOrderByWithRelationInput[];
    cursor?: Prisma.EmpresaWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | EmpresaCountAggregateInputType;
    _avg?: EmpresaAvgAggregateInputType;
    _sum?: EmpresaSumAggregateInputType;
    _min?: EmpresaMinAggregateInputType;
    _max?: EmpresaMaxAggregateInputType;
};
export type GetEmpresaAggregateType<T extends EmpresaAggregateArgs> = {
    [P in keyof T & keyof AggregateEmpresa]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateEmpresa[P]> : Prisma.GetScalarType<T[P], AggregateEmpresa[P]>;
};
export type EmpresaGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EmpresaWhereInput;
    orderBy?: Prisma.EmpresaOrderByWithAggregationInput | Prisma.EmpresaOrderByWithAggregationInput[];
    by: Prisma.EmpresaScalarFieldEnum[] | Prisma.EmpresaScalarFieldEnum;
    having?: Prisma.EmpresaScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: EmpresaCountAggregateInputType | true;
    _avg?: EmpresaAvgAggregateInputType;
    _sum?: EmpresaSumAggregateInputType;
    _min?: EmpresaMinAggregateInputType;
    _max?: EmpresaMaxAggregateInputType;
};
export type EmpresaGroupByOutputType = {
    id: number;
    ruc: string;
    razonSocial: string;
    correoContacto: string;
    telefonoContacto: string | null;
    estado: $Enums.EstadoEmpresa;
    contratoVigenciaInicio: Date | null;
    contratoVigenciaFin: Date | null;
    creadoEn: Date;
    actualizadoEn: Date;
    _count: EmpresaCountAggregateOutputType | null;
    _avg: EmpresaAvgAggregateOutputType | null;
    _sum: EmpresaSumAggregateOutputType | null;
    _min: EmpresaMinAggregateOutputType | null;
    _max: EmpresaMaxAggregateOutputType | null;
};
export type GetEmpresaGroupByPayload<T extends EmpresaGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<EmpresaGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof EmpresaGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], EmpresaGroupByOutputType[P]> : Prisma.GetScalarType<T[P], EmpresaGroupByOutputType[P]>;
}>>;
export type EmpresaWhereInput = {
    AND?: Prisma.EmpresaWhereInput | Prisma.EmpresaWhereInput[];
    OR?: Prisma.EmpresaWhereInput[];
    NOT?: Prisma.EmpresaWhereInput | Prisma.EmpresaWhereInput[];
    id?: Prisma.IntFilter<"Empresa"> | number;
    ruc?: Prisma.StringFilter<"Empresa"> | string;
    razonSocial?: Prisma.StringFilter<"Empresa"> | string;
    correoContacto?: Prisma.StringFilter<"Empresa"> | string;
    telefonoContacto?: Prisma.StringNullableFilter<"Empresa"> | string | null;
    estado?: Prisma.EnumEstadoEmpresaFilter<"Empresa"> | $Enums.EstadoEmpresa;
    contratoVigenciaInicio?: Prisma.DateTimeNullableFilter<"Empresa"> | Date | string | null;
    contratoVigenciaFin?: Prisma.DateTimeNullableFilter<"Empresa"> | Date | string | null;
    creadoEn?: Prisma.DateTimeFilter<"Empresa"> | Date | string;
    actualizadoEn?: Prisma.DateTimeFilter<"Empresa"> | Date | string;
    usuarios?: Prisma.UsuarioListRelationFilter;
    personas?: Prisma.PersonaListRelationFilter;
};
export type EmpresaOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    ruc?: Prisma.SortOrder;
    razonSocial?: Prisma.SortOrder;
    correoContacto?: Prisma.SortOrder;
    telefonoContacto?: Prisma.SortOrderInput | Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    contratoVigenciaInicio?: Prisma.SortOrderInput | Prisma.SortOrder;
    contratoVigenciaFin?: Prisma.SortOrderInput | Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
    actualizadoEn?: Prisma.SortOrder;
    usuarios?: Prisma.UsuarioOrderByRelationAggregateInput;
    personas?: Prisma.PersonaOrderByRelationAggregateInput;
};
export type EmpresaWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    ruc?: string;
    AND?: Prisma.EmpresaWhereInput | Prisma.EmpresaWhereInput[];
    OR?: Prisma.EmpresaWhereInput[];
    NOT?: Prisma.EmpresaWhereInput | Prisma.EmpresaWhereInput[];
    razonSocial?: Prisma.StringFilter<"Empresa"> | string;
    correoContacto?: Prisma.StringFilter<"Empresa"> | string;
    telefonoContacto?: Prisma.StringNullableFilter<"Empresa"> | string | null;
    estado?: Prisma.EnumEstadoEmpresaFilter<"Empresa"> | $Enums.EstadoEmpresa;
    contratoVigenciaInicio?: Prisma.DateTimeNullableFilter<"Empresa"> | Date | string | null;
    contratoVigenciaFin?: Prisma.DateTimeNullableFilter<"Empresa"> | Date | string | null;
    creadoEn?: Prisma.DateTimeFilter<"Empresa"> | Date | string;
    actualizadoEn?: Prisma.DateTimeFilter<"Empresa"> | Date | string;
    usuarios?: Prisma.UsuarioListRelationFilter;
    personas?: Prisma.PersonaListRelationFilter;
}, "id" | "ruc">;
export type EmpresaOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    ruc?: Prisma.SortOrder;
    razonSocial?: Prisma.SortOrder;
    correoContacto?: Prisma.SortOrder;
    telefonoContacto?: Prisma.SortOrderInput | Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    contratoVigenciaInicio?: Prisma.SortOrderInput | Prisma.SortOrder;
    contratoVigenciaFin?: Prisma.SortOrderInput | Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
    actualizadoEn?: Prisma.SortOrder;
    _count?: Prisma.EmpresaCountOrderByAggregateInput;
    _avg?: Prisma.EmpresaAvgOrderByAggregateInput;
    _max?: Prisma.EmpresaMaxOrderByAggregateInput;
    _min?: Prisma.EmpresaMinOrderByAggregateInput;
    _sum?: Prisma.EmpresaSumOrderByAggregateInput;
};
export type EmpresaScalarWhereWithAggregatesInput = {
    AND?: Prisma.EmpresaScalarWhereWithAggregatesInput | Prisma.EmpresaScalarWhereWithAggregatesInput[];
    OR?: Prisma.EmpresaScalarWhereWithAggregatesInput[];
    NOT?: Prisma.EmpresaScalarWhereWithAggregatesInput | Prisma.EmpresaScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Empresa"> | number;
    ruc?: Prisma.StringWithAggregatesFilter<"Empresa"> | string;
    razonSocial?: Prisma.StringWithAggregatesFilter<"Empresa"> | string;
    correoContacto?: Prisma.StringWithAggregatesFilter<"Empresa"> | string;
    telefonoContacto?: Prisma.StringNullableWithAggregatesFilter<"Empresa"> | string | null;
    estado?: Prisma.EnumEstadoEmpresaWithAggregatesFilter<"Empresa"> | $Enums.EstadoEmpresa;
    contratoVigenciaInicio?: Prisma.DateTimeNullableWithAggregatesFilter<"Empresa"> | Date | string | null;
    contratoVigenciaFin?: Prisma.DateTimeNullableWithAggregatesFilter<"Empresa"> | Date | string | null;
    creadoEn?: Prisma.DateTimeWithAggregatesFilter<"Empresa"> | Date | string;
    actualizadoEn?: Prisma.DateTimeWithAggregatesFilter<"Empresa"> | Date | string;
};
export type EmpresaCreateInput = {
    ruc: string;
    razonSocial: string;
    correoContacto: string;
    telefonoContacto?: string | null;
    estado?: $Enums.EstadoEmpresa;
    contratoVigenciaInicio?: Date | string | null;
    contratoVigenciaFin?: Date | string | null;
    creadoEn?: Date | string;
    actualizadoEn?: Date | string;
    usuarios?: Prisma.UsuarioCreateNestedManyWithoutEmpresaInput;
    personas?: Prisma.PersonaCreateNestedManyWithoutEmpresaInput;
};
export type EmpresaUncheckedCreateInput = {
    id?: number;
    ruc: string;
    razonSocial: string;
    correoContacto: string;
    telefonoContacto?: string | null;
    estado?: $Enums.EstadoEmpresa;
    contratoVigenciaInicio?: Date | string | null;
    contratoVigenciaFin?: Date | string | null;
    creadoEn?: Date | string;
    actualizadoEn?: Date | string;
    usuarios?: Prisma.UsuarioUncheckedCreateNestedManyWithoutEmpresaInput;
    personas?: Prisma.PersonaUncheckedCreateNestedManyWithoutEmpresaInput;
};
export type EmpresaUpdateInput = {
    ruc?: Prisma.StringFieldUpdateOperationsInput | string;
    razonSocial?: Prisma.StringFieldUpdateOperationsInput | string;
    correoContacto?: Prisma.StringFieldUpdateOperationsInput | string;
    telefonoContacto?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoEmpresaFieldUpdateOperationsInput | $Enums.EstadoEmpresa;
    contratoVigenciaInicio?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    contratoVigenciaFin?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    actualizadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    usuarios?: Prisma.UsuarioUpdateManyWithoutEmpresaNestedInput;
    personas?: Prisma.PersonaUpdateManyWithoutEmpresaNestedInput;
};
export type EmpresaUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    ruc?: Prisma.StringFieldUpdateOperationsInput | string;
    razonSocial?: Prisma.StringFieldUpdateOperationsInput | string;
    correoContacto?: Prisma.StringFieldUpdateOperationsInput | string;
    telefonoContacto?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoEmpresaFieldUpdateOperationsInput | $Enums.EstadoEmpresa;
    contratoVigenciaInicio?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    contratoVigenciaFin?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    actualizadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    usuarios?: Prisma.UsuarioUncheckedUpdateManyWithoutEmpresaNestedInput;
    personas?: Prisma.PersonaUncheckedUpdateManyWithoutEmpresaNestedInput;
};
export type EmpresaCreateManyInput = {
    id?: number;
    ruc: string;
    razonSocial: string;
    correoContacto: string;
    telefonoContacto?: string | null;
    estado?: $Enums.EstadoEmpresa;
    contratoVigenciaInicio?: Date | string | null;
    contratoVigenciaFin?: Date | string | null;
    creadoEn?: Date | string;
    actualizadoEn?: Date | string;
};
export type EmpresaUpdateManyMutationInput = {
    ruc?: Prisma.StringFieldUpdateOperationsInput | string;
    razonSocial?: Prisma.StringFieldUpdateOperationsInput | string;
    correoContacto?: Prisma.StringFieldUpdateOperationsInput | string;
    telefonoContacto?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoEmpresaFieldUpdateOperationsInput | $Enums.EstadoEmpresa;
    contratoVigenciaInicio?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    contratoVigenciaFin?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    actualizadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EmpresaUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    ruc?: Prisma.StringFieldUpdateOperationsInput | string;
    razonSocial?: Prisma.StringFieldUpdateOperationsInput | string;
    correoContacto?: Prisma.StringFieldUpdateOperationsInput | string;
    telefonoContacto?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoEmpresaFieldUpdateOperationsInput | $Enums.EstadoEmpresa;
    contratoVigenciaInicio?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    contratoVigenciaFin?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    actualizadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EmpresaCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    ruc?: Prisma.SortOrder;
    razonSocial?: Prisma.SortOrder;
    correoContacto?: Prisma.SortOrder;
    telefonoContacto?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    contratoVigenciaInicio?: Prisma.SortOrder;
    contratoVigenciaFin?: Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
    actualizadoEn?: Prisma.SortOrder;
};
export type EmpresaAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type EmpresaMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    ruc?: Prisma.SortOrder;
    razonSocial?: Prisma.SortOrder;
    correoContacto?: Prisma.SortOrder;
    telefonoContacto?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    contratoVigenciaInicio?: Prisma.SortOrder;
    contratoVigenciaFin?: Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
    actualizadoEn?: Prisma.SortOrder;
};
export type EmpresaMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    ruc?: Prisma.SortOrder;
    razonSocial?: Prisma.SortOrder;
    correoContacto?: Prisma.SortOrder;
    telefonoContacto?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    contratoVigenciaInicio?: Prisma.SortOrder;
    contratoVigenciaFin?: Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
    actualizadoEn?: Prisma.SortOrder;
};
export type EmpresaSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type EmpresaScalarRelationFilter = {
    is?: Prisma.EmpresaWhereInput;
    isNot?: Prisma.EmpresaWhereInput;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
};
export type EnumEstadoEmpresaFieldUpdateOperationsInput = {
    set?: $Enums.EstadoEmpresa;
};
export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type EmpresaCreateNestedOneWithoutUsuariosInput = {
    create?: Prisma.XOR<Prisma.EmpresaCreateWithoutUsuariosInput, Prisma.EmpresaUncheckedCreateWithoutUsuariosInput>;
    connectOrCreate?: Prisma.EmpresaCreateOrConnectWithoutUsuariosInput;
    connect?: Prisma.EmpresaWhereUniqueInput;
};
export type EmpresaUpdateOneRequiredWithoutUsuariosNestedInput = {
    create?: Prisma.XOR<Prisma.EmpresaCreateWithoutUsuariosInput, Prisma.EmpresaUncheckedCreateWithoutUsuariosInput>;
    connectOrCreate?: Prisma.EmpresaCreateOrConnectWithoutUsuariosInput;
    upsert?: Prisma.EmpresaUpsertWithoutUsuariosInput;
    connect?: Prisma.EmpresaWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.EmpresaUpdateToOneWithWhereWithoutUsuariosInput, Prisma.EmpresaUpdateWithoutUsuariosInput>, Prisma.EmpresaUncheckedUpdateWithoutUsuariosInput>;
};
export type EmpresaCreateNestedOneWithoutPersonasInput = {
    create?: Prisma.XOR<Prisma.EmpresaCreateWithoutPersonasInput, Prisma.EmpresaUncheckedCreateWithoutPersonasInput>;
    connectOrCreate?: Prisma.EmpresaCreateOrConnectWithoutPersonasInput;
    connect?: Prisma.EmpresaWhereUniqueInput;
};
export type EmpresaUpdateOneRequiredWithoutPersonasNestedInput = {
    create?: Prisma.XOR<Prisma.EmpresaCreateWithoutPersonasInput, Prisma.EmpresaUncheckedCreateWithoutPersonasInput>;
    connectOrCreate?: Prisma.EmpresaCreateOrConnectWithoutPersonasInput;
    upsert?: Prisma.EmpresaUpsertWithoutPersonasInput;
    connect?: Prisma.EmpresaWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.EmpresaUpdateToOneWithWhereWithoutPersonasInput, Prisma.EmpresaUpdateWithoutPersonasInput>, Prisma.EmpresaUncheckedUpdateWithoutPersonasInput>;
};
export type EmpresaCreateWithoutUsuariosInput = {
    ruc: string;
    razonSocial: string;
    correoContacto: string;
    telefonoContacto?: string | null;
    estado?: $Enums.EstadoEmpresa;
    contratoVigenciaInicio?: Date | string | null;
    contratoVigenciaFin?: Date | string | null;
    creadoEn?: Date | string;
    actualizadoEn?: Date | string;
    personas?: Prisma.PersonaCreateNestedManyWithoutEmpresaInput;
};
export type EmpresaUncheckedCreateWithoutUsuariosInput = {
    id?: number;
    ruc: string;
    razonSocial: string;
    correoContacto: string;
    telefonoContacto?: string | null;
    estado?: $Enums.EstadoEmpresa;
    contratoVigenciaInicio?: Date | string | null;
    contratoVigenciaFin?: Date | string | null;
    creadoEn?: Date | string;
    actualizadoEn?: Date | string;
    personas?: Prisma.PersonaUncheckedCreateNestedManyWithoutEmpresaInput;
};
export type EmpresaCreateOrConnectWithoutUsuariosInput = {
    where: Prisma.EmpresaWhereUniqueInput;
    create: Prisma.XOR<Prisma.EmpresaCreateWithoutUsuariosInput, Prisma.EmpresaUncheckedCreateWithoutUsuariosInput>;
};
export type EmpresaUpsertWithoutUsuariosInput = {
    update: Prisma.XOR<Prisma.EmpresaUpdateWithoutUsuariosInput, Prisma.EmpresaUncheckedUpdateWithoutUsuariosInput>;
    create: Prisma.XOR<Prisma.EmpresaCreateWithoutUsuariosInput, Prisma.EmpresaUncheckedCreateWithoutUsuariosInput>;
    where?: Prisma.EmpresaWhereInput;
};
export type EmpresaUpdateToOneWithWhereWithoutUsuariosInput = {
    where?: Prisma.EmpresaWhereInput;
    data: Prisma.XOR<Prisma.EmpresaUpdateWithoutUsuariosInput, Prisma.EmpresaUncheckedUpdateWithoutUsuariosInput>;
};
export type EmpresaUpdateWithoutUsuariosInput = {
    ruc?: Prisma.StringFieldUpdateOperationsInput | string;
    razonSocial?: Prisma.StringFieldUpdateOperationsInput | string;
    correoContacto?: Prisma.StringFieldUpdateOperationsInput | string;
    telefonoContacto?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoEmpresaFieldUpdateOperationsInput | $Enums.EstadoEmpresa;
    contratoVigenciaInicio?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    contratoVigenciaFin?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    actualizadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    personas?: Prisma.PersonaUpdateManyWithoutEmpresaNestedInput;
};
export type EmpresaUncheckedUpdateWithoutUsuariosInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    ruc?: Prisma.StringFieldUpdateOperationsInput | string;
    razonSocial?: Prisma.StringFieldUpdateOperationsInput | string;
    correoContacto?: Prisma.StringFieldUpdateOperationsInput | string;
    telefonoContacto?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoEmpresaFieldUpdateOperationsInput | $Enums.EstadoEmpresa;
    contratoVigenciaInicio?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    contratoVigenciaFin?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    actualizadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    personas?: Prisma.PersonaUncheckedUpdateManyWithoutEmpresaNestedInput;
};
export type EmpresaCreateWithoutPersonasInput = {
    ruc: string;
    razonSocial: string;
    correoContacto: string;
    telefonoContacto?: string | null;
    estado?: $Enums.EstadoEmpresa;
    contratoVigenciaInicio?: Date | string | null;
    contratoVigenciaFin?: Date | string | null;
    creadoEn?: Date | string;
    actualizadoEn?: Date | string;
    usuarios?: Prisma.UsuarioCreateNestedManyWithoutEmpresaInput;
};
export type EmpresaUncheckedCreateWithoutPersonasInput = {
    id?: number;
    ruc: string;
    razonSocial: string;
    correoContacto: string;
    telefonoContacto?: string | null;
    estado?: $Enums.EstadoEmpresa;
    contratoVigenciaInicio?: Date | string | null;
    contratoVigenciaFin?: Date | string | null;
    creadoEn?: Date | string;
    actualizadoEn?: Date | string;
    usuarios?: Prisma.UsuarioUncheckedCreateNestedManyWithoutEmpresaInput;
};
export type EmpresaCreateOrConnectWithoutPersonasInput = {
    where: Prisma.EmpresaWhereUniqueInput;
    create: Prisma.XOR<Prisma.EmpresaCreateWithoutPersonasInput, Prisma.EmpresaUncheckedCreateWithoutPersonasInput>;
};
export type EmpresaUpsertWithoutPersonasInput = {
    update: Prisma.XOR<Prisma.EmpresaUpdateWithoutPersonasInput, Prisma.EmpresaUncheckedUpdateWithoutPersonasInput>;
    create: Prisma.XOR<Prisma.EmpresaCreateWithoutPersonasInput, Prisma.EmpresaUncheckedCreateWithoutPersonasInput>;
    where?: Prisma.EmpresaWhereInput;
};
export type EmpresaUpdateToOneWithWhereWithoutPersonasInput = {
    where?: Prisma.EmpresaWhereInput;
    data: Prisma.XOR<Prisma.EmpresaUpdateWithoutPersonasInput, Prisma.EmpresaUncheckedUpdateWithoutPersonasInput>;
};
export type EmpresaUpdateWithoutPersonasInput = {
    ruc?: Prisma.StringFieldUpdateOperationsInput | string;
    razonSocial?: Prisma.StringFieldUpdateOperationsInput | string;
    correoContacto?: Prisma.StringFieldUpdateOperationsInput | string;
    telefonoContacto?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoEmpresaFieldUpdateOperationsInput | $Enums.EstadoEmpresa;
    contratoVigenciaInicio?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    contratoVigenciaFin?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    actualizadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    usuarios?: Prisma.UsuarioUpdateManyWithoutEmpresaNestedInput;
};
export type EmpresaUncheckedUpdateWithoutPersonasInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    ruc?: Prisma.StringFieldUpdateOperationsInput | string;
    razonSocial?: Prisma.StringFieldUpdateOperationsInput | string;
    correoContacto?: Prisma.StringFieldUpdateOperationsInput | string;
    telefonoContacto?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoEmpresaFieldUpdateOperationsInput | $Enums.EstadoEmpresa;
    contratoVigenciaInicio?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    contratoVigenciaFin?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    actualizadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    usuarios?: Prisma.UsuarioUncheckedUpdateManyWithoutEmpresaNestedInput;
};
export type EmpresaCountOutputType = {
    usuarios: number;
    personas: number;
};
export type EmpresaCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    usuarios?: boolean | EmpresaCountOutputTypeCountUsuariosArgs;
    personas?: boolean | EmpresaCountOutputTypeCountPersonasArgs;
};
export type EmpresaCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmpresaCountOutputTypeSelect<ExtArgs> | null;
};
export type EmpresaCountOutputTypeCountUsuariosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UsuarioWhereInput;
};
export type EmpresaCountOutputTypeCountPersonasArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonaWhereInput;
};
export type EmpresaSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    ruc?: boolean;
    razonSocial?: boolean;
    correoContacto?: boolean;
    telefonoContacto?: boolean;
    estado?: boolean;
    contratoVigenciaInicio?: boolean;
    contratoVigenciaFin?: boolean;
    creadoEn?: boolean;
    actualizadoEn?: boolean;
    usuarios?: boolean | Prisma.Empresa$usuariosArgs<ExtArgs>;
    personas?: boolean | Prisma.Empresa$personasArgs<ExtArgs>;
    _count?: boolean | Prisma.EmpresaCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["empresa"]>;
export type EmpresaSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    ruc?: boolean;
    razonSocial?: boolean;
    correoContacto?: boolean;
    telefonoContacto?: boolean;
    estado?: boolean;
    contratoVigenciaInicio?: boolean;
    contratoVigenciaFin?: boolean;
    creadoEn?: boolean;
    actualizadoEn?: boolean;
}, ExtArgs["result"]["empresa"]>;
export type EmpresaSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    ruc?: boolean;
    razonSocial?: boolean;
    correoContacto?: boolean;
    telefonoContacto?: boolean;
    estado?: boolean;
    contratoVigenciaInicio?: boolean;
    contratoVigenciaFin?: boolean;
    creadoEn?: boolean;
    actualizadoEn?: boolean;
}, ExtArgs["result"]["empresa"]>;
export type EmpresaSelectScalar = {
    id?: boolean;
    ruc?: boolean;
    razonSocial?: boolean;
    correoContacto?: boolean;
    telefonoContacto?: boolean;
    estado?: boolean;
    contratoVigenciaInicio?: boolean;
    contratoVigenciaFin?: boolean;
    creadoEn?: boolean;
    actualizadoEn?: boolean;
};
export type EmpresaOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "ruc" | "razonSocial" | "correoContacto" | "telefonoContacto" | "estado" | "contratoVigenciaInicio" | "contratoVigenciaFin" | "creadoEn" | "actualizadoEn", ExtArgs["result"]["empresa"]>;
export type EmpresaInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    usuarios?: boolean | Prisma.Empresa$usuariosArgs<ExtArgs>;
    personas?: boolean | Prisma.Empresa$personasArgs<ExtArgs>;
    _count?: boolean | Prisma.EmpresaCountOutputTypeDefaultArgs<ExtArgs>;
};
export type EmpresaIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type EmpresaIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $EmpresaPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Empresa";
    objects: {
        usuarios: Prisma.$UsuarioPayload<ExtArgs>[];
        personas: Prisma.$PersonaPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        ruc: string;
        razonSocial: string;
        correoContacto: string;
        telefonoContacto: string | null;
        estado: $Enums.EstadoEmpresa;
        contratoVigenciaInicio: Date | null;
        contratoVigenciaFin: Date | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }, ExtArgs["result"]["empresa"]>;
    composites: {};
};
export type EmpresaGetPayload<S extends boolean | null | undefined | EmpresaDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$EmpresaPayload, S>;
export type EmpresaCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<EmpresaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: EmpresaCountAggregateInputType | true;
};
export interface EmpresaDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Empresa'];
        meta: {
            name: 'Empresa';
        };
    };
    findUnique<T extends EmpresaFindUniqueArgs>(args: Prisma.SelectSubset<T, EmpresaFindUniqueArgs<ExtArgs>>): Prisma.Prisma__EmpresaClient<runtime.Types.Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends EmpresaFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, EmpresaFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__EmpresaClient<runtime.Types.Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends EmpresaFindFirstArgs>(args?: Prisma.SelectSubset<T, EmpresaFindFirstArgs<ExtArgs>>): Prisma.Prisma__EmpresaClient<runtime.Types.Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends EmpresaFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, EmpresaFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__EmpresaClient<runtime.Types.Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends EmpresaFindManyArgs>(args?: Prisma.SelectSubset<T, EmpresaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends EmpresaCreateArgs>(args: Prisma.SelectSubset<T, EmpresaCreateArgs<ExtArgs>>): Prisma.Prisma__EmpresaClient<runtime.Types.Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends EmpresaCreateManyArgs>(args?: Prisma.SelectSubset<T, EmpresaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends EmpresaCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, EmpresaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends EmpresaDeleteArgs>(args: Prisma.SelectSubset<T, EmpresaDeleteArgs<ExtArgs>>): Prisma.Prisma__EmpresaClient<runtime.Types.Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends EmpresaUpdateArgs>(args: Prisma.SelectSubset<T, EmpresaUpdateArgs<ExtArgs>>): Prisma.Prisma__EmpresaClient<runtime.Types.Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends EmpresaDeleteManyArgs>(args?: Prisma.SelectSubset<T, EmpresaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends EmpresaUpdateManyArgs>(args: Prisma.SelectSubset<T, EmpresaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends EmpresaUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, EmpresaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends EmpresaUpsertArgs>(args: Prisma.SelectSubset<T, EmpresaUpsertArgs<ExtArgs>>): Prisma.Prisma__EmpresaClient<runtime.Types.Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends EmpresaCountArgs>(args?: Prisma.Subset<T, EmpresaCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], EmpresaCountAggregateOutputType> : number>;
    aggregate<T extends EmpresaAggregateArgs>(args: Prisma.Subset<T, EmpresaAggregateArgs>): Prisma.PrismaPromise<GetEmpresaAggregateType<T>>;
    groupBy<T extends EmpresaGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: EmpresaGroupByArgs['orderBy'];
    } : {
        orderBy?: EmpresaGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, EmpresaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmpresaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: EmpresaFieldRefs;
}
export interface Prisma__EmpresaClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    usuarios<T extends Prisma.Empresa$usuariosArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Empresa$usuariosArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    personas<T extends Prisma.Empresa$personasArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Empresa$personasArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface EmpresaFieldRefs {
    readonly id: Prisma.FieldRef<"Empresa", 'Int'>;
    readonly ruc: Prisma.FieldRef<"Empresa", 'String'>;
    readonly razonSocial: Prisma.FieldRef<"Empresa", 'String'>;
    readonly correoContacto: Prisma.FieldRef<"Empresa", 'String'>;
    readonly telefonoContacto: Prisma.FieldRef<"Empresa", 'String'>;
    readonly estado: Prisma.FieldRef<"Empresa", 'EstadoEmpresa'>;
    readonly contratoVigenciaInicio: Prisma.FieldRef<"Empresa", 'DateTime'>;
    readonly contratoVigenciaFin: Prisma.FieldRef<"Empresa", 'DateTime'>;
    readonly creadoEn: Prisma.FieldRef<"Empresa", 'DateTime'>;
    readonly actualizadoEn: Prisma.FieldRef<"Empresa", 'DateTime'>;
}
export type EmpresaFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmpresaSelect<ExtArgs> | null;
    omit?: Prisma.EmpresaOmit<ExtArgs> | null;
    include?: Prisma.EmpresaInclude<ExtArgs> | null;
    where: Prisma.EmpresaWhereUniqueInput;
};
export type EmpresaFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmpresaSelect<ExtArgs> | null;
    omit?: Prisma.EmpresaOmit<ExtArgs> | null;
    include?: Prisma.EmpresaInclude<ExtArgs> | null;
    where: Prisma.EmpresaWhereUniqueInput;
};
export type EmpresaFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmpresaSelect<ExtArgs> | null;
    omit?: Prisma.EmpresaOmit<ExtArgs> | null;
    include?: Prisma.EmpresaInclude<ExtArgs> | null;
    where?: Prisma.EmpresaWhereInput;
    orderBy?: Prisma.EmpresaOrderByWithRelationInput | Prisma.EmpresaOrderByWithRelationInput[];
    cursor?: Prisma.EmpresaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EmpresaScalarFieldEnum | Prisma.EmpresaScalarFieldEnum[];
};
export type EmpresaFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmpresaSelect<ExtArgs> | null;
    omit?: Prisma.EmpresaOmit<ExtArgs> | null;
    include?: Prisma.EmpresaInclude<ExtArgs> | null;
    where?: Prisma.EmpresaWhereInput;
    orderBy?: Prisma.EmpresaOrderByWithRelationInput | Prisma.EmpresaOrderByWithRelationInput[];
    cursor?: Prisma.EmpresaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EmpresaScalarFieldEnum | Prisma.EmpresaScalarFieldEnum[];
};
export type EmpresaFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmpresaSelect<ExtArgs> | null;
    omit?: Prisma.EmpresaOmit<ExtArgs> | null;
    include?: Prisma.EmpresaInclude<ExtArgs> | null;
    where?: Prisma.EmpresaWhereInput;
    orderBy?: Prisma.EmpresaOrderByWithRelationInput | Prisma.EmpresaOrderByWithRelationInput[];
    cursor?: Prisma.EmpresaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EmpresaScalarFieldEnum | Prisma.EmpresaScalarFieldEnum[];
};
export type EmpresaCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmpresaSelect<ExtArgs> | null;
    omit?: Prisma.EmpresaOmit<ExtArgs> | null;
    include?: Prisma.EmpresaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EmpresaCreateInput, Prisma.EmpresaUncheckedCreateInput>;
};
export type EmpresaCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.EmpresaCreateManyInput | Prisma.EmpresaCreateManyInput[];
    skipDuplicates?: boolean;
};
export type EmpresaCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmpresaSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.EmpresaOmit<ExtArgs> | null;
    data: Prisma.EmpresaCreateManyInput | Prisma.EmpresaCreateManyInput[];
    skipDuplicates?: boolean;
};
export type EmpresaUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmpresaSelect<ExtArgs> | null;
    omit?: Prisma.EmpresaOmit<ExtArgs> | null;
    include?: Prisma.EmpresaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EmpresaUpdateInput, Prisma.EmpresaUncheckedUpdateInput>;
    where: Prisma.EmpresaWhereUniqueInput;
};
export type EmpresaUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.EmpresaUpdateManyMutationInput, Prisma.EmpresaUncheckedUpdateManyInput>;
    where?: Prisma.EmpresaWhereInput;
    limit?: number;
};
export type EmpresaUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmpresaSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.EmpresaOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EmpresaUpdateManyMutationInput, Prisma.EmpresaUncheckedUpdateManyInput>;
    where?: Prisma.EmpresaWhereInput;
    limit?: number;
};
export type EmpresaUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmpresaSelect<ExtArgs> | null;
    omit?: Prisma.EmpresaOmit<ExtArgs> | null;
    include?: Prisma.EmpresaInclude<ExtArgs> | null;
    where: Prisma.EmpresaWhereUniqueInput;
    create: Prisma.XOR<Prisma.EmpresaCreateInput, Prisma.EmpresaUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.EmpresaUpdateInput, Prisma.EmpresaUncheckedUpdateInput>;
};
export type EmpresaDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmpresaSelect<ExtArgs> | null;
    omit?: Prisma.EmpresaOmit<ExtArgs> | null;
    include?: Prisma.EmpresaInclude<ExtArgs> | null;
    where: Prisma.EmpresaWhereUniqueInput;
};
export type EmpresaDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EmpresaWhereInput;
    limit?: number;
};
export type Empresa$usuariosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Empresa$personasArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonaSelect<ExtArgs> | null;
    omit?: Prisma.PersonaOmit<ExtArgs> | null;
    include?: Prisma.PersonaInclude<ExtArgs> | null;
    where?: Prisma.PersonaWhereInput;
    orderBy?: Prisma.PersonaOrderByWithRelationInput | Prisma.PersonaOrderByWithRelationInput[];
    cursor?: Prisma.PersonaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PersonaScalarFieldEnum | Prisma.PersonaScalarFieldEnum[];
};
export type EmpresaDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmpresaSelect<ExtArgs> | null;
    omit?: Prisma.EmpresaOmit<ExtArgs> | null;
    include?: Prisma.EmpresaInclude<ExtArgs> | null;
};
