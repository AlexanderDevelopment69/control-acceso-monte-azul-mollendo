import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type PuestoModel = runtime.Types.Result.DefaultSelection<Prisma.$PuestoPayload>;
export type AggregatePuesto = {
    _count: PuestoCountAggregateOutputType | null;
    _avg: PuestoAvgAggregateOutputType | null;
    _sum: PuestoSumAggregateOutputType | null;
    _min: PuestoMinAggregateOutputType | null;
    _max: PuestoMaxAggregateOutputType | null;
};
export type PuestoAvgAggregateOutputType = {
    id: number | null;
};
export type PuestoSumAggregateOutputType = {
    id: number | null;
};
export type PuestoMinAggregateOutputType = {
    id: number | null;
    nombre: string | null;
    caso: $Enums.CasoPuesto | null;
};
export type PuestoMaxAggregateOutputType = {
    id: number | null;
    nombre: string | null;
    caso: $Enums.CasoPuesto | null;
};
export type PuestoCountAggregateOutputType = {
    id: number;
    nombre: number;
    caso: number;
    _all: number;
};
export type PuestoAvgAggregateInputType = {
    id?: true;
};
export type PuestoSumAggregateInputType = {
    id?: true;
};
export type PuestoMinAggregateInputType = {
    id?: true;
    nombre?: true;
    caso?: true;
};
export type PuestoMaxAggregateInputType = {
    id?: true;
    nombre?: true;
    caso?: true;
};
export type PuestoCountAggregateInputType = {
    id?: true;
    nombre?: true;
    caso?: true;
    _all?: true;
};
export type PuestoAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PuestoWhereInput;
    orderBy?: Prisma.PuestoOrderByWithRelationInput | Prisma.PuestoOrderByWithRelationInput[];
    cursor?: Prisma.PuestoWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | PuestoCountAggregateInputType;
    _avg?: PuestoAvgAggregateInputType;
    _sum?: PuestoSumAggregateInputType;
    _min?: PuestoMinAggregateInputType;
    _max?: PuestoMaxAggregateInputType;
};
export type GetPuestoAggregateType<T extends PuestoAggregateArgs> = {
    [P in keyof T & keyof AggregatePuesto]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregatePuesto[P]> : Prisma.GetScalarType<T[P], AggregatePuesto[P]>;
};
export type PuestoGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PuestoWhereInput;
    orderBy?: Prisma.PuestoOrderByWithAggregationInput | Prisma.PuestoOrderByWithAggregationInput[];
    by: Prisma.PuestoScalarFieldEnum[] | Prisma.PuestoScalarFieldEnum;
    having?: Prisma.PuestoScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PuestoCountAggregateInputType | true;
    _avg?: PuestoAvgAggregateInputType;
    _sum?: PuestoSumAggregateInputType;
    _min?: PuestoMinAggregateInputType;
    _max?: PuestoMaxAggregateInputType;
};
export type PuestoGroupByOutputType = {
    id: number;
    nombre: string;
    caso: $Enums.CasoPuesto;
    _count: PuestoCountAggregateOutputType | null;
    _avg: PuestoAvgAggregateOutputType | null;
    _sum: PuestoSumAggregateOutputType | null;
    _min: PuestoMinAggregateOutputType | null;
    _max: PuestoMaxAggregateOutputType | null;
};
export type GetPuestoGroupByPayload<T extends PuestoGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PuestoGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof PuestoGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PuestoGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PuestoGroupByOutputType[P]>;
}>>;
export type PuestoWhereInput = {
    AND?: Prisma.PuestoWhereInput | Prisma.PuestoWhereInput[];
    OR?: Prisma.PuestoWhereInput[];
    NOT?: Prisma.PuestoWhereInput | Prisma.PuestoWhereInput[];
    id?: Prisma.IntFilter<"Puesto"> | number;
    nombre?: Prisma.StringFilter<"Puesto"> | string;
    caso?: Prisma.EnumCasoPuestoFilter<"Puesto"> | $Enums.CasoPuesto;
    personas?: Prisma.PersonaListRelationFilter;
    requisitos?: Prisma.RequisitoPorPuestoListRelationFilter;
};
export type PuestoOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    nombre?: Prisma.SortOrder;
    caso?: Prisma.SortOrder;
    personas?: Prisma.PersonaOrderByRelationAggregateInput;
    requisitos?: Prisma.RequisitoPorPuestoOrderByRelationAggregateInput;
};
export type PuestoWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    nombre_caso?: Prisma.PuestoNombreCasoCompoundUniqueInput;
    AND?: Prisma.PuestoWhereInput | Prisma.PuestoWhereInput[];
    OR?: Prisma.PuestoWhereInput[];
    NOT?: Prisma.PuestoWhereInput | Prisma.PuestoWhereInput[];
    nombre?: Prisma.StringFilter<"Puesto"> | string;
    caso?: Prisma.EnumCasoPuestoFilter<"Puesto"> | $Enums.CasoPuesto;
    personas?: Prisma.PersonaListRelationFilter;
    requisitos?: Prisma.RequisitoPorPuestoListRelationFilter;
}, "id" | "nombre_caso">;
export type PuestoOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    nombre?: Prisma.SortOrder;
    caso?: Prisma.SortOrder;
    _count?: Prisma.PuestoCountOrderByAggregateInput;
    _avg?: Prisma.PuestoAvgOrderByAggregateInput;
    _max?: Prisma.PuestoMaxOrderByAggregateInput;
    _min?: Prisma.PuestoMinOrderByAggregateInput;
    _sum?: Prisma.PuestoSumOrderByAggregateInput;
};
export type PuestoScalarWhereWithAggregatesInput = {
    AND?: Prisma.PuestoScalarWhereWithAggregatesInput | Prisma.PuestoScalarWhereWithAggregatesInput[];
    OR?: Prisma.PuestoScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PuestoScalarWhereWithAggregatesInput | Prisma.PuestoScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Puesto"> | number;
    nombre?: Prisma.StringWithAggregatesFilter<"Puesto"> | string;
    caso?: Prisma.EnumCasoPuestoWithAggregatesFilter<"Puesto"> | $Enums.CasoPuesto;
};
export type PuestoCreateInput = {
    nombre: string;
    caso: $Enums.CasoPuesto;
    personas?: Prisma.PersonaCreateNestedManyWithoutPuestoInput;
    requisitos?: Prisma.RequisitoPorPuestoCreateNestedManyWithoutPuestoInput;
};
export type PuestoUncheckedCreateInput = {
    id?: number;
    nombre: string;
    caso: $Enums.CasoPuesto;
    personas?: Prisma.PersonaUncheckedCreateNestedManyWithoutPuestoInput;
    requisitos?: Prisma.RequisitoPorPuestoUncheckedCreateNestedManyWithoutPuestoInput;
};
export type PuestoUpdateInput = {
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    caso?: Prisma.EnumCasoPuestoFieldUpdateOperationsInput | $Enums.CasoPuesto;
    personas?: Prisma.PersonaUpdateManyWithoutPuestoNestedInput;
    requisitos?: Prisma.RequisitoPorPuestoUpdateManyWithoutPuestoNestedInput;
};
export type PuestoUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    caso?: Prisma.EnumCasoPuestoFieldUpdateOperationsInput | $Enums.CasoPuesto;
    personas?: Prisma.PersonaUncheckedUpdateManyWithoutPuestoNestedInput;
    requisitos?: Prisma.RequisitoPorPuestoUncheckedUpdateManyWithoutPuestoNestedInput;
};
export type PuestoCreateManyInput = {
    id?: number;
    nombre: string;
    caso: $Enums.CasoPuesto;
};
export type PuestoUpdateManyMutationInput = {
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    caso?: Prisma.EnumCasoPuestoFieldUpdateOperationsInput | $Enums.CasoPuesto;
};
export type PuestoUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    caso?: Prisma.EnumCasoPuestoFieldUpdateOperationsInput | $Enums.CasoPuesto;
};
export type PuestoNombreCasoCompoundUniqueInput = {
    nombre: string;
    caso: $Enums.CasoPuesto;
};
export type PuestoCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nombre?: Prisma.SortOrder;
    caso?: Prisma.SortOrder;
};
export type PuestoAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type PuestoMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nombre?: Prisma.SortOrder;
    caso?: Prisma.SortOrder;
};
export type PuestoMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nombre?: Prisma.SortOrder;
    caso?: Prisma.SortOrder;
};
export type PuestoSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type PuestoNullableScalarRelationFilter = {
    is?: Prisma.PuestoWhereInput | null;
    isNot?: Prisma.PuestoWhereInput | null;
};
export type PuestoScalarRelationFilter = {
    is?: Prisma.PuestoWhereInput;
    isNot?: Prisma.PuestoWhereInput;
};
export type EnumCasoPuestoFieldUpdateOperationsInput = {
    set?: $Enums.CasoPuesto;
};
export type PuestoCreateNestedOneWithoutPersonasInput = {
    create?: Prisma.XOR<Prisma.PuestoCreateWithoutPersonasInput, Prisma.PuestoUncheckedCreateWithoutPersonasInput>;
    connectOrCreate?: Prisma.PuestoCreateOrConnectWithoutPersonasInput;
    connect?: Prisma.PuestoWhereUniqueInput;
};
export type PuestoUpdateOneWithoutPersonasNestedInput = {
    create?: Prisma.XOR<Prisma.PuestoCreateWithoutPersonasInput, Prisma.PuestoUncheckedCreateWithoutPersonasInput>;
    connectOrCreate?: Prisma.PuestoCreateOrConnectWithoutPersonasInput;
    upsert?: Prisma.PuestoUpsertWithoutPersonasInput;
    disconnect?: Prisma.PuestoWhereInput | boolean;
    delete?: Prisma.PuestoWhereInput | boolean;
    connect?: Prisma.PuestoWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PuestoUpdateToOneWithWhereWithoutPersonasInput, Prisma.PuestoUpdateWithoutPersonasInput>, Prisma.PuestoUncheckedUpdateWithoutPersonasInput>;
};
export type PuestoCreateNestedOneWithoutRequisitosInput = {
    create?: Prisma.XOR<Prisma.PuestoCreateWithoutRequisitosInput, Prisma.PuestoUncheckedCreateWithoutRequisitosInput>;
    connectOrCreate?: Prisma.PuestoCreateOrConnectWithoutRequisitosInput;
    connect?: Prisma.PuestoWhereUniqueInput;
};
export type PuestoUpdateOneRequiredWithoutRequisitosNestedInput = {
    create?: Prisma.XOR<Prisma.PuestoCreateWithoutRequisitosInput, Prisma.PuestoUncheckedCreateWithoutRequisitosInput>;
    connectOrCreate?: Prisma.PuestoCreateOrConnectWithoutRequisitosInput;
    upsert?: Prisma.PuestoUpsertWithoutRequisitosInput;
    connect?: Prisma.PuestoWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PuestoUpdateToOneWithWhereWithoutRequisitosInput, Prisma.PuestoUpdateWithoutRequisitosInput>, Prisma.PuestoUncheckedUpdateWithoutRequisitosInput>;
};
export type PuestoCreateWithoutPersonasInput = {
    nombre: string;
    caso: $Enums.CasoPuesto;
    requisitos?: Prisma.RequisitoPorPuestoCreateNestedManyWithoutPuestoInput;
};
export type PuestoUncheckedCreateWithoutPersonasInput = {
    id?: number;
    nombre: string;
    caso: $Enums.CasoPuesto;
    requisitos?: Prisma.RequisitoPorPuestoUncheckedCreateNestedManyWithoutPuestoInput;
};
export type PuestoCreateOrConnectWithoutPersonasInput = {
    where: Prisma.PuestoWhereUniqueInput;
    create: Prisma.XOR<Prisma.PuestoCreateWithoutPersonasInput, Prisma.PuestoUncheckedCreateWithoutPersonasInput>;
};
export type PuestoUpsertWithoutPersonasInput = {
    update: Prisma.XOR<Prisma.PuestoUpdateWithoutPersonasInput, Prisma.PuestoUncheckedUpdateWithoutPersonasInput>;
    create: Prisma.XOR<Prisma.PuestoCreateWithoutPersonasInput, Prisma.PuestoUncheckedCreateWithoutPersonasInput>;
    where?: Prisma.PuestoWhereInput;
};
export type PuestoUpdateToOneWithWhereWithoutPersonasInput = {
    where?: Prisma.PuestoWhereInput;
    data: Prisma.XOR<Prisma.PuestoUpdateWithoutPersonasInput, Prisma.PuestoUncheckedUpdateWithoutPersonasInput>;
};
export type PuestoUpdateWithoutPersonasInput = {
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    caso?: Prisma.EnumCasoPuestoFieldUpdateOperationsInput | $Enums.CasoPuesto;
    requisitos?: Prisma.RequisitoPorPuestoUpdateManyWithoutPuestoNestedInput;
};
export type PuestoUncheckedUpdateWithoutPersonasInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    caso?: Prisma.EnumCasoPuestoFieldUpdateOperationsInput | $Enums.CasoPuesto;
    requisitos?: Prisma.RequisitoPorPuestoUncheckedUpdateManyWithoutPuestoNestedInput;
};
export type PuestoCreateWithoutRequisitosInput = {
    nombre: string;
    caso: $Enums.CasoPuesto;
    personas?: Prisma.PersonaCreateNestedManyWithoutPuestoInput;
};
export type PuestoUncheckedCreateWithoutRequisitosInput = {
    id?: number;
    nombre: string;
    caso: $Enums.CasoPuesto;
    personas?: Prisma.PersonaUncheckedCreateNestedManyWithoutPuestoInput;
};
export type PuestoCreateOrConnectWithoutRequisitosInput = {
    where: Prisma.PuestoWhereUniqueInput;
    create: Prisma.XOR<Prisma.PuestoCreateWithoutRequisitosInput, Prisma.PuestoUncheckedCreateWithoutRequisitosInput>;
};
export type PuestoUpsertWithoutRequisitosInput = {
    update: Prisma.XOR<Prisma.PuestoUpdateWithoutRequisitosInput, Prisma.PuestoUncheckedUpdateWithoutRequisitosInput>;
    create: Prisma.XOR<Prisma.PuestoCreateWithoutRequisitosInput, Prisma.PuestoUncheckedCreateWithoutRequisitosInput>;
    where?: Prisma.PuestoWhereInput;
};
export type PuestoUpdateToOneWithWhereWithoutRequisitosInput = {
    where?: Prisma.PuestoWhereInput;
    data: Prisma.XOR<Prisma.PuestoUpdateWithoutRequisitosInput, Prisma.PuestoUncheckedUpdateWithoutRequisitosInput>;
};
export type PuestoUpdateWithoutRequisitosInput = {
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    caso?: Prisma.EnumCasoPuestoFieldUpdateOperationsInput | $Enums.CasoPuesto;
    personas?: Prisma.PersonaUpdateManyWithoutPuestoNestedInput;
};
export type PuestoUncheckedUpdateWithoutRequisitosInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    caso?: Prisma.EnumCasoPuestoFieldUpdateOperationsInput | $Enums.CasoPuesto;
    personas?: Prisma.PersonaUncheckedUpdateManyWithoutPuestoNestedInput;
};
export type PuestoCountOutputType = {
    personas: number;
    requisitos: number;
};
export type PuestoCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    personas?: boolean | PuestoCountOutputTypeCountPersonasArgs;
    requisitos?: boolean | PuestoCountOutputTypeCountRequisitosArgs;
};
export type PuestoCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PuestoCountOutputTypeSelect<ExtArgs> | null;
};
export type PuestoCountOutputTypeCountPersonasArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonaWhereInput;
};
export type PuestoCountOutputTypeCountRequisitosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RequisitoPorPuestoWhereInput;
};
export type PuestoSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nombre?: boolean;
    caso?: boolean;
    personas?: boolean | Prisma.Puesto$personasArgs<ExtArgs>;
    requisitos?: boolean | Prisma.Puesto$requisitosArgs<ExtArgs>;
    _count?: boolean | Prisma.PuestoCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["puesto"]>;
