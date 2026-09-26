import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../models.js";
import { type PrismaClient } from "./class.js";
export type * from '../models.js';
export type DMMF = typeof runtime.DMMF;
export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;
export declare const PrismaClientKnownRequestError: typeof runtime.PrismaClientKnownRequestError;
export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export declare const PrismaClientUnknownRequestError: typeof runtime.PrismaClientUnknownRequestError;
export type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export declare const PrismaClientRustPanicError: typeof runtime.PrismaClientRustPanicError;
export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export declare const PrismaClientInitializationError: typeof runtime.PrismaClientInitializationError;
export type PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export declare const PrismaClientValidationError: typeof runtime.PrismaClientValidationError;
export type PrismaClientValidationError = runtime.PrismaClientValidationError;
export declare const sql: typeof runtime.sqltag;
export declare const empty: runtime.Sql;
export declare const join: typeof runtime.join;
export declare const raw: typeof runtime.raw;
export declare const Sql: typeof runtime.Sql;
export type Sql = runtime.Sql;
export declare const Decimal: typeof runtime.Decimal;
export type Decimal = runtime.Decimal;
export type DecimalJsLike = runtime.DecimalJsLike;
export type Extension = runtime.Types.Extensions.UserArgs;
export declare const getExtensionContext: typeof runtime.Extensions.getExtensionContext;
export type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<T, F>;
export type Payload<T, F extends runtime.Operation = never> = runtime.Types.Public.Payload<T, F>;
export type Result<T, A, F extends runtime.Operation> = runtime.Types.Public.Result<T, A, F>;
export type Exact<A, W> = runtime.Types.Public.Exact<A, W>;
export type PrismaVersion = {
    client: string;
    engine: string;
};
export declare const prismaVersion: PrismaVersion;
export type Bytes = runtime.Bytes;
export type JsonObject = runtime.JsonObject;
export type JsonArray = runtime.JsonArray;
export type JsonValue = runtime.JsonValue;
export type InputJsonObject = runtime.InputJsonObject;
export type InputJsonArray = runtime.InputJsonArray;
export type InputJsonValue = runtime.InputJsonValue;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: runtime.DbNullClass;
export declare const JsonNull: runtime.JsonNullClass;
export declare const AnyNull: runtime.AnyNullClass;
type SelectAndInclude = {
    select: any;
    include: any;
};
type SelectAndOmit = {
    select: any;
    omit: any;
};
type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
export type Enumerable<T> = T | Array<T>;
export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
};
export type PrismaClientConstructorArgs<Options extends PrismaClientOptions> = [
    PrismaClientOptions
] extends [Options] ? PrismaClientOptions : Subset<Options, PrismaClientOptions>;
export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & (T extends SelectAndInclude ? 'Please either choose `select` or `include`.' : T extends SelectAndOmit ? 'Please either choose `select` or `omit`.' : {});
export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & K;
type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
export type XOR<T, U> = T extends object ? U extends object ? ((Without<T, U> & U) | (Without<U, T> & T)) & object : U : T;
type IsObject<T extends any> = T extends Array<any> ? False : T extends Date ? False : T extends Uint8Array ? False : T extends BigInt ? False : T extends object ? True : False;
export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;
type __Either<O extends object, K extends Key> = Omit<O, K> & {
    [P in K]: Prisma__Pick<O, P & keyof O>;
}[K];
type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;
type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;
type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
}[strict];
export type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown ? _Either<O, K, strict> : never;
export type Union = any;
export type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
} & {};
export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
} & {};
type _Merge<U extends object> = IntersectOf<Overwrite<U, {
    [K in keyof U]-?: At<U, K>;
}>>;
type Key = string | number | symbol;
type AtStrict<O extends object, K extends Key> = O[K & keyof O];
type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
}[strict];
export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
} & {};
export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
} & {};
type _Record<K extends keyof any, T> = {
    [P in K]: T;
};
type NoExpand<T> = T extends unknown ? T : never;
export type AtLeast<O extends object, K extends string> = NoExpand<O extends unknown ? (K extends keyof O ? {
    [P in K]: O[P];
} & O : O) | {
    [P in keyof O as P extends K ? P : never]-?: O[P];
} & O : never>;
type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;
export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;
export type Boolean = True | False;
export type True = 1;
export type False = 0;
export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
}[B];
export type Extends<A1 extends any, A2 extends any> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;
export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
        0: 0;
        1: 1;
    };
    1: {
        0: 1;
        1: 1;
    };
}[B1][B2];
export type Keys<U extends Union> = U extends unknown ? keyof U : never;
export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O ? O[P] : never;
} : never;
type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> = IsObject<T> extends True ? U : T;
export type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True ? T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K;
}[keyof T];
type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
export type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;
export type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;
export type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;
export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;
type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;
export declare const ModelName: {
    readonly Empresa: "Empresa";
    readonly Usuario: "Usuario";
    readonly Puesto: "Puesto";
    readonly Persona: "Persona";
    readonly TipoDocumento: "TipoDocumento";
    readonly RequisitoPorPuesto: "RequisitoPorPuesto";
    readonly DocumentoPersona: "DocumentoPersona";
    readonly SolicitudVisita: "SolicitudVisita";
    readonly EventoAcceso: "EventoAcceso";
    readonly Auditoria: "Auditoria";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export interface TypeMapCb<GlobalOmitOptions = {}> extends runtime.Types.Utils.Fn<{
    extArgs: runtime.Types.Extensions.InternalArgs;
}, runtime.Types.Utils.Record<string, any>> {
    returns: TypeMap<this['params']['extArgs'], GlobalOmitOptions>;
}
export type TypeMap<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
        omit: GlobalOmitOptions;
    };
    meta: {
        modelProps: "empresa" | "usuario" | "puesto" | "persona" | "tipoDocumento" | "requisitoPorPuesto" | "documentoPersona" | "solicitudVisita" | "eventoAcceso" | "auditoria";
        txIsolationLevel: TransactionIsolationLevel;
    };
    model: {
        Empresa: {
            payload: Prisma.$EmpresaPayload<ExtArgs>;
            fields: Prisma.EmpresaFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.EmpresaFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmpresaPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.EmpresaFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmpresaPayload>;
                };
                findFirst: {
                    args: Prisma.EmpresaFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmpresaPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.EmpresaFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmpresaPayload>;
                };
                findMany: {
                    args: Prisma.EmpresaFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmpresaPayload>[];
                };
                create: {
                    args: Prisma.EmpresaCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmpresaPayload>;
                };
                createMany: {
                    args: Prisma.EmpresaCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.EmpresaCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmpresaPayload>[];
                };
                delete: {
                    args: Prisma.EmpresaDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmpresaPayload>;
                };
                update: {
                    args: Prisma.EmpresaUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmpresaPayload>;
                };
                deleteMany: {
                    args: Prisma.EmpresaDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.EmpresaUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.EmpresaUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmpresaPayload>[];
                };
                upsert: {
                    args: Prisma.EmpresaUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmpresaPayload>;
                };
                aggregate: {
                    args: Prisma.EmpresaAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateEmpresa>;
                };
                groupBy: {
                    args: Prisma.EmpresaGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EmpresaGroupByOutputType>[];
                };
                count: {
                    args: Prisma.EmpresaCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EmpresaCountAggregateOutputType> | number;
                };
            };
        };
        Usuario: {
            payload: Prisma.$UsuarioPayload<ExtArgs>;
            fields: Prisma.UsuarioFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.UsuarioFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsuarioPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.UsuarioFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsuarioPayload>;
                };
                findFirst: {
                    args: Prisma.UsuarioFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsuarioPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.UsuarioFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsuarioPayload>;
                };
                findMany: {
                    args: Prisma.UsuarioFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsuarioPayload>[];
                };
                create: {
                    args: Prisma.UsuarioCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsuarioPayload>;
                };
                createMany: {
                    args: Prisma.UsuarioCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.UsuarioCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsuarioPayload>[];
                };
                delete: {
                    args: Prisma.UsuarioDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsuarioPayload>;
                };
                update: {
                    args: Prisma.UsuarioUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsuarioPayload>;
                };
                deleteMany: {
                    args: Prisma.UsuarioDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.UsuarioUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.UsuarioUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsuarioPayload>[];
                };
                upsert: {
                    args: Prisma.UsuarioUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UsuarioPayload>;
                };
                aggregate: {
                    args: Prisma.UsuarioAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateUsuario>;
                };
                groupBy: {
                    args: Prisma.UsuarioGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UsuarioGroupByOutputType>[];
                };
                count: {
                    args: Prisma.UsuarioCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UsuarioCountAggregateOutputType> | number;
                };
            };
        };
        Puesto: {
            payload: Prisma.$PuestoPayload<ExtArgs>;
            fields: Prisma.PuestoFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PuestoFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PuestoPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PuestoFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PuestoPayload>;
                };
                findFirst: {
                    args: Prisma.PuestoFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PuestoPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PuestoFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PuestoPayload>;
                };
                findMany: {
                    args: Prisma.PuestoFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PuestoPayload>[];
                };
                create: {
                    args: Prisma.PuestoCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PuestoPayload>;
                };
                createMany: {
                    args: Prisma.PuestoCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PuestoCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PuestoPayload>[];
                };
                delete: {
                    args: Prisma.PuestoDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PuestoPayload>;
                };
                update: {
                    args: Prisma.PuestoUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PuestoPayload>;
                };
                deleteMany: {
                    args: Prisma.PuestoDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PuestoUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PuestoUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PuestoPayload>[];
                };
                upsert: {
                    args: Prisma.PuestoUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PuestoPayload>;
                };
                aggregate: {
                    args: Prisma.PuestoAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePuesto>;
                };
                groupBy: {
                    args: Prisma.PuestoGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PuestoGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PuestoCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PuestoCountAggregateOutputType> | number;
                };
            };
        };
        Persona: {
            payload: Prisma.$PersonaPayload<ExtArgs>;
            fields: Prisma.PersonaFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PersonaFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonaPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PersonaFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonaPayload>;
                };
                findFirst: {
                    args: Prisma.PersonaFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonaPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PersonaFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonaPayload>;
                };
                findMany: {
                    args: Prisma.PersonaFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonaPayload>[];
                };
                create: {
                    args: Prisma.PersonaCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonaPayload>;
                };
                createMany: {
                    args: Prisma.PersonaCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PersonaCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonaPayload>[];
                };
                delete: {
                    args: Prisma.PersonaDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonaPayload>;
                };
                update: {
                    args: Prisma.PersonaUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonaPayload>;
                };
                deleteMany: {
                    args: Prisma.PersonaDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PersonaUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PersonaUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonaPayload>[];
                };
                upsert: {
                    args: Prisma.PersonaUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PersonaPayload>;
                };
                aggregate: {
                    args: Prisma.PersonaAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePersona>;
                };
                groupBy: {
                    args: Prisma.PersonaGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PersonaGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PersonaCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PersonaCountAggregateOutputType> | number;
                };
            };
        };
        TipoDocumento: {
            payload: Prisma.$TipoDocumentoPayload<ExtArgs>;
            fields: Prisma.TipoDocumentoFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TipoDocumentoFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TipoDocumentoPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TipoDocumentoFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TipoDocumentoPayload>;
                };
                findFirst: {
                    args: Prisma.TipoDocumentoFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TipoDocumentoPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TipoDocumentoFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TipoDocumentoPayload>;
                };
                findMany: {
                    args: Prisma.TipoDocumentoFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TipoDocumentoPayload>[];
                };
                create: {
                    args: Prisma.TipoDocumentoCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TipoDocumentoPayload>;
                };
                createMany: {
                    args: Prisma.TipoDocumentoCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TipoDocumentoCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TipoDocumentoPayload>[];
                };
                delete: {
                    args: Prisma.TipoDocumentoDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TipoDocumentoPayload>;
                };
                update: {
                    args: Prisma.TipoDocumentoUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TipoDocumentoPayload>;
                };
                deleteMany: {
                    args: Prisma.TipoDocumentoDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TipoDocumentoUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TipoDocumentoUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TipoDocumentoPayload>[];
                };
                upsert: {
                    args: Prisma.TipoDocumentoUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TipoDocumentoPayload>;
                };
                aggregate: {
                    args: Prisma.TipoDocumentoAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTipoDocumento>;
                };
                groupBy: {
                    args: Prisma.TipoDocumentoGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TipoDocumentoGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TipoDocumentoCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TipoDocumentoCountAggregateOutputType> | number;
                };
            };
        };
        RequisitoPorPuesto: {
            payload: Prisma.$RequisitoPorPuestoPayload<ExtArgs>;
            fields: Prisma.RequisitoPorPuestoFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RequisitoPorPuestoFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequisitoPorPuestoPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RequisitoPorPuestoFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequisitoPorPuestoPayload>;
                };
                findFirst: {
                    args: Prisma.RequisitoPorPuestoFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequisitoPorPuestoPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RequisitoPorPuestoFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequisitoPorPuestoPayload>;
                };
                findMany: {
                    args: Prisma.RequisitoPorPuestoFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequisitoPorPuestoPayload>[];
                };
                create: {
                    args: Prisma.RequisitoPorPuestoCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequisitoPorPuestoPayload>;
                };
                createMany: {
                    args: Prisma.RequisitoPorPuestoCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RequisitoPorPuestoCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequisitoPorPuestoPayload>[];
                };
                delete: {
                    args: Prisma.RequisitoPorPuestoDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequisitoPorPuestoPayload>;
                };
                update: {
                    args: Prisma.RequisitoPorPuestoUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequisitoPorPuestoPayload>;
                };
                deleteMany: {
                    args: Prisma.RequisitoPorPuestoDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RequisitoPorPuestoUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RequisitoPorPuestoUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequisitoPorPuestoPayload>[];
                };
                upsert: {
                    args: Prisma.RequisitoPorPuestoUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequisitoPorPuestoPayload>;
                };
                aggregate: {
                    args: Prisma.RequisitoPorPuestoAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRequisitoPorPuesto>;
                };
                groupBy: {
                    args: Prisma.RequisitoPorPuestoGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RequisitoPorPuestoGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RequisitoPorPuestoCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RequisitoPorPuestoCountAggregateOutputType> | number;
                };
            };
        };
        DocumentoPersona: {
            payload: Prisma.$DocumentoPersonaPayload<ExtArgs>;
            fields: Prisma.DocumentoPersonaFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.DocumentoPersonaFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentoPersonaPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.DocumentoPersonaFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentoPersonaPayload>;
                };
                findFirst: {
                    args: Prisma.DocumentoPersonaFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentoPersonaPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.DocumentoPersonaFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentoPersonaPayload>;
                };
                findMany: {
                    args: Prisma.DocumentoPersonaFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentoPersonaPayload>[];
                };
                create: {
                    args: Prisma.DocumentoPersonaCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentoPersonaPayload>;
                };
                createMany: {
                    args: Prisma.DocumentoPersonaCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.DocumentoPersonaCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentoPersonaPayload>[];
                };
                delete: {
                    args: Prisma.DocumentoPersonaDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentoPersonaPayload>;
                };
                update: {
                    args: Prisma.DocumentoPersonaUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentoPersonaPayload>;
                };
                deleteMany: {
                    args: Prisma.DocumentoPersonaDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.DocumentoPersonaUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.DocumentoPersonaUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentoPersonaPayload>[];
                };
                upsert: {
                    args: Prisma.DocumentoPersonaUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentoPersonaPayload>;
                };
                aggregate: {
                    args: Prisma.DocumentoPersonaAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateDocumentoPersona>;
                };
                groupBy: {
                    args: Prisma.DocumentoPersonaGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DocumentoPersonaGroupByOutputType>[];
                };
                count: {
                    args: Prisma.DocumentoPersonaCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DocumentoPersonaCountAggregateOutputType> | number;
                };
            };
        };
        SolicitudVisita: {
            payload: Prisma.$SolicitudVisitaPayload<ExtArgs>;
            fields: Prisma.SolicitudVisitaFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.SolicitudVisitaFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudVisitaPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.SolicitudVisitaFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudVisitaPayload>;
                };
                findFirst: {
                    args: Prisma.SolicitudVisitaFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudVisitaPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.SolicitudVisitaFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudVisitaPayload>;
                };
                findMany: {
                    args: Prisma.SolicitudVisitaFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudVisitaPayload>[];
                };
                create: {
                    args: Prisma.SolicitudVisitaCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudVisitaPayload>;
                };
                createMany: {
                    args: Prisma.SolicitudVisitaCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.SolicitudVisitaCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudVisitaPayload>[];
                };
                delete: {
                    args: Prisma.SolicitudVisitaDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudVisitaPayload>;
                };
                update: {
                    args: Prisma.SolicitudVisitaUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudVisitaPayload>;
                };
                deleteMany: {
                    args: Prisma.SolicitudVisitaDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.SolicitudVisitaUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.SolicitudVisitaUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudVisitaPayload>[];
                };
                upsert: {
                    args: Prisma.SolicitudVisitaUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SolicitudVisitaPayload>;
                };
                aggregate: {
                    args: Prisma.SolicitudVisitaAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateSolicitudVisita>;
                };
                groupBy: {
                    args: Prisma.SolicitudVisitaGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SolicitudVisitaGroupByOutputType>[];
                };
                count: {
                    args: Prisma.SolicitudVisitaCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SolicitudVisitaCountAggregateOutputType> | number;
                };
            };
        };
        EventoAcceso: {
            payload: Prisma.$EventoAccesoPayload<ExtArgs>;
            fields: Prisma.EventoAccesoFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.EventoAccesoFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventoAccesoPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.EventoAccesoFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventoAccesoPayload>;
                };
                findFirst: {
                    args: Prisma.EventoAccesoFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventoAccesoPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.EventoAccesoFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventoAccesoPayload>;
                };
                findMany: {
                    args: Prisma.EventoAccesoFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventoAccesoPayload>[];
                };
                create: {
                    args: Prisma.EventoAccesoCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventoAccesoPayload>;
                };
                createMany: {
                    args: Prisma.EventoAccesoCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.EventoAccesoCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventoAccesoPayload>[];
                };
                delete: {
                    args: Prisma.EventoAccesoDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventoAccesoPayload>;
                };
                update: {
                    args: Prisma.EventoAccesoUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventoAccesoPayload>;
                };
                deleteMany: {
                    args: Prisma.EventoAccesoDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.EventoAccesoUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.EventoAccesoUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventoAccesoPayload>[];
                };
                upsert: {
                    args: Prisma.EventoAccesoUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventoAccesoPayload>;
                };
                aggregate: {
                    args: Prisma.EventoAccesoAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateEventoAcceso>;
                };
                groupBy: {
                    args: Prisma.EventoAccesoGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EventoAccesoGroupByOutputType>[];
                };
                count: {
                    args: Prisma.EventoAccesoCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EventoAccesoCountAggregateOutputType> | number;
                };
            };
        };
        Auditoria: {
            payload: Prisma.$AuditoriaPayload<ExtArgs>;
            fields: Prisma.AuditoriaFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.AuditoriaFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditoriaPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.AuditoriaFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditoriaPayload>;
                };
                findFirst: {
                    args: Prisma.AuditoriaFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditoriaPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.AuditoriaFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditoriaPayload>;
                };
                findMany: {
                    args: Prisma.AuditoriaFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditoriaPayload>[];
                };
                create: {
                    args: Prisma.AuditoriaCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditoriaPayload>;
                };
                createMany: {
                    args: Prisma.AuditoriaCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.AuditoriaCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditoriaPayload>[];
                };
                delete: {
                    args: Prisma.AuditoriaDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditoriaPayload>;
                };
                update: {
                    args: Prisma.AuditoriaUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditoriaPayload>;
                };
                deleteMany: {
                    args: Prisma.AuditoriaDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.AuditoriaUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.AuditoriaUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditoriaPayload>[];
                };
                upsert: {
                    args: Prisma.AuditoriaUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuditoriaPayload>;
                };
                aggregate: {
                    args: Prisma.AuditoriaAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateAuditoria>;
                };
                groupBy: {
                    args: Prisma.AuditoriaGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AuditoriaGroupByOutputType>[];
                };
                count: {
                    args: Prisma.AuditoriaCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AuditoriaCountAggregateOutputType> | number;
                };
            };
        };
    };
} & {
    other: {
        payload: any;
        operations: {
            $executeRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $executeRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
            $queryRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $queryRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
        };
    };
};
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const EmpresaScalarFieldEnum: {
    readonly id: "id";
    readonly ruc: "ruc";
    readonly razonSocial: "razonSocial";
    readonly correoContacto: "correoContacto";
    readonly telefonoContacto: "telefonoContacto";
    readonly estado: "estado";
    readonly contratoVigenciaInicio: "contratoVigenciaInicio";
    readonly contratoVigenciaFin: "contratoVigenciaFin";
    readonly creadoEn: "creadoEn";
    readonly actualizadoEn: "actualizadoEn";
};
export type EmpresaScalarFieldEnum = (typeof EmpresaScalarFieldEnum)[keyof typeof EmpresaScalarFieldEnum];
export declare const UsuarioScalarFieldEnum: {
    readonly id: "id";
    readonly empresaId: "empresaId";
    readonly rol: "rol";
    readonly correo: "correo";
    readonly passwordHash: "passwordHash";
    readonly estadoCuenta: "estadoCuenta";
    readonly creadoEn: "creadoEn";
};
export type UsuarioScalarFieldEnum = (typeof UsuarioScalarFieldEnum)[keyof typeof UsuarioScalarFieldEnum];
export declare const PuestoScalarFieldEnum: {
    readonly id: "id";
    readonly nombre: "nombre";
    readonly caso: "caso";
};
export type PuestoScalarFieldEnum = (typeof PuestoScalarFieldEnum)[keyof typeof PuestoScalarFieldEnum];
export declare const PersonaScalarFieldEnum: {
    readonly id: "id";
    readonly empresaId: "empresaId";
    readonly puestoId: "puestoId";
    readonly tipoDocumentoIdentidad: "tipoDocumentoIdentidad";
    readonly numeroDocumento: "numeroDocumento";
    readonly nombres: "nombres";
    readonly apellidos: "apellidos";
    readonly area: "area";
    readonly estado: "estado";
    readonly creadoEn: "creadoEn";
};
export type PersonaScalarFieldEnum = (typeof PersonaScalarFieldEnum)[keyof typeof PersonaScalarFieldEnum];
export declare const TipoDocumentoScalarFieldEnum: {
    readonly id: "id";
    readonly nombre: "nombre";
    readonly tipoValidacion: "tipoValidacion";
};
export type TipoDocumentoScalarFieldEnum = (typeof TipoDocumentoScalarFieldEnum)[keyof typeof TipoDocumentoScalarFieldEnum];
export declare const RequisitoPorPuestoScalarFieldEnum: {
    readonly puestoId: "puestoId";
    readonly tipoDocumentoId: "tipoDocumentoId";
    readonly obligatorio: "obligatorio";
};
export type RequisitoPorPuestoScalarFieldEnum = (typeof RequisitoPorPuestoScalarFieldEnum)[keyof typeof RequisitoPorPuestoScalarFieldEnum];
export declare const DocumentoPersonaScalarFieldEnum: {
    readonly id: "id";
    readonly personaId: "personaId";
    readonly tipoDocumentoId: "tipoDocumentoId";
    readonly fechaEmision: "fechaEmision";
    readonly fechaVencimiento: "fechaVencimiento";
    readonly archivoUrl: "archivoUrl";
    readonly version: "version";
    readonly creadoEn: "creadoEn";
};
export type DocumentoPersonaScalarFieldEnum = (typeof DocumentoPersonaScalarFieldEnum)[keyof typeof DocumentoPersonaScalarFieldEnum];
export declare const SolicitudVisitaScalarFieldEnum: {
    readonly id: "id";
    readonly personaId: "personaId";
    readonly empresaId: "empresaId";
    readonly personaVisitada: "personaVisitada";
    readonly motivo: "motivo";
    readonly fechaHoraProgramada: "fechaHoraProgramada";
    readonly estado: "estado";
    readonly creadoEn: "creadoEn";
};
export type SolicitudVisitaScalarFieldEnum = (typeof SolicitudVisitaScalarFieldEnum)[keyof typeof SolicitudVisitaScalarFieldEnum];
export declare const EventoAccesoScalarFieldEnum: {
    readonly id: "id";
    readonly personaId: "personaId";
    readonly tipoMovimiento: "tipoMovimiento";
    readonly resultado: "resultado";
    readonly denegadoPorBaja: "denegadoPorBaja";
    readonly denegadoPorAlcohol: "denegadoPorAlcohol";
    readonly denegadoPorDocumentos: "denegadoPorDocumentos";
    readonly denegadoSinPuesto: "denegadoSinPuesto";
    readonly fechaHora: "fechaHora";
    readonly torniqueteId: "torniqueteId";
};
export type EventoAccesoScalarFieldEnum = (typeof EventoAccesoScalarFieldEnum)[keyof typeof EventoAccesoScalarFieldEnum];
export declare const AuditoriaScalarFieldEnum: {
    readonly id: "id";
    readonly usuarioId: "usuarioId";
    readonly tablaAfectada: "tablaAfectada";
    readonly registroId: "registroId";
    readonly accion: "accion";
    readonly fechaHora: "fechaHora";
};
export type AuditoriaScalarFieldEnum = (typeof AuditoriaScalarFieldEnum)[keyof typeof AuditoriaScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;
export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;
export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;
export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;
export type EnumEstadoEmpresaFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EstadoEmpresa'>;
export type ListEnumEstadoEmpresaFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EstadoEmpresa[]'>;
export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;
export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>;
export type EnumRolUsuarioFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RolUsuario'>;
export type ListEnumRolUsuarioFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RolUsuario[]'>;
export type EnumEstadoCuentaFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EstadoCuenta'>;
export type ListEnumEstadoCuentaFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EstadoCuenta[]'>;
export type EnumCasoPuestoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CasoPuesto'>;
export type ListEnumCasoPuestoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CasoPuesto[]'>;
export type EnumTipoDocumentoIdentidadFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TipoDocumentoIdentidad'>;
export type ListEnumTipoDocumentoIdentidadFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TipoDocumentoIdentidad[]'>;
export type EnumEstadoPersonaFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EstadoPersona'>;
export type ListEnumEstadoPersonaFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EstadoPersona[]'>;
export type EnumTipoValidacionDocumentoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TipoValidacionDocumento'>;
export type ListEnumTipoValidacionDocumentoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TipoValidacionDocumento[]'>;
export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;
export type EnumEstadoSolicitudVisitaFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EstadoSolicitudVisita'>;
export type ListEnumEstadoSolicitudVisitaFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EstadoSolicitudVisita[]'>;
export type EnumTipoMovimientoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TipoMovimiento'>;
export type ListEnumTipoMovimientoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TipoMovimiento[]'>;
export type EnumResultadoAccesoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ResultadoAcceso'>;
export type ListEnumResultadoAccesoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ResultadoAcceso[]'>;
export type EnumAccionAuditoriaFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AccionAuditoria'>;
export type ListEnumAccionAuditoriaFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AccionAuditoria[]'>;
export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>;
export type BatchPayload = {
    count: number;
};
export declare const defineExtension: runtime.Types.Extensions.ExtendsHook<"define", TypeMapCb, runtime.Types.Extensions.DefaultArgs>;
export type DefaultPrismaClient = PrismaClient;
export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
export interface PrismaClientBaseOptions {
    errorFormat?: ErrorFormat;
    log?: (LogLevel | LogDefinition)[];
    transactionOptions?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: TransactionIsolationLevel;
    };
    omit?: GlobalOmitConfig;
    comments?: runtime.SqlCommenterPlugin[];
    queryPlanCacheMaxSize?: number;
}
export interface PrismaClientOptionsWithAccelerateUrl extends PrismaClientBaseOptions {
    accelerateUrl: string;
    adapter?: never;
}
export interface PrismaClientOptionsWithAdapter extends PrismaClientBaseOptions {
    adapter: runtime.SqlDriverAdapterFactory;
    accelerateUrl?: never;
}
export type PrismaClientOptions = PrismaClientOptionsWithAccelerateUrl | PrismaClientOptionsWithAdapter;
export type GlobalOmitConfig = {
    empresa?: Prisma.EmpresaOmit;
    usuario?: Prisma.UsuarioOmit;
    puesto?: Prisma.PuestoOmit;
    persona?: Prisma.PersonaOmit;
    tipoDocumento?: Prisma.TipoDocumentoOmit;
    requisitoPorPuesto?: Prisma.RequisitoPorPuestoOmit;
    documentoPersona?: Prisma.DocumentoPersonaOmit;
    solicitudVisita?: Prisma.SolicitudVisitaOmit;
    eventoAcceso?: Prisma.EventoAccesoOmit;
    auditoria?: Prisma.AuditoriaOmit;
};
export type LogLevel = 'info' | 'query' | 'warn' | 'error';
export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
};
export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;
export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;
export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;
export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};
export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
};
export type PrismaAction = 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'executeRaw' | 'queryRaw' | 'aggregate' | 'count' | 'runCommandRaw' | 'findRaw' | 'groupBy';
export type TransactionClient = Omit<DefaultPrismaClient, runtime.ITXClientDenyList>;
