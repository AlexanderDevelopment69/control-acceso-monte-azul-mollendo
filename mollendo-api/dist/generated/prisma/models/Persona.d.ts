import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type PersonaModel = runtime.Types.Result.DefaultSelection<Prisma.$PersonaPayload>;
export type AggregatePersona = {
    _count: PersonaCountAggregateOutputType | null;
    _avg: PersonaAvgAggregateOutputType | null;
    _sum: PersonaSumAggregateOutputType | null;
    _min: PersonaMinAggregateOutputType | null;
    _max: PersonaMaxAggregateOutputType | null;
};
export type PersonaAvgAggregateOutputType = {
    id: number | null;
    empresaId: number | null;
    puestoId: number | null;
};
export type PersonaSumAggregateOutputType = {
    id: number | null;
    empresaId: number | null;
    puestoId: number | null;
};
export type PersonaMinAggregateOutputType = {
    id: number | null;
    empresaId: number | null;
    puestoId: number | null;
    tipoDocumentoIdentidad: $Enums.TipoDocumentoIdentidad | null;
    numeroDocumento: string | null;
    nombres: string | null;
    apellidos: string | null;
    area: string | null;
    estado: $Enums.EstadoPersona | null;
    creadoEn: Date | null;
};
export type PersonaMaxAggregateOutputType = {
    id: number | null;
    empresaId: number | null;
    puestoId: number | null;
    tipoDocumentoIdentidad: $Enums.TipoDocumentoIdentidad | null;
    numeroDocumento: string | null;
    nombres: string | null;
    apellidos: string | null;
    area: string | null;
    estado: $Enums.EstadoPersona | null;
    creadoEn: Date | null;
};
export type PersonaCountAggregateOutputType = {
    id: number;
    empresaId: number;
    puestoId: number;
    tipoDocumentoIdentidad: number;
    numeroDocumento: number;
    nombres: number;
    apellidos: number;
    area: number;
    estado: number;
    creadoEn: number;
    _all: number;
};
export type PersonaAvgAggregateInputType = {
    id?: true;
    empresaId?: true;
    puestoId?: true;
};
export type PersonaSumAggregateInputType = {
    id?: true;
    empresaId?: true;
    puestoId?: true;
};
export type PersonaMinAggregateInputType = {
    id?: true;
    empresaId?: true;
    puestoId?: true;
    tipoDocumentoIdentidad?: true;
    numeroDocumento?: true;
    nombres?: true;
    apellidos?: true;
    area?: true;
    estado?: true;
    creadoEn?: true;
};
export type PersonaMaxAggregateInputType = {
    id?: true;
    empresaId?: true;
    puestoId?: true;
    tipoDocumentoIdentidad?: true;
    numeroDocumento?: true;
    nombres?: true;
    apellidos?: true;
    area?: true;
    estado?: true;
    creadoEn?: true;
};
export type PersonaCountAggregateInputType = {
    id?: true;
    empresaId?: true;
    puestoId?: true;
    tipoDocumentoIdentidad?: true;
    numeroDocumento?: true;
    nombres?: true;
    apellidos?: true;
    area?: true;
    estado?: true;
    creadoEn?: true;
    _all?: true;
};
export type PersonaAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonaWhereInput;
    orderBy?: Prisma.PersonaOrderByWithRelationInput | Prisma.PersonaOrderByWithRelationInput[];
    cursor?: Prisma.PersonaWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | PersonaCountAggregateInputType;
    _avg?: PersonaAvgAggregateInputType;
    _sum?: PersonaSumAggregateInputType;
    _min?: PersonaMinAggregateInputType;
    _max?: PersonaMaxAggregateInputType;
};
export type GetPersonaAggregateType<T extends PersonaAggregateArgs> = {
    [P in keyof T & keyof AggregatePersona]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregatePersona[P]> : Prisma.GetScalarType<T[P], AggregatePersona[P]>;
};
export type PersonaGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonaWhereInput;
    orderBy?: Prisma.PersonaOrderByWithAggregationInput | Prisma.PersonaOrderByWithAggregationInput[];
    by: Prisma.PersonaScalarFieldEnum[] | Prisma.PersonaScalarFieldEnum;
    having?: Prisma.PersonaScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PersonaCountAggregateInputType | true;
    _avg?: PersonaAvgAggregateInputType;
    _sum?: PersonaSumAggregateInputType;
    _min?: PersonaMinAggregateInputType;
    _max?: PersonaMaxAggregateInputType;
};
export type PersonaGroupByOutputType = {
    id: number;
    empresaId: number;
    puestoId: number | null;
    tipoDocumentoIdentidad: $Enums.TipoDocumentoIdentidad;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    area: string | null;
    estado: $Enums.EstadoPersona;
    creadoEn: Date;
    _count: PersonaCountAggregateOutputType | null;
    _avg: PersonaAvgAggregateOutputType | null;
    _sum: PersonaSumAggregateOutputType | null;
    _min: PersonaMinAggregateOutputType | null;
    _max: PersonaMaxAggregateOutputType | null;
};
export type GetPersonaGroupByPayload<T extends PersonaGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PersonaGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof PersonaGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PersonaGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PersonaGroupByOutputType[P]>;
}>>;
export type PersonaWhereInput = {
    AND?: Prisma.PersonaWhereInput | Prisma.PersonaWhereInput[];
    OR?: Prisma.PersonaWhereInput[];
    NOT?: Prisma.PersonaWhereInput | Prisma.PersonaWhereInput[];
    id?: Prisma.IntFilter<"Persona"> | number;
    empresaId?: Prisma.IntFilter<"Persona"> | number;
    puestoId?: Prisma.IntNullableFilter<"Persona"> | number | null;
    tipoDocumentoIdentidad?: Prisma.EnumTipoDocumentoIdentidadFilter<"Persona"> | $Enums.TipoDocumentoIdentidad;
    numeroDocumento?: Prisma.StringFilter<"Persona"> | string;
    nombres?: Prisma.StringFilter<"Persona"> | string;
    apellidos?: Prisma.StringFilter<"Persona"> | string;
    area?: Prisma.StringNullableFilter<"Persona"> | string | null;
    estado?: Prisma.EnumEstadoPersonaFilter<"Persona"> | $Enums.EstadoPersona;
    creadoEn?: Prisma.DateTimeFilter<"Persona"> | Date | string;
    empresa?: Prisma.XOR<Prisma.EmpresaScalarRelationFilter, Prisma.EmpresaWhereInput>;
    puesto?: Prisma.XOR<Prisma.PuestoNullableScalarRelationFilter, Prisma.PuestoWhereInput> | null;
    documentos?: Prisma.DocumentoPersonaListRelationFilter;
    solicitudesVisita?: Prisma.SolicitudVisitaListRelationFilter;
    eventosAcceso?: Prisma.EventoAccesoListRelationFilter;
};
export type PersonaOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    empresaId?: Prisma.SortOrder;
    puestoId?: Prisma.SortOrderInput | Prisma.SortOrder;
    tipoDocumentoIdentidad?: Prisma.SortOrder;
    numeroDocumento?: Prisma.SortOrder;
    nombres?: Prisma.SortOrder;
    apellidos?: Prisma.SortOrder;
    area?: Prisma.SortOrderInput | Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
    empresa?: Prisma.EmpresaOrderByWithRelationInput;
    puesto?: Prisma.PuestoOrderByWithRelationInput;
    documentos?: Prisma.DocumentoPersonaOrderByRelationAggregateInput;
    solicitudesVisita?: Prisma.SolicitudVisitaOrderByRelationAggregateInput;
    eventosAcceso?: Prisma.EventoAccesoOrderByRelationAggregateInput;
};
export type PersonaWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    tipoDocumentoIdentidad_numeroDocumento?: Prisma.PersonaTipoDocumentoIdentidadNumeroDocumentoCompoundUniqueInput;
    AND?: Prisma.PersonaWhereInput | Prisma.PersonaWhereInput[];
    OR?: Prisma.PersonaWhereInput[];
    NOT?: Prisma.PersonaWhereInput | Prisma.PersonaWhereInput[];
    empresaId?: Prisma.IntFilter<"Persona"> | number;
    puestoId?: Prisma.IntNullableFilter<"Persona"> | number | null;
    tipoDocumentoIdentidad?: Prisma.EnumTipoDocumentoIdentidadFilter<"Persona"> | $Enums.TipoDocumentoIdentidad;
    numeroDocumento?: Prisma.StringFilter<"Persona"> | string;
    nombres?: Prisma.StringFilter<"Persona"> | string;
    apellidos?: Prisma.StringFilter<"Persona"> | string;
    area?: Prisma.StringNullableFilter<"Persona"> | string | null;
    estado?: Prisma.EnumEstadoPersonaFilter<"Persona"> | $Enums.EstadoPersona;
    creadoEn?: Prisma.DateTimeFilter<"Persona"> | Date | string;
    empresa?: Prisma.XOR<Prisma.EmpresaScalarRelationFilter, Prisma.EmpresaWhereInput>;
    puesto?: Prisma.XOR<Prisma.PuestoNullableScalarRelationFilter, Prisma.PuestoWhereInput> | null;
    documentos?: Prisma.DocumentoPersonaListRelationFilter;
    solicitudesVisita?: Prisma.SolicitudVisitaListRelationFilter;
    eventosAcceso?: Prisma.EventoAccesoListRelationFilter;
}, "id" | "tipoDocumentoIdentidad_numeroDocumento">;
export type PersonaOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    empresaId?: Prisma.SortOrder;
    puestoId?: Prisma.SortOrderInput | Prisma.SortOrder;
    tipoDocumentoIdentidad?: Prisma.SortOrder;
    numeroDocumento?: Prisma.SortOrder;
    nombres?: Prisma.SortOrder;
    apellidos?: Prisma.SortOrder;
    area?: Prisma.SortOrderInput | Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
    _count?: Prisma.PersonaCountOrderByAggregateInput;
    _avg?: Prisma.PersonaAvgOrderByAggregateInput;
    _max?: Prisma.PersonaMaxOrderByAggregateInput;
    _min?: Prisma.PersonaMinOrderByAggregateInput;
    _sum?: Prisma.PersonaSumOrderByAggregateInput;
};
export type PersonaScalarWhereWithAggregatesInput = {
    AND?: Prisma.PersonaScalarWhereWithAggregatesInput | Prisma.PersonaScalarWhereWithAggregatesInput[];
    OR?: Prisma.PersonaScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PersonaScalarWhereWithAggregatesInput | Prisma.PersonaScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Persona"> | number;
    empresaId?: Prisma.IntWithAggregatesFilter<"Persona"> | number;
    puestoId?: Prisma.IntNullableWithAggregatesFilter<"Persona"> | number | null;
    tipoDocumentoIdentidad?: Prisma.EnumTipoDocumentoIdentidadWithAggregatesFilter<"Persona"> | $Enums.TipoDocumentoIdentidad;
    numeroDocumento?: Prisma.StringWithAggregatesFilter<"Persona"> | string;
    nombres?: Prisma.StringWithAggregatesFilter<"Persona"> | string;
    apellidos?: Prisma.StringWithAggregatesFilter<"Persona"> | string;
    area?: Prisma.StringNullableWithAggregatesFilter<"Persona"> | string | null;
    estado?: Prisma.EnumEstadoPersonaWithAggregatesFilter<"Persona"> | $Enums.EstadoPersona;
    creadoEn?: Prisma.DateTimeWithAggregatesFilter<"Persona"> | Date | string;
};
export type PersonaCreateInput = {
    tipoDocumentoIdentidad: $Enums.TipoDocumentoIdentidad;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    area?: string | null;
    estado?: $Enums.EstadoPersona;
    creadoEn?: Date | string;
    empresa: Prisma.EmpresaCreateNestedOneWithoutPersonasInput;
    puesto?: Prisma.PuestoCreateNestedOneWithoutPersonasInput;
    documentos?: Prisma.DocumentoPersonaCreateNestedManyWithoutPersonaInput;
    solicitudesVisita?: Prisma.SolicitudVisitaCreateNestedManyWithoutPersonaInput;
    eventosAcceso?: Prisma.EventoAccesoCreateNestedManyWithoutPersonaInput;
};
export type PersonaUncheckedCreateInput = {
    id?: number;
    empresaId: number;
    puestoId?: number | null;
    tipoDocumentoIdentidad: $Enums.TipoDocumentoIdentidad;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    area?: string | null;
    estado?: $Enums.EstadoPersona;
    creadoEn?: Date | string;
    documentos?: Prisma.DocumentoPersonaUncheckedCreateNestedManyWithoutPersonaInput;
    solicitudesVisita?: Prisma.SolicitudVisitaUncheckedCreateNestedManyWithoutPersonaInput;
    eventosAcceso?: Prisma.EventoAccesoUncheckedCreateNestedManyWithoutPersonaInput;
};
export type PersonaUpdateInput = {
    tipoDocumentoIdentidad?: Prisma.EnumTipoDocumentoIdentidadFieldUpdateOperationsInput | $Enums.TipoDocumentoIdentidad;
    numeroDocumento?: Prisma.StringFieldUpdateOperationsInput | string;
    nombres?: Prisma.StringFieldUpdateOperationsInput | string;
    apellidos?: Prisma.StringFieldUpdateOperationsInput | string;
    area?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoPersonaFieldUpdateOperationsInput | $Enums.EstadoPersona;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    empresa?: Prisma.EmpresaUpdateOneRequiredWithoutPersonasNestedInput;
    puesto?: Prisma.PuestoUpdateOneWithoutPersonasNestedInput;
    documentos?: Prisma.DocumentoPersonaUpdateManyWithoutPersonaNestedInput;
    solicitudesVisita?: Prisma.SolicitudVisitaUpdateManyWithoutPersonaNestedInput;
    eventosAcceso?: Prisma.EventoAccesoUpdateManyWithoutPersonaNestedInput;
};
export type PersonaUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    empresaId?: Prisma.IntFieldUpdateOperationsInput | number;
    puestoId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    tipoDocumentoIdentidad?: Prisma.EnumTipoDocumentoIdentidadFieldUpdateOperationsInput | $Enums.TipoDocumentoIdentidad;
    numeroDocumento?: Prisma.StringFieldUpdateOperationsInput | string;
    nombres?: Prisma.StringFieldUpdateOperationsInput | string;
    apellidos?: Prisma.StringFieldUpdateOperationsInput | string;
    area?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoPersonaFieldUpdateOperationsInput | $Enums.EstadoPersona;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    documentos?: Prisma.DocumentoPersonaUncheckedUpdateManyWithoutPersonaNestedInput;
    solicitudesVisita?: Prisma.SolicitudVisitaUncheckedUpdateManyWithoutPersonaNestedInput;
    eventosAcceso?: Prisma.EventoAccesoUncheckedUpdateManyWithoutPersonaNestedInput;
};
export type PersonaCreateManyInput = {
    id?: number;
    empresaId: number;
    puestoId?: number | null;
    tipoDocumentoIdentidad: $Enums.TipoDocumentoIdentidad;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    area?: string | null;
    estado?: $Enums.EstadoPersona;
    creadoEn?: Date | string;
};
export type PersonaUpdateManyMutationInput = {
    tipoDocumentoIdentidad?: Prisma.EnumTipoDocumentoIdentidadFieldUpdateOperationsInput | $Enums.TipoDocumentoIdentidad;
    numeroDocumento?: Prisma.StringFieldUpdateOperationsInput | string;
    nombres?: Prisma.StringFieldUpdateOperationsInput | string;
    apellidos?: Prisma.StringFieldUpdateOperationsInput | string;
    area?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoPersonaFieldUpdateOperationsInput | $Enums.EstadoPersona;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PersonaUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    empresaId?: Prisma.IntFieldUpdateOperationsInput | number;
    puestoId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    tipoDocumentoIdentidad?: Prisma.EnumTipoDocumentoIdentidadFieldUpdateOperationsInput | $Enums.TipoDocumentoIdentidad;
    numeroDocumento?: Prisma.StringFieldUpdateOperationsInput | string;
    nombres?: Prisma.StringFieldUpdateOperationsInput | string;
    apellidos?: Prisma.StringFieldUpdateOperationsInput | string;
    area?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoPersonaFieldUpdateOperationsInput | $Enums.EstadoPersona;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PersonaListRelationFilter = {
    every?: Prisma.PersonaWhereInput;
    some?: Prisma.PersonaWhereInput;
    none?: Prisma.PersonaWhereInput;
};
export type PersonaOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type PersonaTipoDocumentoIdentidadNumeroDocumentoCompoundUniqueInput = {
    tipoDocumentoIdentidad: $Enums.TipoDocumentoIdentidad;
    numeroDocumento: string;
};
export type PersonaCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    empresaId?: Prisma.SortOrder;
    puestoId?: Prisma.SortOrder;
    tipoDocumentoIdentidad?: Prisma.SortOrder;
    numeroDocumento?: Prisma.SortOrder;
    nombres?: Prisma.SortOrder;
    apellidos?: Prisma.SortOrder;
    area?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
};
export type PersonaAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    empresaId?: Prisma.SortOrder;
    puestoId?: Prisma.SortOrder;
};
export type PersonaMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    empresaId?: Prisma.SortOrder;
    puestoId?: Prisma.SortOrder;
    tipoDocumentoIdentidad?: Prisma.SortOrder;
    numeroDocumento?: Prisma.SortOrder;
    nombres?: Prisma.SortOrder;
    apellidos?: Prisma.SortOrder;
    area?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
};
export type PersonaMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    empresaId?: Prisma.SortOrder;
    puestoId?: Prisma.SortOrder;
    tipoDocumentoIdentidad?: Prisma.SortOrder;
    numeroDocumento?: Prisma.SortOrder;
    nombres?: Prisma.SortOrder;
    apellidos?: Prisma.SortOrder;
    area?: Prisma.SortOrder;
    estado?: Prisma.SortOrder;
    creadoEn?: Prisma.SortOrder;
};
export type PersonaSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    empresaId?: Prisma.SortOrder;
    puestoId?: Prisma.SortOrder;
};
export type PersonaScalarRelationFilter = {
    is?: Prisma.PersonaWhereInput;
    isNot?: Prisma.PersonaWhereInput;
};
export type PersonaCreateNestedManyWithoutEmpresaInput = {
    create?: Prisma.XOR<Prisma.PersonaCreateWithoutEmpresaInput, Prisma.PersonaUncheckedCreateWithoutEmpresaInput> | Prisma.PersonaCreateWithoutEmpresaInput[] | Prisma.PersonaUncheckedCreateWithoutEmpresaInput[];
    connectOrCreate?: Prisma.PersonaCreateOrConnectWithoutEmpresaInput | Prisma.PersonaCreateOrConnectWithoutEmpresaInput[];
    createMany?: Prisma.PersonaCreateManyEmpresaInputEnvelope;
    connect?: Prisma.PersonaWhereUniqueInput | Prisma.PersonaWhereUniqueInput[];
};
export type PersonaUncheckedCreateNestedManyWithoutEmpresaInput = {
    create?: Prisma.XOR<Prisma.PersonaCreateWithoutEmpresaInput, Prisma.PersonaUncheckedCreateWithoutEmpresaInput> | Prisma.PersonaCreateWithoutEmpresaInput[] | Prisma.PersonaUncheckedCreateWithoutEmpresaInput[];
    connectOrCreate?: Prisma.PersonaCreateOrConnectWithoutEmpresaInput | Prisma.PersonaCreateOrConnectWithoutEmpresaInput[];
    createMany?: Prisma.PersonaCreateManyEmpresaInputEnvelope;
    connect?: Prisma.PersonaWhereUniqueInput | Prisma.PersonaWhereUniqueInput[];
};
export type PersonaUpdateManyWithoutEmpresaNestedInput = {
    create?: Prisma.XOR<Prisma.PersonaCreateWithoutEmpresaInput, Prisma.PersonaUncheckedCreateWithoutEmpresaInput> | Prisma.PersonaCreateWithoutEmpresaInput[] | Prisma.PersonaUncheckedCreateWithoutEmpresaInput[];
    connectOrCreate?: Prisma.PersonaCreateOrConnectWithoutEmpresaInput | Prisma.PersonaCreateOrConnectWithoutEmpresaInput[];
    upsert?: Prisma.PersonaUpsertWithWhereUniqueWithoutEmpresaInput | Prisma.PersonaUpsertWithWhereUniqueWithoutEmpresaInput[];
    createMany?: Prisma.PersonaCreateManyEmpresaInputEnvelope;
    set?: Prisma.PersonaWhereUniqueInput | Prisma.PersonaWhereUniqueInput[];
    disconnect?: Prisma.PersonaWhereUniqueInput | Prisma.PersonaWhereUniqueInput[];
    delete?: Prisma.PersonaWhereUniqueInput | Prisma.PersonaWhereUniqueInput[];
    connect?: Prisma.PersonaWhereUniqueInput | Prisma.PersonaWhereUniqueInput[];
    update?: Prisma.PersonaUpdateWithWhereUniqueWithoutEmpresaInput | Prisma.PersonaUpdateWithWhereUniqueWithoutEmpresaInput[];
    updateMany?: Prisma.PersonaUpdateManyWithWhereWithoutEmpresaInput | Prisma.PersonaUpdateManyWithWhereWithoutEmpresaInput[];
    deleteMany?: Prisma.PersonaScalarWhereInput | Prisma.PersonaScalarWhereInput[];
};
export type PersonaUncheckedUpdateManyWithoutEmpresaNestedInput = {
    create?: Prisma.XOR<Prisma.PersonaCreateWithoutEmpresaInput, Prisma.PersonaUncheckedCreateWithoutEmpresaInput> | Prisma.PersonaCreateWithoutEmpresaInput[] | Prisma.PersonaUncheckedCreateWithoutEmpresaInput[];
    connectOrCreate?: Prisma.PersonaCreateOrConnectWithoutEmpresaInput | Prisma.PersonaCreateOrConnectWithoutEmpresaInput[];
    upsert?: Prisma.PersonaUpsertWithWhereUniqueWithoutEmpresaInput | Prisma.PersonaUpsertWithWhereUniqueWithoutEmpresaInput[];
    createMany?: Prisma.PersonaCreateManyEmpresaInputEnvelope;
    set?: Prisma.PersonaWhereUniqueInput | Prisma.PersonaWhereUniqueInput[];
    disconnect?: Prisma.PersonaWhereUniqueInput | Prisma.PersonaWhereUniqueInput[];
    delete?: Prisma.PersonaWhereUniqueInput | Prisma.PersonaWhereUniqueInput[];
    connect?: Prisma.PersonaWhereUniqueInput | Prisma.PersonaWhereUniqueInput[];
    update?: Prisma.PersonaUpdateWithWhereUniqueWithoutEmpresaInput | Prisma.PersonaUpdateWithWhereUniqueWithoutEmpresaInput[];
    updateMany?: Prisma.PersonaUpdateManyWithWhereWithoutEmpresaInput | Prisma.PersonaUpdateManyWithWhereWithoutEmpresaInput[];
    deleteMany?: Prisma.PersonaScalarWhereInput | Prisma.PersonaScalarWhereInput[];
};
export type PersonaCreateNestedManyWithoutPuestoInput = {
    create?: Prisma.XOR<Prisma.PersonaCreateWithoutPuestoInput, Prisma.PersonaUncheckedCreateWithoutPuestoInput> | Prisma.PersonaCreateWithoutPuestoInput[] | Prisma.PersonaUncheckedCreateWithoutPuestoInput[];
    connectOrCreate?: Prisma.PersonaCreateOrConnectWithoutPuestoInput | Prisma.PersonaCreateOrConnectWithoutPuestoInput[];
    createMany?: Prisma.PersonaCreateManyPuestoInputEnvelope;
    connect?: Prisma.PersonaWhereUniqueInput | Prisma.PersonaWhereUniqueInput[];
};
export type PersonaUncheckedCreateNestedManyWithoutPuestoInput = {
    create?: Prisma.XOR<Prisma.PersonaCreateWithoutPuestoInput, Prisma.PersonaUncheckedCreateWithoutPuestoInput> | Prisma.PersonaCreateWithoutPuestoInput[] | Prisma.PersonaUncheckedCreateWithoutPuestoInput[];
    connectOrCreate?: Prisma.PersonaCreateOrConnectWithoutPuestoInput | Prisma.PersonaCreateOrConnectWithoutPuestoInput[];
    createMany?: Prisma.PersonaCreateManyPuestoInputEnvelope;
    connect?: Prisma.PersonaWhereUniqueInput | Prisma.PersonaWhereUniqueInput[];
};
export type PersonaUpdateManyWithoutPuestoNestedInput = {
    create?: Prisma.XOR<Prisma.PersonaCreateWithoutPuestoInput, Prisma.PersonaUncheckedCreateWithoutPuestoInput> | Prisma.PersonaCreateWithoutPuestoInput[] | Prisma.PersonaUncheckedCreateWithoutPuestoInput[];
    connectOrCreate?: Prisma.PersonaCreateOrConnectWithoutPuestoInput | Prisma.PersonaCreateOrConnectWithoutPuestoInput[];
    upsert?: Prisma.PersonaUpsertWithWhereUniqueWithoutPuestoInput | Prisma.PersonaUpsertWithWhereUniqueWithoutPuestoInput[];
    createMany?: Prisma.PersonaCreateManyPuestoInputEnvelope;
    set?: Prisma.PersonaWhereUniqueInput | Prisma.PersonaWhereUniqueInput[];
    disconnect?: Prisma.PersonaWhereUniqueInput | Prisma.PersonaWhereUniqueInput[];
    delete?: Prisma.PersonaWhereUniqueInput | Prisma.PersonaWhereUniqueInput[];
    connect?: Prisma.PersonaWhereUniqueInput | Prisma.PersonaWhereUniqueInput[];
    update?: Prisma.PersonaUpdateWithWhereUniqueWithoutPuestoInput | Prisma.PersonaUpdateWithWhereUniqueWithoutPuestoInput[];
    updateMany?: Prisma.PersonaUpdateManyWithWhereWithoutPuestoInput | Prisma.PersonaUpdateManyWithWhereWithoutPuestoInput[];
    deleteMany?: Prisma.PersonaScalarWhereInput | Prisma.PersonaScalarWhereInput[];
};
export type PersonaUncheckedUpdateManyWithoutPuestoNestedInput = {
    create?: Prisma.XOR<Prisma.PersonaCreateWithoutPuestoInput, Prisma.PersonaUncheckedCreateWithoutPuestoInput> | Prisma.PersonaCreateWithoutPuestoInput[] | Prisma.PersonaUncheckedCreateWithoutPuestoInput[];
    connectOrCreate?: Prisma.PersonaCreateOrConnectWithoutPuestoInput | Prisma.PersonaCreateOrConnectWithoutPuestoInput[];
    upsert?: Prisma.PersonaUpsertWithWhereUniqueWithoutPuestoInput | Prisma.PersonaUpsertWithWhereUniqueWithoutPuestoInput[];
    createMany?: Prisma.PersonaCreateManyPuestoInputEnvelope;
    set?: Prisma.PersonaWhereUniqueInput | Prisma.PersonaWhereUniqueInput[];
    disconnect?: Prisma.PersonaWhereUniqueInput | Prisma.PersonaWhereUniqueInput[];
    delete?: Prisma.PersonaWhereUniqueInput | Prisma.PersonaWhereUniqueInput[];
    connect?: Prisma.PersonaWhereUniqueInput | Prisma.PersonaWhereUniqueInput[];
    update?: Prisma.PersonaUpdateWithWhereUniqueWithoutPuestoInput | Prisma.PersonaUpdateWithWhereUniqueWithoutPuestoInput[];
    updateMany?: Prisma.PersonaUpdateManyWithWhereWithoutPuestoInput | Prisma.PersonaUpdateManyWithWhereWithoutPuestoInput[];
    deleteMany?: Prisma.PersonaScalarWhereInput | Prisma.PersonaScalarWhereInput[];
};
export type EnumTipoDocumentoIdentidadFieldUpdateOperationsInput = {
    set?: $Enums.TipoDocumentoIdentidad;
};
export type EnumEstadoPersonaFieldUpdateOperationsInput = {
    set?: $Enums.EstadoPersona;
};
export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type PersonaCreateNestedOneWithoutDocumentosInput = {
    create?: Prisma.XOR<Prisma.PersonaCreateWithoutDocumentosInput, Prisma.PersonaUncheckedCreateWithoutDocumentosInput>;
    connectOrCreate?: Prisma.PersonaCreateOrConnectWithoutDocumentosInput;
    connect?: Prisma.PersonaWhereUniqueInput;
};
export type PersonaUpdateOneRequiredWithoutDocumentosNestedInput = {
    create?: Prisma.XOR<Prisma.PersonaCreateWithoutDocumentosInput, Prisma.PersonaUncheckedCreateWithoutDocumentosInput>;
    connectOrCreate?: Prisma.PersonaCreateOrConnectWithoutDocumentosInput;
    upsert?: Prisma.PersonaUpsertWithoutDocumentosInput;
    connect?: Prisma.PersonaWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PersonaUpdateToOneWithWhereWithoutDocumentosInput, Prisma.PersonaUpdateWithoutDocumentosInput>, Prisma.PersonaUncheckedUpdateWithoutDocumentosInput>;
};
export type PersonaCreateNestedOneWithoutSolicitudesVisitaInput = {
    create?: Prisma.XOR<Prisma.PersonaCreateWithoutSolicitudesVisitaInput, Prisma.PersonaUncheckedCreateWithoutSolicitudesVisitaInput>;
    connectOrCreate?: Prisma.PersonaCreateOrConnectWithoutSolicitudesVisitaInput;
    connect?: Prisma.PersonaWhereUniqueInput;
};
export type PersonaUpdateOneRequiredWithoutSolicitudesVisitaNestedInput = {
    create?: Prisma.XOR<Prisma.PersonaCreateWithoutSolicitudesVisitaInput, Prisma.PersonaUncheckedCreateWithoutSolicitudesVisitaInput>;
    connectOrCreate?: Prisma.PersonaCreateOrConnectWithoutSolicitudesVisitaInput;
    upsert?: Prisma.PersonaUpsertWithoutSolicitudesVisitaInput;
    connect?: Prisma.PersonaWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PersonaUpdateToOneWithWhereWithoutSolicitudesVisitaInput, Prisma.PersonaUpdateWithoutSolicitudesVisitaInput>, Prisma.PersonaUncheckedUpdateWithoutSolicitudesVisitaInput>;
};
export type PersonaCreateNestedOneWithoutEventosAccesoInput = {
    create?: Prisma.XOR<Prisma.PersonaCreateWithoutEventosAccesoInput, Prisma.PersonaUncheckedCreateWithoutEventosAccesoInput>;
    connectOrCreate?: Prisma.PersonaCreateOrConnectWithoutEventosAccesoInput;
    connect?: Prisma.PersonaWhereUniqueInput;
};
export type PersonaUpdateOneRequiredWithoutEventosAccesoNestedInput = {
    create?: Prisma.XOR<Prisma.PersonaCreateWithoutEventosAccesoInput, Prisma.PersonaUncheckedCreateWithoutEventosAccesoInput>;
    connectOrCreate?: Prisma.PersonaCreateOrConnectWithoutEventosAccesoInput;
    upsert?: Prisma.PersonaUpsertWithoutEventosAccesoInput;
    connect?: Prisma.PersonaWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PersonaUpdateToOneWithWhereWithoutEventosAccesoInput, Prisma.PersonaUpdateWithoutEventosAccesoInput>, Prisma.PersonaUncheckedUpdateWithoutEventosAccesoInput>;
};
export type PersonaCreateWithoutEmpresaInput = {
    tipoDocumentoIdentidad: $Enums.TipoDocumentoIdentidad;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    area?: string | null;
    estado?: $Enums.EstadoPersona;
    creadoEn?: Date | string;
    puesto?: Prisma.PuestoCreateNestedOneWithoutPersonasInput;
    documentos?: Prisma.DocumentoPersonaCreateNestedManyWithoutPersonaInput;
    solicitudesVisita?: Prisma.SolicitudVisitaCreateNestedManyWithoutPersonaInput;
    eventosAcceso?: Prisma.EventoAccesoCreateNestedManyWithoutPersonaInput;
};
export type PersonaUncheckedCreateWithoutEmpresaInput = {
    id?: number;
    puestoId?: number | null;
    tipoDocumentoIdentidad: $Enums.TipoDocumentoIdentidad;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    area?: string | null;
    estado?: $Enums.EstadoPersona;
    creadoEn?: Date | string;
    documentos?: Prisma.DocumentoPersonaUncheckedCreateNestedManyWithoutPersonaInput;
    solicitudesVisita?: Prisma.SolicitudVisitaUncheckedCreateNestedManyWithoutPersonaInput;
    eventosAcceso?: Prisma.EventoAccesoUncheckedCreateNestedManyWithoutPersonaInput;
};
export type PersonaCreateOrConnectWithoutEmpresaInput = {
    where: Prisma.PersonaWhereUniqueInput;
    create: Prisma.XOR<Prisma.PersonaCreateWithoutEmpresaInput, Prisma.PersonaUncheckedCreateWithoutEmpresaInput>;
};
export type PersonaCreateManyEmpresaInputEnvelope = {
    data: Prisma.PersonaCreateManyEmpresaInput | Prisma.PersonaCreateManyEmpresaInput[];
    skipDuplicates?: boolean;
};
export type PersonaUpsertWithWhereUniqueWithoutEmpresaInput = {
    where: Prisma.PersonaWhereUniqueInput;
    update: Prisma.XOR<Prisma.PersonaUpdateWithoutEmpresaInput, Prisma.PersonaUncheckedUpdateWithoutEmpresaInput>;
    create: Prisma.XOR<Prisma.PersonaCreateWithoutEmpresaInput, Prisma.PersonaUncheckedCreateWithoutEmpresaInput>;
};
export type PersonaUpdateWithWhereUniqueWithoutEmpresaInput = {
    where: Prisma.PersonaWhereUniqueInput;
    data: Prisma.XOR<Prisma.PersonaUpdateWithoutEmpresaInput, Prisma.PersonaUncheckedUpdateWithoutEmpresaInput>;
};
export type PersonaUpdateManyWithWhereWithoutEmpresaInput = {
    where: Prisma.PersonaScalarWhereInput;
    data: Prisma.XOR<Prisma.PersonaUpdateManyMutationInput, Prisma.PersonaUncheckedUpdateManyWithoutEmpresaInput>;
};
export type PersonaScalarWhereInput = {
    AND?: Prisma.PersonaScalarWhereInput | Prisma.PersonaScalarWhereInput[];
    OR?: Prisma.PersonaScalarWhereInput[];
    NOT?: Prisma.PersonaScalarWhereInput | Prisma.PersonaScalarWhereInput[];
    id?: Prisma.IntFilter<"Persona"> | number;
    empresaId?: Prisma.IntFilter<"Persona"> | number;
    puestoId?: Prisma.IntNullableFilter<"Persona"> | number | null;
    tipoDocumentoIdentidad?: Prisma.EnumTipoDocumentoIdentidadFilter<"Persona"> | $Enums.TipoDocumentoIdentidad;
    numeroDocumento?: Prisma.StringFilter<"Persona"> | string;
    nombres?: Prisma.StringFilter<"Persona"> | string;
    apellidos?: Prisma.StringFilter<"Persona"> | string;
    area?: Prisma.StringNullableFilter<"Persona"> | string | null;
    estado?: Prisma.EnumEstadoPersonaFilter<"Persona"> | $Enums.EstadoPersona;
    creadoEn?: Prisma.DateTimeFilter<"Persona"> | Date | string;
};
export type PersonaCreateWithoutPuestoInput = {
    tipoDocumentoIdentidad: $Enums.TipoDocumentoIdentidad;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    area?: string | null;
    estado?: $Enums.EstadoPersona;
    creadoEn?: Date | string;
    empresa: Prisma.EmpresaCreateNestedOneWithoutPersonasInput;
    documentos?: Prisma.DocumentoPersonaCreateNestedManyWithoutPersonaInput;
    solicitudesVisita?: Prisma.SolicitudVisitaCreateNestedManyWithoutPersonaInput;
    eventosAcceso?: Prisma.EventoAccesoCreateNestedManyWithoutPersonaInput;
};
export type PersonaUncheckedCreateWithoutPuestoInput = {
    id?: number;
    empresaId: number;
    tipoDocumentoIdentidad: $Enums.TipoDocumentoIdentidad;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    area?: string | null;
    estado?: $Enums.EstadoPersona;
    creadoEn?: Date | string;
    documentos?: Prisma.DocumentoPersonaUncheckedCreateNestedManyWithoutPersonaInput;
    solicitudesVisita?: Prisma.SolicitudVisitaUncheckedCreateNestedManyWithoutPersonaInput;
    eventosAcceso?: Prisma.EventoAccesoUncheckedCreateNestedManyWithoutPersonaInput;
};
export type PersonaCreateOrConnectWithoutPuestoInput = {
    where: Prisma.PersonaWhereUniqueInput;
    create: Prisma.XOR<Prisma.PersonaCreateWithoutPuestoInput, Prisma.PersonaUncheckedCreateWithoutPuestoInput>;
};
export type PersonaCreateManyPuestoInputEnvelope = {
    data: Prisma.PersonaCreateManyPuestoInput | Prisma.PersonaCreateManyPuestoInput[];
    skipDuplicates?: boolean;
};
export type PersonaUpsertWithWhereUniqueWithoutPuestoInput = {
    where: Prisma.PersonaWhereUniqueInput;
    update: Prisma.XOR<Prisma.PersonaUpdateWithoutPuestoInput, Prisma.PersonaUncheckedUpdateWithoutPuestoInput>;
    create: Prisma.XOR<Prisma.PersonaCreateWithoutPuestoInput, Prisma.PersonaUncheckedCreateWithoutPuestoInput>;
};
export type PersonaUpdateWithWhereUniqueWithoutPuestoInput = {
    where: Prisma.PersonaWhereUniqueInput;
    data: Prisma.XOR<Prisma.PersonaUpdateWithoutPuestoInput, Prisma.PersonaUncheckedUpdateWithoutPuestoInput>;
};
export type PersonaUpdateManyWithWhereWithoutPuestoInput = {
    where: Prisma.PersonaScalarWhereInput;
    data: Prisma.XOR<Prisma.PersonaUpdateManyMutationInput, Prisma.PersonaUncheckedUpdateManyWithoutPuestoInput>;
};
export type PersonaCreateWithoutDocumentosInput = {
    tipoDocumentoIdentidad: $Enums.TipoDocumentoIdentidad;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    area?: string | null;
    estado?: $Enums.EstadoPersona;
    creadoEn?: Date | string;
    empresa: Prisma.EmpresaCreateNestedOneWithoutPersonasInput;
    puesto?: Prisma.PuestoCreateNestedOneWithoutPersonasInput;
    solicitudesVisita?: Prisma.SolicitudVisitaCreateNestedManyWithoutPersonaInput;
    eventosAcceso?: Prisma.EventoAccesoCreateNestedManyWithoutPersonaInput;
};
export type PersonaUncheckedCreateWithoutDocumentosInput = {
    id?: number;
    empresaId: number;
    puestoId?: number | null;
    tipoDocumentoIdentidad: $Enums.TipoDocumentoIdentidad;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    area?: string | null;
    estado?: $Enums.EstadoPersona;
    creadoEn?: Date | string;
    solicitudesVisita?: Prisma.SolicitudVisitaUncheckedCreateNestedManyWithoutPersonaInput;
    eventosAcceso?: Prisma.EventoAccesoUncheckedCreateNestedManyWithoutPersonaInput;
};
export type PersonaCreateOrConnectWithoutDocumentosInput = {
    where: Prisma.PersonaWhereUniqueInput;
    create: Prisma.XOR<Prisma.PersonaCreateWithoutDocumentosInput, Prisma.PersonaUncheckedCreateWithoutDocumentosInput>;
};
export type PersonaUpsertWithoutDocumentosInput = {
    update: Prisma.XOR<Prisma.PersonaUpdateWithoutDocumentosInput, Prisma.PersonaUncheckedUpdateWithoutDocumentosInput>;
    create: Prisma.XOR<Prisma.PersonaCreateWithoutDocumentosInput, Prisma.PersonaUncheckedCreateWithoutDocumentosInput>;
    where?: Prisma.PersonaWhereInput;
};
export type PersonaUpdateToOneWithWhereWithoutDocumentosInput = {
    where?: Prisma.PersonaWhereInput;
    data: Prisma.XOR<Prisma.PersonaUpdateWithoutDocumentosInput, Prisma.PersonaUncheckedUpdateWithoutDocumentosInput>;
};
export type PersonaUpdateWithoutDocumentosInput = {
    tipoDocumentoIdentidad?: Prisma.EnumTipoDocumentoIdentidadFieldUpdateOperationsInput | $Enums.TipoDocumentoIdentidad;
    numeroDocumento?: Prisma.StringFieldUpdateOperationsInput | string;
    nombres?: Prisma.StringFieldUpdateOperationsInput | string;
    apellidos?: Prisma.StringFieldUpdateOperationsInput | string;
    area?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoPersonaFieldUpdateOperationsInput | $Enums.EstadoPersona;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    empresa?: Prisma.EmpresaUpdateOneRequiredWithoutPersonasNestedInput;
    puesto?: Prisma.PuestoUpdateOneWithoutPersonasNestedInput;
    solicitudesVisita?: Prisma.SolicitudVisitaUpdateManyWithoutPersonaNestedInput;
    eventosAcceso?: Prisma.EventoAccesoUpdateManyWithoutPersonaNestedInput;
};
export type PersonaUncheckedUpdateWithoutDocumentosInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    empresaId?: Prisma.IntFieldUpdateOperationsInput | number;
    puestoId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    tipoDocumentoIdentidad?: Prisma.EnumTipoDocumentoIdentidadFieldUpdateOperationsInput | $Enums.TipoDocumentoIdentidad;
    numeroDocumento?: Prisma.StringFieldUpdateOperationsInput | string;
    nombres?: Prisma.StringFieldUpdateOperationsInput | string;
    apellidos?: Prisma.StringFieldUpdateOperationsInput | string;
    area?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoPersonaFieldUpdateOperationsInput | $Enums.EstadoPersona;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    solicitudesVisita?: Prisma.SolicitudVisitaUncheckedUpdateManyWithoutPersonaNestedInput;
    eventosAcceso?: Prisma.EventoAccesoUncheckedUpdateManyWithoutPersonaNestedInput;
};
export type PersonaCreateWithoutSolicitudesVisitaInput = {
    tipoDocumentoIdentidad: $Enums.TipoDocumentoIdentidad;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    area?: string | null;
    estado?: $Enums.EstadoPersona;
    creadoEn?: Date | string;
    empresa: Prisma.EmpresaCreateNestedOneWithoutPersonasInput;
    puesto?: Prisma.PuestoCreateNestedOneWithoutPersonasInput;
    documentos?: Prisma.DocumentoPersonaCreateNestedManyWithoutPersonaInput;
    eventosAcceso?: Prisma.EventoAccesoCreateNestedManyWithoutPersonaInput;
};
export type PersonaUncheckedCreateWithoutSolicitudesVisitaInput = {
    id?: number;
    empresaId: number;
    puestoId?: number | null;
    tipoDocumentoIdentidad: $Enums.TipoDocumentoIdentidad;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    area?: string | null;
    estado?: $Enums.EstadoPersona;
    creadoEn?: Date | string;
    documentos?: Prisma.DocumentoPersonaUncheckedCreateNestedManyWithoutPersonaInput;
    eventosAcceso?: Prisma.EventoAccesoUncheckedCreateNestedManyWithoutPersonaInput;
};
export type PersonaCreateOrConnectWithoutSolicitudesVisitaInput = {
    where: Prisma.PersonaWhereUniqueInput;
    create: Prisma.XOR<Prisma.PersonaCreateWithoutSolicitudesVisitaInput, Prisma.PersonaUncheckedCreateWithoutSolicitudesVisitaInput>;
};
export type PersonaUpsertWithoutSolicitudesVisitaInput = {
    update: Prisma.XOR<Prisma.PersonaUpdateWithoutSolicitudesVisitaInput, Prisma.PersonaUncheckedUpdateWithoutSolicitudesVisitaInput>;
    create: Prisma.XOR<Prisma.PersonaCreateWithoutSolicitudesVisitaInput, Prisma.PersonaUncheckedCreateWithoutSolicitudesVisitaInput>;
    where?: Prisma.PersonaWhereInput;
};
export type PersonaUpdateToOneWithWhereWithoutSolicitudesVisitaInput = {
    where?: Prisma.PersonaWhereInput;
    data: Prisma.XOR<Prisma.PersonaUpdateWithoutSolicitudesVisitaInput, Prisma.PersonaUncheckedUpdateWithoutSolicitudesVisitaInput>;
};
export type PersonaUpdateWithoutSolicitudesVisitaInput = {
    tipoDocumentoIdentidad?: Prisma.EnumTipoDocumentoIdentidadFieldUpdateOperationsInput | $Enums.TipoDocumentoIdentidad;
    numeroDocumento?: Prisma.StringFieldUpdateOperationsInput | string;
    nombres?: Prisma.StringFieldUpdateOperationsInput | string;
    apellidos?: Prisma.StringFieldUpdateOperationsInput | string;
    area?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoPersonaFieldUpdateOperationsInput | $Enums.EstadoPersona;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    empresa?: Prisma.EmpresaUpdateOneRequiredWithoutPersonasNestedInput;
    puesto?: Prisma.PuestoUpdateOneWithoutPersonasNestedInput;
    documentos?: Prisma.DocumentoPersonaUpdateManyWithoutPersonaNestedInput;
    eventosAcceso?: Prisma.EventoAccesoUpdateManyWithoutPersonaNestedInput;
};
export type PersonaUncheckedUpdateWithoutSolicitudesVisitaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    empresaId?: Prisma.IntFieldUpdateOperationsInput | number;
    puestoId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    tipoDocumentoIdentidad?: Prisma.EnumTipoDocumentoIdentidadFieldUpdateOperationsInput | $Enums.TipoDocumentoIdentidad;
    numeroDocumento?: Prisma.StringFieldUpdateOperationsInput | string;
    nombres?: Prisma.StringFieldUpdateOperationsInput | string;
    apellidos?: Prisma.StringFieldUpdateOperationsInput | string;
    area?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoPersonaFieldUpdateOperationsInput | $Enums.EstadoPersona;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    documentos?: Prisma.DocumentoPersonaUncheckedUpdateManyWithoutPersonaNestedInput;
    eventosAcceso?: Prisma.EventoAccesoUncheckedUpdateManyWithoutPersonaNestedInput;
};
export type PersonaCreateWithoutEventosAccesoInput = {
    tipoDocumentoIdentidad: $Enums.TipoDocumentoIdentidad;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    area?: string | null;
    estado?: $Enums.EstadoPersona;
    creadoEn?: Date | string;
    empresa: Prisma.EmpresaCreateNestedOneWithoutPersonasInput;
    puesto?: Prisma.PuestoCreateNestedOneWithoutPersonasInput;
    documentos?: Prisma.DocumentoPersonaCreateNestedManyWithoutPersonaInput;
    solicitudesVisita?: Prisma.SolicitudVisitaCreateNestedManyWithoutPersonaInput;
};
export type PersonaUncheckedCreateWithoutEventosAccesoInput = {
    id?: number;
    empresaId: number;
    puestoId?: number | null;
    tipoDocumentoIdentidad: $Enums.TipoDocumentoIdentidad;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    area?: string | null;
    estado?: $Enums.EstadoPersona;
    creadoEn?: Date | string;
    documentos?: Prisma.DocumentoPersonaUncheckedCreateNestedManyWithoutPersonaInput;
    solicitudesVisita?: Prisma.SolicitudVisitaUncheckedCreateNestedManyWithoutPersonaInput;
};
export type PersonaCreateOrConnectWithoutEventosAccesoInput = {
    where: Prisma.PersonaWhereUniqueInput;
    create: Prisma.XOR<Prisma.PersonaCreateWithoutEventosAccesoInput, Prisma.PersonaUncheckedCreateWithoutEventosAccesoInput>;
};
export type PersonaUpsertWithoutEventosAccesoInput = {
    update: Prisma.XOR<Prisma.PersonaUpdateWithoutEventosAccesoInput, Prisma.PersonaUncheckedUpdateWithoutEventosAccesoInput>;
    create: Prisma.XOR<Prisma.PersonaCreateWithoutEventosAccesoInput, Prisma.PersonaUncheckedCreateWithoutEventosAccesoInput>;
    where?: Prisma.PersonaWhereInput;
};
export type PersonaUpdateToOneWithWhereWithoutEventosAccesoInput = {
    where?: Prisma.PersonaWhereInput;
    data: Prisma.XOR<Prisma.PersonaUpdateWithoutEventosAccesoInput, Prisma.PersonaUncheckedUpdateWithoutEventosAccesoInput>;
};
export type PersonaUpdateWithoutEventosAccesoInput = {
    tipoDocumentoIdentidad?: Prisma.EnumTipoDocumentoIdentidadFieldUpdateOperationsInput | $Enums.TipoDocumentoIdentidad;
    numeroDocumento?: Prisma.StringFieldUpdateOperationsInput | string;
    nombres?: Prisma.StringFieldUpdateOperationsInput | string;
    apellidos?: Prisma.StringFieldUpdateOperationsInput | string;
    area?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoPersonaFieldUpdateOperationsInput | $Enums.EstadoPersona;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    empresa?: Prisma.EmpresaUpdateOneRequiredWithoutPersonasNestedInput;
    puesto?: Prisma.PuestoUpdateOneWithoutPersonasNestedInput;
    documentos?: Prisma.DocumentoPersonaUpdateManyWithoutPersonaNestedInput;
    solicitudesVisita?: Prisma.SolicitudVisitaUpdateManyWithoutPersonaNestedInput;
};
export type PersonaUncheckedUpdateWithoutEventosAccesoInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    empresaId?: Prisma.IntFieldUpdateOperationsInput | number;
    puestoId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    tipoDocumentoIdentidad?: Prisma.EnumTipoDocumentoIdentidadFieldUpdateOperationsInput | $Enums.TipoDocumentoIdentidad;
    numeroDocumento?: Prisma.StringFieldUpdateOperationsInput | string;
    nombres?: Prisma.StringFieldUpdateOperationsInput | string;
    apellidos?: Prisma.StringFieldUpdateOperationsInput | string;
    area?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoPersonaFieldUpdateOperationsInput | $Enums.EstadoPersona;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    documentos?: Prisma.DocumentoPersonaUncheckedUpdateManyWithoutPersonaNestedInput;
    solicitudesVisita?: Prisma.SolicitudVisitaUncheckedUpdateManyWithoutPersonaNestedInput;
};
export type PersonaCreateManyEmpresaInput = {
    id?: number;
    puestoId?: number | null;
    tipoDocumentoIdentidad: $Enums.TipoDocumentoIdentidad;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    area?: string | null;
    estado?: $Enums.EstadoPersona;
    creadoEn?: Date | string;
};
export type PersonaUpdateWithoutEmpresaInput = {
    tipoDocumentoIdentidad?: Prisma.EnumTipoDocumentoIdentidadFieldUpdateOperationsInput | $Enums.TipoDocumentoIdentidad;
    numeroDocumento?: Prisma.StringFieldUpdateOperationsInput | string;
    nombres?: Prisma.StringFieldUpdateOperationsInput | string;
    apellidos?: Prisma.StringFieldUpdateOperationsInput | string;
    area?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoPersonaFieldUpdateOperationsInput | $Enums.EstadoPersona;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    puesto?: Prisma.PuestoUpdateOneWithoutPersonasNestedInput;
    documentos?: Prisma.DocumentoPersonaUpdateManyWithoutPersonaNestedInput;
    solicitudesVisita?: Prisma.SolicitudVisitaUpdateManyWithoutPersonaNestedInput;
    eventosAcceso?: Prisma.EventoAccesoUpdateManyWithoutPersonaNestedInput;
};
export type PersonaUncheckedUpdateWithoutEmpresaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    puestoId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    tipoDocumentoIdentidad?: Prisma.EnumTipoDocumentoIdentidadFieldUpdateOperationsInput | $Enums.TipoDocumentoIdentidad;
    numeroDocumento?: Prisma.StringFieldUpdateOperationsInput | string;
    nombres?: Prisma.StringFieldUpdateOperationsInput | string;
    apellidos?: Prisma.StringFieldUpdateOperationsInput | string;
    area?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoPersonaFieldUpdateOperationsInput | $Enums.EstadoPersona;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    documentos?: Prisma.DocumentoPersonaUncheckedUpdateManyWithoutPersonaNestedInput;
    solicitudesVisita?: Prisma.SolicitudVisitaUncheckedUpdateManyWithoutPersonaNestedInput;
    eventosAcceso?: Prisma.EventoAccesoUncheckedUpdateManyWithoutPersonaNestedInput;
};
export type PersonaUncheckedUpdateManyWithoutEmpresaInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    puestoId?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    tipoDocumentoIdentidad?: Prisma.EnumTipoDocumentoIdentidadFieldUpdateOperationsInput | $Enums.TipoDocumentoIdentidad;
    numeroDocumento?: Prisma.StringFieldUpdateOperationsInput | string;
    nombres?: Prisma.StringFieldUpdateOperationsInput | string;
    apellidos?: Prisma.StringFieldUpdateOperationsInput | string;
    area?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoPersonaFieldUpdateOperationsInput | $Enums.EstadoPersona;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PersonaCreateManyPuestoInput = {
    id?: number;
    empresaId: number;
    tipoDocumentoIdentidad: $Enums.TipoDocumentoIdentidad;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    area?: string | null;
    estado?: $Enums.EstadoPersona;
    creadoEn?: Date | string;
};
export type PersonaUpdateWithoutPuestoInput = {
    tipoDocumentoIdentidad?: Prisma.EnumTipoDocumentoIdentidadFieldUpdateOperationsInput | $Enums.TipoDocumentoIdentidad;
    numeroDocumento?: Prisma.StringFieldUpdateOperationsInput | string;
    nombres?: Prisma.StringFieldUpdateOperationsInput | string;
    apellidos?: Prisma.StringFieldUpdateOperationsInput | string;
    area?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoPersonaFieldUpdateOperationsInput | $Enums.EstadoPersona;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    empresa?: Prisma.EmpresaUpdateOneRequiredWithoutPersonasNestedInput;
    documentos?: Prisma.DocumentoPersonaUpdateManyWithoutPersonaNestedInput;
    solicitudesVisita?: Prisma.SolicitudVisitaUpdateManyWithoutPersonaNestedInput;
    eventosAcceso?: Prisma.EventoAccesoUpdateManyWithoutPersonaNestedInput;
};
export type PersonaUncheckedUpdateWithoutPuestoInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    empresaId?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoDocumentoIdentidad?: Prisma.EnumTipoDocumentoIdentidadFieldUpdateOperationsInput | $Enums.TipoDocumentoIdentidad;
    numeroDocumento?: Prisma.StringFieldUpdateOperationsInput | string;
    nombres?: Prisma.StringFieldUpdateOperationsInput | string;
    apellidos?: Prisma.StringFieldUpdateOperationsInput | string;
    area?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoPersonaFieldUpdateOperationsInput | $Enums.EstadoPersona;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    documentos?: Prisma.DocumentoPersonaUncheckedUpdateManyWithoutPersonaNestedInput;
    solicitudesVisita?: Prisma.SolicitudVisitaUncheckedUpdateManyWithoutPersonaNestedInput;
    eventosAcceso?: Prisma.EventoAccesoUncheckedUpdateManyWithoutPersonaNestedInput;
};
export type PersonaUncheckedUpdateManyWithoutPuestoInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    empresaId?: Prisma.IntFieldUpdateOperationsInput | number;
    tipoDocumentoIdentidad?: Prisma.EnumTipoDocumentoIdentidadFieldUpdateOperationsInput | $Enums.TipoDocumentoIdentidad;
    numeroDocumento?: Prisma.StringFieldUpdateOperationsInput | string;
    nombres?: Prisma.StringFieldUpdateOperationsInput | string;
    apellidos?: Prisma.StringFieldUpdateOperationsInput | string;
    area?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    estado?: Prisma.EnumEstadoPersonaFieldUpdateOperationsInput | $Enums.EstadoPersona;
    creadoEn?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PersonaCountOutputType = {
    documentos: number;
    solicitudesVisita: number;
    eventosAcceso: number;
};
export type PersonaCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    documentos?: boolean | PersonaCountOutputTypeCountDocumentosArgs;
    solicitudesVisita?: boolean | PersonaCountOutputTypeCountSolicitudesVisitaArgs;
    eventosAcceso?: boolean | PersonaCountOutputTypeCountEventosAccesoArgs;
};
export type PersonaCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonaCountOutputTypeSelect<ExtArgs> | null;
};
export type PersonaCountOutputTypeCountDocumentosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DocumentoPersonaWhereInput;
};
export type PersonaCountOutputTypeCountSolicitudesVisitaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SolicitudVisitaWhereInput;
};
export type PersonaCountOutputTypeCountEventosAccesoArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EventoAccesoWhereInput;
};
export type PersonaSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    empresaId?: boolean;
    puestoId?: boolean;
    tipoDocumentoIdentidad?: boolean;
    numeroDocumento?: boolean;
    nombres?: boolean;
    apellidos?: boolean;
    area?: boolean;
    estado?: boolean;
    creadoEn?: boolean;
    empresa?: boolean | Prisma.EmpresaDefaultArgs<ExtArgs>;
    puesto?: boolean | Prisma.Persona$puestoArgs<ExtArgs>;
    documentos?: boolean | Prisma.Persona$documentosArgs<ExtArgs>;
    solicitudesVisita?: boolean | Prisma.Persona$solicitudesVisitaArgs<ExtArgs>;
    eventosAcceso?: boolean | Prisma.Persona$eventosAccesoArgs<ExtArgs>;
    _count?: boolean | Prisma.PersonaCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["persona"]>;
