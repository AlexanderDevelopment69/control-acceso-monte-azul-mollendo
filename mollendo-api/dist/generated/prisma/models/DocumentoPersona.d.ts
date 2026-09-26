import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type DocumentoPersonaModel = runtime.Types.Result.DefaultSelection<Prisma.$DocumentoPersonaPayload>;
export type AggregateDocumentoPersona = {
    _count: DocumentoPersonaCountAggregateOutputType | null;
    _avg: DocumentoPersonaAvgAggregateOutputType | null;
    _sum: DocumentoPersonaSumAggregateOutputType | null;
    _min: DocumentoPersonaMinAggregateOutputType | null;
    _max: DocumentoPersonaMaxAggregateOutputType | null;
};
export type DocumentoPersonaAvgAggregateOutputType = {
    id: number | null;
    personaId: number | null;
    tipoDocumentoId: number | null;
    version: number | null;
};
export type DocumentoPersonaSumAggregateOutputType = {
    id: number | null;
    personaId: number | null;
    tipoDocumentoId: number | null;
    version: number | null;
};
export type DocumentoPersonaMinAggregateOutputType = {
    id: number | null;
    personaId: number | null;
    tipoDocumentoId: number | null;
    fechaEmision: Date | null;
    fechaVencimiento: Date | null;
    archivoUrl: string | null;
    version: number | null;
    creadoEn: Date | null;
};
export type DocumentoPersonaMaxAggregateOutputType = {
    id: number | null;
    personaId: number | null;
    tipoDocumentoId: number | null;
    fechaEmision: Date | null;
    fechaVencimiento: Date | null;
    archivoUrl: string | null;
    version: number | null;
    creadoEn: Date | null;
};
export type DocumentoPersonaCountAggregateOutputType = {
    id: number;
    personaId: number;
    tipoDocumentoId: number;
    fechaEmision: number;
    fechaVencimiento: number;
    archivoUrl: number;
    version: number;
    creadoEn: number;
    _all: number;
};
export type DocumentoPersonaAvgAggregateInputType = {
    id?: true;
    personaId?: true;
    tipoDocumentoId?: true;
    version?: true;
};
export type DocumentoPersonaSumAggregateInputType = {
    id?: true;
    personaId?: true;
    tipoDocumentoId?: true;
    version?: true;
};
export type DocumentoPersonaMinAggregateInputType = {
    id?: true;
    personaId?: true;
    tipoDocumentoId?: true;
    fechaEmision?: true;
    fechaVencimiento?: true;
    archivoUrl?: true;
    version?: true;
    creadoEn?: true;
};
export type DocumentoPersonaMaxAggregateInputType = {
    id?: true;
    personaId?: true;
    tipoDocumentoId?: true;
    fechaEmision?: true;
    fechaVencimiento?: true;
    archivoUrl?: true;
    version?: true;
    creadoEn?: true;
};
export type DocumentoPersonaCountAggregateInputType = {
    id?: true;
    personaId?: true;
    tipoDocumentoId?: true;
    fechaEmision?: true;
    fechaVencimiento?: true;
    archivoUrl?: true;
    version?: true;
    creadoEn?: true;
    _all?: true;
};
export type DocumentoPersonaAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DocumentoPersonaWhereInput;
    orderBy?: Prisma.DocumentoPersonaOrderByWithRelationInput | Prisma.DocumentoPersonaOrderByWithRelationInput[];
    cursor?: Prisma.DocumentoPersonaWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | DocumentoPersonaCountAggregateInputType;
    _avg?: DocumentoPersonaAvgAggregateInputType;
    _sum?: DocumentoPersonaSumAggregateInputType;
    _min?: DocumentoPersonaMinAggregateInputType;
    _max?: DocumentoPersonaMaxAggregateInputType;
};
export type GetDocumentoPersonaAggregateType<T extends DocumentoPersonaAggregateArgs> = {
    [P in keyof T & keyof AggregateDocumentoPersona]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateDocumentoPersona[P]> : Prisma.GetScalarType<T[P], AggregateDocumentoPersona[P]>;
};
export type DocumentoPersonaGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DocumentoPersonaWhereInput;
    orderBy?: Prisma.DocumentoPersonaOrderByWithAggregationInput | Prisma.DocumentoPersonaOrderByWithAggregationInput[];
    by: Prisma.DocumentoPersonaScalarFieldEnum[] | Prisma.DocumentoPersonaScalarFieldEnum;
    having?: Prisma.DocumentoPersonaScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: DocumentoPersonaCountAggregateInputType | true;
    _avg?: DocumentoPersonaAvgAggregateInputType;
    _sum?: DocumentoPersonaSumAggregateInputType;
    _min?: DocumentoPersonaMinAggregateInputType;
    _max?: DocumentoPersonaMaxAggregateInputType;
};
export type DocumentoPersonaGroupByOutputType = {
    id: number;
    personaId: number;
    tipoDocumentoId: number;
    fechaEmision: Date | null;
    fechaVencimiento: Date | null;
    archivoUrl: string | null;
    version: number;
    creadoEn: Date;
    _count: DocumentoPersonaCountAggregateOutputType | null;
    _avg: DocumentoPersonaAvgAggregateOutputType | null;
    _sum: DocumentoPersonaSumAggregateOutputType | null;
    _min: DocumentoPersonaMinAggregateOutputType | null;
    _max: DocumentoPersonaMaxAggregateOutputType | null;
};
export type GetDocumentoPersonaGroupByPayload<T extends DocumentoPersonaGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<DocumentoPersonaGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof DocumentoPersonaGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], DocumentoPersonaGroupByOutputType[P]> : Prisma.GetScalarType<T[P], DocumentoPersonaGroupByOutputType[P]>;
}>>;
export type DocumentoPersonaWhereInput = {
    AND?: Prisma.DocumentoPersonaWhereInput | Prisma.DocumentoPersonaWhereInput[];
    OR?: Prisma.DocumentoPersonaWhereInput[];
    NOT?: Prisma.DocumentoPersonaWhereInput | Prisma.DocumentoPersonaWhereInput[];
    id?: Prisma.IntFilter<"DocumentoPersona"> | number;
    personaId?: Prisma.IntFilter<"DocumentoPersona"> | number;
    tipoDocumentoId?: Prisma.IntFilter<"DocumentoPersona"> | number;
    fechaEmision?: Prisma.DateTimeNullableFilter<"DocumentoPersona"> | Date | string | null;
    fechaVencimiento?: Prisma.DateTimeNullableFilter<"DocumentoPersona"> | Date | string | null;
    archivoUrl?: Prisma.StringNullableFilter<"DocumentoPersona"> | string | null;
    version?: Prisma.IntFilter<"DocumentoPersona"> | number;
    creadoEn?: Prisma.DateTimeFilter<"DocumentoPersona"> | Date | string;
    persona?: Prisma.XOR<Prisma.PersonaScalarRelationFilter, Prisma.PersonaWhereInput>;
    tipoDocumento?: Prisma.XOR<Prisma.TipoDocumentoScalarRelationFilter, Prisma.TipoDocumentoWhereInput>;
};
export type DocumentoPersonaOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    personaId?: Prisma.SortOrder;
    tipoDocumentoId?: Prisma.SortOrder;
    fechaEmision?: Prisma.SortOrderInput | Prisma.SortOrder;
    fechaVencimiento?: Prisma.SortOrderInput | Prisma.SortOrder;
    archivoUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    version?: Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
    persona?: Prisma.PersonaOrderByWithRelationInput;
    tipoDocumento?: Prisma.TipoDocumentoOrderByWithRelationInput;
};
export type DocumentoPersonaWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.DocumentoPersonaWhereInput | Prisma.DocumentoPersonaWhereInput[];
    OR?: Prisma.DocumentoPersonaWhereInput[];
    NOT?: Prisma.DocumentoPersonaWhereInput | Prisma.DocumentoPersonaWhereInput[];
    personaId?: Prisma.IntFilter<"DocumentoPersona"> | number;
    tipoDocumentoId?: Prisma.IntFilter<"DocumentoPersona"> | number;
    fechaEmision?: Prisma.DateTimeNullableFilter<"DocumentoPersona"> | Date | string | null;
    fechaVencimiento?: Prisma.DateTimeNullableFilter<"DocumentoPersona"> | Date | string | null;
    archivoUrl?: Prisma.StringNullableFilter<"DocumentoPersona"> | string | null;
    version?: Prisma.IntFilter<"DocumentoPersona"> | number;
    creadoEn?: Prisma.DateTimeFilter<"DocumentoPersona"> | Date | string;
    persona?: Prisma.XOR<Prisma.PersonaScalarRelationFilter, Prisma.PersonaWhereInput>;
    tipoDocumento?: Prisma.XOR<Prisma.TipoDocumentoScalarRelationFilter, Prisma.TipoDocumentoWhereInput>;
}, "id">;
export type DocumentoPersonaOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    personaId?: Prisma.SortOrder;
    tipoDocumentoId?: Prisma.SortOrder;
    fechaEmision?: Prisma.SortOrderInput | Prisma.SortOrder;
    fechaVencimiento?: Prisma.SortOrderInput | Prisma.SortOrder;
    archivoUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    version?: Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
    _count?: Prisma.DocumentoPersonaCountOrderByAggregateInput;
    _avg?: Prisma.DocumentoPersonaAvgOrderByAggregateInput;
    _max?: Prisma.DocumentoPersonaMaxOrderByAggregateInput;
    _min?: Prisma.DocumentoPersonaMinOrderByAggregateInput;
    _sum?: Prisma.DocumentoPersonaSumOrderByAggregateInput;
};
export type DocumentoPersonaScalarWhereWithAggregatesInput = {
    AND?: Prisma.DocumentoPersonaScalarWhereWithAggregatesInput | Prisma.DocumentoPersonaScalarWhereWithAggregatesInput[];
    OR?: Prisma.DocumentoPersonaScalarWhereWithAggregatesInput[];
    NOT?: Prisma.DocumentoPersonaScalarWhereWithAggregatesInput | Prisma.DocumentoPersonaScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"DocumentoPersona"> | number;
    personaId?: Prisma.IntWithAggregatesFilter<"DocumentoPersona"> | number;
    tipoDocumentoId?: Prisma.IntWithAggregatesFilter<"DocumentoPersona"> | number;
    fechaEmision?: Prisma.DateTimeNullableWithAggregatesFilter<"DocumentoPersona"> | Date | string | null;
    fechaVencimiento?: Prisma.DateTimeNullableWithAggregatesFilter<"DocumentoPersona"> | Date | string | null;
    archivoUrl?: Prisma.StringNullableWithAggregatesFilter<"DocumentoPersona"> | string | null;
    version?: Prisma.IntWithAggregatesFilter<"DocumentoPersona"> | number;
    creadoEn?: Prisma.DateTimeWithAggregatesFilter<"DocumentoPersona"> | Date | string;
};
export type DocumentoPersonaCreateInput = {
    fechaEmision?: Date | string | null;
    fechaVencimiento?: Date | string | null;
    archivoUrl?: string | null;
    version?: number;
    creadoEn?: Date | string;
    persona: Prisma.PersonaCreateNestedOneWithoutDocumentosInput;
    tipoDocumento: Prisma.TipoDocumentoCreateNestedOneWithoutDocumentosInput;
};
export type DocumentoPersonaUncheckedCreateInput = {
    id?: number;
    personaId: number;
    tipoDocumentoId: number;
    fechaEmision?: Date | string | null;
    fechaVencimiento?: Date | string | null;
    archivoUrl?: string | null;
    version?: number;
    creadoEn?: Date | string;
};
export type DocumentoPersonaUpdateInput = {
    fechaEmision?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    fechaVencimiento?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    archivoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    persona?: Prisma.PersonaUpdateOneRequiredWithoutDocumentosNestedInput;
    tipoDocumento?: Prisma.TipoDocumentoUpdateOneRequiredWithoutDocumentosNestedInput;
};
export type DocumentoPersonaUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personaId?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoDocumentoId?: Prisma.IntFieldUpdateOperationsInput | number;
    fechaEmision?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    fechaVencimiento?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    archivoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DocumentoPersonaCreateManyInput = {
    id?: number;
    personaId: number;
    tipoDocumentoId: number;
    fechaEmision?: Date | string | null;
    fechaVencimiento?: Date | string | null;
    archivoUrl?: string | null;
    version?: number;
    creadoEn?: Date | string;
};
export type DocumentoPersonaUpdateManyMutationInput = {
    fechaEmision?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    fechaVencimiento?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    archivoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DocumentoPersonaUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personaId?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoDocumentoId?: Prisma.IntFieldUpdateOperationsInput | number;
    fechaEmision?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    fechaVencimiento?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    archivoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DocumentoPersonaListRelationFilter = {
    every?: Prisma.DocumentoPersonaWhereInput;
    some?: Prisma.DocumentoPersonaWhereInput;
    none?: Prisma.DocumentoPersonaWhereInput;
};
export type DocumentoPersonaOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type DocumentoPersonaCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personaId?: Prisma.SortOrder;
    tipoDocumentoId?: Prisma.SortOrder;
    fechaEmision?: Prisma.SortOrder;
    fechaVencimiento?: Prisma.SortOrder;
    archivoUrl?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
};
export type DocumentoPersonaAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personaId?: Prisma.SortOrder;
    tipoDocumentoId?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
};
export type DocumentoPersonaMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personaId?: Prisma.SortOrder;
    tipoDocumentoId?: Prisma.SortOrder;
    fechaEmision?: Prisma.SortOrder;
    fechaVencimiento?: Prisma.SortOrder;
    archivoUrl?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
};
export type DocumentoPersonaMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personaId?: Prisma.SortOrder;
    tipoDocumentoId?: Prisma.SortOrder;
    fechaEmision?: Prisma.SortOrder;
    fechaVencimiento?: Prisma.SortOrder;
    archivoUrl?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
};
export type DocumentoPersonaSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personaId?: Prisma.SortOrder;
    tipoDocumentoId?: Prisma.SortOrder;
    version?: Prisma.SortOrder;
};
export type DocumentoPersonaCreateNestedManyWithoutPersonaInput = {
    create?: Prisma.XOR<Prisma.DocumentoPersonaCreateWithoutPersonaInput, Prisma.DocumentoPersonaUncheckedCreateWithoutPersonaInput> | Prisma.DocumentoPersonaCreateWithoutPersonaInput[] | Prisma.DocumentoPersonaUncheckedCreateWithoutPersonaInput[];
    connectOrCreate?: Prisma.DocumentoPersonaCreateOrConnectWithoutPersonaInput | Prisma.DocumentoPersonaCreateOrConnectWithoutPersonaInput[];
    createMany?: Prisma.DocumentoPersonaCreateManyPersonaInputEnvelope;
    connect?: Prisma.DocumentoPersonaWhereUniqueInput | Prisma.DocumentoPersonaWhereUniqueInput[];
};
export type DocumentoPersonaUncheckedCreateNestedManyWithoutPersonaInput = {
    create?: Prisma.XOR<Prisma.DocumentoPersonaCreateWithoutPersonaInput, Prisma.DocumentoPersonaUncheckedCreateWithoutPersonaInput> | Prisma.DocumentoPersonaCreateWithoutPersonaInput[] | Prisma.DocumentoPersonaUncheckedCreateWithoutPersonaInput[];
    connectOrCreate?: Prisma.DocumentoPersonaCreateOrConnectWithoutPersonaInput | Prisma.DocumentoPersonaCreateOrConnectWithoutPersonaInput[];
    createMany?: Prisma.DocumentoPersonaCreateManyPersonaInputEnvelope;
    connect?: Prisma.DocumentoPersonaWhereUniqueInput | Prisma.DocumentoPersonaWhereUniqueInput[];
};
export type DocumentoPersonaUpdateManyWithoutPersonaNestedInput = {
    create?: Prisma.XOR<Prisma.DocumentoPersonaCreateWithoutPersonaInput, Prisma.DocumentoPersonaUncheckedCreateWithoutPersonaInput> | Prisma.DocumentoPersonaCreateWithoutPersonaInput[] | Prisma.DocumentoPersonaUncheckedCreateWithoutPersonaInput[];
    connectOrCreate?: Prisma.DocumentoPersonaCreateOrConnectWithoutPersonaInput | Prisma.DocumentoPersonaCreateOrConnectWithoutPersonaInput[];
    upsert?: Prisma.DocumentoPersonaUpsertWithWhereUniqueWithoutPersonaInput | Prisma.DocumentoPersonaUpsertWithWhereUniqueWithoutPersonaInput[];
    createMany?: Prisma.DocumentoPersonaCreateManyPersonaInputEnvelope;
    set?: Prisma.DocumentoPersonaWhereUniqueInput | Prisma.DocumentoPersonaWhereUniqueInput[];
    disconnect?: Prisma.DocumentoPersonaWhereUniqueInput | Prisma.DocumentoPersonaWhereUniqueInput[];
    delete?: Prisma.DocumentoPersonaWhereUniqueInput | Prisma.DocumentoPersonaWhereUniqueInput[];
    connect?: Prisma.DocumentoPersonaWhereUniqueInput | Prisma.DocumentoPersonaWhereUniqueInput[];
    update?: Prisma.DocumentoPersonaUpdateWithWhereUniqueWithoutPersonaInput | Prisma.DocumentoPersonaUpdateWithWhereUniqueWithoutPersonaInput[];
    updateMany?: Prisma.DocumentoPersonaUpdateManyWithWhereWithoutPersonaInput | Prisma.DocumentoPersonaUpdateManyWithWhereWithoutPersonaInput[];
    deleteMany?: Prisma.DocumentoPersonaScalarWhereInput | Prisma.DocumentoPersonaScalarWhereInput[];
};
export type DocumentoPersonaUncheckedUpdateManyWithoutPersonaNestedInput = {
    create?: Prisma.XOR<Prisma.DocumentoPersonaCreateWithoutPersonaInput, Prisma.DocumentoPersonaUncheckedCreateWithoutPersonaInput> | Prisma.DocumentoPersonaCreateWithoutPersonaInput[] | Prisma.DocumentoPersonaUncheckedCreateWithoutPersonaInput[];
    connectOrCreate?: Prisma.DocumentoPersonaCreateOrConnectWithoutPersonaInput | Prisma.DocumentoPersonaCreateOrConnectWithoutPersonaInput[];
    upsert?: Prisma.DocumentoPersonaUpsertWithWhereUniqueWithoutPersonaInput | Prisma.DocumentoPersonaUpsertWithWhereUniqueWithoutPersonaInput[];
    createMany?: Prisma.DocumentoPersonaCreateManyPersonaInputEnvelope;
    set?: Prisma.DocumentoPersonaWhereUniqueInput | Prisma.DocumentoPersonaWhereUniqueInput[];
    disconnect?: Prisma.DocumentoPersonaWhereUniqueInput | Prisma.DocumentoPersonaWhereUniqueInput[];
    delete?: Prisma.DocumentoPersonaWhereUniqueInput | Prisma.DocumentoPersonaWhereUniqueInput[];
    connect?: Prisma.DocumentoPersonaWhereUniqueInput | Prisma.DocumentoPersonaWhereUniqueInput[];
    update?: Prisma.DocumentoPersonaUpdateWithWhereUniqueWithoutPersonaInput | Prisma.DocumentoPersonaUpdateWithWhereUniqueWithoutPersonaInput[];
    updateMany?: Prisma.DocumentoPersonaUpdateManyWithWhereWithoutPersonaInput | Prisma.DocumentoPersonaUpdateManyWithWhereWithoutPersonaInput[];
    deleteMany?: Prisma.DocumentoPersonaScalarWhereInput | Prisma.DocumentoPersonaScalarWhereInput[];
};
export type DocumentoPersonaCreateNestedManyWithoutTipoDocumentoInput = {
    create?: Prisma.XOR<Prisma.DocumentoPersonaCreateWithoutTipoDocumentoInput, Prisma.DocumentoPersonaUncheckedCreateWithoutTipoDocumentoInput> | Prisma.DocumentoPersonaCreateWithoutTipoDocumentoInput[] | Prisma.DocumentoPersonaUncheckedCreateWithoutTipoDocumentoInput[];
    connectOrCreate?: Prisma.DocumentoPersonaCreateOrConnectWithoutTipoDocumentoInput | Prisma.DocumentoPersonaCreateOrConnectWithoutTipoDocumentoInput[];
    createMany?: Prisma.DocumentoPersonaCreateManyTipoDocumentoInputEnvelope;
    connect?: Prisma.DocumentoPersonaWhereUniqueInput | Prisma.DocumentoPersonaWhereUniqueInput[];
};
export type DocumentoPersonaUncheckedCreateNestedManyWithoutTipoDocumentoInput = {
    create?: Prisma.XOR<Prisma.DocumentoPersonaCreateWithoutTipoDocumentoInput, Prisma.DocumentoPersonaUncheckedCreateWithoutTipoDocumentoInput> | Prisma.DocumentoPersonaCreateWithoutTipoDocumentoInput[] | Prisma.DocumentoPersonaUncheckedCreateWithoutTipoDocumentoInput[];
    connectOrCreate?: Prisma.DocumentoPersonaCreateOrConnectWithoutTipoDocumentoInput | Prisma.DocumentoPersonaCreateOrConnectWithoutTipoDocumentoInput[];
    createMany?: Prisma.DocumentoPersonaCreateManyTipoDocumentoInputEnvelope;
    connect?: Prisma.DocumentoPersonaWhereUniqueInput | Prisma.DocumentoPersonaWhereUniqueInput[];
};
export type DocumentoPersonaUpdateManyWithoutTipoDocumentoNestedInput = {
    create?: Prisma.XOR<Prisma.DocumentoPersonaCreateWithoutTipoDocumentoInput, Prisma.DocumentoPersonaUncheckedCreateWithoutTipoDocumentoInput> | Prisma.DocumentoPersonaCreateWithoutTipoDocumentoInput[] | Prisma.DocumentoPersonaUncheckedCreateWithoutTipoDocumentoInput[];
    connectOrCreate?: Prisma.DocumentoPersonaCreateOrConnectWithoutTipoDocumentoInput | Prisma.DocumentoPersonaCreateOrConnectWithoutTipoDocumentoInput[];
    upsert?: Prisma.DocumentoPersonaUpsertWithWhereUniqueWithoutTipoDocumentoInput | Prisma.DocumentoPersonaUpsertWithWhereUniqueWithoutTipoDocumentoInput[];
    createMany?: Prisma.DocumentoPersonaCreateManyTipoDocumentoInputEnvelope;
    set?: Prisma.DocumentoPersonaWhereUniqueInput | Prisma.DocumentoPersonaWhereUniqueInput[];
    disconnect?: Prisma.DocumentoPersonaWhereUniqueInput | Prisma.DocumentoPersonaWhereUniqueInput[];
    delete?: Prisma.DocumentoPersonaWhereUniqueInput | Prisma.DocumentoPersonaWhereUniqueInput[];
    connect?: Prisma.DocumentoPersonaWhereUniqueInput | Prisma.DocumentoPersonaWhereUniqueInput[];
    update?: Prisma.DocumentoPersonaUpdateWithWhereUniqueWithoutTipoDocumentoInput | Prisma.DocumentoPersonaUpdateWithWhereUniqueWithoutTipoDocumentoInput[];
    updateMany?: Prisma.DocumentoPersonaUpdateManyWithWhereWithoutTipoDocumentoInput | Prisma.DocumentoPersonaUpdateManyWithWhereWithoutTipoDocumentoInput[];
    deleteMany?: Prisma.DocumentoPersonaScalarWhereInput | Prisma.DocumentoPersonaScalarWhereInput[];
};
export type DocumentoPersonaUncheckedUpdateManyWithoutTipoDocumentoNestedInput = {
    create?: Prisma.XOR<Prisma.DocumentoPersonaCreateWithoutTipoDocumentoInput, Prisma.DocumentoPersonaUncheckedCreateWithoutTipoDocumentoInput> | Prisma.DocumentoPersonaCreateWithoutTipoDocumentoInput[] | Prisma.DocumentoPersonaUncheckedCreateWithoutTipoDocumentoInput[];
    connectOrCreate?: Prisma.DocumentoPersonaCreateOrConnectWithoutTipoDocumentoInput | Prisma.DocumentoPersonaCreateOrConnectWithoutTipoDocumentoInput[];
    upsert?: Prisma.DocumentoPersonaUpsertWithWhereUniqueWithoutTipoDocumentoInput | Prisma.DocumentoPersonaUpsertWithWhereUniqueWithoutTipoDocumentoInput[];
    createMany?: Prisma.DocumentoPersonaCreateManyTipoDocumentoInputEnvelope;
    set?: Prisma.DocumentoPersonaWhereUniqueInput | Prisma.DocumentoPersonaWhereUniqueInput[];
    disconnect?: Prisma.DocumentoPersonaWhereUniqueInput | Prisma.DocumentoPersonaWhereUniqueInput[];
    delete?: Prisma.DocumentoPersonaWhereUniqueInput | Prisma.DocumentoPersonaWhereUniqueInput[];
    connect?: Prisma.DocumentoPersonaWhereUniqueInput | Prisma.DocumentoPersonaWhereUniqueInput[];
    update?: Prisma.DocumentoPersonaUpdateWithWhereUniqueWithoutTipoDocumentoInput | Prisma.DocumentoPersonaUpdateWithWhereUniqueWithoutTipoDocumentoInput[];
    updateMany?: Prisma.DocumentoPersonaUpdateManyWithWhereWithoutTipoDocumentoInput | Prisma.DocumentoPersonaUpdateManyWithWhereWithoutTipoDocumentoInput[];
    deleteMany?: Prisma.DocumentoPersonaScalarWhereInput | Prisma.DocumentoPersonaScalarWhereInput[];
};
export type DocumentoPersonaCreateWithoutPersonaInput = {
    fechaEmision?: Date | string | null;
    fechaVencimiento?: Date | string | null;
    archivoUrl?: string | null;
    version?: number;
    creadoEn?: Date | string;
    tipoDocumento: Prisma.TipoDocumentoCreateNestedOneWithoutDocumentosInput;
};
export type DocumentoPersonaUncheckedCreateWithoutPersonaInput = {
    id?: number;
    tipoDocumentoId: number;
    fechaEmision?: Date | string | null;
    fechaVencimiento?: Date | string | null;
    archivoUrl?: string | null;
    version?: number;
    creadoEn?: Date | string;
};
export type DocumentoPersonaCreateOrConnectWithoutPersonaInput = {
    where: Prisma.DocumentoPersonaWhereUniqueInput;
    create: Prisma.XOR<Prisma.DocumentoPersonaCreateWithoutPersonaInput, Prisma.DocumentoPersonaUncheckedCreateWithoutPersonaInput>;
};
export type DocumentoPersonaCreateManyPersonaInputEnvelope = {
    data: Prisma.DocumentoPersonaCreateManyPersonaInput | Prisma.DocumentoPersonaCreateManyPersonaInput[];
    skipDuplicates?: boolean;
};
export type DocumentoPersonaUpsertWithWhereUniqueWithoutPersonaInput = {
    where: Prisma.DocumentoPersonaWhereUniqueInput;
    update: Prisma.XOR<Prisma.DocumentoPersonaUpdateWithoutPersonaInput, Prisma.DocumentoPersonaUncheckedUpdateWithoutPersonaInput>;
    create: Prisma.XOR<Prisma.DocumentoPersonaCreateWithoutPersonaInput, Prisma.DocumentoPersonaUncheckedCreateWithoutPersonaInput>;
};
export type DocumentoPersonaUpdateWithWhereUniqueWithoutPersonaInput = {
    where: Prisma.DocumentoPersonaWhereUniqueInput;
    data: Prisma.XOR<Prisma.DocumentoPersonaUpdateWithoutPersonaInput, Prisma.DocumentoPersonaUncheckedUpdateWithoutPersonaInput>;
};
export type DocumentoPersonaUpdateManyWithWhereWithoutPersonaInput = {
    where: Prisma.DocumentoPersonaScalarWhereInput;
    data: Prisma.XOR<Prisma.DocumentoPersonaUpdateManyMutationInput, Prisma.DocumentoPersonaUncheckedUpdateManyWithoutPersonaInput>;
};
export type DocumentoPersonaScalarWhereInput = {
    AND?: Prisma.DocumentoPersonaScalarWhereInput | Prisma.DocumentoPersonaScalarWhereInput[];
    OR?: Prisma.DocumentoPersonaScalarWhereInput[];
    NOT?: Prisma.DocumentoPersonaScalarWhereInput | Prisma.DocumentoPersonaScalarWhereInput[];
    id?: Prisma.IntFilter<"DocumentoPersona"> | number;
    personaId?: Prisma.IntFilter<"DocumentoPersona"> | number;
    tipoDocumentoId?: Prisma.IntFilter<"DocumentoPersona"> | number;
    fechaEmision?: Prisma.DateTimeNullableFilter<"DocumentoPersona"> | Date | string | null;
    fechaVencimiento?: Prisma.DateTimeNullableFilter<"DocumentoPersona"> | Date | string | null;
    archivoUrl?: Prisma.StringNullableFilter<"DocumentoPersona"> | string | null;
    version?: Prisma.IntFilter<"DocumentoPersona"> | number;
    creadoEn?: Prisma.DateTimeFilter<"DocumentoPersona"> | Date | string;
};
export type DocumentoPersonaCreateWithoutTipoDocumentoInput = {
    fechaEmision?: Date | string | null;
    fechaVencimiento?: Date | string | null;
    archivoUrl?: string | null;
    version?: number;
    creadoEn?: Date | string;
    persona: Prisma.PersonaCreateNestedOneWithoutDocumentosInput;
};
export type DocumentoPersonaUncheckedCreateWithoutTipoDocumentoInput = {
    id?: number;
    personaId: number;
    fechaEmision?: Date | string | null;
    fechaVencimiento?: Date | string | null;
    archivoUrl?: string | null;
    version?: number;
    creadoEn?: Date | string;
};
export type DocumentoPersonaCreateOrConnectWithoutTipoDocumentoInput = {
    where: Prisma.DocumentoPersonaWhereUniqueInput;
    create: Prisma.XOR<Prisma.DocumentoPersonaCreateWithoutTipoDocumentoInput, Prisma.DocumentoPersonaUncheckedCreateWithoutTipoDocumentoInput>;
};
export type DocumentoPersonaCreateManyTipoDocumentoInputEnvelope = {
    data: Prisma.DocumentoPersonaCreateManyTipoDocumentoInput | Prisma.DocumentoPersonaCreateManyTipoDocumentoInput[];
    skipDuplicates?: boolean;
};
export type DocumentoPersonaUpsertWithWhereUniqueWithoutTipoDocumentoInput = {
    where: Prisma.DocumentoPersonaWhereUniqueInput;
    update: Prisma.XOR<Prisma.DocumentoPersonaUpdateWithoutTipoDocumentoInput, Prisma.DocumentoPersonaUncheckedUpdateWithoutTipoDocumentoInput>;
    create: Prisma.XOR<Prisma.DocumentoPersonaCreateWithoutTipoDocumentoInput, Prisma.DocumentoPersonaUncheckedCreateWithoutTipoDocumentoInput>;
};
export type DocumentoPersonaUpdateWithWhereUniqueWithoutTipoDocumentoInput = {
    where: Prisma.DocumentoPersonaWhereUniqueInput;
    data: Prisma.XOR<Prisma.DocumentoPersonaUpdateWithoutTipoDocumentoInput, Prisma.DocumentoPersonaUncheckedUpdateWithoutTipoDocumentoInput>;
};
export type DocumentoPersonaUpdateManyWithWhereWithoutTipoDocumentoInput = {
    where: Prisma.DocumentoPersonaScalarWhereInput;
    data: Prisma.XOR<Prisma.DocumentoPersonaUpdateManyMutationInput, Prisma.DocumentoPersonaUncheckedUpdateManyWithoutTipoDocumentoInput>;
};
export type DocumentoPersonaCreateManyPersonaInput = {
    id?: number;
    tipoDocumentoId: number;
    fechaEmision?: Date | string | null;
    fechaVencimiento?: Date | string | null;
    archivoUrl?: string | null;
    version?: number;
    creadoEn?: Date | string;
};
export type DocumentoPersonaUpdateWithoutPersonaInput = {
    fechaEmision?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    fechaVencimiento?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    archivoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tipoDocumento?: Prisma.TipoDocumentoUpdateOneRequiredWithoutDocumentosNestedInput;
};
export type DocumentoPersonaUncheckedUpdateWithoutPersonaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoDocumentoId?: Prisma.IntFieldUpdateOperationsInput | number;
    fechaEmision?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    fechaVencimiento?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    archivoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DocumentoPersonaUncheckedUpdateManyWithoutPersonaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoDocumentoId?: Prisma.IntFieldUpdateOperationsInput | number;
    fechaEmision?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    fechaVencimiento?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    archivoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DocumentoPersonaCreateManyTipoDocumentoInput = {
    id?: number;
    personaId: number;
    fechaEmision?: Date | string | null;
    fechaVencimiento?: Date | string | null;
    archivoUrl?: string | null;
    version?: number;
    creadoEn?: Date | string;
};
export type DocumentoPersonaUpdateWithoutTipoDocumentoInput = {
    fechaEmision?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    fechaVencimiento?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    archivoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    persona?: Prisma.PersonaUpdateOneRequiredWithoutDocumentosNestedInput;
};
export type DocumentoPersonaUncheckedUpdateWithoutTipoDocumentoInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personaId?: Prisma.IntFieldUpdateOperationsInput | number;
    fechaEmision?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    fechaVencimiento?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    archivoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DocumentoPersonaUncheckedUpdateManyWithoutTipoDocumentoInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personaId?: Prisma.IntFieldUpdateOperationsInput | number;
    fechaEmision?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    fechaVencimiento?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    archivoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    version?: Prisma.IntFieldUpdateOperationsInput | number;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DocumentoPersonaSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    personaId?: boolean;
    tipoDocumentoId?: boolean;
    fechaEmision?: boolean;
    fechaVencimiento?: boolean;
    archivoUrl?: boolean;
    version?: boolean;
    creadoEn?: boolean;
    persona?: boolean | Prisma.PersonaDefaultArgs<ExtArgs>;
    tipoDocumento?: boolean | Prisma.TipoDocumentoDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["documentoPersona"]>;
