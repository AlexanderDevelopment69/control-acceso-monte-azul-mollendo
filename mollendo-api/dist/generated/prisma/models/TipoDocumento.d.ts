import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TipoDocumentoModel = runtime.Types.Result.DefaultSelection<Prisma.$TipoDocumentoPayload>;
export type AggregateTipoDocumento = {
    _count: TipoDocumentoCountAggregateOutputType | null;
    _avg: TipoDocumentoAvgAggregateOutputType | null;
    _sum: TipoDocumentoSumAggregateOutputType | null;
    _min: TipoDocumentoMinAggregateOutputType | null;
    _max: TipoDocumentoMaxAggregateOutputType | null;
};
export type TipoDocumentoAvgAggregateOutputType = {
    id: number | null;
};
export type TipoDocumentoSumAggregateOutputType = {
    id: number | null;
};
export type TipoDocumentoMinAggregateOutputType = {
    id: number | null;
    nombre: string | null;
};
export type TipoDocumentoMaxAggregateOutputType = {
    id: number | null;
    nombre: string | null;
};
export type TipoDocumentoCountAggregateOutputType = {
    id: number;
    nombre: number;
    _all: number;
};
export type TipoDocumentoAvgAggregateInputType = {
    id?: true;
};
export type TipoDocumentoSumAggregateInputType = {
    id?: true;
};
export type TipoDocumentoMinAggregateInputType = {
    id?: true;
    nombre?: true;
};
export type TipoDocumentoMaxAggregateInputType = {
    id?: true;
    nombre?: true;
};
export type TipoDocumentoCountAggregateInputType = {
    id?: true;
    nombre?: true;
    _all?: true;
};
export type TipoDocumentoAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TipoDocumentoWhereInput;
    orderBy?: Prisma.TipoDocumentoOrderByWithRelationInput | Prisma.TipoDocumentoOrderByWithRelationInput[];
    cursor?: Prisma.TipoDocumentoWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TipoDocumentoCountAggregateInputType;
    _avg?: TipoDocumentoAvgAggregateInputType;
    _sum?: TipoDocumentoSumAggregateInputType;
    _min?: TipoDocumentoMinAggregateInputType;
    _max?: TipoDocumentoMaxAggregateInputType;
};
export type GetTipoDocumentoAggregateType<T extends TipoDocumentoAggregateArgs> = {
    [P in keyof T & keyof AggregateTipoDocumento]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTipoDocumento[P]> : Prisma.GetScalarType<T[P], AggregateTipoDocumento[P]>;
};
export type TipoDocumentoGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TipoDocumentoWhereInput;
    orderBy?: Prisma.TipoDocumentoOrderByWithAggregationInput | Prisma.TipoDocumentoOrderByWithAggregationInput[];
    by: Prisma.TipoDocumentoScalarFieldEnum[] | Prisma.TipoDocumentoScalarFieldEnum;
    having?: Prisma.TipoDocumentoScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TipoDocumentoCountAggregateInputType | true;
    _avg?: TipoDocumentoAvgAggregateInputType;
    _sum?: TipoDocumentoSumAggregateInputType;
    _min?: TipoDocumentoMinAggregateInputType;
    _max?: TipoDocumentoMaxAggregateInputType;
};
export type TipoDocumentoGroupByOutputType = {
    id: number;
    nombre: string;
    _count: TipoDocumentoCountAggregateOutputType | null;
    _avg: TipoDocumentoAvgAggregateOutputType | null;
    _sum: TipoDocumentoSumAggregateOutputType | null;
    _min: TipoDocumentoMinAggregateOutputType | null;
    _max: TipoDocumentoMaxAggregateOutputType | null;
};
export type GetTipoDocumentoGroupByPayload<T extends TipoDocumentoGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TipoDocumentoGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TipoDocumentoGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TipoDocumentoGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TipoDocumentoGroupByOutputType[P]>;
}>>;
export type TipoDocumentoWhereInput = {
    AND?: Prisma.TipoDocumentoWhereInput | Prisma.TipoDocumentoWhereInput[];
    OR?: Prisma.TipoDocumentoWhereInput[];
    NOT?: Prisma.TipoDocumentoWhereInput | Prisma.TipoDocumentoWhereInput[];
    id?: Prisma.IntFilter<"TipoDocumento"> | number;
    nombre?: Prisma.StringFilter<"TipoDocumento"> | string;
    documentos?: Prisma.DocumentoPersonaListRelationFilter;
};
export type TipoDocumentoOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    nombre?: Prisma.SortOrder;
    documentos?: Prisma.DocumentoPersonaOrderByRelationAggregateInput;
};
export type TipoDocumentoWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    nombre?: string;
    AND?: Prisma.TipoDocumentoWhereInput | Prisma.TipoDocumentoWhereInput[];
    OR?: Prisma.TipoDocumentoWhereInput[];
    NOT?: Prisma.TipoDocumentoWhereInput | Prisma.TipoDocumentoWhereInput[];
    documentos?: Prisma.DocumentoPersonaListRelationFilter;
}, "id" | "nombre">;
export type TipoDocumentoOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    nombre?: Prisma.SortOrder;
    _count?: Prisma.TipoDocumentoCountOrderByAggregateInput;
    _avg?: Prisma.TipoDocumentoAvgOrderByAggregateInput;
    _max?: Prisma.TipoDocumentoMaxOrderByAggregateInput;
    _min?: Prisma.TipoDocumentoMinOrderByAggregateInput;
    _sum?: Prisma.TipoDocumentoSumOrderByAggregateInput;
};
export type TipoDocumentoScalarWhereWithAggregatesInput = {
    AND?: Prisma.TipoDocumentoScalarWhereWithAggregatesInput | Prisma.TipoDocumentoScalarWhereWithAggregatesInput[];
    OR?: Prisma.TipoDocumentoScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TipoDocumentoScalarWhereWithAggregatesInput | Prisma.TipoDocumentoScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"TipoDocumento"> | number;
    nombre?: Prisma.StringWithAggregatesFilter<"TipoDocumento"> | string;
};
export type TipoDocumentoCreateInput = {
    nombre: string;
    documentos?: Prisma.DocumentoPersonaCreateNestedManyWithoutTipoDocumentoInput;
};
export type TipoDocumentoUncheckedCreateInput = {
    id?: number;
    nombre: string;
    documentos?: Prisma.DocumentoPersonaUncheckedCreateNestedManyWithoutTipoDocumentoInput;
};
export type TipoDocumentoUpdateInput = {
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    documentos?: Prisma.DocumentoPersonaUpdateManyWithoutTipoDocumentoNestedInput;
};
export type TipoDocumentoUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
    documentos?: Prisma.DocumentoPersonaUncheckedUpdateManyWithoutTipoDocumentoNestedInput;
};
export type TipoDocumentoCreateManyInput = {
    id?: number;
    nombre: string;
};
export type TipoDocumentoUpdateManyMutationInput = {
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TipoDocumentoUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TipoDocumentoCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nombre?: Prisma.SortOrder;
};
export type TipoDocumentoAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type TipoDocumentoMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nombre?: Prisma.SortOrder;
};
export type TipoDocumentoMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nombre?: Prisma.SortOrder;
};
export type TipoDocumentoSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type TipoDocumentoScalarRelationFilter = {
    is?: Prisma.TipoDocumentoWhereInput;
    isNot?: Prisma.TipoDocumentoWhereInput;
};
export type TipoDocumentoCreateNestedOneWithoutDocumentosInput = {
    create?: Prisma.XOR<Prisma.TipoDocumentoCreateWithoutDocumentosInput, Prisma.TipoDocumentoUncheckedCreateWithoutDocumentosInput>;
    connectOrCreate?: Prisma.TipoDocumentoCreateOrConnectWithoutDocumentosInput;
    connect?: Prisma.TipoDocumentoWhereUniqueInput;
};
export type TipoDocumentoUpdateOneRequiredWithoutDocumentosNestedInput = {
    create?: Prisma.XOR<Prisma.TipoDocumentoCreateWithoutDocumentosInput, Prisma.TipoDocumentoUncheckedCreateWithoutDocumentosInput>;
    connectOrCreate?: Prisma.TipoDocumentoCreateOrConnectWithoutDocumentosInput;
    upsert?: Prisma.TipoDocumentoUpsertWithoutDocumentosInput;
    connect?: Prisma.TipoDocumentoWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TipoDocumentoUpdateToOneWithWhereWithoutDocumentosInput, Prisma.TipoDocumentoUpdateWithoutDocumentosInput>, Prisma.TipoDocumentoUncheckedUpdateWithoutDocumentosInput>;
};
export type TipoDocumentoCreateWithoutDocumentosInput = {
    nombre: string;
};
export type TipoDocumentoUncheckedCreateWithoutDocumentosInput = {
    id?: number;
    nombre: string;
};
export type TipoDocumentoCreateOrConnectWithoutDocumentosInput = {
    where: Prisma.TipoDocumentoWhereUniqueInput;
    create: Prisma.XOR<Prisma.TipoDocumentoCreateWithoutDocumentosInput, Prisma.TipoDocumentoUncheckedCreateWithoutDocumentosInput>;
};
export type TipoDocumentoUpsertWithoutDocumentosInput = {
    update: Prisma.XOR<Prisma.TipoDocumentoUpdateWithoutDocumentosInput, Prisma.TipoDocumentoUncheckedUpdateWithoutDocumentosInput>;
    create: Prisma.XOR<Prisma.TipoDocumentoCreateWithoutDocumentosInput, Prisma.TipoDocumentoUncheckedCreateWithoutDocumentosInput>;
    where?: Prisma.TipoDocumentoWhereInput;
};
export type TipoDocumentoUpdateToOneWithWhereWithoutDocumentosInput = {
    where?: Prisma.TipoDocumentoWhereInput;
    data: Prisma.XOR<Prisma.TipoDocumentoUpdateWithoutDocumentosInput, Prisma.TipoDocumentoUncheckedUpdateWithoutDocumentosInput>;
};
export type TipoDocumentoUpdateWithoutDocumentosInput = {
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TipoDocumentoUncheckedUpdateWithoutDocumentosInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nombre?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TipoDocumentoCountOutputType = {
    documentos: number;
};
export type TipoDocumentoCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    documentos?: boolean | TipoDocumentoCountOutputTypeCountDocumentosArgs;
};
export type TipoDocumentoCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoDocumentoCountOutputTypeSelect<ExtArgs> | null;
};
export type TipoDocumentoCountOutputTypeCountDocumentosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DocumentoPersonaWhereInput;
};
export type TipoDocumentoSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nombre?: boolean;
    documentos?: boolean | Prisma.TipoDocumento$documentosArgs<ExtArgs>;
    _count?: boolean | Prisma.TipoDocumentoCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tipoDocumento"]>;
