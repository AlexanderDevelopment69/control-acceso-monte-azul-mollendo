import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ConfiguracionSmtpModel = runtime.Types.Result.DefaultSelection<Prisma.$ConfiguracionSmtpPayload>;
export type AggregateConfiguracionSmtp = {
    _count: ConfiguracionSmtpCountAggregateOutputType | null;
    _avg: ConfiguracionSmtpAvgAggregateOutputType | null;
    _sum: ConfiguracionSmtpSumAggregateOutputType | null;
    _min: ConfiguracionSmtpMinAggregateOutputType | null;
    _max: ConfiguracionSmtpMaxAggregateOutputType | null;
};
export type ConfiguracionSmtpAvgAggregateOutputType = {
    id: number | null;
    puerto: number | null;
};
export type ConfiguracionSmtpSumAggregateOutputType = {
    id: number | null;
    puerto: number | null;
};
export type ConfiguracionSmtpMinAggregateOutputType = {
    id: number | null;
    host: string | null;
    puerto: number | null;
    seguro: boolean | null;
    usuario: string | null;
    password: string | null;
    remitente: string | null;
    actualizadoEn: Date | null;
};
export type ConfiguracionSmtpMaxAggregateOutputType = {
    id: number | null;
    host: string | null;
    puerto: number | null;
    seguro: boolean | null;
    usuario: string | null;
    password: string | null;
    remitente: string | null;
    actualizadoEn: Date | null;
};
export type ConfiguracionSmtpCountAggregateOutputType = {
    id: number;
    host: number;
    puerto: number;
    seguro: number;
    usuario: number;
    password: number;
    remitente: number;
    actualizadoEn: number;
    _all: number;
};
export type ConfiguracionSmtpAvgAggregateInputType = {
    id?: true;
    puerto?: true;
};
export type ConfiguracionSmtpSumAggregateInputType = {
    id?: true;
    puerto?: true;
};
export type ConfiguracionSmtpMinAggregateInputType = {
    id?: true;
    host?: true;
    puerto?: true;
    seguro?: true;
    usuario?: true;
    password?: true;
    remitente?: true;
    actualizadoEn?: true;
};
export type ConfiguracionSmtpMaxAggregateInputType = {
    id?: true;
    host?: true;
    puerto?: true;
    seguro?: true;
    usuario?: true;
    password?: true;
    remitente?: true;
    actualizadoEn?: true;
};
export type ConfiguracionSmtpCountAggregateInputType = {
    id?: true;
    host?: true;
    puerto?: true;
    seguro?: true;
    usuario?: true;
    password?: true;
    remitente?: true;
    actualizadoEn?: true;
    _all?: true;
};
export type ConfiguracionSmtpAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ConfiguracionSmtpWhereInput;
    orderBy?: Prisma.ConfiguracionSmtpOrderByWithRelationInput | Prisma.ConfiguracionSmtpOrderByWithRelationInput[];
    cursor?: Prisma.ConfiguracionSmtpWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ConfiguracionSmtpCountAggregateInputType;
    _avg?: ConfiguracionSmtpAvgAggregateInputType;
    _sum?: ConfiguracionSmtpSumAggregateInputType;
    _min?: ConfiguracionSmtpMinAggregateInputType;
    _max?: ConfiguracionSmtpMaxAggregateInputType;
};
export type GetConfiguracionSmtpAggregateType<T extends ConfiguracionSmtpAggregateArgs> = {
    [P in keyof T & keyof AggregateConfiguracionSmtp]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateConfiguracionSmtp[P]> : Prisma.GetScalarType<T[P], AggregateConfiguracionSmtp[P]>;
};
export type ConfiguracionSmtpGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ConfiguracionSmtpWhereInput;
    orderBy?: Prisma.ConfiguracionSmtpOrderByWithAggregationInput | Prisma.ConfiguracionSmtpOrderByWithAggregationInput[];
    by: Prisma.ConfiguracionSmtpScalarFieldEnum[] | Prisma.ConfiguracionSmtpScalarFieldEnum;
    having?: Prisma.ConfiguracionSmtpScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ConfiguracionSmtpCountAggregateInputType | true;
    _avg?: ConfiguracionSmtpAvgAggregateInputType;
    _sum?: ConfiguracionSmtpSumAggregateInputType;
    _min?: ConfiguracionSmtpMinAggregateInputType;
    _max?: ConfiguracionSmtpMaxAggregateInputType;
};
export type ConfiguracionSmtpGroupByOutputType = {
    id: number;
    host: string;
    puerto: number;
    seguro: boolean;
    usuario: string | null;
    password: string | null;
    remitente: string;
    actualizadoEn: Date;
    _count: ConfiguracionSmtpCountAggregateOutputType | null;
    _avg: ConfiguracionSmtpAvgAggregateOutputType | null;
    _sum: ConfiguracionSmtpSumAggregateOutputType | null;
    _min: ConfiguracionSmtpMinAggregateOutputType | null;
    _max: ConfiguracionSmtpMaxAggregateOutputType | null;
};
export type GetConfiguracionSmtpGroupByPayload<T extends ConfiguracionSmtpGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ConfiguracionSmtpGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ConfiguracionSmtpGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ConfiguracionSmtpGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ConfiguracionSmtpGroupByOutputType[P]>;
}>>;
export type ConfiguracionSmtpWhereInput = {
    AND?: Prisma.ConfiguracionSmtpWhereInput | Prisma.ConfiguracionSmtpWhereInput[];
    OR?: Prisma.ConfiguracionSmtpWhereInput[];
    NOT?: Prisma.ConfiguracionSmtpWhereInput | Prisma.ConfiguracionSmtpWhereInput[];
    id?: Prisma.IntFilter<"ConfiguracionSmtp"> | number;
    host?: Prisma.StringFilter<"ConfiguracionSmtp"> | string;
    puerto?: Prisma.IntFilter<"ConfiguracionSmtp"> | number;
    seguro?: Prisma.BoolFilter<"ConfiguracionSmtp"> | boolean;
    usuario?: Prisma.StringNullableFilter<"ConfiguracionSmtp"> | string | null;
    password?: Prisma.StringNullableFilter<"ConfiguracionSmtp"> | string | null;
    remitente?: Prisma.StringFilter<"ConfiguracionSmtp"> | string;
    actualizadoEn?: Prisma.DateTimeFilter<"ConfiguracionSmtp"> | Date | string;
};
export type ConfiguracionSmtpOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    host?: Prisma.SortOrder;
    puerto?: Prisma.SortOrder;
    seguro?: Prisma.SortOrder;
    usuario?: Prisma.SortOrderInput | Prisma.SortOrder;
    password?: Prisma.SortOrderInput | Prisma.SortOrder;
    remitente?: Prisma.SortOrder;
    actualizadoEn?: Prisma.SortOrder;
};
export type ConfiguracionSmtpWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.ConfiguracionSmtpWhereInput | Prisma.ConfiguracionSmtpWhereInput[];
    OR?: Prisma.ConfiguracionSmtpWhereInput[];
    NOT?: Prisma.ConfiguracionSmtpWhereInput | Prisma.ConfiguracionSmtpWhereInput[];
    host?: Prisma.StringFilter<"ConfiguracionSmtp"> | string;
    puerto?: Prisma.IntFilter<"ConfiguracionSmtp"> | number;
    seguro?: Prisma.BoolFilter<"ConfiguracionSmtp"> | boolean;
    usuario?: Prisma.StringNullableFilter<"ConfiguracionSmtp"> | string | null;
    password?: Prisma.StringNullableFilter<"ConfiguracionSmtp"> | string | null;
    remitente?: Prisma.StringFilter<"ConfiguracionSmtp"> | string;
    actualizadoEn?: Prisma.DateTimeFilter<"ConfiguracionSmtp"> | Date | string;
}, "id">;
export type ConfiguracionSmtpOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    host?: Prisma.SortOrder;
    puerto?: Prisma.SortOrder;
    seguro?: Prisma.SortOrder;
    usuario?: Prisma.SortOrderInput | Prisma.SortOrder;
    password?: Prisma.SortOrderInput | Prisma.SortOrder;
    remitente?: Prisma.SortOrder;
    actualizadoEn?: Prisma.SortOrder;
    _count?: Prisma.ConfiguracionSmtpCountOrderByAggregateInput;
    _avg?: Prisma.ConfiguracionSmtpAvgOrderByAggregateInput;
    _max?: Prisma.ConfiguracionSmtpMaxOrderByAggregateInput;
    _min?: Prisma.ConfiguracionSmtpMinOrderByAggregateInput;
    _sum?: Prisma.ConfiguracionSmtpSumOrderByAggregateInput;
};
export type ConfiguracionSmtpScalarWhereWithAggregatesInput = {
    AND?: Prisma.ConfiguracionSmtpScalarWhereWithAggregatesInput | Prisma.ConfiguracionSmtpScalarWhereWithAggregatesInput[];
    OR?: Prisma.ConfiguracionSmtpScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ConfiguracionSmtpScalarWhereWithAggregatesInput | Prisma.ConfiguracionSmtpScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"ConfiguracionSmtp"> | number;
    host?: Prisma.StringWithAggregatesFilter<"ConfiguracionSmtp"> | string;
    puerto?: Prisma.IntWithAggregatesFilter<"ConfiguracionSmtp"> | number;
    seguro?: Prisma.BoolWithAggregatesFilter<"ConfiguracionSmtp"> | boolean;
    usuario?: Prisma.StringNullableWithAggregatesFilter<"ConfiguracionSmtp"> | string | null;
    password?: Prisma.StringNullableWithAggregatesFilter<"ConfiguracionSmtp"> | string | null;
    remitente?: Prisma.StringWithAggregatesFilter<"ConfiguracionSmtp"> | string;
    actualizadoEn?: Prisma.DateTimeWithAggregatesFilter<"ConfiguracionSmtp"> | Date | string;
};
export type ConfiguracionSmtpCreateInput = {
    id?: number;
    host: string;
    puerto?: number;
    seguro?: boolean;
    usuario?: string | null;
    password?: string | null;
    remitente: string;
    actualizadoEn?: Date | string;
};
export type ConfiguracionSmtpUncheckedCreateInput = {
    id?: number;
    host: string;
    puerto?: number;
    seguro?: boolean;
    usuario?: string | null;
    password?: string | null;
    remitente: string;
    actualizadoEn?: Date | string;
};
export type ConfiguracionSmtpUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    host?: Prisma.StringFieldUpdateOperationsInput | string;
    puerto?: Prisma.IntFieldUpdateOperationsInput | number;
    seguro?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    usuario?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    password?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    remitente?: Prisma.StringFieldUpdateOperationsInput | string;
    actualizadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ConfiguracionSmtpUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    host?: Prisma.StringFieldUpdateOperationsInput | string;
    puerto?: Prisma.IntFieldUpdateOperationsInput | number;
    seguro?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    usuario?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    password?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    remitente?: Prisma.StringFieldUpdateOperationsInput | string;
    actualizadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ConfiguracionSmtpCreateManyInput = {
    id?: number;
    host: string;
    puerto?: number;
    seguro?: boolean;
    usuario?: string | null;
    password?: string | null;
    remitente: string;
    actualizadoEn?: Date | string;
};
export type ConfiguracionSmtpUpdateManyMutationInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    host?: Prisma.StringFieldUpdateOperationsInput | string;
    puerto?: Prisma.IntFieldUpdateOperationsInput | number;
    seguro?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    usuario?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    password?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    remitente?: Prisma.StringFieldUpdateOperationsInput | string;
    actualizadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ConfiguracionSmtpUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    host?: Prisma.StringFieldUpdateOperationsInput | string;
    puerto?: Prisma.IntFieldUpdateOperationsInput | number;
    seguro?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    usuario?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    password?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    remitente?: Prisma.StringFieldUpdateOperationsInput | string;
    actualizadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ConfiguracionSmtpCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    host?: Prisma.SortOrder;
    puerto?: Prisma.SortOrder;
    seguro?: Prisma.SortOrder;
    usuario?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    remitente?: Prisma.SortOrder;
    actualizadoEn?: Prisma.SortOrder;
};
export type ConfiguracionSmtpAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    puerto?: Prisma.SortOrder;
};
export type ConfiguracionSmtpMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    host?: Prisma.SortOrder;
    puerto?: Prisma.SortOrder;
    seguro?: Prisma.SortOrder;
    usuario?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    remitente?: Prisma.SortOrder;
    actualizadoEn?: Prisma.SortOrder;
};
export type ConfiguracionSmtpMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    host?: Prisma.SortOrder;
    puerto?: Prisma.SortOrder;
    seguro?: Prisma.SortOrder;
    usuario?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    remitente?: Prisma.SortOrder;
    actualizadoEn?: Prisma.SortOrder;
};
export type ConfiguracionSmtpSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    puerto?: Prisma.SortOrder;
};
export type ConfiguracionSmtpSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    host?: boolean;
    puerto?: boolean;
    seguro?: boolean;
    usuario?: boolean;
    password?: boolean;
    remitente?: boolean;
    actualizadoEn?: boolean;
}, ExtArgs["result"]["configuracionSmtp"]>;
export type ConfiguracionSmtpSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    host?: boolean;
    puerto?: boolean;
    seguro?: boolean;
    usuario?: boolean;
    password?: boolean;
    remitente?: boolean;
    actualizadoEn?: boolean;
}, ExtArgs["result"]["configuracionSmtp"]>;
export type ConfiguracionSmtpSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    host?: boolean;
    puerto?: boolean;
    seguro?: boolean;
    usuario?: boolean;
    password?: boolean;
    remitente?: boolean;
    actualizadoEn?: boolean;
}, ExtArgs["result"]["configuracionSmtp"]>;
export type ConfiguracionSmtpSelectScalar = {
    id?: boolean;
    host?: boolean;
    puerto?: boolean;
    seguro?: boolean;
    usuario?: boolean;
    password?: boolean;
    remitente?: boolean;
    actualizadoEn?: boolean;
};
export type ConfiguracionSmtpOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "host" | "puerto" | "seguro" | "usuario" | "password" | "remitente" | "actualizadoEn", ExtArgs["result"]["configuracionSmtp"]>;
export type $ConfiguracionSmtpPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ConfiguracionSmtp";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        host: string;
        puerto: number;
        seguro: boolean;
        usuario: string | null;
        password: string | null;
        remitente: string;
        actualizadoEn: Date;
    }, ExtArgs["result"]["configuracionSmtp"]>;
    composites: {};
};
export type ConfiguracionSmtpGetPayload<S extends boolean | null | undefined | ConfiguracionSmtpDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ConfiguracionSmtpPayload, S>;
export type ConfiguracionSmtpCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ConfiguracionSmtpFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ConfiguracionSmtpCountAggregateInputType | true;
};
export interface ConfiguracionSmtpDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ConfiguracionSmtp'];
        meta: {
            name: 'ConfiguracionSmtp';
        };
    };
    findUnique<T extends ConfiguracionSmtpFindUniqueArgs>(args: Prisma.SelectSubset<T, ConfiguracionSmtpFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ConfiguracionSmtpClient<runtime.Types.Result.GetResult<Prisma.$ConfiguracionSmtpPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ConfiguracionSmtpFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ConfiguracionSmtpFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ConfiguracionSmtpClient<runtime.Types.Result.GetResult<Prisma.$ConfiguracionSmtpPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ConfiguracionSmtpFindFirstArgs>(args?: Prisma.SelectSubset<T, ConfiguracionSmtpFindFirstArgs<ExtArgs>>): Prisma.Prisma__ConfiguracionSmtpClient<runtime.Types.Result.GetResult<Prisma.$ConfiguracionSmtpPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ConfiguracionSmtpFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ConfiguracionSmtpFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ConfiguracionSmtpClient<runtime.Types.Result.GetResult<Prisma.$ConfiguracionSmtpPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ConfiguracionSmtpFindManyArgs>(args?: Prisma.SelectSubset<T, ConfiguracionSmtpFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ConfiguracionSmtpPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ConfiguracionSmtpCreateArgs>(args: Prisma.SelectSubset<T, ConfiguracionSmtpCreateArgs<ExtArgs>>): Prisma.Prisma__ConfiguracionSmtpClient<runtime.Types.Result.GetResult<Prisma.$ConfiguracionSmtpPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ConfiguracionSmtpCreateManyArgs>(args?: Prisma.SelectSubset<T, ConfiguracionSmtpCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ConfiguracionSmtpCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ConfiguracionSmtpCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ConfiguracionSmtpPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ConfiguracionSmtpDeleteArgs>(args: Prisma.SelectSubset<T, ConfiguracionSmtpDeleteArgs<ExtArgs>>): Prisma.Prisma__ConfiguracionSmtpClient<runtime.Types.Result.GetResult<Prisma.$ConfiguracionSmtpPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ConfiguracionSmtpUpdateArgs>(args: Prisma.SelectSubset<T, ConfiguracionSmtpUpdateArgs<ExtArgs>>): Prisma.Prisma__ConfiguracionSmtpClient<runtime.Types.Result.GetResult<Prisma.$ConfiguracionSmtpPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ConfiguracionSmtpDeleteManyArgs>(args?: Prisma.SelectSubset<T, ConfiguracionSmtpDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ConfiguracionSmtpUpdateManyArgs>(args: Prisma.SelectSubset<T, ConfiguracionSmtpUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ConfiguracionSmtpUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ConfiguracionSmtpUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ConfiguracionSmtpPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ConfiguracionSmtpUpsertArgs>(args: Prisma.SelectSubset<T, ConfiguracionSmtpUpsertArgs<ExtArgs>>): Prisma.Prisma__ConfiguracionSmtpClient<runtime.Types.Result.GetResult<Prisma.$ConfiguracionSmtpPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ConfiguracionSmtpCountArgs>(args?: Prisma.Subset<T, ConfiguracionSmtpCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ConfiguracionSmtpCountAggregateOutputType> : number>;
    aggregate<T extends ConfiguracionSmtpAggregateArgs>(args: Prisma.Subset<T, ConfiguracionSmtpAggregateArgs>): Prisma.PrismaPromise<GetConfiguracionSmtpAggregateType<T>>;
    groupBy<T extends ConfiguracionSmtpGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ConfiguracionSmtpGroupByArgs['orderBy'];
    } : {
        orderBy?: ConfiguracionSmtpGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ConfiguracionSmtpGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConfiguracionSmtpGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ConfiguracionSmtpFieldRefs;
}
export interface Prisma__ConfiguracionSmtpClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ConfiguracionSmtpFieldRefs {
    readonly id: Prisma.FieldRef<"ConfiguracionSmtp", 'Int'>;
    readonly host: Prisma.FieldRef<"ConfiguracionSmtp", 'String'>;
    readonly puerto: Prisma.FieldRef<"ConfiguracionSmtp", 'Int'>;
    readonly seguro: Prisma.FieldRef<"ConfiguracionSmtp", 'Boolean'>;
    readonly usuario: Prisma.FieldRef<"ConfiguracionSmtp", 'String'>;
    readonly password: Prisma.FieldRef<"ConfiguracionSmtp", 'String'>;
    readonly remitente: Prisma.FieldRef<"ConfiguracionSmtp", 'String'>;
    readonly actualizadoEn: Prisma.FieldRef<"ConfiguracionSmtp", 'DateTime'>;
}
export type ConfiguracionSmtpFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConfiguracionSmtpSelect<ExtArgs> | null;
    omit?: Prisma.ConfiguracionSmtpOmit<ExtArgs> | null;
    where: Prisma.ConfiguracionSmtpWhereUniqueInput;
};
export type ConfiguracionSmtpFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConfiguracionSmtpSelect<ExtArgs> | null;
    omit?: Prisma.ConfiguracionSmtpOmit<ExtArgs> | null;
    where: Prisma.ConfiguracionSmtpWhereUniqueInput;
};
export type ConfiguracionSmtpFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConfiguracionSmtpSelect<ExtArgs> | null;
    omit?: Prisma.ConfiguracionSmtpOmit<ExtArgs> | null;
    where?: Prisma.ConfiguracionSmtpWhereInput;
    orderBy?: Prisma.ConfiguracionSmtpOrderByWithRelationInput | Prisma.ConfiguracionSmtpOrderByWithRelationInput[];
    cursor?: Prisma.ConfiguracionSmtpWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ConfiguracionSmtpScalarFieldEnum | Prisma.ConfiguracionSmtpScalarFieldEnum[];
};
export type ConfiguracionSmtpFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConfiguracionSmtpSelect<ExtArgs> | null;
    omit?: Prisma.ConfiguracionSmtpOmit<ExtArgs> | null;
    where?: Prisma.ConfiguracionSmtpWhereInput;
    orderBy?: Prisma.ConfiguracionSmtpOrderByWithRelationInput | Prisma.ConfiguracionSmtpOrderByWithRelationInput[];
    cursor?: Prisma.ConfiguracionSmtpWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ConfiguracionSmtpScalarFieldEnum | Prisma.ConfiguracionSmtpScalarFieldEnum[];
};
export type ConfiguracionSmtpFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConfiguracionSmtpSelect<ExtArgs> | null;
    omit?: Prisma.ConfiguracionSmtpOmit<ExtArgs> | null;
    where?: Prisma.ConfiguracionSmtpWhereInput;
    orderBy?: Prisma.ConfiguracionSmtpOrderByWithRelationInput | Prisma.ConfiguracionSmtpOrderByWithRelationInput[];
    cursor?: Prisma.ConfiguracionSmtpWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ConfiguracionSmtpScalarFieldEnum | Prisma.ConfiguracionSmtpScalarFieldEnum[];
};
export type ConfiguracionSmtpCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConfiguracionSmtpSelect<ExtArgs> | null;
    omit?: Prisma.ConfiguracionSmtpOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ConfiguracionSmtpCreateInput, Prisma.ConfiguracionSmtpUncheckedCreateInput>;
};
export type ConfiguracionSmtpCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ConfiguracionSmtpCreateManyInput | Prisma.ConfiguracionSmtpCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ConfiguracionSmtpCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConfiguracionSmtpSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ConfiguracionSmtpOmit<ExtArgs> | null;
    data: Prisma.ConfiguracionSmtpCreateManyInput | Prisma.ConfiguracionSmtpCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ConfiguracionSmtpUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConfiguracionSmtpSelect<ExtArgs> | null;
    omit?: Prisma.ConfiguracionSmtpOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ConfiguracionSmtpUpdateInput, Prisma.ConfiguracionSmtpUncheckedUpdateInput>;
    where: Prisma.ConfiguracionSmtpWhereUniqueInput;
};
export type ConfiguracionSmtpUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ConfiguracionSmtpUpdateManyMutationInput, Prisma.ConfiguracionSmtpUncheckedUpdateManyInput>;
    where?: Prisma.ConfiguracionSmtpWhereInput;
    limit?: number;
};
export type ConfiguracionSmtpUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConfiguracionSmtpSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ConfiguracionSmtpOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ConfiguracionSmtpUpdateManyMutationInput, Prisma.ConfiguracionSmtpUncheckedUpdateManyInput>;
    where?: Prisma.ConfiguracionSmtpWhereInput;
    limit?: number;
};
export type ConfiguracionSmtpUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConfiguracionSmtpSelect<ExtArgs> | null;
    omit?: Prisma.ConfiguracionSmtpOmit<ExtArgs> | null;
    where: Prisma.ConfiguracionSmtpWhereUniqueInput;
    create: Prisma.XOR<Prisma.ConfiguracionSmtpCreateInput, Prisma.ConfiguracionSmtpUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ConfiguracionSmtpUpdateInput, Prisma.ConfiguracionSmtpUncheckedUpdateInput>;
};
export type ConfiguracionSmtpDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConfiguracionSmtpSelect<ExtArgs> | null;
    omit?: Prisma.ConfiguracionSmtpOmit<ExtArgs> | null;
    where: Prisma.ConfiguracionSmtpWhereUniqueInput;
};
export type ConfiguracionSmtpDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ConfiguracionSmtpWhereInput;
    limit?: number;
};
export type ConfiguracionSmtpDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ConfiguracionSmtpSelect<ExtArgs> | null;
    omit?: Prisma.ConfiguracionSmtpOmit<ExtArgs> | null;
};
