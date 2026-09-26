"use client";

import React, { useState } from "react";
import { documentosApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { TipoDocumento } from "@/lib/api/types";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import FileInput from "@/components/form/input/FileInput";
import { ErrorBanner } from "@/components/common/ErrorBanner";

export function SubirDocumentoForm({
  personaId,
  tiposDocumento,
  tipoDocumentoIdInicial,
  onSubido,
}: {
  personaId: number;
  tiposDocumento: TipoDocumento[];
  tipoDocumentoIdInicial?: number;
  onSubido: () => void;
}) {
  const [tipoDocumentoId, setTipoDocumentoId] = useState(tipoDocumentoIdInicial ? String(tipoDocumentoIdInicial) : "");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!archivo || !tipoDocumentoId) {
      setError("Seleccione el tipo de documento y el archivo");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("tipoDocumentoId", tipoDocumentoId);
      if (fechaVencimiento) formData.append("fechaVencimiento", fechaVencimiento);
      formData.append("archivo", archivo);
      await documentosApi.subir(personaId, formData);
      onSubido();
      setTipoDocumentoId("");
      setFechaVencimiento("");
      setArchivo(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo subir el documento");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-wrap gap-4 sm:flex-row sm:items-end">
      {error && (
        <ErrorBanner className="w-full">{error}</ErrorBanner>
      )}
      <div className="flex-1">
        <Label>Tipo de documento</Label>
        <Select
          defaultValue={tipoDocumentoId}
          onChange={setTipoDocumentoId}
          placeholder="Selecciona un tipo de documento"
          options={tiposDocumento.map((t) => ({ value: String(t.id), label: t.nombre }))}
        />
      </div>
      <div className="flex-1">
        <Label>Fecha de vencimiento (si aplica)</Label>
        <DatePicker
          id="fecha-vencimiento-documento"
          placeholder="DD-MM-AAAA"
          value={fechaVencimiento}
          onChange={setFechaVencimiento}
        />
      </div>
      <div className="flex-1">
        <Label>Archivo</Label>
        <FileInput onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
      </div>
      <Button disabled={loading} className="min-w-[152px] shrink-0">{loading ? "Subiendo…" : "Subir documento"}</Button>
    </form>
  );
}
