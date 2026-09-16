"use client";

import React, { useEffect, useState } from "react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { tiposDocumentoApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { TipoDocumento } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { PageHeader } from "@/components/common/PageHeader";
import { TableFooter } from "@/components/tables/TableFooter";
import { TableSearch } from "@/components/tables/TableSearch";
import { usePagination } from "@/lib/usePagination";

const VALIDACION_LABEL: Record<string, string> = {
  fecha_vencimiento: "Fecha de vencimiento",
  si_no: "Sí / No",
  vigente_por_actividad: "Vigente por actividad",
};

function TiposDocumentoContent() {
  const [tipos, setTipos] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [tipoValidacion, setTipoValidacion] = useState("fecha_vencimiento");
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  async function cargar() {
    setLoading(true);
    try {
      setTipos(await tiposDocumentoApi.list());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreando(true);
    try {
      await tiposDocumentoApi.create({ nombre, tipoValidacion });
      setNombre("");
      cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear el tipo de documento");
    } finally {
      setCreando(false);
    }
  }

  const [busqueda, setBusqueda] = useState("");
  const filtrados = tipos.filter((t) => !busqueda.trim() || t.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()));
  const { page, setPage, totalPages, paginated, total, from, to } = usePagination(filtrados, 10);

  return (
    <div>
      <PageHeader
        title="Tipos de documento"
        description="Catálogo de documentos que las empresas deben presentar para su personal."
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">Agregar tipo de documento</h2>
        <form onSubmit={handleSubmit} className="flex flex-col flex-wrap gap-4 sm:flex-row sm:items-end">
          {error && (
            <ErrorBanner className="w-full">{error}</ErrorBanner>
          )}
          <div className="flex-1">
            <Label>Nombre</Label>
            <Input defaultValue={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: SCTR" />
          </div>
          <div className="flex-1">
            <Label>Tipo de validación</Label>
            <Select
              defaultValue={tipoValidacion}
              onChange={setTipoValidacion}
              options={[
                { value: "fecha_vencimiento", label: "Fecha de vencimiento" },
                { value: "si_no", label: "Sí / No" },
                { value: "vigente_por_actividad", label: "Vigente por actividad" },
              ]}
            />
          </div>
          <Button disabled={creando}>{creando ? "Agregando…" : "Agregar"}</Button>
        </form>
      </div>

      <div className="mb-4">
        <TableSearch value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre…" />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Nombre</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Tipo de validación</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading && (
              <TableRow>
                <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={2}>Cargando…</TableCell>
              </TableRow>
            )}
            {!loading && tipos.length === 0 && (
              <TableRow>
                <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={2}>No hay tipos de documento registrados.</TableCell>
              </TableRow>
            )}
            {!loading && tipos.length > 0 && filtrados.length === 0 && (
              <TableRow>
                <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={2}>Sin resultados para esa búsqueda.</TableCell>
              </TableRow>
            )}
            {paginated.map((tipo) => (
              <TableRow key={tipo.id}>
                <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{tipo.nombre}</TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {VALIDACION_LABEL[tipo.tipoValidacion] ?? tipo.tipoValidacion}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!loading && <TableFooter from={from} to={to} total={total} page={page} totalPages={totalPages} onPageChange={setPage} />}
      </div>
    </div>
  );
}

export default function TiposDocumentoPage() {
  return (
    <RequireRole roles={["administracion"]}>
      <TiposDocumentoContent />
    </RequireRole>
  );
}
