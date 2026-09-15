import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type SolicitudVisitaModel = runtime.Types.Result.DefaultSelection<Prisma.$SolicitudVisitaPayload>;
export type AggregateSolicitudVisita = {
    _count: SolicitudVisitaCountAggregateOutputType | null;
    _avg: SolicitudVisitaAvgAggregateOutputType | null;
    _sum: SolicitudVisitaSumAggregateOutputType | null;
    _min: SolicitudVisitaMinAggregateOutputType | null;
    _max: SolicitudVisitaMaxAggregateOutputType | null;
};
export type SolicitudVisitaAvgAggregateOutputType = {
    id: number | null;
    personaId: number | null;
    empresaId: number | null;
};
export type SolicitudVisitaSumAggregateOutputType = {
    id: number | null;
    personaId: number | null;
    empresaId: number | null;
};
export type SolicitudVisitaMinAggregateOutputType = {
    id: number | null;
    personaId: number | null;
    empresaId: number | null;
    personaVisitada: string | null;
    motivo: string | null;
    fechaHoraProgramada: Date | null;
    estado: $Enums.EstadoSolicitudVisita | null;
    creadoEn: Date | null;
};
export type SolicitudVisitaMaxAggregateOutputType = {
    id: number | null;
    personaId: number | null;
    empresaId: number | null;
    personaVisitada: string | null;
    motivo: string | null;
    fechaHoraProgramada: Date | null;
    estado: $Enums.EstadoSolicitudVisita | null;
    creadoEn: Date | null;
};
export type SolicitudVisitaCountAggregateOutputType = {
    id: number;
    personaId: number;
    empresaId: number;
    personaVisitada: number;
    motivo: number;
    fechaHoraProgramada: number;
    estado: number;
    creadoEn: number;
    _all: number;
};
export type SolicitudVisitaAvgAggregateInputType = {
    id?: true;
    personaId?: true;
    empresaId?: true;
};
export type SolicitudVisitaSumAggregateInputType = {
    id?: true;
    personaId?: true;
    empresaId?: true;
};
export type SolicitudVisitaMinAggregateInputType = {
    id?: true;
    personaId?: true;
    empresaId?: true;
    personaVisitada?: true;
    motivo?: true;
    fechaHoraProgramada?: true;
    estado?: true;
    creadoEn?: true;
};
export type SolicitudVisitaMaxAggregateInputType = {
    id?: true;
    personaId?: true;
    empresaId?: true;
    personaVisitada?: true;
    motivo?: true;
    fechaHoraProgramada?: true;
    estado?: true;
    creadoEn?: true;
};
export type SolicitudVisitaCountAggregateInputType = {
    id?: true;
    personaId?: true;
    empresaId?: true;
    personaVisitada?: true;
    motivo?: true;
    fechaHoraProgramada?: true;
    estado?: true;
    creadoEn?: true;
    _all?: true;
};
export type SolicitudVisitaAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SolicitudVisitaWhereInput;
    orderBy?: Prisma.SolicitudVisitaOrderByWithRelationInput | Prisma.SolicitudVisitaOrderByWithRelationInput[];
    cursor?: Prisma.SolicitudVisitaWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | SolicitudVisitaCountAggregateInputType;
    _avg?: SolicitudVisitaAvgAggregateInputType;
    _sum?: SolicitudVisitaSumAggregateInputType;
    _min?: SolicitudVisitaMinAggregateInputType;
    _max?: SolicitudVisitaMaxAggregateInputType;
};
export type GetSolicitudVisitaAggregateType<T extends SolicitudVisitaAggregateArgs> = {
    [P in keyof T & keyof AggregateSolicitudVisita]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateSolicitudVisita[P]> : Prisma.GetScalarType<T[P], AggregateSolicitudVisita[P]>;
};
export type SolicitudVisitaGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SolicitudVisitaWhereInput;
    orderBy?: Prisma.SolicitudVisitaOrderByWithAggregationInput | Prisma.SolicitudVisitaOrderByWithAggregationInput[];
    by: Prisma.SolicitudVisitaScalarFieldEnum[] | Prisma.SolicitudVisitaScalarFieldEnum;
    having?: Prisma.SolicitudVisitaScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SolicitudVisitaCountAggregateInputType | true;
    _avg?: SolicitudVisitaAvgAggregateInputType;
    _sum?: SolicitudVisitaSumAggregateInputType;
    _min?: SolicitudVisitaMinAggregateInputType;
    _max?: SolicitudVisitaMaxAggregateInputType;
};
export type SolicitudVisitaGroupByOutputType = {
    id: number;
    personaId: number;
    empresaId: number;
    personaVisitada: string;
    motivo: string;
    fechaHoraProgramada: Date;
    estado: $Enums.EstadoSolicitudVisita;
    creadoEn: Date;
    _count: SolicitudVisitaCountAggregateOutputType | null;
    _avg: SolicitudVisitaAvgAggregateOutputType | null;
    _sum: SolicitudVisitaSumAggregateOutputType | null;
    _min: SolicitudVisitaMinAggregateOutputType | null;
    _max: SolicitudVisitaMaxAggregateOutputType | null;
};
export type GetSolicitudVisitaGroupByPayload<T extends SolicitudVisitaGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<SolicitudVisitaGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof SolicitudVisitaGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], SolicitudVisitaGroupByOutputType[P]> : Prisma.GetScalarType<T[P], SolicitudVisitaGroupByOutputType[P]>;
}>>;
export type SolicitudVisitaWhereInput = {
    AND?: Prisma.SolicitudVisitaWhereInput | Prisma.SolicitudVisitaWhereInput[];
    OR?: Prisma.SolicitudVisitaWhereInput[];
    NOT?: Prisma.SolicitudVisitaWhereInput | Prisma.SolicitudVisitaWhereInput[];
    id?: Prisma.IntFilter<"SolicitudVisita"> | number;
    personaId?: Prisma.IntFilter<"SolicitudVisita"> | number;
    empresaId?: Prisma.IntFilter<"SolicitudVisita"> | number;
    personaVisitada?: Prisma.StringFilter<"SolicitudVisita"> | string;
    motivo?: Prisma.StringFilter<"SolicitudVisita"> | string;
    fechaHoraProgramada?: Prisma.DateTimeFilter<"SolicitudVisita"> | Date | string;
    estado?: Prisma.EnumEstadoSolicitudVisitaFilter<"SolicitudVisita"> | $Enums.EstadoSolicitudVisita;
    creadoEn?: Prisma.DateTimeFilter<"SolicitudVisita"> | Date | string;
    persona?: Prisma.XOR<Prisma.PersonaScalarRelationFilter, Prisma.PersonaWhereInput>;
    empresa?: Prisma.XOR<Prisma.EmpresaScalarRelationFilter, Prisma.EmpresaWhereInput>;
};
export type SolicitudVisitaOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    personaId?: Prisma.SortOrder;
    empresaId?: Prisma.SortOrder;
    personaVisitada?: Prisma.SortOrder;
    motivo?: Prisma.SortOrder;
    fechaHoraProgramada?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
    persona?: Prisma.PersonaOrderByWithRelationInput;
    empresa?: Prisma.EmpresaOrderByWithRelationInput;
};
export type SolicitudVisitaWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.SolicitudVisitaWhereInput | Prisma.SolicitudVisitaWhereInput[];
    OR?: Prisma.SolicitudVisitaWhereInput[];
    NOT?: Prisma.SolicitudVisitaWhereInput | Prisma.SolicitudVisitaWhereInput[];
    personaId?: Prisma.IntFilter<"SolicitudVisita"> | number;
    empresaId?: Prisma.IntFilter<"SolicitudVisita"> | number;
    personaVisitada?: Prisma.StringFilter<"SolicitudVisita"> | string;
    motivo?: Prisma.StringFilter<"SolicitudVisita"> | string;
    fechaHoraProgramada?: Prisma.DateTimeFilter<"SolicitudVisita"> | Date | string;
    estado?: Prisma.EnumEstadoSolicitudVisitaFilter<"SolicitudVisita"> | $Enums.EstadoSolicitudVisita;
    creadoEn?: Prisma.DateTimeFilter<"SolicitudVisita"> | Date | string;
    persona?: Prisma.XOR<Prisma.PersonaScalarRelationFilter, Prisma.PersonaWhereInput>;
    empresa?: Prisma.XOR<Prisma.EmpresaScalarRelationFilter, Prisma.EmpresaWhereInput>;
}, "id">;
export type SolicitudVisitaOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    personaId?: Prisma.SortOrder;
    empresaId?: Prisma.SortOrder;
    personaVisitada?: Prisma.SortOrder;
    motivo?: Prisma.SortOrder;
    fechaHoraProgramada?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
    _count?: Prisma.SolicitudVisitaCountOrderByAggregateInput;
    _avg?: Prisma.SolicitudVisitaAvgOrderByAggregateInput;
    _max?: Prisma.SolicitudVisitaMaxOrderByAggregateInput;
    _min?: Prisma.SolicitudVisitaMinOrderByAggregateInput;
    _sum?: Prisma.SolicitudVisitaSumOrderByAggregateInput;
};
export type SolicitudVisitaScalarWhereWithAggregatesInput = {
    AND?: Prisma.SolicitudVisitaScalarWhereWithAggregatesInput | Prisma.SolicitudVisitaScalarWhereWithAggregatesInput[];
    OR?: Prisma.SolicitudVisitaScalarWhereWithAggregatesInput[];
    NOT?: Prisma.SolicitudVisitaScalarWhereWithAggregatesInput | Prisma.SolicitudVisitaScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"SolicitudVisita"> | number;
    personaId?: Prisma.IntWithAggregatesFilter<"SolicitudVisita"> | number;
    empresaId?: Prisma.IntWithAggregatesFilter<"SolicitudVisita"> | number;
    personaVisitada?: Prisma.StringWithAggregatesFilter<"SolicitudVisita"> | string;
    motivo?: Prisma.StringWithAggregatesFilter<"SolicitudVisita"> | string;
    fechaHoraProgramada?: Prisma.DateTimeWithAggregatesFilter<"SolicitudVisita"> | Date | string;
    estado?: Prisma.EnumEstadoSolicitudVisitaWithAggregatesFilter<"SolicitudVisita"> | $Enums.EstadoSolicitudVisita;
    creadoEn?: Prisma.DateTimeWithAggregatesFilter<"SolicitudVisita"> | Date | string;
};
export type SolicitudVisitaCreateInput = {
    personaVisitada: string;
    motivo: string;
    fechaHoraProgramada: Date | string;
    estado?: $Enums.EstadoSolicitudVisita;
    creadoEn?: Date | string;
    persona: Prisma.PersonaCreateNestedOneWithoutSolicitudesVisitaInput;
    empresa: Prisma.EmpresaCreateNestedOneWithoutSolicitudesVisitaInput;
};
export type SolicitudVisitaUncheckedCreateInput = {
    id?: number;
    personaId: number;
    empresaId: number;
    personaVisitada: string;
    motivo: string;
    fechaHoraProgramada: Date | string;
    estado?: $Enums.EstadoSolicitudVisita;
    creadoEn?: Date | string;
};
export type SolicitudVisitaUpdateInput = {
    personaVisitada?: Prisma.StringFieldUpdateOperationsInput | string;
    motivo?: Prisma.StringFieldUpdateOperationsInput | string;
    fechaHoraProgramada?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    estado?: Prisma.EnumEstadoSolicitudVisitaFieldUpdateOperationsInput | $Enums.EstadoSolicitudVisita;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    persona?: Prisma.PersonaUpdateOneRequiredWithoutSolicitudesVisitaNestedInput;
    empresa?: Prisma.EmpresaUpdateOneRequiredWithoutSolicitudesVisitaNestedInput;
};
export type SolicitudVisitaUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personaId?: Prisma.IntFieldUpdateOperationsInput | number;
    empresaId?: Prisma.IntFieldUpdateOperationsInput | number;
    personaVisitada?: Prisma.StringFieldUpdateOperationsInput | string;
    motivo?: Prisma.StringFieldUpdateOperationsInput | string;
    fechaHoraProgramada?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    estado?: Prisma.EnumEstadoSolicitudVisitaFieldUpdateOperationsInput | $Enums.EstadoSolicitudVisita;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SolicitudVisitaCreateManyInput = {
    id?: number;
    personaId: number;
    empresaId: number;
    personaVisitada: string;
    motivo: string;
    fechaHoraProgramada: Date | string;
    estado?: $Enums.EstadoSolicitudVisita;
    creadoEn?: Date | string;
};
export type SolicitudVisitaUpdateManyMutationInput = {
    personaVisitada?: Prisma.StringFieldUpdateOperationsInput | string;
    motivo?: Prisma.StringFieldUpdateOperationsInput | string;
    fechaHoraProgramada?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    estado?: Prisma.EnumEstadoSolicitudVisitaFieldUpdateOperationsInput | $Enums.EstadoSolicitudVisita;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SolicitudVisitaUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personaId?: Prisma.IntFieldUpdateOperationsInput | number;
    empresaId?: Prisma.IntFieldUpdateOperationsInput | number;
    personaVisitada?: Prisma.StringFieldUpdateOperationsInput | string;
    motivo?: Prisma.StringFieldUpdateOperationsInput | string;
    fechaHoraProgramada?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    estado?: Prisma.EnumEstadoSolicitudVisitaFieldUpdateOperationsInput | $Enums.EstadoSolicitudVisita;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SolicitudVisitaListRelationFilter = {
    every?: Prisma.SolicitudVisitaWhereInput;
    some?: Prisma.SolicitudVisitaWhereInput;
    none?: Prisma.SolicitudVisitaWhereInput;
};
export type SolicitudVisitaOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type SolicitudVisitaCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personaId?: Prisma.SortOrder;
    empresaId?: Prisma.SortOrder;
    personaVisitada?: Prisma.SortOrder;
    motivo?: Prisma.SortOrder;
    fechaHoraProgramada?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
};
export type SolicitudVisitaAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personaId?: Prisma.SortOrder;
    empresaId?: Prisma.SortOrder;
};
export type SolicitudVisitaMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personaId?: Prisma.SortOrder;
    empresaId?: Prisma.SortOrder;
    personaVisitada?: Prisma.SortOrder;
    motivo?: Prisma.SortOrder;
    fechaHoraProgramada?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
};
export type SolicitudVisitaMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personaId?: Prisma.SortOrder;
    empresaId?: Prisma.SortOrder;
    personaVisitada?: Prisma.SortOrder;
    motivo?: Prisma.SortOrder;
    fechaHoraProgramada?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
};
export type SolicitudVisitaSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    personaId?: Prisma.SortOrder;
    empresaId?: Prisma.SortOrder;
};
export type SolicitudVisitaCreateNestedManyWithoutEmpresaInput = {
    create?: Prisma.XOR<Prisma.SolicitudVisitaCreateWithoutEmpresaInput, Prisma.SolicitudVisitaUncheckedCreateWithoutEmpresaInput> | Prisma.SolicitudVisitaCreateWithoutEmpresaInput[] | Prisma.SolicitudVisitaUncheckedCreateWithoutEmpresaInput[];
    connectOrCreate?: Prisma.SolicitudVisitaCreateOrConnectWithoutEmpresaInput | Prisma.SolicitudVisitaCreateOrConnectWithoutEmpresaInput[];
    createMany?: Prisma.SolicitudVisitaCreateManyEmpresaInputEnvelope;
    connect?: Prisma.SolicitudVisitaWhereUniqueInput | Prisma.SolicitudVisitaWhereUniqueInput[];
};
export type SolicitudVisitaUncheckedCreateNestedManyWithoutEmpresaInput = {
    create?: Prisma.XOR<Prisma.SolicitudVisitaCreateWithoutEmpresaInput, Prisma.SolicitudVisitaUncheckedCreateWithoutEmpresaInput> | Prisma.SolicitudVisitaCreateWithoutEmpresaInput[] | Prisma.SolicitudVisitaUncheckedCreateWithoutEmpresaInput[];
    connectOrCreate?: Prisma.SolicitudVisitaCreateOrConnectWithoutEmpresaInput | Prisma.SolicitudVisitaCreateOrConnectWithoutEmpresaInput[];
    createMany?: Prisma.SolicitudVisitaCreateManyEmpresaInputEnvelope;
    connect?: Prisma.SolicitudVisitaWhereUniqueInput | Prisma.SolicitudVisitaWhereUniqueInput[];
};
export type SolicitudVisitaUpdateManyWithoutEmpresaNestedInput = {
    create?: Prisma.XOR<Prisma.SolicitudVisitaCreateWithoutEmpresaInput, Prisma.SolicitudVisitaUncheckedCreateWithoutEmpresaInput> | Prisma.SolicitudVisitaCreateWithoutEmpresaInput[] | Prisma.SolicitudVisitaUncheckedCreateWithoutEmpresaInput[];
    connectOrCreate?: Prisma.SolicitudVisitaCreateOrConnectWithoutEmpresaInput | Prisma.SolicitudVisitaCreateOrConnectWithoutEmpresaInput[];
    upsert?: Prisma.SolicitudVisitaUpsertWithWhereUniqueWithoutEmpresaInput | Prisma.SolicitudVisitaUpsertWithWhereUniqueWithoutEmpresaInput[];
    createMany?: Prisma.SolicitudVisitaCreateManyEmpresaInputEnvelope;
    set?: Prisma.SolicitudVisitaWhereUniqueInput | Prisma.SolicitudVisitaWhereUniqueInput[];
    disconnect?: Prisma.SolicitudVisitaWhereUniqueInput | Prisma.SolicitudVisitaWhereUniqueInput[];
    delete?: Prisma.SolicitudVisitaWhereUniqueInput | Prisma.SolicitudVisitaWhereUniqueInput[];
    connect?: Prisma.SolicitudVisitaWhereUniqueInput | Prisma.SolicitudVisitaWhereUniqueInput[];
    update?: Prisma.SolicitudVisitaUpdateWithWhereUniqueWithoutEmpresaInput | Prisma.SolicitudVisitaUpdateWithWhereUniqueWithoutEmpresaInput[];
    updateMany?: Prisma.SolicitudVisitaUpdateManyWithWhereWithoutEmpresaInput | Prisma.SolicitudVisitaUpdateManyWithWhereWithoutEmpresaInput[];
    deleteMany?: Prisma.SolicitudVisitaScalarWhereInput | Prisma.SolicitudVisitaScalarWhereInput[];
};
export type SolicitudVisitaUncheckedUpdateManyWithoutEmpresaNestedInput = {
    create?: Prisma.XOR<Prisma.SolicitudVisitaCreateWithoutEmpresaInput, Prisma.SolicitudVisitaUncheckedCreateWithoutEmpresaInput> | Prisma.SolicitudVisitaCreateWithoutEmpresaInput[] | Prisma.SolicitudVisitaUncheckedCreateWithoutEmpresaInput[];
    connectOrCreate?: Prisma.SolicitudVisitaCreateOrConnectWithoutEmpresaInput | Prisma.SolicitudVisitaCreateOrConnectWithoutEmpresaInput[];
    upsert?: Prisma.SolicitudVisitaUpsertWithWhereUniqueWithoutEmpresaInput | Prisma.SolicitudVisitaUpsertWithWhereUniqueWithoutEmpresaInput[];
    createMany?: Prisma.SolicitudVisitaCreateManyEmpresaInputEnvelope;
    set?: Prisma.SolicitudVisitaWhereUniqueInput | Prisma.SolicitudVisitaWhereUniqueInput[];
    disconnect?: Prisma.SolicitudVisitaWhereUniqueInput | Prisma.SolicitudVisitaWhereUniqueInput[];
    delete?: Prisma.SolicitudVisitaWhereUniqueInput | Prisma.SolicitudVisitaWhereUniqueInput[];
    connect?: Prisma.SolicitudVisitaWhereUniqueInput | Prisma.SolicitudVisitaWhereUniqueInput[];
    update?: Prisma.SolicitudVisitaUpdateWithWhereUniqueWithoutEmpresaInput | Prisma.SolicitudVisitaUpdateWithWhereUniqueWithoutEmpresaInput[];
    updateMany?: Prisma.SolicitudVisitaUpdateManyWithWhereWithoutEmpresaInput | Prisma.SolicitudVisitaUpdateManyWithWhereWithoutEmpresaInput[];
    deleteMany?: Prisma.SolicitudVisitaScalarWhereInput | Prisma.SolicitudVisitaScalarWhereInput[];
};
export type SolicitudVisitaCreateNestedManyWithoutPersonaInput = {
    create?: Prisma.XOR<Prisma.SolicitudVisitaCreateWithoutPersonaInput, Prisma.SolicitudVisitaUncheckedCreateWithoutPersonaInput> | Prisma.SolicitudVisitaCreateWithoutPersonaInput[] | Prisma.SolicitudVisitaUncheckedCreateWithoutPersonaInput[];
    connectOrCreate?: Prisma.SolicitudVisitaCreateOrConnectWithoutPersonaInput | Prisma.SolicitudVisitaCreateOrConnectWithoutPersonaInput[];
    createMany?: Prisma.SolicitudVisitaCreateManyPersonaInputEnvelope;
    connect?: Prisma.SolicitudVisitaWhereUniqueInput | Prisma.SolicitudVisitaWhereUniqueInput[];
};
export type SolicitudVisitaUncheckedCreateNestedManyWithoutPersonaInput = {
    create?: Prisma.XOR<Prisma.SolicitudVisitaCreateWithoutPersonaInput, Prisma.SolicitudVisitaUncheckedCreateWithoutPersonaInput> | Prisma.SolicitudVisitaCreateWithoutPersonaInput[] | Prisma.SolicitudVisitaUncheckedCreateWithoutPersonaInput[];
    connectOrCreate?: Prisma.SolicitudVisitaCreateOrConnectWithoutPersonaInput | Prisma.SolicitudVisitaCreateOrConnectWithoutPersonaInput[];
    createMany?: Prisma.SolicitudVisitaCreateManyPersonaInputEnvelope;
    connect?: Prisma.SolicitudVisitaWhereUniqueInput | Prisma.SolicitudVisitaWhereUniqueInput[];
};
export type SolicitudVisitaUpdateManyWithoutPersonaNestedInput = {
    create?: Prisma.XOR<Prisma.SolicitudVisitaCreateWithoutPersonaInput, Prisma.SolicitudVisitaUncheckedCreateWithoutPersonaInput> | Prisma.SolicitudVisitaCreateWithoutPersonaInput[] | Prisma.SolicitudVisitaUncheckedCreateWithoutPersonaInput[];
    connectOrCreate?: Prisma.SolicitudVisitaCreateOrConnectWithoutPersonaInput | Prisma.SolicitudVisitaCreateOrConnectWithoutPersonaInput[];
    upsert?: Prisma.SolicitudVisitaUpsertWithWhereUniqueWithoutPersonaInput | Prisma.SolicitudVisitaUpsertWithWhereUniqueWithoutPersonaInput[];
    createMany?: Prisma.SolicitudVisitaCreateManyPersonaInputEnvelope;
    set?: Prisma.SolicitudVisitaWhereUniqueInput | Prisma.SolicitudVisitaWhereUniqueInput[];
    disconnect?: Prisma.SolicitudVisitaWhereUniqueInput | Prisma.SolicitudVisitaWhereUniqueInput[];
    delete?: Prisma.SolicitudVisitaWhereUniqueInput | Prisma.SolicitudVisitaWhereUniqueInput[];
    connect?: Prisma.SolicitudVisitaWhereUniqueInput | Prisma.SolicitudVisitaWhereUniqueInput[];
    update?: Prisma.SolicitudVisitaUpdateWithWhereUniqueWithoutPersonaInput | Prisma.SolicitudVisitaUpdateWithWhereUniqueWithoutPersonaInput[];
    updateMany?: Prisma.SolicitudVisitaUpdateManyWithWhereWithoutPersonaInput | Prisma.SolicitudVisitaUpdateManyWithWhereWithoutPersonaInput[];
    deleteMany?: Prisma.SolicitudVisitaScalarWhereInput | Prisma.SolicitudVisitaScalarWhereInput[];
};
export type SolicitudVisitaUncheckedUpdateManyWithoutPersonaNestedInput = {
    create?: Prisma.XOR<Prisma.SolicitudVisitaCreateWithoutPersonaInput, Prisma.SolicitudVisitaUncheckedCreateWithoutPersonaInput> | Prisma.SolicitudVisitaCreateWithoutPersonaInput[] | Prisma.SolicitudVisitaUncheckedCreateWithoutPersonaInput[];
    connectOrCreate?: Prisma.SolicitudVisitaCreateOrConnectWithoutPersonaInput | Prisma.SolicitudVisitaCreateOrConnectWithoutPersonaInput[];
    upsert?: Prisma.SolicitudVisitaUpsertWithWhereUniqueWithoutPersonaInput | Prisma.SolicitudVisitaUpsertWithWhereUniqueWithoutPersonaInput[];
    createMany?: Prisma.SolicitudVisitaCreateManyPersonaInputEnvelope;
    set?: Prisma.SolicitudVisitaWhereUniqueInput | Prisma.SolicitudVisitaWhereUniqueInput[];
    disconnect?: Prisma.SolicitudVisitaWhereUniqueInput | Prisma.SolicitudVisitaWhereUniqueInput[];
    delete?: Prisma.SolicitudVisitaWhereUniqueInput | Prisma.SolicitudVisitaWhereUniqueInput[];
    connect?: Prisma.SolicitudVisitaWhereUniqueInput | Prisma.SolicitudVisitaWhereUniqueInput[];
    update?: Prisma.SolicitudVisitaUpdateWithWhereUniqueWithoutPersonaInput | Prisma.SolicitudVisitaUpdateWithWhereUniqueWithoutPersonaInput[];
    updateMany?: Prisma.SolicitudVisitaUpdateManyWithWhereWithoutPersonaInput | Prisma.SolicitudVisitaUpdateManyWithWhereWithoutPersonaInput[];
    deleteMany?: Prisma.SolicitudVisitaScalarWhereInput | Prisma.SolicitudVisitaScalarWhereInput[];
};
export type EnumEstadoSolicitudVisitaFieldUpdateOperationsInput = {
    set?: $Enums.EstadoSolicitudVisita;
};
export type SolicitudVisitaCreateWithoutEmpresaInput = {
    personaVisitada: string;
    motivo: string;
    fechaHoraProgramada: Date | string;
    estado?: $Enums.EstadoSolicitudVisita;
    creadoEn?: Date | string;
    persona: Prisma.PersonaCreateNestedOneWithoutSolicitudesVisitaInput;
};
export type SolicitudVisitaUncheckedCreateWithoutEmpresaInput = {
    id?: number;
    personaId: number;
    personaVisitada: string;
    motivo: string;
    fechaHoraProgramada: Date | string;
    estado?: $Enums.EstadoSolicitudVisita;
    creadoEn?: Date | string;
};
export type SolicitudVisitaCreateOrConnectWithoutEmpresaInput = {
    where: Prisma.SolicitudVisitaWhereUniqueInput;
    create: Prisma.XOR<Prisma.SolicitudVisitaCreateWithoutEmpresaInput, Prisma.SolicitudVisitaUncheckedCreateWithoutEmpresaInput>;
};
export type SolicitudVisitaCreateManyEmpresaInputEnvelope = {
    data: Prisma.SolicitudVisitaCreateManyEmpresaInput | Prisma.SolicitudVisitaCreateManyEmpresaInput[];
    skipDuplicates?: boolean;
};
export type SolicitudVisitaUpsertWithWhereUniqueWithoutEmpresaInput = {
    where: Prisma.SolicitudVisitaWhereUniqueInput;
    update: Prisma.XOR<Prisma.SolicitudVisitaUpdateWithoutEmpresaInput, Prisma.SolicitudVisitaUncheckedUpdateWithoutEmpresaInput>;
    create: Prisma.XOR<Prisma.SolicitudVisitaCreateWithoutEmpresaInput, Prisma.SolicitudVisitaUncheckedCreateWithoutEmpresaInput>;
};
export type SolicitudVisitaUpdateWithWhereUniqueWithoutEmpresaInput = {
    where: Prisma.SolicitudVisitaWhereUniqueInput;
    data: Prisma.XOR<Prisma.SolicitudVisitaUpdateWithoutEmpresaInput, Prisma.SolicitudVisitaUncheckedUpdateWithoutEmpresaInput>;
};
export type SolicitudVisitaUpdateManyWithWhereWithoutEmpresaInput = {
    where: Prisma.SolicitudVisitaScalarWhereInput;
    data: Prisma.XOR<Prisma.SolicitudVisitaUpdateManyMutationInput, Prisma.SolicitudVisitaUncheckedUpdateManyWithoutEmpresaInput>;
};
export type SolicitudVisitaScalarWhereInput = {
    AND?: Prisma.SolicitudVisitaScalarWhereInput | Prisma.SolicitudVisitaScalarWhereInput[];
    OR?: Prisma.SolicitudVisitaScalarWhereInput[];
    NOT?: Prisma.SolicitudVisitaScalarWhereInput | Prisma.SolicitudVisitaScalarWhereInput[];
    id?: Prisma.IntFilter<"SolicitudVisita"> | number;
    personaId?: Prisma.IntFilter<"SolicitudVisita"> | number;
    empresaId?: Prisma.IntFilter<"SolicitudVisita"> | number;
    personaVisitada?: Prisma.StringFilter<"SolicitudVisita"> | string;
    motivo?: Prisma.StringFilter<"SolicitudVisita"> | string;
    fechaHoraProgramada?: Prisma.DateTimeFilter<"SolicitudVisita"> | Date | string;
    estado?: Prisma.EnumEstadoSolicitudVisitaFilter<"SolicitudVisita"> | $Enums.EstadoSolicitudVisita;
    creadoEn?: Prisma.DateTimeFilter<"SolicitudVisita"> | Date | string;
};
export type SolicitudVisitaCreateWithoutPersonaInput = {
    personaVisitada: string;
    motivo: string;
    fechaHoraProgramada: Date | string;
    estado?: $Enums.EstadoSolicitudVisita;
    creadoEn?: Date | string;
    empresa: Prisma.EmpresaCreateNestedOneWithoutSolicitudesVisitaInput;
};
export type SolicitudVisitaUncheckedCreateWithoutPersonaInput = {
    id?: number;
    empresaId: number;
    personaVisitada: string;
    motivo: string;
    fechaHoraProgramada: Date | string;
    estado?: $Enums.EstadoSolicitudVisita;
    creadoEn?: Date | string;
};
export type SolicitudVisitaCreateOrConnectWithoutPersonaInput = {
    where: Prisma.SolicitudVisitaWhereUniqueInput;
    create: Prisma.XOR<Prisma.SolicitudVisitaCreateWithoutPersonaInput, Prisma.SolicitudVisitaUncheckedCreateWithoutPersonaInput>;
};
export type SolicitudVisitaCreateManyPersonaInputEnvelope = {
    data: Prisma.SolicitudVisitaCreateManyPersonaInput | Prisma.SolicitudVisitaCreateManyPersonaInput[];
    skipDuplicates?: boolean;
};
export type SolicitudVisitaUpsertWithWhereUniqueWithoutPersonaInput = {
    where: Prisma.SolicitudVisitaWhereUniqueInput;
    update: Prisma.XOR<Prisma.SolicitudVisitaUpdateWithoutPersonaInput, Prisma.SolicitudVisitaUncheckedUpdateWithoutPersonaInput>;
    create: Prisma.XOR<Prisma.SolicitudVisitaCreateWithoutPersonaInput, Prisma.SolicitudVisitaUncheckedCreateWithoutPersonaInput>;
};
export type SolicitudVisitaUpdateWithWhereUniqueWithoutPersonaInput = {
    where: Prisma.SolicitudVisitaWhereUniqueInput;
    data: Prisma.XOR<Prisma.SolicitudVisitaUpdateWithoutPersonaInput, Prisma.SolicitudVisitaUncheckedUpdateWithoutPersonaInput>;
};
export type SolicitudVisitaUpdateManyWithWhereWithoutPersonaInput = {
    where: Prisma.SolicitudVisitaScalarWhereInput;
    data: Prisma.XOR<Prisma.SolicitudVisitaUpdateManyMutationInput, Prisma.SolicitudVisitaUncheckedUpdateManyWithoutPersonaInput>;
};
export type SolicitudVisitaCreateManyEmpresaInput = {
    id?: number;
    personaId: number;
    personaVisitada: string;
    motivo: string;
    fechaHoraProgramada: Date | string;
    estado?: $Enums.EstadoSolicitudVisita;
    creadoEn?: Date | string;
};
export type SolicitudVisitaUpdateWithoutEmpresaInput = {
    personaVisitada?: Prisma.StringFieldUpdateOperationsInput | string;
    motivo?: Prisma.StringFieldUpdateOperationsInput | string;
    fechaHoraProgramada?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    estado?: Prisma.EnumEstadoSolicitudVisitaFieldUpdateOperationsInput | $Enums.EstadoSolicitudVisita;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    persona?: Prisma.PersonaUpdateOneRequiredWithoutSolicitudesVisitaNestedInput;
};
export type SolicitudVisitaUncheckedUpdateWithoutEmpresaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personaId?: Prisma.IntFieldUpdateOperationsInput | number;
    personaVisitada?: Prisma.StringFieldUpdateOperationsInput | string;
    motivo?: Prisma.StringFieldUpdateOperationsInput | string;
    fechaHoraProgramada?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    estado?: Prisma.EnumEstadoSolicitudVisitaFieldUpdateOperationsInput | $Enums.EstadoSolicitudVisita;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SolicitudVisitaUncheckedUpdateManyWithoutEmpresaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    personaId?: Prisma.IntFieldUpdateOperationsInput | number;
    personaVisitada?: Prisma.StringFieldUpdateOperationsInput | string;
    motivo?: Prisma.StringFieldUpdateOperationsInput | string;
    fechaHoraProgramada?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    estado?: Prisma.EnumEstadoSolicitudVisitaFieldUpdateOperationsInput | $Enums.EstadoSolicitudVisita;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SolicitudVisitaCreateManyPersonaInput = {
    id?: number;
    empresaId: number;
    personaVisitada: string;
    motivo: string;
    fechaHoraProgramada: Date | string;
    estado?: $Enums.EstadoSolicitudVisita;
    creadoEn?: Date | string;
};
export type SolicitudVisitaUpdateWithoutPersonaInput = {
    personaVisitada?: Prisma.StringFieldUpdateOperationsInput | string;
    motivo?: Prisma.StringFieldUpdateOperationsInput | string;
    fechaHoraProgramada?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    estado?: Prisma.EnumEstadoSolicitudVisitaFieldUpdateOperationsInput | $Enums.EstadoSolicitudVisita;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    empresa?: Prisma.EmpresaUpdateOneRequiredWithoutSolicitudesVisitaNestedInput;
};
export type SolicitudVisitaUncheckedUpdateWithoutPersonaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    empresaId?: Prisma.IntFieldUpdateOperationsInput | number;
    personaVisitada?: Prisma.StringFieldUpdateOperationsInput | string;
    motivo?: Prisma.StringFieldUpdateOperationsInput | string;
    fechaHoraProgramada?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    estado?: Prisma.EnumEstadoSolicitudVisitaFieldUpdateOperationsInput | $Enums.EstadoSolicitudVisita;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SolicitudVisitaUncheckedUpdateManyWithoutPersonaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    empresaId?: Prisma.IntFieldUpdateOperationsInput | number;
    personaVisitada?: Prisma.StringFieldUpdateOperationsInput | string;
    motivo?: Prisma.StringFieldUpdateOperationsInput | string;
    fechaHoraProgramada?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    estado?: Prisma.EnumEstadoSolicitudVisitaFieldUpdateOperationsInput | $Enums.EstadoSolicitudVisita;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SolicitudVisitaSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    personaId?: boolean;
    empresaId?: boolean;
    personaVisitada?: boolean;
    motivo?: boolean;
    fechaHoraProgramada?: boolean;
    estado?: boolean;
    creadoEn?: boolean;
    persona?: boolean | Prisma.PersonaDefaultArgs<ExtArgs>;
    empresa?: boolean | Prisma.EmpresaDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["solicitudVisita"]>;
