import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type EventoAccesoModel = runtime.Types.Result.DefaultSelection<Prisma.$EventoAccesoPayload>;
export type AggregateEventoAcceso = {
    _count: EventoAccesoCountAggregateOutputType | null;
    _avg: EventoAccesoAvgAggregateOutputType | null;
    _sum: EventoAccesoSumAggregateOutputType | null;
    _min: EventoAccesoMinAggregateOutputType | null;
    _max: EventoAccesoMaxAggregateOutputType | null;
};
export type EventoAccesoAvgAggregateOutputType = {
    id: number | null;
    personaId: number | null;
};
export type EventoAccesoSumAggregateOutputType = {
    id: number | null;
    personaId: number | null;
};
export type EventoAccesoMinAggregateOutputType = {
    id: number | null;
    personaId: number | null;
    tipoMovimiento: $Enums.TipoMovimiento | null;
    resultado: $Enums.ResultadoAcceso | null;
    denegadoPorBaja: boolean | null;
    denegadoPorAlcohol: boolean | null;
    denegadoPorDocumentos: boolean | null;
    denegadoSinDocumentos: boolean | null;
    fechaHora: Date | null;
    torniqueteId: string | null;
};
export type EventoAccesoMaxAggregateOutputType = {
    id: number | null;
    personaId: number | null;
    tipoMovimiento: $Enums.TipoMovimiento | null;
    resultado: $Enums.ResultadoAcceso | null;
    denegadoPorBaja: boolean | null;
    denegadoPorAlcohol: boolean | null;
    denegadoPorDocumentos: boolean | null;
    denegadoSinDocumentos: boolean | null;
    fechaHora: Date | null;
    torniqueteId: string | null;
};
export type EventoAccesoCountAggregateOutputType = {
    id: number;
    personaId: number;
    tipoMovimiento: number;
    resultado: number;
    denegadoPorBaja: number;
    denegadoPorAlcohol: number;
    denegadoPorDocumentos: number;
    denegadoSinDocumentos: number;
    fechaHora: number;
    torniqueteId: number;
    _all: number;
};
export type EventoAccesoAvgAggregateInputType = {
    id?: true;
    personaId?: true;
};
export type EventoAccesoSumAggregateInputType = {
    id?: true;
    personaId?: true;
};
export type EventoAccesoMinAggregateInputType = {
    id?: true;
    personaId?: true;
    tipoMovimiento?: true;
    resultado?: true;
    denegadoPorBaja?: true;
    denegadoPorAlcohol?: true;
    denegadoPorDocumentos?: true;
    denegadoSinDocumentos?: true;
    fechaHora?: true;
    torniqueteId?: true;
};
export type EventoAccesoMaxAggregateInputType = {
    id?: true;
    personaId?: true;
    tipoMovimiento?: true;
    resultado?: true;
    denegadoPorBaja?: true;
    denegadoPorAlcohol?: true;
    denegadoPorDocumentos?: true;
    denegadoSinDocumentos?: true;
    fechaHora?: true;
    torniqueteId?: true;
};
export type EventoAccesoCountAggregateInputType = {
    id?: true;
    personaId?: true;
    tipoMovimiento?: true;
    resultado?: true;
    denegadoPorBaja?: true;
    denegadoPorAlcohol?: true;
    denegadoPorDocumentos?: true;
    denegadoSinDocumentos?: true;
    fechaHora?: true;
    torniqueteId?: true;
    _all?: true;
};
export type EventoAccesoAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EventoAccesoWhereInput;
    orderBy?: Prisma.EventoAccesoOrderByWithRelationInput | Prisma.EventoAccesoOrderByWithRelationInput[];
    cursor?: Prisma.EventoAccesoWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | EventoAccesoCountAggregateInputType;
    _avg?: EventoAccesoAvgAggregateInputType;
    _sum?: EventoAccesoSumAggregateInputType;
    _min?: EventoAccesoMinAggregateInputType;
    _max?: EventoAccesoMaxAggregateInputType;
};
export type GetEventoAccesoAggregateType<T extends EventoAccesoAggregateArgs> = {
    [P in keyof T & keyof AggregateEventoAcceso]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateEventoAcceso[P]> : Prisma.GetScalarType<T[P], AggregateEventoAcceso[P]>;
};
export type EventoAccesoGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EventoAccesoWhereInput;
    orderBy?: Prisma.EventoAccesoOrderByWithAggregationInput | Prisma.EventoAccesoOrderByWithAggregationInput[];
    by: Prisma.EventoAccesoScalarFieldEnum[] | Prisma.EventoAccesoScalarFieldEnum;
    having?: Prisma.EventoAccesoScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: EventoAccesoCountAggregateInputType | true;
    _avg?: EventoAccesoAvgAggregateInputType;
    _sum?: EventoAccesoSumAggregateInputType;
    _min?: EventoAccesoMinAggregateInputType;
    _max?: EventoAccesoMaxAggregateInputType;
};
export type EventoAccesoGroupByOutputType = {
    id: number;
    personaId: number;
    tipoMovimiento: $Enums.TipoMovimiento;
    resultado: $Enums.ResultadoAcceso;
    denegadoPorBaja: boolean;
    denegadoPorAlcohol: boolean;
    denegadoPorDocumentos: boolean;
    denegadoSinDocumentos: boolean;
    fechaHora: Date;
    torniqueteId: string | null;
    _count: EventoAccesoCountAggregateOutputType | null;
    _avg: EventoAccesoAvgAggregateOutputType | null;
    _sum: EventoAccesoSumAggregateOutputType | null;
    _min: EventoAccesoMinAggregateOutputType | null;
    _max: EventoAccesoMaxAggregateOutputType | null;
};
export type GetEventoAccesoGroupByPayload<T extends EventoAccesoGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<EventoAccesoGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof EventoAccesoGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], EventoAccesoGroupByOutputType[P]> : Prisma.GetScalarType<T[P], EventoAccesoGroupByOutputType[P]>;
}>>;
export type EventoAccesoWhereInput = {
    AND?: Prisma.EventoAccesoWhereInput | Prisma.EventoAccesoWhereInput[];
    OR?: Prisma.EventoAccesoWhereInput[];
    NOT?: Prisma.EventoAccesoWhereInput | Prisma.EventoAccesoWhereInput[];
    id?: Prisma.IntFilter<"EventoAcceso"> | number;
    personaId?: Prisma.IntFilter<"EventoAcceso"> | number;
    tipoMovimiento?: Prisma.EnumTipoMovimientoFilter<"EventoAcceso"> | $Enums.TipoMovimiento;
    resultado?: Prisma.EnumResultadoAccesoFilter<"EventoAcceso"> | $Enums.ResultadoAcceso;
    denegadoPorBaja?: Prisma.BoolFilter<"EventoAcceso"> | boolean;
    denegadoPorAlcohol?: Prisma.BoolFilter<"EventoAcceso"> | boolean;
    denegadoPorDocumentos?: Prisma.BoolFilter<"EventoAcceso"> | boolean;
    denegadoSinDocumentos?: Prisma.BoolFilter<"EventoAcceso"> | boolean;
    fechaHora?: Prisma.DateTimeFilter<"EventoAcceso"> | Date | string;
    torniqueteId?: Prisma.StringNullableFilter<"EventoAcceso"> | string | null;
    persona?: Prisma.XOR<Prisma.PersonaScalarRelationFilter, Prisma.PersonaWhereInput>;
};
export type EventoAccesoOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    personaId?: Prisma.SortOrder;
    tipoMovimiento?: Prisma.SortOrder;
    resultado?: Prisma.SortOrder;
    denegadoPorBaja?: Prisma.SortOrder;
    denegadoPorAlcohol?: Prisma.SortOrder;
    denegadoPorDocumentos?: Prisma.SortOrder;
    denegadoSinDocumentos?: Prisma.SortOrder;
    fechaHora?: Prisma.SortOrder;
    torniqueteId?: Prisma.SortOrderInput | Prisma.SortOrder;
    persona?: Prisma.PersonaOrderByWithRelationInput;
};
export type EventoAccesoWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.EventoAccesoWhereInput | Prisma.EventoAccesoWhereInput[];
    OR?: Prisma.EventoAccesoWhereInput[];
    NOT?: Prisma.EventoAccesoWhereInput | Prisma.EventoAccesoWhereInput[];
    personaId?: Prisma.IntFilter<"EventoAcceso"> | number;
    tipoMovimiento?: Prisma.EnumTipoMovimientoFilter<"EventoAcceso"> | $Enums.TipoMovimiento;
    resultado?: Prisma.EnumResultadoAccesoFilter<"EventoAcceso"> | $Enums.ResultadoAcceso;
    denegadoPorBaja?: Prisma.BoolFilter<"EventoAcceso"> | boolean;
    denegadoPorAlcohol?: Prisma.BoolFilter<"EventoAcceso"> | boolean;
    denegadoPorDocumentos?: Prisma.BoolFilter<"EventoAcceso"> | boolean;
    denegadoSinDocumentos?: Prisma.BoolFilter<"EventoAcceso"> | boolean;
    fechaHora?: Prisma.DateTimeFilter<"EventoAcceso"> | Date | string;
    torniqueteId?: Prisma.StringNullableFilter<"EventoAcceso"> | string | null;
    persona?: Prisma.XOR<Prisma.PersonaScalarRelationFilter, Prisma.PersonaWhereInput>;
}, "id">;
export type EventoAccesoOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    personaId?: Prisma.SortOrder;
    tipoMovimiento?: Prisma.SortOrder;
    resultado?: Prisma.SortOrder;
    denegadoPorBaja?: Prisma.SortOrder;
    denegadoPorAlcohol?: Prisma.SortOrder;
    denegadoPorDocumentos?: Prisma.SortOrder;
    denegadoSinDocumentos?: Prisma.SortOrder;
    fechaHora?: Prisma.SortOrder;
    torniqueteId?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.EventoAccesoCountOrderByAggregateInput;
    _avg?: Prisma.EventoAccesoAvgOrderByAggregateInput;
    _max?: Prisma.EventoAccesoMaxOrderByAggregateInput;
    _min?: Prisma.EventoAccesoMinOrderByAggregateInput;
    _sum?: Prisma.EventoAccesoSumOrderByAggregateInput;
};
export type EventoAccesoScalarWhereWithAggregatesInput = {
    AND?: Prisma.EventoAccesoScalarWhereWithAggregatesInput | Prisma.EventoAccesoScalarWhereWithAggregatesInput[];
    OR?: Prisma.EventoAccesoScalarWhereWithAggregatesInput[];
    NOT?: Prisma.EventoAccesoScalarWhereWithAggregatesInput | Prisma.EventoAccesoScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"EventoAcceso"> | number;
    personaId?: Prisma.IntWithAggregatesFilter<"EventoAcceso"> | number;
    tipoMovimiento?: Prisma.EnumTipoMovimientoWithAggregatesFilter<"EventoAcceso"> | $Enums.TipoMovimiento;
    resultado?: Prisma.EnumResultadoAccesoWithAggregatesFilter<"EventoAcceso"> | $Enums.ResultadoAcceso;
    denegadoPorBaja?: Prisma.BoolWithAggregatesFilter<"EventoAcceso"> | boolean;
    denegadoPorAlcohol?: Prisma.BoolWithAggregatesFilter<"EventoAcceso"> | boolean;
    denegadoPorDocumentos?: Prisma.BoolWithAggregatesFilter<"EventoAcceso"> | boolean;
    denegadoSinDocumentos?: Prisma.BoolWithAggregatesFilter<"EventoAcceso"> | boolean;
    fechaHora?: Prisma.DateTimeWithAggregatesFilter<"EventoAcceso"> | Date | string;
    torniqueteId?: Prisma.StringNullableWithAggregatesFilter<"EventoAcceso"> | string | null;
};
export type EventoAccesoCreateInput = {
    tipoMovimiento: $Enums.TipoMovimiento;
    resultado: $Enums.ResultadoAcceso;
    denegadoPorBaja?: boolean;
    denegadoPorAlcohol?: boolean;
    denegadoPorDocumentos?: boolean;
    denegadoSinDocumentos?: boolean;
    fechaHora?: Date | string;
    torniqueteId?: string | null;
    persona: Prisma.PersonaCreateNestedOneWithoutEventosAccesoInput;
};
export type EventoAccesoUncheckedCreateInput = {
    id?: number;
    personaId: number;
    tipoMovimiento: $Enums.TipoMovimiento;
    resultado: $Enums.ResultadoAcceso;
    denegadoPorBaja?: boolean;
    denegadoPorAlcohol?: boolean;
    denegadoPorDocumentos?: boolean;
    denegadoSinDocumentos?: boolean;
    fechaHora?: Date | string;
    torniqueteId?: string | null;
};
export type EventoAccesoUpdateInput = {
    tipoMovimiento?: Prisma.EnumTipoMovimientoFieldUpdateOperationsInput | $Enums.TipoMovimiento;
    resultado?: Prisma.EnumResultadoAccesoFieldUpdateOperationsInput | $Enums.ResultadoAcceso;
    denegadoPorBaja?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    denegadoPorAlcohol?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    denegadoPorDocumentos?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    denegadoSinDocumentos?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    torniqueteId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    persona?: Prisma.PersonaUpdateOneRequiredWithoutEventosAccesoNestedInput;
};
export type EventoAccesoUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personaId?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoMovimiento?: Prisma.EnumTipoMovimientoFieldUpdateOperationsInput | $Enums.TipoMovimiento;
    resultado?: Prisma.EnumResultadoAccesoFieldUpdateOperationsInput | $Enums.ResultadoAcceso;
    denegadoPorBaja?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    denegadoPorAlcohol?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    denegadoPorDocumentos?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    denegadoSinDocumentos?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    torniqueteId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EventoAccesoCreateManyInput = {
    id?: number;
    personaId: number;
    tipoMovimiento: $Enums.TipoMovimiento;
    resultado: $Enums.ResultadoAcceso;
    denegadoPorBaja?: boolean;
    denegadoPorAlcohol?: boolean;
    denegadoPorDocumentos?: boolean;
    denegadoSinDocumentos?: boolean;
    fechaHora?: Date | string;
    torniqueteId?: string | null;
};
export type EventoAccesoUpdateManyMutationInput = {
    tipoMovimiento?: Prisma.EnumTipoMovimientoFieldUpdateOperationsInput | $Enums.TipoMovimiento;
    resultado?: Prisma.EnumResultadoAccesoFieldUpdateOperationsInput | $Enums.ResultadoAcceso;
    denegadoPorBaja?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    denegadoPorAlcohol?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    denegadoPorDocumentos?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    denegadoSinDocumentos?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    torniqueteId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EventoAccesoUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personaId?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoMovimiento?: Prisma.EnumTipoMovimientoFieldUpdateOperationsInput | $Enums.TipoMovimiento;
    resultado?: Prisma.EnumResultadoAccesoFieldUpdateOperationsInput | $Enums.ResultadoAcceso;
    denegadoPorBaja?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    denegadoPorAlcohol?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    denegadoPorDocumentos?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    denegadoSinDocumentos?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    torniqueteId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EventoAccesoListRelationFilter = {
    every?: Prisma.EventoAccesoWhereInput;
    some?: Prisma.EventoAccesoWhereInput;
    none?: Prisma.EventoAccesoWhereInput;
};
export type EventoAccesoOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type EventoAccesoCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personaId?: Prisma.SortOrder;
    tipoMovimiento?: Prisma.SortOrder;
    resultado?: Prisma.SortOrder;
    denegadoPorBaja?: Prisma.SortOrder;
    denegadoPorAlcohol?: Prisma.SortOrder;
    denegadoPorDocumentos?: Prisma.SortOrder;
    denegadoSinDocumentos?: Prisma.SortOrder;
    fechaHora?: Prisma.SortOrder;
    torniqueteId?: Prisma.SortOrder;
};
export type EventoAccesoAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personaId?: Prisma.SortOrder;
};
export type EventoAccesoMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personaId?: Prisma.SortOrder;
    tipoMovimiento?: Prisma.SortOrder;
    resultado?: Prisma.SortOrder;
    denegadoPorBaja?: Prisma.SortOrder;
    denegadoPorAlcohol?: Prisma.SortOrder;
    denegadoPorDocumentos?: Prisma.SortOrder;
    denegadoSinDocumentos?: Prisma.SortOrder;
    fechaHora?: Prisma.SortOrder;
    torniqueteId?: Prisma.SortOrder;
};
export type EventoAccesoMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personaId?: Prisma.SortOrder;
    tipoMovimiento?: Prisma.SortOrder;
    resultado?: Prisma.SortOrder;
    denegadoPorBaja?: Prisma.SortOrder;
    denegadoPorAlcohol?: Prisma.SortOrder;
    denegadoPorDocumentos?: Prisma.SortOrder;
    denegadoSinDocumentos?: Prisma.SortOrder;
    fechaHora?: Prisma.SortOrder;
    torniqueteId?: Prisma.SortOrder;
};
export type EventoAccesoSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personaId?: Prisma.SortOrder;
};
export type EventoAccesoCreateNestedManyWithoutPersonaInput = {
    create?: Prisma.XOR<Prisma.EventoAccesoCreateWithoutPersonaInput, Prisma.EventoAccesoUncheckedCreateWithoutPersonaInput> | Prisma.EventoAccesoCreateWithoutPersonaInput[] | Prisma.EventoAccesoUncheckedCreateWithoutPersonaInput[];
    connectOrCreate?: Prisma.EventoAccesoCreateOrConnectWithoutPersonaInput | Prisma.EventoAccesoCreateOrConnectWithoutPersonaInput[];
    createMany?: Prisma.EventoAccesoCreateManyPersonaInputEnvelope;
    connect?: Prisma.EventoAccesoWhereUniqueInput | Prisma.EventoAccesoWhereUniqueInput[];
};
export type EventoAccesoUncheckedCreateNestedManyWithoutPersonaInput = {
    create?: Prisma.XOR<Prisma.EventoAccesoCreateWithoutPersonaInput, Prisma.EventoAccesoUncheckedCreateWithoutPersonaInput> | Prisma.EventoAccesoCreateWithoutPersonaInput[] | Prisma.EventoAccesoUncheckedCreateWithoutPersonaInput[];
    connectOrCreate?: Prisma.EventoAccesoCreateOrConnectWithoutPersonaInput | Prisma.EventoAccesoCreateOrConnectWithoutPersonaInput[];
    createMany?: Prisma.EventoAccesoCreateManyPersonaInputEnvelope;
    connect?: Prisma.EventoAccesoWhereUniqueInput | Prisma.EventoAccesoWhereUniqueInput[];
};
export type EventoAccesoUpdateManyWithoutPersonaNestedInput = {
    create?: Prisma.XOR<Prisma.EventoAccesoCreateWithoutPersonaInput, Prisma.EventoAccesoUncheckedCreateWithoutPersonaInput> | Prisma.EventoAccesoCreateWithoutPersonaInput[] | Prisma.EventoAccesoUncheckedCreateWithoutPersonaInput[];
    connectOrCreate?: Prisma.EventoAccesoCreateOrConnectWithoutPersonaInput | Prisma.EventoAccesoCreateOrConnectWithoutPersonaInput[];
    upsert?: Prisma.EventoAccesoUpsertWithWhereUniqueWithoutPersonaInput | Prisma.EventoAccesoUpsertWithWhereUniqueWithoutPersonaInput[];
    createMany?: Prisma.EventoAccesoCreateManyPersonaInputEnvelope;
    set?: Prisma.EventoAccesoWhereUniqueInput | Prisma.EventoAccesoWhereUniqueInput[];
    disconnect?: Prisma.EventoAccesoWhereUniqueInput | Prisma.EventoAccesoWhereUniqueInput[];
    delete?: Prisma.EventoAccesoWhereUniqueInput | Prisma.EventoAccesoWhereUniqueInput[];
    connect?: Prisma.EventoAccesoWhereUniqueInput | Prisma.EventoAccesoWhereUniqueInput[];
    update?: Prisma.EventoAccesoUpdateWithWhereUniqueWithoutPersonaInput | Prisma.EventoAccesoUpdateWithWhereUniqueWithoutPersonaInput[];
    updateMany?: Prisma.EventoAccesoUpdateManyWithWhereWithoutPersonaInput | Prisma.EventoAccesoUpdateManyWithWhereWithoutPersonaInput[];
    deleteMany?: Prisma.EventoAccesoScalarWhereInput | Prisma.EventoAccesoScalarWhereInput[];
};
export type EventoAccesoUncheckedUpdateManyWithoutPersonaNestedInput = {
    create?: Prisma.XOR<Prisma.EventoAccesoCreateWithoutPersonaInput, Prisma.EventoAccesoUncheckedCreateWithoutPersonaInput> | Prisma.EventoAccesoCreateWithoutPersonaInput[] | Prisma.EventoAccesoUncheckedCreateWithoutPersonaInput[];
    connectOrCreate?: Prisma.EventoAccesoCreateOrConnectWithoutPersonaInput | Prisma.EventoAccesoCreateOrConnectWithoutPersonaInput[];
    upsert?: Prisma.EventoAccesoUpsertWithWhereUniqueWithoutPersonaInput | Prisma.EventoAccesoUpsertWithWhereUniqueWithoutPersonaInput[];
    createMany?: Prisma.EventoAccesoCreateManyPersonaInputEnvelope;
    set?: Prisma.EventoAccesoWhereUniqueInput | Prisma.EventoAccesoWhereUniqueInput[];
    disconnect?: Prisma.EventoAccesoWhereUniqueInput | Prisma.EventoAccesoWhereUniqueInput[];
    delete?: Prisma.EventoAccesoWhereUniqueInput | Prisma.EventoAccesoWhereUniqueInput[];
    connect?: Prisma.EventoAccesoWhereUniqueInput | Prisma.EventoAccesoWhereUniqueInput[];
    update?: Prisma.EventoAccesoUpdateWithWhereUniqueWithoutPersonaInput | Prisma.EventoAccesoUpdateWithWhereUniqueWithoutPersonaInput[];
    updateMany?: Prisma.EventoAccesoUpdateManyWithWhereWithoutPersonaInput | Prisma.EventoAccesoUpdateManyWithWhereWithoutPersonaInput[];
    deleteMany?: Prisma.EventoAccesoScalarWhereInput | Prisma.EventoAccesoScalarWhereInput[];
};
export type EnumTipoMovimientoFieldUpdateOperationsInput = {
    set?: $Enums.TipoMovimiento;
};
export type EnumResultadoAccesoFieldUpdateOperationsInput = {
    set?: $Enums.ResultadoAcceso;
};
export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
};
export type EventoAccesoCreateWithoutPersonaInput = {
    tipoMovimiento: $Enums.TipoMovimiento;
    resultado: $Enums.ResultadoAcceso;
    denegadoPorBaja?: boolean;
    denegadoPorAlcohol?: boolean;
    denegadoPorDocumentos?: boolean;
    denegadoSinDocumentos?: boolean;
    fechaHora?: Date | string;
    torniqueteId?: string | null;
};
export type EventoAccesoUncheckedCreateWithoutPersonaInput = {
    id?: number;
    tipoMovimiento: $Enums.TipoMovimiento;
    resultado: $Enums.ResultadoAcceso;
    denegadoPorBaja?: boolean;
    denegadoPorAlcohol?: boolean;
    denegadoPorDocumentos?: boolean;
    denegadoSinDocumentos?: boolean;
    fechaHora?: Date | string;
    torniqueteId?: string | null;
};
export type EventoAccesoCreateOrConnectWithoutPersonaInput = {
    where: Prisma.EventoAccesoWhereUniqueInput;
    create: Prisma.XOR<Prisma.EventoAccesoCreateWithoutPersonaInput, Prisma.EventoAccesoUncheckedCreateWithoutPersonaInput>;
};
export type EventoAccesoCreateManyPersonaInputEnvelope = {
    data: Prisma.EventoAccesoCreateManyPersonaInput | Prisma.EventoAccesoCreateManyPersonaInput[];
    skipDuplicates?: boolean;
};
export type EventoAccesoUpsertWithWhereUniqueWithoutPersonaInput = {
    where: Prisma.EventoAccesoWhereUniqueInput;
    update: Prisma.XOR<Prisma.EventoAccesoUpdateWithoutPersonaInput, Prisma.EventoAccesoUncheckedUpdateWithoutPersonaInput>;
    create: Prisma.XOR<Prisma.EventoAccesoCreateWithoutPersonaInput, Prisma.EventoAccesoUncheckedCreateWithoutPersonaInput>;
};
export type EventoAccesoUpdateWithWhereUniqueWithoutPersonaInput = {
    where: Prisma.EventoAccesoWhereUniqueInput;
    data: Prisma.XOR<Prisma.EventoAccesoUpdateWithoutPersonaInput, Prisma.EventoAccesoUncheckedUpdateWithoutPersonaInput>;
};
export type EventoAccesoUpdateManyWithWhereWithoutPersonaInput = {
    where: Prisma.EventoAccesoScalarWhereInput;
    data: Prisma.XOR<Prisma.EventoAccesoUpdateManyMutationInput, Prisma.EventoAccesoUncheckedUpdateManyWithoutPersonaInput>;
};
export type EventoAccesoScalarWhereInput = {
    AND?: Prisma.EventoAccesoScalarWhereInput | Prisma.EventoAccesoScalarWhereInput[];
    OR?: Prisma.EventoAccesoScalarWhereInput[];
    NOT?: Prisma.EventoAccesoScalarWhereInput | Prisma.EventoAccesoScalarWhereInput[];
    id?: Prisma.IntFilter<"EventoAcceso"> | number;
    personaId?: Prisma.IntFilter<"EventoAcceso"> | number;
    tipoMovimiento?: Prisma.EnumTipoMovimientoFilter<"EventoAcceso"> | $Enums.TipoMovimiento;
    resultado?: Prisma.EnumResultadoAccesoFilter<"EventoAcceso"> | $Enums.ResultadoAcceso;
    denegadoPorBaja?: Prisma.BoolFilter<"EventoAcceso"> | boolean;
    denegadoPorAlcohol?: Prisma.BoolFilter<"EventoAcceso"> | boolean;
    denegadoPorDocumentos?: Prisma.BoolFilter<"EventoAcceso"> | boolean;
    denegadoSinDocumentos?: Prisma.BoolFilter<"EventoAcceso"> | boolean;
    fechaHora?: Prisma.DateTimeFilter<"EventoAcceso"> | Date | string;
    torniqueteId?: Prisma.StringNullableFilter<"EventoAcceso"> | string | null;
};
export type EventoAccesoCreateManyPersonaInput = {
    id?: number;
    tipoMovimiento: $Enums.TipoMovimiento;
    resultado: $Enums.ResultadoAcceso;
    denegadoPorBaja?: boolean;
    denegadoPorAlcohol?: boolean;
    denegadoPorDocumentos?: boolean;
    denegadoSinDocumentos?: boolean;
    fechaHora?: Date | string;
    torniqueteId?: string | null;
};
export type EventoAccesoUpdateWithoutPersonaInput = {
    tipoMovimiento?: Prisma.EnumTipoMovimientoFieldUpdateOperationsInput | $Enums.TipoMovimiento;
    resultado?: Prisma.EnumResultadoAccesoFieldUpdateOperationsInput | $Enums.ResultadoAcceso;
    denegadoPorBaja?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    denegadoPorAlcohol?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    denegadoPorDocumentos?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    denegadoSinDocumentos?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    torniqueteId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EventoAccesoUncheckedUpdateWithoutPersonaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoMovimiento?: Prisma.EnumTipoMovimientoFieldUpdateOperationsInput | $Enums.TipoMovimiento;
    resultado?: Prisma.EnumResultadoAccesoFieldUpdateOperationsInput | $Enums.ResultadoAcceso;
    denegadoPorBaja?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    denegadoPorAlcohol?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    denegadoPorDocumentos?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    denegadoSinDocumentos?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    torniqueteId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EventoAccesoUncheckedUpdateManyWithoutPersonaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoMovimiento?: Prisma.EnumTipoMovimientoFieldUpdateOperationsInput | $Enums.TipoMovimiento;
    resultado?: Prisma.EnumResultadoAccesoFieldUpdateOperationsInput | $Enums.ResultadoAcceso;
    denegadoPorBaja?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    denegadoPorAlcohol?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    denegadoPorDocumentos?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    denegadoSinDocumentos?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    torniqueteId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type EventoAccesoSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    personaId?: boolean;
    tipoMovimiento?: boolean;
    resultado?: boolean;
    denegadoPorBaja?: boolean;
    denegadoPorAlcohol?: boolean;
    denegadoPorDocumentos?: boolean;
    denegadoSinDocumentos?: boolean;
    fechaHora?: boolean;
    torniqueteId?: boolean;
    persona?: boolean | Prisma.PersonaDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["eventoAcceso"]>;
export type EventoAccesoSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    personaId?: boolean;
    tipoMovimiento?: boolean;
    resultado?: boolean;
    denegadoPorBaja?: boolean;
    denegadoPorAlcohol?: boolean;
    denegadoPorDocumentos?: boolean;
    denegadoSinDocumentos?: boolean;
    fechaHora?: boolean;
    torniqueteId?: boolean;
    persona?: boolean | Prisma.PersonaDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["eventoAcceso"]>;
export type EventoAccesoSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    personaId?: boolean;
    tipoMovimiento?: boolean;
    resultado?: boolean;
    denegadoPorBaja?: boolean;
    denegadoPorAlcohol?: boolean;
    denegadoPorDocumentos?: boolean;
    denegadoSinDocumentos?: boolean;
    fechaHora?: boolean;
    torniqueteId?: boolean;
    persona?: boolean | Prisma.PersonaDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["eventoAcceso"]>;
export type EventoAccesoSelectScalar = {
    id?: boolean;
    personaId?: boolean;
    tipoMovimiento?: boolean;
    resultado?: boolean;
    denegadoPorBaja?: boolean;
    denegadoPorAlcohol?: boolean;
    denegadoPorDocumentos?: boolean;
    denegadoSinDocumentos?: boolean;
    fechaHora?: boolean;
    torniqueteId?: boolean;
};
export type EventoAccesoOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "personaId" | "tipoMovimiento" | "resultado" | "denegadoPorBaja" | "denegadoPorAlcohol" | "denegadoPorDocumentos" | "denegadoSinDocumentos" | "fechaHora" | "torniqueteId", ExtArgs["result"]["eventoAcceso"]>;
export type EventoAccesoInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    persona?: boolean | Prisma.PersonaDefaultArgs<ExtArgs>;
};
export type EventoAccesoIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    persona?: boolean | Prisma.PersonaDefaultArgs<ExtArgs>;
};
export type EventoAccesoIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    persona?: boolean | Prisma.PersonaDefaultArgs<ExtArgs>;
};
export type $EventoAccesoPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "EventoAcceso";
    objects: {
        persona: Prisma.$PersonaPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        personaId: number;
        tipoMovimiento: $Enums.TipoMovimiento;
        resultado: $Enums.ResultadoAcceso;
        denegadoPorBaja: boolean;
        denegadoPorAlcohol: boolean;
        denegadoPorDocumentos: boolean;
        denegadoSinDocumentos: boolean;
        fechaHora: Date;
        torniqueteId: string | null;
    }, ExtArgs["result"]["eventoAcceso"]>;
    composites: {};
};
export type EventoAccesoGetPayload<S extends boolean | null | undefined | EventoAccesoDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$EventoAccesoPayload, S>;
export type EventoAccesoCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<EventoAccesoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: EventoAccesoCountAggregateInputType | true;
};
export interface EventoAccesoDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['EventoAcceso'];
        meta: {
            name: 'EventoAcceso';
        };
    };
    findUnique<T extends EventoAccesoFindUniqueArgs>(args: Prisma.SelectSubset<T, EventoAccesoFindUniqueArgs<ExtArgs>>): Prisma.Prisma__EventoAccesoClient<runtime.Types.Result.GetResult<Prisma.$EventoAccesoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends EventoAccesoFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, EventoAccesoFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__EventoAccesoClient<runtime.Types.Result.GetResult<Prisma.$EventoAccesoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends EventoAccesoFindFirstArgs>(args?: Prisma.SelectSubset<T, EventoAccesoFindFirstArgs<ExtArgs>>): Prisma.Prisma__EventoAccesoClient<runtime.Types.Result.GetResult<Prisma.$EventoAccesoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends EventoAccesoFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, EventoAccesoFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__EventoAccesoClient<runtime.Types.Result.GetResult<Prisma.$EventoAccesoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends EventoAccesoFindManyArgs>(args?: Prisma.SelectSubset<T, EventoAccesoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EventoAccesoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends EventoAccesoCreateArgs>(args: Prisma.SelectSubset<T, EventoAccesoCreateArgs<ExtArgs>>): Prisma.Prisma__EventoAccesoClient<runtime.Types.Result.GetResult<Prisma.$EventoAccesoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends EventoAccesoCreateManyArgs>(args?: Prisma.SelectSubset<T, EventoAccesoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends EventoAccesoCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, EventoAccesoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EventoAccesoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends EventoAccesoDeleteArgs>(args: Prisma.SelectSubset<T, EventoAccesoDeleteArgs<ExtArgs>>): Prisma.Prisma__EventoAccesoClient<runtime.Types.Result.GetResult<Prisma.$EventoAccesoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends EventoAccesoUpdateArgs>(args: Prisma.SelectSubset<T, EventoAccesoUpdateArgs<ExtArgs>>): Prisma.Prisma__EventoAccesoClient<runtime.Types.Result.GetResult<Prisma.$EventoAccesoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends EventoAccesoDeleteManyArgs>(args?: Prisma.SelectSubset<T, EventoAccesoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends EventoAccesoUpdateManyArgs>(args: Prisma.SelectSubset<T, EventoAccesoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends EventoAccesoUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, EventoAccesoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EventoAccesoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends EventoAccesoUpsertArgs>(args: Prisma.SelectSubset<T, EventoAccesoUpsertArgs<ExtArgs>>): Prisma.Prisma__EventoAccesoClient<runtime.Types.Result.GetResult<Prisma.$EventoAccesoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends EventoAccesoCountArgs>(args?: Prisma.Subset<T, EventoAccesoCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], EventoAccesoCountAggregateOutputType> : number>;
    aggregate<T extends EventoAccesoAggregateArgs>(args: Prisma.Subset<T, EventoAccesoAggregateArgs>): Prisma.PrismaPromise<GetEventoAccesoAggregateType<T>>;
    groupBy<T extends EventoAccesoGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: EventoAccesoGroupByArgs['orderBy'];
    } : {
        orderBy?: EventoAccesoGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, EventoAccesoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEventoAccesoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: EventoAccesoFieldRefs;
}
export interface Prisma__EventoAccesoClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    persona<T extends Prisma.PersonaDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PersonaDefaultArgs<ExtArgs>>): Prisma.Prisma__PersonaClient<runtime.Types.Result.GetResult<Prisma.$PersonaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface EventoAccesoFieldRefs {
    readonly id: Prisma.FieldRef<"EventoAcceso", 'Int'>;
    readonly personaId: Prisma.FieldRef<"EventoAcceso", 'Int'>;
    readonly tipoMovimiento: Prisma.FieldRef<"EventoAcceso", 'TipoMovimiento'>;
    readonly resultado: Prisma.FieldRef<"EventoAcceso", 'ResultadoAcceso'>;
    readonly denegadoPorBaja: Prisma.FieldRef<"EventoAcceso", 'Boolean'>;
    readonly denegadoPorAlcohol: Prisma.FieldRef<"EventoAcceso", 'Boolean'>;
    readonly denegadoPorDocumentos: Prisma.FieldRef<"EventoAcceso", 'Boolean'>;
    readonly denegadoSinDocumentos: Prisma.FieldRef<"EventoAcceso", 'Boolean'>;
    readonly fechaHora: Prisma.FieldRef<"EventoAcceso", 'DateTime'>;
    readonly torniqueteId: Prisma.FieldRef<"EventoAcceso", 'String'>;
}
export type EventoAccesoFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventoAccesoSelect<ExtArgs> | null;
    omit?: Prisma.EventoAccesoOmit<ExtArgs> | null;
    include?: Prisma.EventoAccesoInclude<ExtArgs> | null;
    where: Prisma.EventoAccesoWhereUniqueInput;
};
export type EventoAccesoFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventoAccesoSelect<ExtArgs> | null;
    omit?: Prisma.EventoAccesoOmit<ExtArgs> | null;
    include?: Prisma.EventoAccesoInclude<ExtArgs> | null;
    where: Prisma.EventoAccesoWhereUniqueInput;
};
export type EventoAccesoFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventoAccesoSelect<ExtArgs> | null;
    omit?: Prisma.EventoAccesoOmit<ExtArgs> | null;
    include?: Prisma.EventoAccesoInclude<ExtArgs> | null;
    where?: Prisma.EventoAccesoWhereInput;
    orderBy?: Prisma.EventoAccesoOrderByWithRelationInput | Prisma.EventoAccesoOrderByWithRelationInput[];
    cursor?: Prisma.EventoAccesoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EventoAccesoScalarFieldEnum | Prisma.EventoAccesoScalarFieldEnum[];
};
export type EventoAccesoFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventoAccesoSelect<ExtArgs> | null;
    omit?: Prisma.EventoAccesoOmit<ExtArgs> | null;
    include?: Prisma.EventoAccesoInclude<ExtArgs> | null;
    where?: Prisma.EventoAccesoWhereInput;
    orderBy?: Prisma.EventoAccesoOrderByWithRelationInput | Prisma.EventoAccesoOrderByWithRelationInput[];
    cursor?: Prisma.EventoAccesoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EventoAccesoScalarFieldEnum | Prisma.EventoAccesoScalarFieldEnum[];
};
export type EventoAccesoFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventoAccesoSelect<ExtArgs> | null;
    omit?: Prisma.EventoAccesoOmit<ExtArgs> | null;
    include?: Prisma.EventoAccesoInclude<ExtArgs> | null;
    where?: Prisma.EventoAccesoWhereInput;
    orderBy?: Prisma.EventoAccesoOrderByWithRelationInput | Prisma.EventoAccesoOrderByWithRelationInput[];
    cursor?: Prisma.EventoAccesoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EventoAccesoScalarFieldEnum | Prisma.EventoAccesoScalarFieldEnum[];
};
export type EventoAccesoCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventoAccesoSelect<ExtArgs> | null;
    omit?: Prisma.EventoAccesoOmit<ExtArgs> | null;
    include?: Prisma.EventoAccesoInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EventoAccesoCreateInput, Prisma.EventoAccesoUncheckedCreateInput>;
};
export type EventoAccesoCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.EventoAccesoCreateManyInput | Prisma.EventoAccesoCreateManyInput[];
    skipDuplicates?: boolean;
};
export type EventoAccesoCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventoAccesoSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.EventoAccesoOmit<ExtArgs> | null;
    data: Prisma.EventoAccesoCreateManyInput | Prisma.EventoAccesoCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.EventoAccesoIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type EventoAccesoUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventoAccesoSelect<ExtArgs> | null;
    omit?: Prisma.EventoAccesoOmit<ExtArgs> | null;
    include?: Prisma.EventoAccesoInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EventoAccesoUpdateInput, Prisma.EventoAccesoUncheckedUpdateInput>;
    where: Prisma.EventoAccesoWhereUniqueInput;
};
export type EventoAccesoUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.EventoAccesoUpdateManyMutationInput, Prisma.EventoAccesoUncheckedUpdateManyInput>;
    where?: Prisma.EventoAccesoWhereInput;
    limit?: number;
};
export type EventoAccesoUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventoAccesoSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.EventoAccesoOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EventoAccesoUpdateManyMutationInput, Prisma.EventoAccesoUncheckedUpdateManyInput>;
    where?: Prisma.EventoAccesoWhereInput;
    limit?: number;
    include?: Prisma.EventoAccesoIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type EventoAccesoUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventoAccesoSelect<ExtArgs> | null;
    omit?: Prisma.EventoAccesoOmit<ExtArgs> | null;
    include?: Prisma.EventoAccesoInclude<ExtArgs> | null;
    where: Prisma.EventoAccesoWhereUniqueInput;
    create: Prisma.XOR<Prisma.EventoAccesoCreateInput, Prisma.EventoAccesoUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.EventoAccesoUpdateInput, Prisma.EventoAccesoUncheckedUpdateInput>;
};
export type EventoAccesoDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventoAccesoSelect<ExtArgs> | null;
    omit?: Prisma.EventoAccesoOmit<ExtArgs> | null;
    include?: Prisma.EventoAccesoInclude<ExtArgs> | null;
    where: Prisma.EventoAccesoWhereUniqueInput;
};
export type EventoAccesoDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EventoAccesoWhereInput;
    limit?: number;
};
export type EventoAccesoDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventoAccesoSelect<ExtArgs> | null;
    omit?: Prisma.EventoAccesoOmit<ExtArgs> | null;
    include?: Prisma.EventoAccesoInclude<ExtArgs> | null;
};