export type DocumentoPersonaSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    personaId?: boolean;
    tipoDocumentoId?: boolean;
    fechaEmision?: boolean;
    fechaVencimiento?: boolean;
    archivoUrl?: boolean;
    version?: boolean;
    creadoEn?: boolean;
    persona?: boolean | Prisma.PersonaDefaultArgs<ExtArgs>;
    tipoDocumento?: boolean | Prisma.TipoDocumentoDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["documentoPersona"]>;
export type DocumentoPersonaSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    personaId?: boolean;
    tipoDocumentoId?: boolean;
    fechaEmision?: boolean;
    fechaVencimiento?: boolean;
    archivoUrl?: boolean;
    version?: boolean;
    creadoEn?: boolean;
    persona?: boolean | Prisma.PersonaDefaultArgs<ExtArgs>;
    tipoDocumento?: boolean | Prisma.TipoDocumentoDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["documentoPersona"]>;
export type DocumentoPersonaSelectScalar = {
    id?: boolean;
    personaId?: boolean;
    tipoDocumentoId?: boolean;
    fechaEmision?: boolean;
    fechaVencimiento?: boolean;
    archivoUrl?: boolean;
    version?: boolean;
    creadoEn?: boolean;
};
export type DocumentoPersonaOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "personaId" | "tipoDocumentoId" | "fechaEmision" | "fechaVencimiento" | "archivoUrl" | "version" | "creadoEn", ExtArgs["result"]["documentoPersona"]>;
export type DocumentoPersonaInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    persona?: boolean | Prisma.PersonaDefaultArgs<ExtArgs>;
    tipoDocumento?: boolean | Prisma.TipoDocumentoDefaultArgs<ExtArgs>;
};
export type DocumentoPersonaIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    persona?: boolean | Prisma.PersonaDefaultArgs<ExtArgs>;
    tipoDocumento?: boolean | Prisma.TipoDocumentoDefaultArgs<ExtArgs>;
};
export type DocumentoPersonaIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    persona?: boolean | Prisma.PersonaDefaultArgs<ExtArgs>;
    tipoDocumento?: boolean | Prisma.TipoDocumentoDefaultArgs<ExtArgs>;
};
export type $DocumentoPersonaPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "DocumentoPersona";
    objects: {
        persona: Prisma.$PersonaPayload<ExtArgs>;
        tipoDocumento: Prisma.$TipoDocumentoPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        personaId: number;
        tipoDocumentoId: number;
        fechaEmision: Date | null;
        fechaVencimiento: Date | null;
        archivoUrl: string | null;
        version: number;
        creadoEn: Date;
    }, ExtArgs["result"]["documentoPersona"]>;
    composites: {};
};
export type DocumentoPersonaGetPayload<S extends boolean | null | undefined | DocumentoPersonaDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$DocumentoPersonaPayload, S>;
export type DocumentoPersonaCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<DocumentoPersonaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: DocumentoPersonaCountAggregateInputType | true;
};
export interface DocumentoPersonaDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['DocumentoPersona'];
        meta: {
            name: 'DocumentoPersona';
        };
    };
    findUnique<T extends DocumentoPersonaFindUniqueArgs>(args: Prisma.SelectSubset<T, DocumentoPersonaFindUniqueArgs<ExtArgs>>): Prisma.Prisma__DocumentoPersonaClient<runtime.Types.Result.GetResult<Prisma.$DocumentoPersonaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends DocumentoPersonaFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, DocumentoPersonaFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__DocumentoPersonaClient<runtime.Types.Result.GetResult<Prisma.$DocumentoPersonaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends DocumentoPersonaFindFirstArgs>(args?: Prisma.SelectSubset<T, DocumentoPersonaFindFirstArgs<ExtArgs>>): Prisma.Prisma__DocumentoPersonaClient<runtime.Types.Result.GetResult<Prisma.$DocumentoPersonaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends DocumentoPersonaFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, DocumentoPersonaFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__DocumentoPersonaClient<runtime.Types.Result.GetResult<Prisma.$DocumentoPersonaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends DocumentoPersonaFindManyArgs>(args?: Prisma.SelectSubset<T, DocumentoPersonaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DocumentoPersonaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends DocumentoPersonaCreateArgs>(args: Prisma.SelectSubset<T, DocumentoPersonaCreateArgs<ExtArgs>>): Prisma.Prisma__DocumentoPersonaClient<runtime.Types.Result.GetResult<Prisma.$DocumentoPersonaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends DocumentoPersonaCreateManyArgs>(args?: Prisma.SelectSubset<T, DocumentoPersonaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends DocumentoPersonaCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, DocumentoPersonaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DocumentoPersonaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends DocumentoPersonaDeleteArgs>(args: Prisma.SelectSubset<T, DocumentoPersonaDeleteArgs<ExtArgs>>): Prisma.Prisma__DocumentoPersonaClient<runtime.Types.Result.GetResult<Prisma.$DocumentoPersonaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends DocumentoPersonaUpdateArgs>(args: Prisma.SelectSubset<T, DocumentoPersonaUpdateArgs<ExtArgs>>): Prisma.Prisma__DocumentoPersonaClient<runtime.Types.Result.GetResult<Prisma.$DocumentoPersonaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends DocumentoPersonaDeleteManyArgs>(args?: Prisma.SelectSubset<T, DocumentoPersonaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends DocumentoPersonaUpdateManyArgs>(args: Prisma.SelectSubset<T, DocumentoPersonaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends DocumentoPersonaUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, DocumentoPersonaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DocumentoPersonaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends DocumentoPersonaUpsertArgs>(args: Prisma.SelectSubset<T, DocumentoPersonaUpsertArgs<ExtArgs>>): Prisma.Prisma__DocumentoPersonaClient<runtime.Types.Result.GetResult<Prisma.$DocumentoPersonaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends DocumentoPersonaCountArgs>(args?: Prisma.Subset<T, DocumentoPersonaCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], DocumentoPersonaCountAggregateOutputType> : number>;
    aggregate<T extends DocumentoPersonaAggregateArgs>(args: Prisma.Subset<T, DocumentoPersonaAggregateArgs>): Prisma.PrismaPromise<GetDocumentoPersonaAggregateType<T>>;
    groupBy<T extends DocumentoPersonaGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: DocumentoPersonaGroupByArgs['orderBy'];
    } : {
        orderBy?: DocumentoPersonaGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, DocumentoPersonaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDocumentoPersonaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: DocumentoPersonaFieldRefs;
}
export interface Prisma__DocumentoPersonaClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    persona<T extends Prisma.PersonaDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PersonaDefaultArgs<ExtArgs>>): Prisma.Prisma__PersonaClient<runtime.Types.Result.GetResult<Prisma.$PersonaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tipoDocumento<T extends Prisma.TipoDocumentoDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TipoDocumentoDefaultArgs<ExtArgs>>): Prisma.Prisma__TipoDocumentoClient<runtime.Types.Result.GetResult<Prisma.$TipoDocumentoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface DocumentoPersonaFieldRefs {
    readonly id: Prisma.FieldRef<"DocumentoPersona", 'Int'>;
    readonly personaId: Prisma.FieldRef<"DocumentoPersona", 'Int'>;
    readonly tipoDocumentoId: Prisma.FieldRef<"DocumentoPersona", 'Int'>;
    readonly fechaEmision: Prisma.FieldRef<"DocumentoPersona", 'DateTime'>;
    readonly fechaVencimiento: Prisma.FieldRef<"DocumentoPersona", 'DateTime'>;
    readonly archivoUrl: Prisma.FieldRef<"DocumentoPersona", 'String'>;
    readonly version: Prisma.FieldRef<"DocumentoPersona", 'Int'>;
    readonly creadoEn: Prisma.FieldRef<"DocumentoPersona", 'DateTime'>;
}
export type DocumentoPersonaFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DocumentoPersonaSelect<ExtArgs> | null;
    omit?: Prisma.DocumentoPersonaOmit<ExtArgs> | null;
    include?: Prisma.DocumentoPersonaInclude<ExtArgs> | null;
    where: Prisma.DocumentoPersonaWhereUniqueInput;
};
export type DocumentoPersonaFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DocumentoPersonaSelect<ExtArgs> | null;
    omit?: Prisma.DocumentoPersonaOmit<ExtArgs> | null;
    include?: Prisma.DocumentoPersonaInclude<ExtArgs> | null;
    where: Prisma.DocumentoPersonaWhereUniqueInput;
};
export type DocumentoPersonaFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DocumentoPersonaSelect<ExtArgs> | null;
    omit?: Prisma.DocumentoPersonaOmit<ExtArgs> | null;
    include?: Prisma.DocumentoPersonaInclude<ExtArgs> | null;
    where?: Prisma.DocumentoPersonaWhereInput;
    orderBy?: Prisma.DocumentoPersonaOrderByWithRelationInput | Prisma.DocumentoPersonaOrderByWithRelationInput[];
    cursor?: Prisma.DocumentoPersonaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DocumentoPersonaScalarFieldEnum | Prisma.DocumentoPersonaScalarFieldEnum[];
};
export type DocumentoPersonaFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DocumentoPersonaSelect<ExtArgs> | null;
    omit?: Prisma.DocumentoPersonaOmit<ExtArgs> | null;
    include?: Prisma.DocumentoPersonaInclude<ExtArgs> | null;
    where?: Prisma.DocumentoPersonaWhereInput;
    orderBy?: Prisma.DocumentoPersonaOrderByWithRelationInput | Prisma.DocumentoPersonaOrderByWithRelationInput[];
    cursor?: Prisma.DocumentoPersonaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DocumentoPersonaScalarFieldEnum | Prisma.DocumentoPersonaScalarFieldEnum[];
};
export type DocumentoPersonaFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DocumentoPersonaSelect<ExtArgs> | null;
    omit?: Prisma.DocumentoPersonaOmit<ExtArgs> | null;
    include?: Prisma.DocumentoPersonaInclude<ExtArgs> | null;
    where?: Prisma.DocumentoPersonaWhereInput;
    orderBy?: Prisma.DocumentoPersonaOrderByWithRelationInput | Prisma.DocumentoPersonaOrderByWithRelationInput[];
    cursor?: Prisma.DocumentoPersonaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DocumentoPersonaScalarFieldEnum | Prisma.DocumentoPersonaScalarFieldEnum[];
};
export type DocumentoPersonaCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DocumentoPersonaSelect<ExtArgs> | null;
    omit?: Prisma.DocumentoPersonaOmit<ExtArgs> | null;
    include?: Prisma.DocumentoPersonaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DocumentoPersonaCreateInput, Prisma.DocumentoPersonaUncheckedCreateInput>;
};
export type DocumentoPersonaCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.DocumentoPersonaCreateManyInput | Prisma.DocumentoPersonaCreateManyInput[];
    skipDuplicates?: boolean;
};
export type DocumentoPersonaCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DocumentoPersonaSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.DocumentoPersonaOmit<ExtArgs> | null;
    data: Prisma.DocumentoPersonaCreateManyInput | Prisma.DocumentoPersonaCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.DocumentoPersonaIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type DocumentoPersonaUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DocumentoPersonaSelect<ExtArgs> | null;
    omit?: Prisma.DocumentoPersonaOmit<ExtArgs> | null;
    include?: Prisma.DocumentoPersonaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DocumentoPersonaUpdateInput, Prisma.DocumentoPersonaUncheckedUpdateInput>;
    where: Prisma.DocumentoPersonaWhereUniqueInput;
};
export type DocumentoPersonaUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.DocumentoPersonaUpdateManyMutationInput, Prisma.DocumentoPersonaUncheckedUpdateManyInput>;
    where?: Prisma.DocumentoPersonaWhereInput;
    limit?: number;
};
export type DocumentoPersonaUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DocumentoPersonaSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.DocumentoPersonaOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DocumentoPersonaUpdateManyMutationInput, Prisma.DocumentoPersonaUncheckedUpdateManyInput>;
    where?: Prisma.DocumentoPersonaWhereInput;
    limit?: number;
    include?: Prisma.DocumentoPersonaIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type DocumentoPersonaUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DocumentoPersonaSelect<ExtArgs> | null;
    omit?: Prisma.DocumentoPersonaOmit<ExtArgs> | null;
    include?: Prisma.DocumentoPersonaInclude<ExtArgs> | null;
    where: Prisma.DocumentoPersonaWhereUniqueInput;
    create: Prisma.XOR<Prisma.DocumentoPersonaCreateInput, Prisma.DocumentoPersonaUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.DocumentoPersonaUpdateInput, Prisma.DocumentoPersonaUncheckedUpdateInput>;
};
export type DocumentoPersonaDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DocumentoPersonaSelect<ExtArgs> | null;
    omit?: Prisma.DocumentoPersonaOmit<ExtArgs> | null;
    include?: Prisma.DocumentoPersonaInclude<ExtArgs> | null;
    where: Prisma.DocumentoPersonaWhereUniqueInput;
};
export type DocumentoPersonaDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DocumentoPersonaWhereInput;
    limit?: number;
};
export type DocumentoPersonaDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DocumentoPersonaSelect<ExtArgs> | null;
    omit?: Prisma.DocumentoPersonaOmit<ExtArgs> | null;
    include?: Prisma.DocumentoPersonaInclude<ExtArgs> | null;
};
