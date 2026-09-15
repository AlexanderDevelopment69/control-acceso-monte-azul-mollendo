import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type RequisitoPorPuestoModel = runtime.Types.Result.DefaultSelection<Prisma.$RequisitoPorPuestoPayload>;
export type AggregateRequisitoPorPuesto = {
    _count: RequisitoPorPuestoCountAggregateOutputType | null;
    _avg: RequisitoPorPuestoAvgAggregateOutputType | null;
    _sum: RequisitoPorPuestoSumAggregateOutputType | null;
    _min: RequisitoPorPuestoMinAggregateOutputType | null;
    _max: RequisitoPorPuestoMaxAggregateOutputType | null;
};
export type RequisitoPorPuestoAvgAggregateOutputType = {
    puestoId: number | null;
    tipoDocumentoId: number | null;
};
export type RequisitoPorPuestoSumAggregateOutputType = {
    puestoId: number | null;
    tipoDocumentoId: number | null;
};
export type RequisitoPorPuestoMinAggregateOutputType = {
    puestoId: number | null;
    tipoDocumentoId: number | null;
    obligatorio: boolean | null;
};
export type RequisitoPorPuestoMaxAggregateOutputType = {
    puestoId: number | null;
    tipoDocumentoId: number | null;
    obligatorio: boolean | null;
};
export type RequisitoPorPuestoCountAggregateOutputType = {
    puestoId: number;
    tipoDocumentoId: number;
    obligatorio: number;
    _all: number;
};
export type RequisitoPorPuestoAvgAggregateInputType = {
    puestoId?: true;
    tipoDocumentoId?: true;
};
export type RequisitoPorPuestoSumAggregateInputType = {
    puestoId?: true;
    tipoDocumentoId?: true;
};
export type RequisitoPorPuestoMinAggregateInputType = {
    puestoId?: true;
    tipoDocumentoId?: true;
    obligatorio?: true;
};
export type RequisitoPorPuestoMaxAggregateInputType = {
    puestoId?: true;
    tipoDocumentoId?: true;
    obligatorio?: true;
};
export type RequisitoPorPuestoCountAggregateInputType = {
    puestoId?: true;
    tipoDocumentoId?: true;
    obligatorio?: true;
    _all?: true;
};
export type RequisitoPorPuestoAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RequisitoPorPuestoWhereInput;
    orderBy?: Prisma.RequisitoPorPuestoOrderByWithRelationInput | Prisma.RequisitoPorPuestoOrderByWithRelationInput[];
    cursor?: Prisma.RequisitoPorPuestoWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | RequisitoPorPuestoCountAggregateInputType;
    _avg?: RequisitoPorPuestoAvgAggregateInputType;
    _sum?: RequisitoPorPuestoSumAggregateInputType;
    _min?: RequisitoPorPuestoMinAggregateInputType;
    _max?: RequisitoPorPuestoMaxAggregateInputType;
};
export type GetRequisitoPorPuestoAggregateType<T extends RequisitoPorPuestoAggregateArgs> = {
    [P in keyof T & keyof AggregateRequisitoPorPuesto]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateRequisitoPorPuesto[P]> : Prisma.GetScalarType<T[P], AggregateRequisitoPorPuesto[P]>;
};
export type RequisitoPorPuestoGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RequisitoPorPuestoWhereInput;
    orderBy?: Prisma.RequisitoPorPuestoOrderByWithAggregationInput | Prisma.RequisitoPorPuestoOrderByWithAggregationInput[];
    by: Prisma.RequisitoPorPuestoScalarFieldEnum[] | Prisma.RequisitoPorPuestoScalarFieldEnum;
    having?: Prisma.RequisitoPorPuestoScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: RequisitoPorPuestoCountAggregateInputType | true;
    _avg?: RequisitoPorPuestoAvgAggregateInputType;
    _sum?: RequisitoPorPuestoSumAggregateInputType;
    _min?: RequisitoPorPuestoMinAggregateInputType;
    _max?: RequisitoPorPuestoMaxAggregateInputType;
};
export type RequisitoPorPuestoGroupByOutputType = {
    puestoId: number;
    tipoDocumentoId: number;
    obligatorio: boolean;
    _count: RequisitoPorPuestoCountAggregateOutputType | null;
    _avg: RequisitoPorPuestoAvgAggregateOutputType | null;
    _sum: RequisitoPorPuestoSumAggregateOutputType | null;
    _min: RequisitoPorPuestoMinAggregateOutputType | null;
    _max: RequisitoPorPuestoMaxAggregateOutputType | null;
};
export type GetRequisitoPorPuestoGroupByPayload<T extends RequisitoPorPuestoGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<RequisitoPorPuestoGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof RequisitoPorPuestoGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], RequisitoPorPuestoGroupByOutputType[P]> : Prisma.GetScalarType<T[P], RequisitoPorPuestoGroupByOutputType[P]>;
}>>;
export type RequisitoPorPuestoWhereInput = {
    AND?: Prisma.RequisitoPorPuestoWhereInput | Prisma.RequisitoPorPuestoWhereInput[];
    OR?: Prisma.RequisitoPorPuestoWhereInput[];
    NOT?: Prisma.RequisitoPorPuestoWhereInput | Prisma.RequisitoPorPuestoWhereInput[];
    puestoId?: Prisma.IntFilter<"RequisitoPorPuesto"> | number;
    tipoDocumentoId?: Prisma.IntFilter<"RequisitoPorPuesto"> | number;
    obligatorio?: Prisma.BoolFilter<"RequisitoPorPuesto"> | boolean;
    puesto?: Prisma.XOR<Prisma.PuestoScalarRelationFilter, Prisma.PuestoWhereInput>;
    tipoDocumento?: Prisma.XOR<Prisma.TipoDocumentoScalarRelationFilter, Prisma.TipoDocumentoWhereInput>;
};
export type RequisitoPorPuestoOrderByWithRelationInput = {
    puestoId?: Prisma.SortOrder;
    tipoDocumentoId?: Prisma.SortOrder;
    obligatorio?: Prisma.SortOrder;
    puesto?: Prisma.PuestoOrderByWithRelationInput;
    tipoDocumento?: Prisma.TipoDocumentoOrderByWithRelationInput;
};
export type RequisitoPorPuestoWhereUniqueInput = Prisma.AtLeast<{
    puestoId_tipoDocumentoId?: Prisma.RequisitoPorPuestoPuestoIdTipoDocumentoIdCompoundUniqueInput;
    AND?: Prisma.RequisitoPorPuestoWhereInput | Prisma.RequisitoPorPuestoWhereInput[];
    OR?: Prisma.RequisitoPorPuestoWhereInput[];
    NOT?: Prisma.RequisitoPorPuestoWhereInput | Prisma.RequisitoPorPuestoWhereInput[];
    puestoId?: Prisma.IntFilter<"RequisitoPorPuesto"> | number;
    tipoDocumentoId?: Prisma.IntFilter<"RequisitoPorPuesto"> | number;
    obligatorio?: Prisma.BoolFilter<"RequisitoPorPuesto"> | boolean;
    puesto?: Prisma.XOR<Prisma.PuestoScalarRelationFilter, Prisma.PuestoWhereInput>;
    tipoDocumento?: Prisma.XOR<Prisma.TipoDocumentoScalarRelationFilter, Prisma.TipoDocumentoWhereInput>;
}, "puestoId_tipoDocumentoId">;
export type RequisitoPorPuestoOrderByWithAggregationInput = {
    puestoId?: Prisma.SortOrder;
    tipoDocumentoId?: Prisma.SortOrder;
    obligatorio?: Prisma.SortOrder;
    _count?: Prisma.RequisitoPorPuestoCountOrderByAggregateInput;
    _avg?: Prisma.RequisitoPorPuestoAvgOrderByAggregateInput;
    _max?: Prisma.RequisitoPorPuestoMaxOrderByAggregateInput;
    _min?: Prisma.RequisitoPorPuestoMinOrderByAggregateInput;
    _sum?: Prisma.RequisitoPorPuestoSumOrderByAggregateInput;
};
export type RequisitoPorPuestoScalarWhereWithAggregatesInput = {
    AND?: Prisma.RequisitoPorPuestoScalarWhereWithAggregatesInput | Prisma.RequisitoPorPuestoScalarWhereWithAggregatesInput[];
    OR?: Prisma.RequisitoPorPuestoScalarWhereWithAggregatesInput[];
    NOT?: Prisma.RequisitoPorPuestoScalarWhereWithAggregatesInput | Prisma.RequisitoPorPuestoScalarWhereWithAggregatesInput[];
    puestoId?: Prisma.IntWithAggregatesFilter<"RequisitoPorPuesto"> | number;
    tipoDocumentoId?: Prisma.IntWithAggregatesFilter<"RequisitoPorPuesto"> | number;
    obligatorio?: Prisma.BoolWithAggregatesFilter<"RequisitoPorPuesto"> | boolean;
};
export type RequisitoPorPuestoCreateInput = {
    obligatorio?: boolean;
    puesto: Prisma.PuestoCreateNestedOneWithoutRequisitosInput;
    tipoDocumento: Prisma.TipoDocumentoCreateNestedOneWithoutRequisitosInput;
};
export type RequisitoPorPuestoUncheckedCreateInput = {
    puestoId: number;
    tipoDocumentoId: number;
    obligatorio?: boolean;
};
export type RequisitoPorPuestoUpdateInput = {
    obligatorio?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    puesto?: Prisma.PuestoUpdateOneRequiredWithoutRequisitosNestedInput;
    tipoDocumento?: Prisma.TipoDocumentoUpdateOneRequiredWithoutRequisitosNestedInput;
};
export type RequisitoPorPuestoUncheckedUpdateInput = {
    puestoId?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoDocumentoId?: Prisma.IntFieldUpdateOperationsInput | number;
    obligatorio?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type RequisitoPorPuestoCreateManyInput = {
    puestoId: number;
    tipoDocumentoId: number;
    obligatorio?: boolean;
};
export type RequisitoPorPuestoUpdateManyMutationInput = {
    obligatorio?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type RequisitoPorPuestoUncheckedUpdateManyInput = {
    puestoId?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoDocumentoId?: Prisma.IntFieldUpdateOperationsInput | number;
    obligatorio?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type RequisitoPorPuestoListRelationFilter = {
    every?: Prisma.RequisitoPorPuestoWhereInput;
    some?: Prisma.RequisitoPorPuestoWhereInput;
    none?: Prisma.RequisitoPorPuestoWhereInput;
};
export type RequisitoPorPuestoOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type RequisitoPorPuestoPuestoIdTipoDocumentoIdCompoundUniqueInput = {
    puestoId: number;
    tipoDocumentoId: number;
};
export type RequisitoPorPuestoCountOrderByAggregateInput = {
    puestoId?: Prisma.SortOrder;
    tipoDocumentoId?: Prisma.SortOrder;
    obligatorio?: Prisma.SortOrder;
};
export type RequisitoPorPuestoAvgOrderByAggregateInput = {
    puestoId?: Prisma.SortOrder;
    tipoDocumentoId?: Prisma.SortOrder;
};
export type RequisitoPorPuestoMaxOrderByAggregateInput = {
    puestoId?: Prisma.SortOrder;
    tipoDocumentoId?: Prisma.SortOrder;
    obligatorio?: Prisma.SortOrder;
};
export type RequisitoPorPuestoMinOrderByAggregateInput = {
    puestoId?: Prisma.SortOrder;
    tipoDocumentoId?: Prisma.SortOrder;
    obligatorio?: Prisma.SortOrder;
};
export type RequisitoPorPuestoSumOrderByAggregateInput = {
    puestoId?: Prisma.SortOrder;
    tipoDocumentoId?: Prisma.SortOrder;
};
export type RequisitoPorPuestoCreateNestedManyWithoutPuestoInput = {
    create?: Prisma.XOR<Prisma.RequisitoPorPuestoCreateWithoutPuestoInput, Prisma.RequisitoPorPuestoUncheckedCreateWithoutPuestoInput> | Prisma.RequisitoPorPuestoCreateWithoutPuestoInput[] | Prisma.RequisitoPorPuestoUncheckedCreateWithoutPuestoInput[];
    connectOrCreate?: Prisma.RequisitoPorPuestoCreateOrConnectWithoutPuestoInput | Prisma.RequisitoPorPuestoCreateOrConnectWithoutPuestoInput[];
    createMany?: Prisma.RequisitoPorPuestoCreateManyPuestoInputEnvelope;
    connect?: Prisma.RequisitoPorPuestoWhereUniqueInput | Prisma.RequisitoPorPuestoWhereUniqueInput[];
};
export type RequisitoPorPuestoUncheckedCreateNestedManyWithoutPuestoInput = {
    create?: Prisma.XOR<Prisma.RequisitoPorPuestoCreateWithoutPuestoInput, Prisma.RequisitoPorPuestoUncheckedCreateWithoutPuestoInput> | Prisma.RequisitoPorPuestoCreateWithoutPuestoInput[] | Prisma.RequisitoPorPuestoUncheckedCreateWithoutPuestoInput[];
    connectOrCreate?: Prisma.RequisitoPorPuestoCreateOrConnectWithoutPuestoInput | Prisma.RequisitoPorPuestoCreateOrConnectWithoutPuestoInput[];
    createMany?: Prisma.RequisitoPorPuestoCreateManyPuestoInputEnvelope;
    connect?: Prisma.RequisitoPorPuestoWhereUniqueInput | Prisma.RequisitoPorPuestoWhereUniqueInput[];
};
export type RequisitoPorPuestoUpdateManyWithoutPuestoNestedInput = {
    create?: Prisma.XOR<Prisma.RequisitoPorPuestoCreateWithoutPuestoInput, Prisma.RequisitoPorPuestoUncheckedCreateWithoutPuestoInput> | Prisma.RequisitoPorPuestoCreateWithoutPuestoInput[] | Prisma.RequisitoPorPuestoUncheckedCreateWithoutPuestoInput[];
    connectOrCreate?: Prisma.RequisitoPorPuestoCreateOrConnectWithoutPuestoInput | Prisma.RequisitoPorPuestoCreateOrConnectWithoutPuestoInput[];
    upsert?: Prisma.RequisitoPorPuestoUpsertWithWhereUniqueWithoutPuestoInput | Prisma.RequisitoPorPuestoUpsertWithWhereUniqueWithoutPuestoInput[];
    createMany?: Prisma.RequisitoPorPuestoCreateManyPuestoInputEnvelope;
    set?: Prisma.RequisitoPorPuestoWhereUniqueInput | Prisma.RequisitoPorPuestoWhereUniqueInput[];
    disconnect?: Prisma.RequisitoPorPuestoWhereUniqueInput | Prisma.RequisitoPorPuestoWhereUniqueInput[];
    delete?: Prisma.RequisitoPorPuestoWhereUniqueInput | Prisma.RequisitoPorPuestoWhereUniqueInput[];
    connect?: Prisma.RequisitoPorPuestoWhereUniqueInput | Prisma.RequisitoPorPuestoWhereUniqueInput[];
    update?: Prisma.RequisitoPorPuestoUpdateWithWhereUniqueWithoutPuestoInput | Prisma.RequisitoPorPuestoUpdateWithWhereUniqueWithoutPuestoInput[];
    updateMany?: Prisma.RequisitoPorPuestoUpdateManyWithWhereWithoutPuestoInput | Prisma.RequisitoPorPuestoUpdateManyWithWhereWithoutPuestoInput[];
    deleteMany?: Prisma.RequisitoPorPuestoScalarWhereInput | Prisma.RequisitoPorPuestoScalarWhereInput[];
};
export type RequisitoPorPuestoUncheckedUpdateManyWithoutPuestoNestedInput = {
    create?: Prisma.XOR<Prisma.RequisitoPorPuestoCreateWithoutPuestoInput, Prisma.RequisitoPorPuestoUncheckedCreateWithoutPuestoInput> | Prisma.RequisitoPorPuestoCreateWithoutPuestoInput[] | Prisma.RequisitoPorPuestoUncheckedCreateWithoutPuestoInput[];
    connectOrCreate?: Prisma.RequisitoPorPuestoCreateOrConnectWithoutPuestoInput | Prisma.RequisitoPorPuestoCreateOrConnectWithoutPuestoInput[];
    upsert?: Prisma.RequisitoPorPuestoUpsertWithWhereUniqueWithoutPuestoInput | Prisma.RequisitoPorPuestoUpsertWithWhereUniqueWithoutPuestoInput[];
    createMany?: Prisma.RequisitoPorPuestoCreateManyPuestoInputEnvelope;
    set?: Prisma.RequisitoPorPuestoWhereUniqueInput | Prisma.RequisitoPorPuestoWhereUniqueInput[];
    disconnect?: Prisma.RequisitoPorPuestoWhereUniqueInput | Prisma.RequisitoPorPuestoWhereUniqueInput[];
    delete?: Prisma.RequisitoPorPuestoWhereUniqueInput | Prisma.RequisitoPorPuestoWhereUniqueInput[];
    connect?: Prisma.RequisitoPorPuestoWhereUniqueInput | Prisma.RequisitoPorPuestoWhereUniqueInput[];
    update?: Prisma.RequisitoPorPuestoUpdateWithWhereUniqueWithoutPuestoInput | Prisma.RequisitoPorPuestoUpdateWithWhereUniqueWithoutPuestoInput[];
    updateMany?: Prisma.RequisitoPorPuestoUpdateManyWithWhereWithoutPuestoInput | Prisma.RequisitoPorPuestoUpdateManyWithWhereWithoutPuestoInput[];
    deleteMany?: Prisma.RequisitoPorPuestoScalarWhereInput | Prisma.RequisitoPorPuestoScalarWhereInput[];
};
export type RequisitoPorPuestoCreateNestedManyWithoutTipoDocumentoInput = {
    create?: Prisma.XOR<Prisma.RequisitoPorPuestoCreateWithoutTipoDocumentoInput, Prisma.RequisitoPorPuestoUncheckedCreateWithoutTipoDocumentoInput> | Prisma.RequisitoPorPuestoCreateWithoutTipoDocumentoInput[] | Prisma.RequisitoPorPuestoUncheckedCreateWithoutTipoDocumentoInput[];
    connectOrCreate?: Prisma.RequisitoPorPuestoCreateOrConnectWithoutTipoDocumentoInput | Prisma.RequisitoPorPuestoCreateOrConnectWithoutTipoDocumentoInput[];
    createMany?: Prisma.RequisitoPorPuestoCreateManyTipoDocumentoInputEnvelope;
    connect?: Prisma.RequisitoPorPuestoWhereUniqueInput | Prisma.RequisitoPorPuestoWhereUniqueInput[];
};
export type RequisitoPorPuestoUncheckedCreateNestedManyWithoutTipoDocumentoInput = {
    create?: Prisma.XOR<Prisma.RequisitoPorPuestoCreateWithoutTipoDocumentoInput, Prisma.RequisitoPorPuestoUncheckedCreateWithoutTipoDocumentoInput> | Prisma.RequisitoPorPuestoCreateWithoutTipoDocumentoInput[] | Prisma.RequisitoPorPuestoUncheckedCreateWithoutTipoDocumentoInput[];
    connectOrCreate?: Prisma.RequisitoPorPuestoCreateOrConnectWithoutTipoDocumentoInput | Prisma.RequisitoPorPuestoCreateOrConnectWithoutTipoDocumentoInput[];
    createMany?: Prisma.RequisitoPorPuestoCreateManyTipoDocumentoInputEnvelope;
    connect?: Prisma.RequisitoPorPuestoWhereUniqueInput | Prisma.RequisitoPorPuestoWhereUniqueInput[];
};
export type RequisitoPorPuestoUpdateManyWithoutTipoDocumentoNestedInput = {
    create?: Prisma.XOR<Prisma.RequisitoPorPuestoCreateWithoutTipoDocumentoInput, Prisma.RequisitoPorPuestoUncheckedCreateWithoutTipoDocumentoInput> | Prisma.RequisitoPorPuestoCreateWithoutTipoDocumentoInput[] | Prisma.RequisitoPorPuestoUncheckedCreateWithoutTipoDocumentoInput[];
    connectOrCreate?: Prisma.RequisitoPorPuestoCreateOrConnectWithoutTipoDocumentoInput | Prisma.RequisitoPorPuestoCreateOrConnectWithoutTipoDocumentoInput[];
    upsert?: Prisma.RequisitoPorPuestoUpsertWithWhereUniqueWithoutTipoDocumentoInput | Prisma.RequisitoPorPuestoUpsertWithWhereUniqueWithoutTipoDocumentoInput[];
    createMany?: Prisma.RequisitoPorPuestoCreateManyTipoDocumentoInputEnvelope;
    set?: Prisma.RequisitoPorPuestoWhereUniqueInput | Prisma.RequisitoPorPuestoWhereUniqueInput[];
    disconnect?: Prisma.RequisitoPorPuestoWhereUniqueInput | Prisma.RequisitoPorPuestoWhereUniqueInput[];
    delete?: Prisma.RequisitoPorPuestoWhereUniqueInput | Prisma.RequisitoPorPuestoWhereUniqueInput[];
    connect?: Prisma.RequisitoPorPuestoWhereUniqueInput | Prisma.RequisitoPorPuestoWhereUniqueInput[];
    update?: Prisma.RequisitoPorPuestoUpdateWithWhereUniqueWithoutTipoDocumentoInput | Prisma.RequisitoPorPuestoUpdateWithWhereUniqueWithoutTipoDocumentoInput[];
    updateMany?: Prisma.RequisitoPorPuestoUpdateManyWithWhereWithoutTipoDocumentoInput | Prisma.RequisitoPorPuestoUpdateManyWithWhereWithoutTipoDocumentoInput[];
    deleteMany?: Prisma.RequisitoPorPuestoScalarWhereInput | Prisma.RequisitoPorPuestoScalarWhereInput[];
};
export type RequisitoPorPuestoUncheckedUpdateManyWithoutTipoDocumentoNestedInput = {
    create?: Prisma.XOR<Prisma.RequisitoPorPuestoCreateWithoutTipoDocumentoInput, Prisma.RequisitoPorPuestoUncheckedCreateWithoutTipoDocumentoInput> | Prisma.RequisitoPorPuestoCreateWithoutTipoDocumentoInput[] | Prisma.RequisitoPorPuestoUncheckedCreateWithoutTipoDocumentoInput[];
    connectOrCreate?: Prisma.RequisitoPorPuestoCreateOrConnectWithoutTipoDocumentoInput | Prisma.RequisitoPorPuestoCreateOrConnectWithoutTipoDocumentoInput[];
    upsert?: Prisma.RequisitoPorPuestoUpsertWithWhereUniqueWithoutTipoDocumentoInput | Prisma.RequisitoPorPuestoUpsertWithWhereUniqueWithoutTipoDocumentoInput[];
    createMany?: Prisma.RequisitoPorPuestoCreateManyTipoDocumentoInputEnvelope;
    set?: Prisma.RequisitoPorPuestoWhereUniqueInput | Prisma.RequisitoPorPuestoWhereUniqueInput[];
    disconnect?: Prisma.RequisitoPorPuestoWhereUniqueInput | Prisma.RequisitoPorPuestoWhereUniqueInput[];
    delete?: Prisma.RequisitoPorPuestoWhereUniqueInput | Prisma.RequisitoPorPuestoWhereUniqueInput[];
    connect?: Prisma.RequisitoPorPuestoWhereUniqueInput | Prisma.RequisitoPorPuestoWhereUniqueInput[];
    update?: Prisma.RequisitoPorPuestoUpdateWithWhereUniqueWithoutTipoDocumentoInput | Prisma.RequisitoPorPuestoUpdateWithWhereUniqueWithoutTipoDocumentoInput[];
    updateMany?: Prisma.RequisitoPorPuestoUpdateManyWithWhereWithoutTipoDocumentoInput | Prisma.RequisitoPorPuestoUpdateManyWithWhereWithoutTipoDocumentoInput[];
    deleteMany?: Prisma.RequisitoPorPuestoScalarWhereInput | Prisma.RequisitoPorPuestoScalarWhereInput[];
};
export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
};
export type RequisitoPorPuestoCreateWithoutPuestoInput = {
    obligatorio?: boolean;
    tipoDocumento: Prisma.TipoDocumentoCreateNestedOneWithoutRequisitosInput;
};
export type RequisitoPorPuestoUncheckedCreateWithoutPuestoInput = {
    tipoDocumentoId: number;
    obligatorio?: boolean;
};
export type RequisitoPorPuestoCreateOrConnectWithoutPuestoInput = {
    where: Prisma.RequisitoPorPuestoWhereUniqueInput;
    create: Prisma.XOR<Prisma.RequisitoPorPuestoCreateWithoutPuestoInput, Prisma.RequisitoPorPuestoUncheckedCreateWithoutPuestoInput>;
};
export type RequisitoPorPuestoCreateManyPuestoInputEnvelope = {
    data: Prisma.RequisitoPorPuestoCreateManyPuestoInput | Prisma.RequisitoPorPuestoCreateManyPuestoInput[];
    skipDuplicates?: boolean;
};
export type RequisitoPorPuestoUpsertWithWhereUniqueWithoutPuestoInput = {
    where: Prisma.RequisitoPorPuestoWhereUniqueInput;
    update: Prisma.XOR<Prisma.RequisitoPorPuestoUpdateWithoutPuestoInput, Prisma.RequisitoPorPuestoUncheckedUpdateWithoutPuestoInput>;
    create: Prisma.XOR<Prisma.RequisitoPorPuestoCreateWithoutPuestoInput, Prisma.RequisitoPorPuestoUncheckedCreateWithoutPuestoInput>;
};
export type RequisitoPorPuestoUpdateWithWhereUniqueWithoutPuestoInput = {
    where: Prisma.RequisitoPorPuestoWhereUniqueInput;
    data: Prisma.XOR<Prisma.RequisitoPorPuestoUpdateWithoutPuestoInput, Prisma.RequisitoPorPuestoUncheckedUpdateWithoutPuestoInput>;
};
export type RequisitoPorPuestoUpdateManyWithWhereWithoutPuestoInput = {
    where: Prisma.RequisitoPorPuestoScalarWhereInput;
    data: Prisma.XOR<Prisma.RequisitoPorPuestoUpdateManyMutationInput, Prisma.RequisitoPorPuestoUncheckedUpdateManyWithoutPuestoInput>;
};
export type RequisitoPorPuestoScalarWhereInput = {
    AND?: Prisma.RequisitoPorPuestoScalarWhereInput | Prisma.RequisitoPorPuestoScalarWhereInput[];
    OR?: Prisma.RequisitoPorPuestoScalarWhereInput[];
    NOT?: Prisma.RequisitoPorPuestoScalarWhereInput | Prisma.RequisitoPorPuestoScalarWhereInput[];
    puestoId?: Prisma.IntFilter<"RequisitoPorPuesto"> | number;
    tipoDocumentoId?: Prisma.IntFilter<"RequisitoPorPuesto"> | number;
    obligatorio?: Prisma.BoolFilter<"RequisitoPorPuesto"> | boolean;
};
export type RequisitoPorPuestoCreateWithoutTipoDocumentoInput = {
    obligatorio?: boolean;
    puesto: Prisma.PuestoCreateNestedOneWithoutRequisitosInput;
};
export type RequisitoPorPuestoUncheckedCreateWithoutTipoDocumentoInput = {
    puestoId: number;
    obligatorio?: boolean;
};
export type RequisitoPorPuestoCreateOrConnectWithoutTipoDocumentoInput = {
    where: Prisma.RequisitoPorPuestoWhereUniqueInput;
    create: Prisma.XOR<Prisma.RequisitoPorPuestoCreateWithoutTipoDocumentoInput, Prisma.RequisitoPorPuestoUncheckedCreateWithoutTipoDocumentoInput>;
};
export type RequisitoPorPuestoCreateManyTipoDocumentoInputEnvelope = {
    data: Prisma.RequisitoPorPuestoCreateManyTipoDocumentoInput | Prisma.RequisitoPorPuestoCreateManyTipoDocumentoInput[];
    skipDuplicates?: boolean;
};
export type RequisitoPorPuestoUpsertWithWhereUniqueWithoutTipoDocumentoInput = {
    where: Prisma.RequisitoPorPuestoWhereUniqueInput;
    update: Prisma.XOR<Prisma.RequisitoPorPuestoUpdateWithoutTipoDocumentoInput, Prisma.RequisitoPorPuestoUncheckedUpdateWithoutTipoDocumentoInput>;
    create: Prisma.XOR<Prisma.RequisitoPorPuestoCreateWithoutTipoDocumentoInput, Prisma.RequisitoPorPuestoUncheckedCreateWithoutTipoDocumentoInput>;
};
export type RequisitoPorPuestoUpdateWithWhereUniqueWithoutTipoDocumentoInput = {
    where: Prisma.RequisitoPorPuestoWhereUniqueInput;
    data: Prisma.XOR<Prisma.RequisitoPorPuestoUpdateWithoutTipoDocumentoInput, Prisma.RequisitoPorPuestoUncheckedUpdateWithoutTipoDocumentoInput>;
};
export type RequisitoPorPuestoUpdateManyWithWhereWithoutTipoDocumentoInput = {
    where: Prisma.RequisitoPorPuestoScalarWhereInput;
    data: Prisma.XOR<Prisma.RequisitoPorPuestoUpdateManyMutationInput, Prisma.RequisitoPorPuestoUncheckedUpdateManyWithoutTipoDocumentoInput>;
};
export type RequisitoPorPuestoCreateManyPuestoInput = {
    tipoDocumentoId: number;
    obligatorio?: boolean;
};
export type RequisitoPorPuestoUpdateWithoutPuestoInput = {
    obligatorio?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    tipoDocumento?: Prisma.TipoDocumentoUpdateOneRequiredWithoutRequisitosNestedInput;
};
export type RequisitoPorPuestoUncheckedUpdateWithoutPuestoInput = {
    tipoDocumentoId?: Prisma.IntFieldUpdateOperationsInput | number;
    obligatorio?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type RequisitoPorPuestoUncheckedUpdateManyWithoutPuestoInput = {
    tipoDocumentoId?: Prisma.IntFieldUpdateOperationsInput | number;
    obligatorio?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type RequisitoPorPuestoCreateManyTipoDocumentoInput = {
    puestoId: number;
    obligatorio?: boolean;
};
export type RequisitoPorPuestoUpdateWithoutTipoDocumentoInput = {
    obligatorio?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    puesto?: Prisma.PuestoUpdateOneRequiredWithoutRequisitosNestedInput;
};
export type RequisitoPorPuestoUncheckedUpdateWithoutTipoDocumentoInput = {
    puestoId?: Prisma.IntFieldUpdateOperationsInput | number;
    obligatorio?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type RequisitoPorPuestoUncheckedUpdateManyWithoutTipoDocumentoInput = {
    puestoId?: Prisma.IntFieldUpdateOperationsInput | number;
    obligatorio?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type RequisitoPorPuestoSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    puestoId?: boolean;
    tipoDocumentoId?: boolean;
    obligatorio?: boolean;
    puesto?: boolean | Prisma.PuestoDefaultArgs<ExtArgs>;
    tipoDocumento?: boolean | Prisma.TipoDocumentoDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["requisitoPorPuesto"]>;
export type RequisitoPorPuestoSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    puestoId?: boolean;
    tipoDocumentoId?: boolean;
    obligatorio?: boolean;
    puesto?: boolean | Prisma.PuestoDefaultArgs<ExtArgs>;
    tipoDocumento?: boolean | Prisma.TipoDocumentoDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["requisitoPorPuesto"]>;
export type RequisitoPorPuestoSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    puestoId?: boolean;
    tipoDocumentoId?: boolean;
    obligatorio?: boolean;
    puesto?: boolean | Prisma.PuestoDefaultArgs<ExtArgs>;
    tipoDocumento?: boolean | Prisma.TipoDocumentoDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["requisitoPorPuesto"]>;
export type RequisitoPorPuestoSelectScalar = {
    puestoId?: boolean;
    tipoDocumentoId?: boolean;
    obligatorio?: boolean;
};
export type RequisitoPorPuestoOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"puestoId" | "tipoDocumentoId" | "obligatorio", ExtArgs["result"]["requisitoPorPuesto"]>;
export type RequisitoPorPuestoInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    puesto?: boolean | Prisma.PuestoDefaultArgs<ExtArgs>;
    tipoDocumento?: boolean | Prisma.TipoDocumentoDefaultArgs<ExtArgs>;
};
export type RequisitoPorPuestoIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    puesto?: boolean | Prisma.PuestoDefaultArgs<ExtArgs>;
    tipoDocumento?: boolean | Prisma.TipoDocumentoDefaultArgs<ExtArgs>;
};
export type RequisitoPorPuestoIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    puesto?: boolean | Prisma.PuestoDefaultArgs<ExtArgs>;
    tipoDocumento?: boolean | Prisma.TipoDocumentoDefaultArgs<ExtArgs>;
};
export type $RequisitoPorPuestoPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "RequisitoPorPuesto";
    objects: {
        puesto: Prisma.$PuestoPayload<ExtArgs>;
        tipoDocumento: Prisma.$TipoDocumentoPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        puestoId: number;
        tipoDocumentoId: number;
        obligatorio: boolean;
    }, ExtArgs["result"]["requisitoPorPuesto"]>;
    composites: {};
};
export type RequisitoPorPuestoGetPayload<S extends boolean | null | undefined | RequisitoPorPuestoDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$RequisitoPorPuestoPayload, S>;
export type RequisitoPorPuestoCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<RequisitoPorPuestoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: RequisitoPorPuestoCountAggregateInputType | true;
};
export interface RequisitoPorPuestoDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['RequisitoPorPuesto'];
        meta: {
            name: 'RequisitoPorPuesto';
        };
    };
    findUnique<T extends RequisitoPorPuestoFindUniqueArgs>(args: Prisma.SelectSubset<T, RequisitoPorPuestoFindUniqueArgs<ExtArgs>>): Prisma.Prisma__RequisitoPorPuestoClient<runtime.Types.Result.GetResult<Prisma.$RequisitoPorPuestoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends RequisitoPorPuestoFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, RequisitoPorPuestoFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__RequisitoPorPuestoClient<runtime.Types.Result.GetResult<Prisma.$RequisitoPorPuestoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends RequisitoPorPuestoFindFirstArgs>(args?: Prisma.SelectSubset<T, RequisitoPorPuestoFindFirstArgs<ExtArgs>>): Prisma.Prisma__RequisitoPorPuestoClient<runtime.Types.Result.GetResult<Prisma.$RequisitoPorPuestoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends RequisitoPorPuestoFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, RequisitoPorPuestoFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__RequisitoPorPuestoClient<runtime.Types.Result.GetResult<Prisma.$RequisitoPorPuestoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends RequisitoPorPuestoFindManyArgs>(args?: Prisma.SelectSubset<T, RequisitoPorPuestoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RequisitoPorPuestoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends RequisitoPorPuestoCreateArgs>(args: Prisma.SelectSubset<T, RequisitoPorPuestoCreateArgs<ExtArgs>>): Prisma.Prisma__RequisitoPorPuestoClient<runtime.Types.Result.GetResult<Prisma.$RequisitoPorPuestoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends RequisitoPorPuestoCreateManyArgs>(args?: Prisma.SelectSubset<T, RequisitoPorPuestoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends RequisitoPorPuestoCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, RequisitoPorPuestoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RequisitoPorPuestoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends RequisitoPorPuestoDeleteArgs>(args: Prisma.SelectSubset<T, RequisitoPorPuestoDeleteArgs<ExtArgs>>): Prisma.Prisma__RequisitoPorPuestoClient<runtime.Types.Result.GetResult<Prisma.$RequisitoPorPuestoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends RequisitoPorPuestoUpdateArgs>(args: Prisma.SelectSubset<T, RequisitoPorPuestoUpdateArgs<ExtArgs>>): Prisma.Prisma__RequisitoPorPuestoClient<runtime.Types.Result.GetResult<Prisma.$RequisitoPorPuestoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends RequisitoPorPuestoDeleteManyArgs>(args?: Prisma.SelectSubset<T, RequisitoPorPuestoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends RequisitoPorPuestoUpdateManyArgs>(args: Prisma.SelectSubset<T, RequisitoPorPuestoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends RequisitoPorPuestoUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, RequisitoPorPuestoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RequisitoPorPuestoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends RequisitoPorPuestoUpsertArgs>(args: Prisma.SelectSubset<T, RequisitoPorPuestoUpsertArgs<ExtArgs>>): Prisma.Prisma__RequisitoPorPuestoClient<runtime.Types.Result.GetResult<Prisma.$RequisitoPorPuestoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends RequisitoPorPuestoCountArgs>(args?: Prisma.Subset<T, RequisitoPorPuestoCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], RequisitoPorPuestoCountAggregateOutputType> : number>;
    aggregate<T extends RequisitoPorPuestoAggregateArgs>(args: Prisma.Subset<T, RequisitoPorPuestoAggregateArgs>): Prisma.PrismaPromise<GetRequisitoPorPuestoAggregateType<T>>;
    groupBy<T extends RequisitoPorPuestoGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: RequisitoPorPuestoGroupByArgs['orderBy'];
    } : {
        orderBy?: RequisitoPorPuestoGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, RequisitoPorPuestoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRequisitoPorPuestoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: RequisitoPorPuestoFieldRefs;
}
export interface Prisma__RequisitoPorPuestoClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    puesto<T extends Prisma.PuestoDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PuestoDefaultArgs<ExtArgs>>): Prisma.Prisma__PuestoClient<runtime.Types.Result.GetResult<Prisma.$PuestoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tipoDocumento<T extends Prisma.TipoDocumentoDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TipoDocumentoDefaultArgs<ExtArgs>>): Prisma.Prisma__TipoDocumentoClient<runtime.Types.Result.GetResult<Prisma.$TipoDocumentoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface RequisitoPorPuestoFieldRefs {
    readonly puestoId: Prisma.FieldRef<"RequisitoPorPuesto", 'Int'>;
    readonly tipoDocumentoId: Prisma.FieldRef<"RequisitoPorPuesto", 'Int'>;
    readonly obligatorio: Prisma.FieldRef<"RequisitoPorPuesto", 'Boolean'>;
}
export type RequisitoPorPuestoFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequisitoPorPuestoSelect<ExtArgs> | null;
    omit?: Prisma.RequisitoPorPuestoOmit<ExtArgs> | null;
    include?: Prisma.RequisitoPorPuestoInclude<ExtArgs> | null;
    where: Prisma.RequisitoPorPuestoWhereUniqueInput;
};
export type RequisitoPorPuestoFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequisitoPorPuestoSelect<ExtArgs> | null;
    omit?: Prisma.RequisitoPorPuestoOmit<ExtArgs> | null;
    include?: Prisma.RequisitoPorPuestoInclude<ExtArgs> | null;
    where: Prisma.RequisitoPorPuestoWhereUniqueInput;
};
export type RequisitoPorPuestoFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequisitoPorPuestoSelect<ExtArgs> | null;
    omit?: Prisma.RequisitoPorPuestoOmit<ExtArgs> | null;
    include?: Prisma.RequisitoPorPuestoInclude<ExtArgs> | null;
    where?: Prisma.RequisitoPorPuestoWhereInput;
    orderBy?: Prisma.RequisitoPorPuestoOrderByWithRelationInput | Prisma.RequisitoPorPuestoOrderByWithRelationInput[];
    cursor?: Prisma.RequisitoPorPuestoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RequisitoPorPuestoScalarFieldEnum | Prisma.RequisitoPorPuestoScalarFieldEnum[];
};
export type RequisitoPorPuestoFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequisitoPorPuestoSelect<ExtArgs> | null;
    omit?: Prisma.RequisitoPorPuestoOmit<ExtArgs> | null;
    include?: Prisma.RequisitoPorPuestoInclude<ExtArgs> | null;
    where?: Prisma.RequisitoPorPuestoWhereInput;
    orderBy?: Prisma.RequisitoPorPuestoOrderByWithRelationInput | Prisma.RequisitoPorPuestoOrderByWithRelationInput[];
    cursor?: Prisma.RequisitoPorPuestoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RequisitoPorPuestoScalarFieldEnum | Prisma.RequisitoPorPuestoScalarFieldEnum[];
};
export type RequisitoPorPuestoFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequisitoPorPuestoSelect<ExtArgs> | null;
    omit?: Prisma.RequisitoPorPuestoOmit<ExtArgs> | null;
    include?: Prisma.RequisitoPorPuestoInclude<ExtArgs> | null;
    where?: Prisma.RequisitoPorPuestoWhereInput;
    orderBy?: Prisma.RequisitoPorPuestoOrderByWithRelationInput | Prisma.RequisitoPorPuestoOrderByWithRelationInput[];
    cursor?: Prisma.RequisitoPorPuestoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RequisitoPorPuestoScalarFieldEnum | Prisma.RequisitoPorPuestoScalarFieldEnum[];
};
export type RequisitoPorPuestoCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequisitoPorPuestoSelect<ExtArgs> | null;
    omit?: Prisma.RequisitoPorPuestoOmit<ExtArgs> | null;
    include?: Prisma.RequisitoPorPuestoInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RequisitoPorPuestoCreateInput, Prisma.RequisitoPorPuestoUncheckedCreateInput>;
};
export type RequisitoPorPuestoCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.RequisitoPorPuestoCreateManyInput | Prisma.RequisitoPorPuestoCreateManyInput[];
    skipDuplicates?: boolean;
};
export type RequisitoPorPuestoCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequisitoPorPuestoSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RequisitoPorPuestoOmit<ExtArgs> | null;
    data: Prisma.RequisitoPorPuestoCreateManyInput | Prisma.RequisitoPorPuestoCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.RequisitoPorPuestoIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type RequisitoPorPuestoUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequisitoPorPuestoSelect<ExtArgs> | null;
    omit?: Prisma.RequisitoPorPuestoOmit<ExtArgs> | null;
    include?: Prisma.RequisitoPorPuestoInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RequisitoPorPuestoUpdateInput, Prisma.RequisitoPorPuestoUncheckedUpdateInput>;
    where: Prisma.RequisitoPorPuestoWhereUniqueInput;
};
export type RequisitoPorPuestoUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.RequisitoPorPuestoUpdateManyMutationInput, Prisma.RequisitoPorPuestoUncheckedUpdateManyInput>;
    where?: Prisma.RequisitoPorPuestoWhereInput;
    limit?: number;
};
export type RequisitoPorPuestoUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequisitoPorPuestoSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RequisitoPorPuestoOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RequisitoPorPuestoUpdateManyMutationInput, Prisma.RequisitoPorPuestoUncheckedUpdateManyInput>;
    where?: Prisma.RequisitoPorPuestoWhereInput;
    limit?: number;
    include?: Prisma.RequisitoPorPuestoIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type RequisitoPorPuestoUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequisitoPorPuestoSelect<ExtArgs> | null;
    omit?: Prisma.RequisitoPorPuestoOmit<ExtArgs> | null;
    include?: Prisma.RequisitoPorPuestoInclude<ExtArgs> | null;
    where: Prisma.RequisitoPorPuestoWhereUniqueInput;
    create: Prisma.XOR<Prisma.RequisitoPorPuestoCreateInput, Prisma.RequisitoPorPuestoUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.RequisitoPorPuestoUpdateInput, Prisma.RequisitoPorPuestoUncheckedUpdateInput>;
};
export type RequisitoPorPuestoDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequisitoPorPuestoSelect<ExtArgs> | null;
    omit?: Prisma.RequisitoPorPuestoOmit<ExtArgs> | null;
    include?: Prisma.RequisitoPorPuestoInclude<ExtArgs> | null;
    where: Prisma.RequisitoPorPuestoWhereUniqueInput;
};
export type RequisitoPorPuestoDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RequisitoPorPuestoWhereInput;
    limit?: number;
};
export type RequisitoPorPuestoDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RequisitoPorPuestoSelect<ExtArgs> | null;
    omit?: Prisma.RequisitoPorPuestoOmit<ExtArgs> | null;
    include?: Prisma.RequisitoPorPuestoInclude<ExtArgs> | null;
};