export type PersonaSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    empresaId?: boolean;
    puestoId?: boolean;
    tipoDocumentoIdentidad?: boolean;
    numeroDocumento?: boolean;
    nombres?: boolean;
    apellidos?: boolean;
    area?: boolean;
    estado?: boolean;
    creadoEn?: boolean;
    empresa?: boolean | Prisma.EmpresaDefaultArgs<ExtArgs>;
    puesto?: boolean | Prisma.Persona$puestoArgs<ExtArgs>;
}, ExtArgs["result"]["persona"]>;
export type PersonaSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    empresaId?: boolean;
    puestoId?: boolean;
    tipoDocumentoIdentidad?: boolean;
    numeroDocumento?: boolean;
    nombres?: boolean;
    apellidos?: boolean;
    area?: boolean;
    estado?: boolean;
    creadoEn?: boolean;
    empresa?: boolean | Prisma.EmpresaDefaultArgs<ExtArgs>;
    puesto?: boolean | Prisma.Persona$puestoArgs<ExtArgs>;
}, ExtArgs["result"]["persona"]>;
export type PersonaSelectScalar = {
    id?: boolean;
    empresaId?: boolean;
    puestoId?: boolean;
    tipoDocumentoIdentidad?: boolean;
    numeroDocumento?: boolean;
    nombres?: boolean;
    apellidos?: boolean;
    area?: boolean;
    estado?: boolean;
    creadoEn?: boolean;
};
export type PersonaOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "empresaId" | "puestoId" | "tipoDocumentoIdentidad" | "numeroDocumento" | "nombres" | "apellidos" | "area" | "estado" | "creadoEn", ExtArgs["result"]["persona"]>;
export type PersonaInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    empresa?: boolean | Prisma.EmpresaDefaultArgs<ExtArgs>;
    puesto?: boolean | Prisma.Persona$puestoArgs<ExtArgs>;
    documentos?: boolean | Prisma.Persona$documentosArgs<ExtArgs>;
    solicitudesVisita?: boolean | Prisma.Persona$solicitudesVisitaArgs<ExtArgs>;
    eventosAcceso?: boolean | Prisma.Persona$eventosAccesoArgs<ExtArgs>;
    _count?: boolean | Prisma.PersonaCountOutputTypeDefaultArgs<ExtArgs>;
};
export type PersonaIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    empresa?: boolean | Prisma.EmpresaDefaultArgs<ExtArgs>;
    puesto?: boolean | Prisma.Persona$puestoArgs<ExtArgs>;
};
export type PersonaIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    empresa?: boolean | Prisma.EmpresaDefaultArgs<ExtArgs>;
    puesto?: boolean | Prisma.Persona$puestoArgs<ExtArgs>;
};
export type $PersonaPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Persona";
    objects: {
        empresa: Prisma.$EmpresaPayload<ExtArgs>;
        puesto: Prisma.$PuestoPayload<ExtArgs> | null;
        documentos: Prisma.$DocumentoPersonaPayload<ExtArgs>[];
        solicitudesVisita: Prisma.$SolicitudVisitaPayload<ExtArgs>[];
        eventosAcceso: Prisma.$EventoAccesoPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        empresaId: number;
        puestoId: number | null;
        tipoDocumentoIdentidad: $Enums.TipoDocumentoIdentidad;
        numeroDocumento: string;
        nombres: string;
        apellidos: string;
        area: string | null;
        estado: $Enums.EstadoPersona;
        creadoEn: Date;
    }, ExtArgs["result"]["persona"]>;
    composites: {};
};
export type PersonaGetPayload<S extends boolean | null | undefined | PersonaDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PersonaPayload, S>;
export type PersonaCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PersonaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PersonaCountAggregateInputType | true;
};
export interface PersonaDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Persona'];
        meta: {
            name: 'Persona';
        };
    };
    findUnique<T extends PersonaFindUniqueArgs>(args: Prisma.SelectSubset<T, PersonaFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PersonaClient<runtime.Types.Result.GetResult<Prisma.$PersonaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends PersonaFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PersonaFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PersonaClient<runtime.Types.Result.GetResult<Prisma.$PersonaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends PersonaFindFirstArgs>(args?: Prisma.SelectSubset<T, PersonaFindFirstArgs<ExtArgs>>): Prisma.Prisma__PersonaClient<runtime.Types.Result.GetResult<Prisma.$PersonaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends PersonaFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PersonaFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PersonaClient<runtime.Types.Result.GetResult<Prisma.$PersonaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends PersonaFindManyArgs>(args?: Prisma.SelectSubset<T, PersonaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends PersonaCreateArgs>(args: Prisma.SelectSubset<T, PersonaCreateArgs<ExtArgs>>): Prisma.Prisma__PersonaClient<runtime.Types.Result.GetResult<Prisma.$PersonaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends PersonaCreateManyArgs>(args?: Prisma.SelectSubset<T, PersonaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends PersonaCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, PersonaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends PersonaDeleteArgs>(args: Prisma.SelectSubset<T, PersonaDeleteArgs<ExtArgs>>): Prisma.Prisma__PersonaClient<runtime.Types.Result.GetResult<Prisma.$PersonaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends PersonaUpdateArgs>(args: Prisma.SelectSubset<T, PersonaUpdateArgs<ExtArgs>>): Prisma.Prisma__PersonaClient<runtime.Types.Result.GetResult<Prisma.$PersonaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends PersonaDeleteManyArgs>(args?: Prisma.SelectSubset<T, PersonaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends PersonaUpdateManyArgs>(args: Prisma.SelectSubset<T, PersonaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends PersonaUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, PersonaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PersonaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends PersonaUpsertArgs>(args: Prisma.SelectSubset<T, PersonaUpsertArgs<ExtArgs>>): Prisma.Prisma__PersonaClient<runtime.Types.Result.GetResult<Prisma.$PersonaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends PersonaCountArgs>(args?: Prisma.Subset<T, PersonaCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PersonaCountAggregateOutputType> : number>;
    aggregate<T extends PersonaAggregateArgs>(args: Prisma.Subset<T, PersonaAggregateArgs>): Prisma.PrismaPromise<GetPersonaAggregateType<T>>;
    groupBy<T extends PersonaGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PersonaGroupByArgs['orderBy'];
    } : {
        orderBy?: PersonaGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PersonaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPersonaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: PersonaFieldRefs;
}
export interface Prisma__PersonaClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    empresa<T extends Prisma.EmpresaDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EmpresaDefaultArgs<ExtArgs>>): Prisma.Prisma__EmpresaClient<runtime.Types.Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    puesto<T extends Prisma.Persona$puestoArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Persona$puestoArgs<ExtArgs>>): Prisma.Prisma__PuestoClient<runtime.Types.Result.GetResult<Prisma.$PuestoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    documentos<T extends Prisma.Persona$documentosArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Persona$documentosArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DocumentoPersonaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    solicitudesVisita<T extends Prisma.Persona$solicitudesVisitaArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Persona$solicitudesVisitaArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SolicitudVisitaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    eventosAcceso<T extends Prisma.Persona$eventosAccesoArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Persona$eventosAccesoArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EventoAccesoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface PersonaFieldRefs {
    readonly id: Prisma.FieldRef<"Persona", 'Int'>;
    readonly empresaId: Prisma.FieldRef<"Persona", 'Int'>;
    readonly puestoId: Prisma.FieldRef<"Persona", 'Int'>;
    readonly tipoDocumentoIdentidad: Prisma.FieldRef<"Persona", 'TipoDocumentoIdentidad'>;
    readonly numeroDocumento: Prisma.FieldRef<"Persona", 'String'>;
    readonly nombres: Prisma.FieldRef<"Persona", 'String'>;
    readonly apellidos: Prisma.FieldRef<"Persona", 'String'>;
    readonly area: Prisma.FieldRef<"Persona", 'String'>;
    readonly estado: Prisma.FieldRef<"Persona", 'EstadoPersona'>;
    readonly creadoEn: Prisma.FieldRef<"Persona", 'DateTime'>;
}
export type PersonaFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonaSelect<ExtArgs> | null;
    omit?: Prisma.PersonaOmit<ExtArgs> | null;
    include?: Prisma.PersonaInclude<ExtArgs> | null;
    where: Prisma.PersonaWhereUniqueInput;
};
export type PersonaFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonaSelect<ExtArgs> | null;
    omit?: Prisma.PersonaOmit<ExtArgs> | null;
    include?: Prisma.PersonaInclude<ExtArgs> | null;
    where: Prisma.PersonaWhereUniqueInput;
};
export type PersonaFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type PersonaFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type PersonaFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type PersonaCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonaSelect<ExtArgs> | null;
    omit?: Prisma.PersonaOmit<ExtArgs> | null;
    include?: Prisma.PersonaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PersonaCreateInput, Prisma.PersonaUncheckedCreateInput>;
};
export type PersonaCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.PersonaCreateManyInput | Prisma.PersonaCreateManyInput[];
    skipDuplicates?: boolean;
};
export type PersonaCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonaSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PersonaOmit<ExtArgs> | null;
    data: Prisma.PersonaCreateManyInput | Prisma.PersonaCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.PersonaIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type PersonaUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonaSelect<ExtArgs> | null;
    omit?: Prisma.PersonaOmit<ExtArgs> | null;
    include?: Prisma.PersonaInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PersonaUpdateInput, Prisma.PersonaUncheckedUpdateInput>;
    where: Prisma.PersonaWhereUniqueInput;
};
export type PersonaUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.PersonaUpdateManyMutationInput, Prisma.PersonaUncheckedUpdateManyInput>;
    where?: Prisma.PersonaWhereInput;
    limit?: number;
};
export type PersonaUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonaSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.PersonaOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.PersonaUpdateManyMutationInput, Prisma.PersonaUncheckedUpdateManyInput>;
    where?: Prisma.PersonaWhereInput;
    limit?: number;
    include?: Prisma.PersonaIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type PersonaUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonaSelect<ExtArgs> | null;
    omit?: Prisma.PersonaOmit<ExtArgs> | null;
    include?: Prisma.PersonaInclude<ExtArgs> | null;
    where: Prisma.PersonaWhereUniqueInput;
    create: Prisma.XOR<Prisma.PersonaCreateInput, Prisma.PersonaUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.PersonaUpdateInput, Prisma.PersonaUncheckedUpdateInput>;
};
export type PersonaDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonaSelect<ExtArgs> | null;
    omit?: Prisma.PersonaOmit<ExtArgs> | null;
    include?: Prisma.PersonaInclude<ExtArgs> | null;
    where: Prisma.PersonaWhereUniqueInput;
};
export type PersonaDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PersonaWhereInput;
    limit?: number;
};
export type Persona$puestoArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PuestoSelect<ExtArgs> | null;
    omit?: Prisma.PuestoOmit<ExtArgs> | null;
    include?: Prisma.PuestoInclude<ExtArgs> | null;
    where?: Prisma.PuestoWhereInput;
};
export type Persona$documentosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Persona$solicitudesVisitaArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Persona$eventosAccesoArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type PersonaDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PersonaSelect<ExtArgs> | null;
    omit?: Prisma.PersonaOmit<ExtArgs> | null;
    include?: Prisma.PersonaInclude<ExtArgs> | null;
};