export type TipoDocumentoSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nombre?: boolean;
}, ExtArgs["result"]["tipoDocumento"]>;
export type TipoDocumentoSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nombre?: boolean;
}, ExtArgs["result"]["tipoDocumento"]>;
export type TipoDocumentoSelectScalar = {
    id?: boolean;
    nombre?: boolean;
};
export type TipoDocumentoOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "nombre", ExtArgs["result"]["tipoDocumento"]>;
export type TipoDocumentoInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    documentos?: boolean | Prisma.TipoDocumento$documentosArgs<ExtArgs>;
    _count?: boolean | Prisma.TipoDocumentoCountOutputTypeDefaultArgs<ExtArgs>;
};
export type TipoDocumentoIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type TipoDocumentoIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $TipoDocumentoPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "TipoDocumento";
    objects: {
        documentos: Prisma.$DocumentoPersonaPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        nombre: string;
    }, ExtArgs["result"]["tipoDocumento"]>;
    composites: {};
};
export type TipoDocumentoGetPayload<S extends boolean | null | undefined | TipoDocumentoDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TipoDocumentoPayload, S>;
export type TipoDocumentoCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TipoDocumentoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TipoDocumentoCountAggregateInputType | true;
};
export interface TipoDocumentoDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TipoDocumento'];
        meta: {
            name: 'TipoDocumento';
        };
    };
    findUnique<T extends TipoDocumentoFindUniqueArgs>(args: Prisma.SelectSubset<T, TipoDocumentoFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TipoDocumentoClient<runtime.Types.Result.GetResult<Prisma.$TipoDocumentoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TipoDocumentoFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TipoDocumentoFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TipoDocumentoClient<runtime.Types.Result.GetResult<Prisma.$TipoDocumentoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TipoDocumentoFindFirstArgs>(args?: Prisma.SelectSubset<T, TipoDocumentoFindFirstArgs<ExtArgs>>): Prisma.Prisma__TipoDocumentoClient<runtime.Types.Result.GetResult<Prisma.$TipoDocumentoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TipoDocumentoFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TipoDocumentoFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TipoDocumentoClient<runtime.Types.Result.GetResult<Prisma.$TipoDocumentoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TipoDocumentoFindManyArgs>(args?: Prisma.SelectSubset<T, TipoDocumentoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TipoDocumentoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TipoDocumentoCreateArgs>(args: Prisma.SelectSubset<T, TipoDocumentoCreateArgs<ExtArgs>>): Prisma.Prisma__TipoDocumentoClient<runtime.Types.Result.GetResult<Prisma.$TipoDocumentoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TipoDocumentoCreateManyArgs>(args?: Prisma.SelectSubset<T, TipoDocumentoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TipoDocumentoCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TipoDocumentoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TipoDocumentoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TipoDocumentoDeleteArgs>(args: Prisma.SelectSubset<T, TipoDocumentoDeleteArgs<ExtArgs>>): Prisma.Prisma__TipoDocumentoClient<runtime.Types.Result.GetResult<Prisma.$TipoDocumentoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TipoDocumentoUpdateArgs>(args: Prisma.SelectSubset<T, TipoDocumentoUpdateArgs<ExtArgs>>): Prisma.Prisma__TipoDocumentoClient<runtime.Types.Result.GetResult<Prisma.$TipoDocumentoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TipoDocumentoDeleteManyArgs>(args?: Prisma.SelectSubset<T, TipoDocumentoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TipoDocumentoUpdateManyArgs>(args: Prisma.SelectSubset<T, TipoDocumentoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TipoDocumentoUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TipoDocumentoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TipoDocumentoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TipoDocumentoUpsertArgs>(args: Prisma.SelectSubset<T, TipoDocumentoUpsertArgs<ExtArgs>>): Prisma.Prisma__TipoDocumentoClient<runtime.Types.Result.GetResult<Prisma.$TipoDocumentoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TipoDocumentoCountArgs>(args?: Prisma.Subset<T, TipoDocumentoCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TipoDocumentoCountAggregateOutputType> : number>;
    aggregate<T extends TipoDocumentoAggregateArgs>(args: Prisma.Subset<T, TipoDocumentoAggregateArgs>): Prisma.PrismaPromise<GetTipoDocumentoAggregateType<T>>;
    groupBy<T extends TipoDocumentoGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TipoDocumentoGroupByArgs['orderBy'];
    } : {
        orderBy?: TipoDocumentoGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TipoDocumentoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTipoDocumentoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TipoDocumentoFieldRefs;
}
export interface Prisma__TipoDocumentoClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    documentos<T extends Prisma.TipoDocumento$documentosArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TipoDocumento$documentosArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DocumentoPersonaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TipoDocumentoFieldRefs {
    readonly id: Prisma.FieldRef<"TipoDocumento", 'Int'>;
    readonly nombre: Prisma.FieldRef<"TipoDocumento", 'String'>;
}
export type TipoDocumentoFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoDocumentoSelect<ExtArgs> | null;
    omit?: Prisma.TipoDocumentoOmit<ExtArgs> | null;
    include?: Prisma.TipoDocumentoInclude<ExtArgs> | null;
    where: Prisma.TipoDocumentoWhereUniqueInput;
};
export type TipoDocumentoFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoDocumentoSelect<ExtArgs> | null;
    omit?: Prisma.TipoDocumentoOmit<ExtArgs> | null;
    include?: Prisma.TipoDocumentoInclude<ExtArgs> | null;
    where: Prisma.TipoDocumentoWhereUniqueInput;
};
export type TipoDocumentoFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoDocumentoSelect<ExtArgs> | null;
    omit?: Prisma.TipoDocumentoOmit<ExtArgs> | null;
    include?: Prisma.TipoDocumentoInclude<ExtArgs> | null;
    where?: Prisma.TipoDocumentoWhereInput;
    orderBy?: Prisma.TipoDocumentoOrderByWithRelationInput | Prisma.TipoDocumentoOrderByWithRelationInput[];
    cursor?: Prisma.TipoDocumentoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TipoDocumentoScalarFieldEnum | Prisma.TipoDocumentoScalarFieldEnum[];
};
export type TipoDocumentoFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoDocumentoSelect<ExtArgs> | null;
    omit?: Prisma.TipoDocumentoOmit<ExtArgs> | null;
    include?: Prisma.TipoDocumentoInclude<ExtArgs> | null;
    where?: Prisma.TipoDocumentoWhereInput;
    orderBy?: Prisma.TipoDocumentoOrderByWithRelationInput | Prisma.TipoDocumentoOrderByWithRelationInput[];
    cursor?: Prisma.TipoDocumentoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TipoDocumentoScalarFieldEnum | Prisma.TipoDocumentoScalarFieldEnum[];
};
export type TipoDocumentoFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoDocumentoSelect<ExtArgs> | null;
    omit?: Prisma.TipoDocumentoOmit<ExtArgs> | null;
    include?: Prisma.TipoDocumentoInclude<ExtArgs> | null;
    where?: Prisma.TipoDocumentoWhereInput;
    orderBy?: Prisma.TipoDocumentoOrderByWithRelationInput | Prisma.TipoDocumentoOrderByWithRelationInput[];
    cursor?: Prisma.TipoDocumentoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TipoDocumentoScalarFieldEnum | Prisma.TipoDocumentoScalarFieldEnum[];
};
export type TipoDocumentoCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoDocumentoSelect<ExtArgs> | null;
    omit?: Prisma.TipoDocumentoOmit<ExtArgs> | null;
    include?: Prisma.TipoDocumentoInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TipoDocumentoCreateInput, Prisma.TipoDocumentoUncheckedCreateInput>;
};
export type TipoDocumentoCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TipoDocumentoCreateManyInput | Prisma.TipoDocumentoCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TipoDocumentoCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoDocumentoSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TipoDocumentoOmit<ExtArgs> | null;
    data: Prisma.TipoDocumentoCreateManyInput | Prisma.TipoDocumentoCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TipoDocumentoUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoDocumentoSelect<ExtArgs> | null;
    omit?: Prisma.TipoDocumentoOmit<ExtArgs> | null;
    include?: Prisma.TipoDocumentoInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TipoDocumentoUpdateInput, Prisma.TipoDocumentoUncheckedUpdateInput>;
    where: Prisma.TipoDocumentoWhereUniqueInput;
};
export type TipoDocumentoUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TipoDocumentoUpdateManyMutationInput, Prisma.TipoDocumentoUncheckedUpdateManyInput>;
    where?: Prisma.TipoDocumentoWhereInput;
    limit?: number;
};
export type TipoDocumentoUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoDocumentoSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TipoDocumentoOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TipoDocumentoUpdateManyMutationInput, Prisma.TipoDocumentoUncheckedUpdateManyInput>;
    where?: Prisma.TipoDocumentoWhereInput;
    limit?: number;
};
export type TipoDocumentoUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoDocumentoSelect<ExtArgs> | null;
    omit?: Prisma.TipoDocumentoOmit<ExtArgs> | null;
    include?: Prisma.TipoDocumentoInclude<ExtArgs> | null;
    where: Prisma.TipoDocumentoWhereUniqueInput;
    create: Prisma.XOR<Prisma.TipoDocumentoCreateInput, Prisma.TipoDocumentoUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TipoDocumentoUpdateInput, Prisma.TipoDocumentoUncheckedUpdateInput>;
};
export type TipoDocumentoDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoDocumentoSelect<ExtArgs> | null;
    omit?: Prisma.TipoDocumentoOmit<ExtArgs> | null;
    include?: Prisma.TipoDocumentoInclude<ExtArgs> | null;
    where: Prisma.TipoDocumentoWhereUniqueInput;
};
export type TipoDocumentoDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TipoDocumentoWhereInput;
    limit?: number;
};
export type TipoDocumento$documentosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type TipoDocumentoDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TipoDocumentoSelect<ExtArgs> | null;
    omit?: Prisma.TipoDocumentoOmit<ExtArgs> | null;
    include?: Prisma.TipoDocumentoInclude<ExtArgs> | null;
};
