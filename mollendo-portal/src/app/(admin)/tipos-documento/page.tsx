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

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">Tipos de documento</h1>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">Agregar tipo de documento</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          {error && (
            <div className="w-full rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-500">
              {error}
            </div>
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
            {tipos.map((tipo) => (
              <TableRow key={tipo.id}>
                <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{tipo.nombre}</TableCell>
                <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {VALIDACION_LABEL[tipo.tipoValidacion] ?? tipo.tipoValidacion}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