export type PuestoSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nombre?: boolean;
    caso?: boolean;
}, ExtArgs["result"]["puesto"]>;
export type PuestoSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nombre?: boolean;
    caso?: boolean;
}, ExtArgs["result"]["puesto"]>;
export type PuestoSelectScalar = {
    id?: boolean;
    nombre?: boolean;
    caso?: boolean;
};
export type PuestoOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "nombre" | "caso", ExtArgs["result"]["puesto"]>;
export type PuestoInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    personas?: boolean | Prisma.Puesto$personasArgs<ExtArgs>;
    requisitos?: boolean | Prisma.Puesto$requisitosArgs<ExtArgs>;
    _count?: boolean | Prisma.PuestoCountOutputTypeDefaultArgs<ExtArgs>;
};
export type PuestoIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type PuestoIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $PuestoPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Puesto";
    objects: {
        personas: Prisma.$PersonaPayload<ExtArgs>[];
        requisitos: Prisma.$RequisitoPorPuestoPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        nombre: string;
        caso: $Enums.CasoPuesto;
    }, ExtArgs["result"]["puesto"]>;
    composites: {};
};
export type PuestoGetPayload<S extends boolean | null | undefined | PuestoDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PuestoPayload, S>;
export type PuestoCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PuestoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PuestoCountAggregateInputType | true;
};
export interface PuestoDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Puesto'];
        meta: {
            name: 'Puesto';
        };
    };
    findUnique<T extends PuestoFindUniqueArgs>(args: Prisma.SelectSubset<T, PuestoFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PuestoClient<runtime.Types.Result.GetResult<Prisma.$PuestoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends PuestoFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PuestoFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PuestoClient<runtime.Types.Result.GetResult<Prisma.$PuestoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends PuestoFindFirstArgs>(args?: Prisma.SelectSubset<T, PuestoFindFirstArgs<ExtArgs>>): Prisma.Prisma__PuestoClient<runtime.Types.Result.GetResult<Prisma.$PuestoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends PuestoFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PuestoFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PuestoClient<runtime.Types.Result.GetResult<Prisma.$PuestoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends PuestoFindManyArgs>(args?: Prisma.SelectSubset<T, PuestoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PuestoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends PuestoCreateArgs>(args: Prisma.SelectSubset<T, PuestoCreateArgs<ExtArgs>>): Prisma.Prisma__PuestoClient<runtime.Types.Result.GetResult<Prisma.$PuestoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends PuestoCreateManyArgs>(args?: Prisma.SelectSubset<T, PuestoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends PuestoCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, PuestoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PuestoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends PuestoDeleteArgs>(args: Prisma.SelectSubset<T, PuestoDeleteArgs<ExtArgs>>): Prisma.Prisma__PuestoClient<runtime.Types.Result.GetResult<Prisma.$PuestoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends PuestoUpdateArgs>(args: Prisma.SelectSubset<T, PuestoUpdateArgs<ExtArgs>>): Prisma.Prisma__PuestoClient<runtime.Types.Result.GetResult<Prisma.$PuestoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends PuestoDeleteManyArgs>(args?: Prisma.SelectSubset<T, PuestoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends PuestoUpdateManyArgs>(args: Prisma.SelectSubset<T, PuestoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends PuestoUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, PuestoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PuestoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends PuestoUpsertArgs>(args: Prisma.SelectSubset<T, PuestoUpsertArgs<ExtArgs>>): Prisma.Prisma__PuestoClient<runtime.Types.Result.GetResult<Prisma.$PuestoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends PuestoCountArgs>(args?: Prisma.Subset<T, PuestoCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PuestoCountAggregateOutputType> : number>;
    aggregate<T extends PuestoAggregateArgs>(args: Prisma.Subset<T, PuestoAggregateArgs>): Prisma.PrismaPromise<GetPuestoAggregateType<T>>;
    groupBy<T extends PuestoGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PuestoGroupByArgs['orderBy'];
    } : {
        orderBy?: PuestoGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PuestoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPuestoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: PuestoFieldRefs;
}
export interface Prisma__PuestoClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    personas<T extends Prisma.Puesto$personasArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Puesto$personasArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    requisitos<T extends Prisma.Puesto$requisitosArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Puesto$requisitosArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RequisitoPorPuestoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface PuestoFieldRefs {
    readonly id: Prisma.FieldRef<"Puesto", 'Int'>;
    readonly nombre: Prisma.FieldRef<"Puesto", 'String'>;
    readonly caso: Prisma.FieldRef<"Puesto", 'CasoPuesto'>;
}
export type PuestoFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PuestoSelect<ExtArgs> | null;
    omit?: Prisma.PuestoOmit<ExtArgs> | null;
    include?: Prisma.PuestoInclude<ExtArgs> | null;
    where: Prisma.PuestoWhereUniqueInput;
};
export type PuestoFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PuestoSelect<ExtArgs> | null;
    omit?: Prisma.PuestoOmit<ExtArgs> | null;
    include?: Prisma.PuestoInclude<ExtArgs> | null;
    where: Prisma.PuestoWhereUniqueInput;
};
export type PuestoFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PuestoSelect<ExtArgs> | null;
    omit?: Prisma.PuestoOmit<ExtArgs> | null;
    include?: Prisma.PuestoInclude<ExtArgs> | null;
    where?: Prisma.PuestoWhereInput;
    orderBy?: Prisma.PuestoOrderByWithRelationInput | Prisma.PuestoOrderByWithRelationInput[];
    cursor?: Prisma.PuestoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PuestoScalarFieldEnum | Prisma.PuestoScalarFieldEnum[];
};
export type PuestoFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PuestoSelect<ExtArgs> | null;
    omit?: Prisma.PuestoOmit<ExtArgs> | null;
    include?: Prisma.PuestoInclude<ExtArgs> | null;
    where?: Prisma.PuestoWhereInput;
    orderBy?: Prisma.PuestoOrderByWithRelationInput | Prisma.PuestoOrderByWithRelationInput[];
    cursor?: Prisma.PuestoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PuestoScalarFieldEnum | Prisma.PuestoScalarFieldEnum[];
};
export type PuestoFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PuestoSelect<ExtArgs> | null;
    omit?: Prisma.PuestoOmit<ExtArgs> | null;
    include?: Prisma.PuestoInclude<ExtArgs> | null;
    where?: Prisma.PuestoWhereInput;
    orderBy?: Prisma.PuestoOrderByWithRelationInput | Prisma.PuestoOrderByWithRelationInput[];
    cursor?: Prisma.PuestoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PuestoScalarFieldEnum | Prisma.PuestoScalarFieldEnum[];
};
export type PuestoCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PuestoSelect<ExtArgs> | null;
    omit?: Prisma.PuestoOmit<ExtArgs> | null;
    include?: Prisma.PuestoInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PuestoCreateInput, Prisma.PuestoUncheckedCreateInput>;
};
export type PuestoCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.PuestoCreateManyInput | Prisma.PuestoCreateManyInput[];
    skipDuplicates?: boolean;
};
export type PuestoCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PuestoSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PuestoOmit<ExtArgs> | null;
    data: Prisma.PuestoCreateManyInput | Prisma.PuestoCreateManyInput[];
    skipDuplicates?: boolean;
};
export type PuestoUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PuestoSelect<ExtArgs> | null;
    omit?: Prisma.PuestoOmit<ExtArgs> | null;
    include?: Prisma.PuestoInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PuestoUpdateInput, Prisma.PuestoUncheckedUpdateInput>;
    where: Prisma.PuestoWhereUniqueInput;
};
export type PuestoUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.PuestoUpdateManyMutationInput, Prisma.PuestoUncheckedUpdateManyInput>;
    where?: Prisma.PuestoWhereInput;
    limit?: number;
};
export type PuestoUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PuestoSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PuestoOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PuestoUpdateManyMutationInput, Prisma.PuestoUncheckedUpdateManyInput>;
    where?: Prisma.PuestoWhereInput;
    limit?: number;
};
export type PuestoUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PuestoSelect<ExtArgs> | null;
    omit?: Prisma.PuestoOmit<ExtArgs> | null;
    include?: Prisma.PuestoInclude<ExtArgs> | null;
    where: Prisma.PuestoWhereUniqueInput;
    create: Prisma.XOR<Prisma.PuestoCreateInput, Prisma.PuestoUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.PuestoUpdateInput, Prisma.PuestoUncheckedUpdateInput>;
};
export type PuestoDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PuestoSelect<ExtArgs> | null;
    omit?: Prisma.PuestoOmit<ExtArgs> | null;
    include?: Prisma.PuestoInclude<ExtArgs> | null;
    where: Prisma.PuestoWhereUniqueInput;
};
export type PuestoDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PuestoWhereInput;
    limit?: number;
};
export type Puesto$personasArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Puesto$requisitosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type PuestoDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PuestoSelect<ExtArgs> | null;
    omit?: Prisma.PuestoOmit<ExtArgs> | null;
    include?: Prisma.PuestoInclude<ExtArgs> | null;
};