export type SolicitudVisitaSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    personaId?: boolean;
    empresaId?: boolean;
    personaVisitada?: boolean;
    motivo?: boolean;
    fechaHoraProgramada?: boolean;
    estado?: boolean;
    creadoEn?: boolean;
    persona?: boolean | Prisma.PersonaDefaultArgs<ExtArgs>;
    empresa?: boolean | Prisma.EmpresaDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["solicitudVisita"]>;
export type SolicitudVisitaSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    personaId?: boolean;
    empresaId?: boolean;
    personaVisitada?: boolean;
    motivo?: boolean;
    fechaHoraProgramada?: boolean;
    estado?: boolean;
    creadoEn?: boolean;
    persona?: boolean | Prisma.PersonaDefaultArgs<ExtArgs>;
    empresa?: boolean | Prisma.EmpresaDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["solicitudVisita"]>;
export type SolicitudVisitaSelectScalar = {
    id?: boolean;
    personaId?: boolean;
    empresaId?: boolean;
    personaVisitada?: boolean;
    motivo?: boolean;
    fechaHoraProgramada?: boolean;
    estado?: boolean;
    creadoEn?: boolean;
};
export type SolicitudVisitaOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "personaId" | "empresaId" | "personaVisitada" | "motivo" | "fechaHoraProgramada" | "estado" | "creadoEn", ExtArgs["result"]["solicitudVisita"]>;
export type SolicitudVisitaInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    persona?: boolean | Prisma.PersonaDefaultArgs<ExtArgs>;
    empresa?: boolean | Prisma.EmpresaDefaultArgs<ExtArgs>;
};
export type SolicitudVisitaIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    persona?: boolean | Prisma.PersonaDefaultArgs<ExtArgs>;
    empresa?: boolean | Prisma.EmpresaDefaultArgs<ExtArgs>;
};
export type SolicitudVisitaIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    persona?: boolean | Prisma.PersonaDefaultArgs<ExtArgs>;
    empresa?: boolean | Prisma.EmpresaDefaultArgs<ExtArgs>;
};
export type $SolicitudVisitaPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "SolicitudVisita";
    objects: {
        persona: Prisma.$PersonaPayload<ExtArgs>;
        empresa: Prisma.$EmpresaPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        personaId: number;
        empresaId: number;
        personaVisitada: string;
        motivo: string;
        fechaHoraProgramada: Date;
        estado: $Enums.EstadoSolicitudVisita;
        creadoEn: Date;
    }, ExtArgs["result"]["solicitudVisita"]>;
    composites: {};
};
export type SolicitudVisitaGetPayload<S extends boolean | null | undefined | SolicitudVisitaDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$SolicitudVisitaPayload, S>;
export type SolicitudVisitaCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<SolicitudVisitaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: SolicitudVisitaCountAggregateInputType | true;
};
export interface SolicitudVisitaDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['SolicitudVisita'];
        meta: {
            name: 'SolicitudVisita';
        };
    };
    findUnique<T extends SolicitudVisitaFindUniqueArgs>(args: Prisma.SelectSubset<T, SolicitudVisitaFindUniqueArgs<ExtArgs>>): Prisma.Prisma__SolicitudVisitaClient<runtime.Types.Result.GetResult<Prisma.$SolicitudVisitaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends SolicitudVisitaFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, SolicitudVisitaFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__SolicitudVisitaClient<runtime.Types.Result.GetResult<Prisma.$SolicitudVisitaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends SolicitudVisitaFindFirstArgs>(args?: Prisma.SelectSubset<T, SolicitudVisitaFindFirstArgs<ExtArgs>>): Prisma.Prisma__SolicitudVisitaClient<runtime.Types.Result.GetResult<Prisma.$SolicitudVisitaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends SolicitudVisitaFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, SolicitudVisitaFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__SolicitudVisitaClient<runtime.Types.Result.GetResult<Prisma.$SolicitudVisitaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends SolicitudVisitaFindManyArgs>(args?: Prisma.SelectSubset<T, SolicitudVisitaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SolicitudVisitaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends SolicitudVisitaCreateArgs>(args: Prisma.SelectSubset<T, SolicitudVisitaCreateArgs<ExtArgs>>): Prisma.Prisma__SolicitudVisitaClient<runtime.Types.Result.GetResult<Prisma.$SolicitudVisitaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends SolicitudVisitaCreateManyArgs>(args?: Prisma.SelectSubset<T, SolicitudVisitaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends SolicitudVisitaCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, SolicitudVisitaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SolicitudVisitaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends SolicitudVisitaDeleteArgs>(args: Prisma.SelectSubset<T, SolicitudVisitaDeleteArgs<ExtArgs>>): Prisma.Prisma__SolicitudVisitaClient<runtime.Types.Result.GetResult<Prisma.$SolicitudVisitaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends SolicitudVisitaUpdateArgs>(args: Prisma.SelectSubset<T, SolicitudVisitaUpdateArgs<ExtArgs>>): Prisma.Prisma__SolicitudVisitaClient<runtime.Types.Result.GetResult<Prisma.$SolicitudVisitaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends SolicitudVisitaDeleteManyArgs>(args?: Prisma.SelectSubset<T, SolicitudVisitaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends SolicitudVisitaUpdateManyArgs>(args: Prisma.SelectSubset<T, SolicitudVisitaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends SolicitudVisitaUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, SolicitudVisitaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SolicitudVisitaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends SolicitudVisitaUpsertArgs>(args: Prisma.SelectSubset<T, SolicitudVisitaUpsertArgs<ExtArgs>>): Prisma.Prisma__SolicitudVisitaClient<runtime.Types.Result.GetResult<Prisma.$SolicitudVisitaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends SolicitudVisitaCountArgs>(args?: Prisma.Subset<T, SolicitudVisitaCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], SolicitudVisitaCountAggregateOutputType> : number>;
    aggregate<T extends SolicitudVisitaAggregateArgs>(args: Prisma.Subset<T, SolicitudVisitaAggregateArgs>): Prisma.PrismaPromise<GetSolicitudVisitaAggregateType<T>>;
    groupBy<T extends SolicitudVisitaGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: SolicitudVisitaGroupByArgs['orderBy'];
    } : {
        orderBy?: SolicitudVisitaGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, SolicitudVisitaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSolicitudVisitaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: SolicitudVisitaFieldRefs;
}
export interface Prisma__SolicitudVisitaClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    persona<T extends Prisma.PersonaDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PersonaDefaultArgs<ExtArgs>>): Prisma.Prisma__PersonaClient<runtime.Types.Result.GetResult<Prisma.$PersonaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    empresa<T extends Prisma.EmpresaDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EmpresaDefaultArgs<ExtArgs>>): Prisma.Prisma__EmpresaClient<runtime.Types.Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface SolicitudVisitaFieldRefs {
    readonly id: Prisma.FieldRef<"SolicitudVisita", 'Int'>;
    readonly personaId: Prisma.FieldRef<"SolicitudVisita", 'Int'>;
    readonly empresaId: Prisma.FieldRef<"SolicitudVisita", 'Int'>;
    readonly personaVisitada: Prisma.FieldRef<"SolicitudVisita", 'String'>;
    readonly motivo: Prisma.FieldRef<"SolicitudVisita", 'String'>;
    readonly fechaHoraProgramada: Prisma.FieldRef<"SolicitudVisita", 'DateTime'>;
    readonly estado: Prisma.FieldRef<"SolicitudVisita", 'EstadoSolicitudVisita'>;
    readonly creadoEn: Prisma.FieldRef<"SolicitudVisita", 'DateTime'>;
}
export type SolicitudVisitaFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudVisitaSelect<ExtArgs> | null;
    omit?: Prisma.SolicitudVisitaOmit<ExtArgs> | null;
    include?: Prisma.SolicitudVisitaInclude<ExtArgs> | null;
    where: Prisma.SolicitudVisitaWhereUniqueInput;
};
export type SolicitudVisitaFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudVisitaSelect<ExtArgs> | null;
    omit?: Prisma.SolicitudVisitaOmit<ExtArgs> | null;
    include?: Prisma.SolicitudVisitaInclude<ExtArgs> | null;
    where: Prisma.SolicitudVisitaWhereUniqueInput;
};
export type SolicitudVisitaFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudVisitaSelect<ExtArgs> | null;
    omit?: Prisma.SolicitudVisitaOmit<ExtArgs> | null;
    include?: Prisma.SolicitudVisitaInclude<ExtArgs> | null;
    where?: Prisma.SolicitudVisitaWhereInput;
    orderBy?: Prisma.SolicitudVisitaOrderByWithRelationInput | Prisma.SolicitudVisitaOrderByWithRelationInput[];
    cursor?: Prisma.SolicitudVisitaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SolicitudVisitaScalarFieldEnum | Prisma.SolicitudVisitaScalarFieldEnum[];
};
export type SolicitudVisitaFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudVisitaSelect<ExtArgs> | null;
    omit?: Prisma.SolicitudVisitaOmit<ExtArgs> | null;
    include?: Prisma.SolicitudVisitaInclude<ExtArgs> | null;
    where?: Prisma.SolicitudVisitaWhereInput;
    orderBy?: Prisma.SolicitudVisitaOrderByWithRelationInput | Prisma.SolicitudVisitaOrderByWithRelationInput[];
    cursor?: Prisma.SolicitudVisitaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SolicitudVisitaScalarFieldEnum | Prisma.SolicitudVisitaScalarFieldEnum[];
};
export type SolicitudVisitaFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudVisitaSelect<ExtArgs> | null;
    omit?: Prisma.SolicitudVisitaOmit<ExtArgs> | null;
    include?: Prisma.SolicitudVisitaInclude<ExtArgs> | null;
    where?: Prisma.SolicitudVisitaWhereInput;
    orderBy?: Prisma.SolicitudVisitaOrderByWithRelationInput | Prisma.SolicitudVisitaOrderByWithRelationInput[];
    cursor?: Prisma.SolicitudVisitaWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SolicitudVisitaScalarFieldEnum | Prisma.SolicitudVisitaScalarFieldEnum[];
};
export type SolicitudVisitaCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudVisitaSelect<ExtArgs> | null;
    omit?: Prisma.SolicitudVisitaOmit<ExtArgs> | null;
    include?: Prisma.SolicitudVisitaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SolicitudVisitaCreateInput, Prisma.SolicitudVisitaUncheckedCreateInput>;
};
export type SolicitudVisitaCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.SolicitudVisitaCreateManyInput | Prisma.SolicitudVisitaCreateManyInput[];
    skipDuplicates?: boolean;
};
export type SolicitudVisitaCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudVisitaSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SolicitudVisitaOmit<ExtArgs> | null;
    data: Prisma.SolicitudVisitaCreateManyInput | Prisma.SolicitudVisitaCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.SolicitudVisitaIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type SolicitudVisitaUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudVisitaSelect<ExtArgs> | null;
    omit?: Prisma.SolicitudVisitaOmit<ExtArgs> | null;
    include?: Prisma.SolicitudVisitaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SolicitudVisitaUpdateInput, Prisma.SolicitudVisitaUncheckedUpdateInput>;
    where: Prisma.SolicitudVisitaWhereUniqueInput;
};
export type SolicitudVisitaUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.SolicitudVisitaUpdateManyMutationInput, Prisma.SolicitudVisitaUncheckedUpdateManyInput>;
    where?: Prisma.SolicitudVisitaWhereInput;
    limit?: number;
};
export type SolicitudVisitaUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudVisitaSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SolicitudVisitaOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SolicitudVisitaUpdateManyMutationInput, Prisma.SolicitudVisitaUncheckedUpdateManyInput>;
    where?: Prisma.SolicitudVisitaWhereInput;
    limit?: number;
    include?: Prisma.SolicitudVisitaIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type SolicitudVisitaUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudVisitaSelect<ExtArgs> | null;
    omit?: Prisma.SolicitudVisitaOmit<ExtArgs> | null;
    include?: Prisma.SolicitudVisitaInclude<ExtArgs> | null;
    where: Prisma.SolicitudVisitaWhereUniqueInput;
    create: Prisma.XOR<Prisma.SolicitudVisitaCreateInput, Prisma.SolicitudVisitaUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.SolicitudVisitaUpdateInput, Prisma.SolicitudVisitaUncheckedUpdateInput>;
};
export type SolicitudVisitaDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudVisitaSelect<ExtArgs> | null;
    omit?: Prisma.SolicitudVisitaOmit<ExtArgs> | null;
    include?: Prisma.SolicitudVisitaInclude<ExtArgs> | null;
    where: Prisma.SolicitudVisitaWhereUniqueInput;
};
export type SolicitudVisitaDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SolicitudVisitaWhereInput;
    limit?: number;
};
export type SolicitudVisitaDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SolicitudVisitaSelect<ExtArgs> | null;
    omit?: Prisma.SolicitudVisitaOmit<ExtArgs> | null;
    include?: Prisma.SolicitudVisitaInclude<ExtArgs> | null;
};
