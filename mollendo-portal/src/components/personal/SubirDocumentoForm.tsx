"use client";

import React, { useState } from "react";
import { documentosApi, tiposDocumentoApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import DatePicker from "@/components/form/date-picker";
import FileInput from "@/components/form/input/FileInput";
import { ErrorBanner } from "@/components/common/ErrorBanner";

/**
 * Subir (o renovar) un documento de una persona: nombre del documento, fecha
 * de vencimiento (vacía = no vence) y archivo. Si ya existe un documento con
 * ese nombre (sin distinguir mayúsculas), se reutiliza y la subida cuenta
 * como versión nueva. El padre lo vuelve a montar (key) después de cada
 * subida para dejarlo limpio.
 */
export function SubirDocumentoForm({
  personaId,
  nombreInicial = "",
  onSubido,
}: {
  personaId: number;
  /** Lo completa "Renovar" con el nombre del documento a renovar. */
  nombreInicial?: string;
  onSubido: () => void;
}) {
  const [nombre, setNombre] = useState(nombreInicial);
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nombre.trim()) {
      setError("Escribe el nombre del documento");
      return;
    }
    if (!archivo) {
      setError("Adjunta el archivo del documento");
      return;
    }
    setLoading(true);
    try {
      const tipo = await tiposDocumentoApi.create({ nombre: nombre.trim() });
      const formData = new FormData();
      formData.append("tipoDocumentoId", String(tipo.id));
      if (fechaVencimiento) formData.append("fechaVencimiento", fechaVencimiento);
      formData.append("archivo", archivo);
      await documentosApi.subir(personaId, formData);
      onSubido();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo subir el documento");
    } finally {
      setLoading(false);
    }
  }

  return (
    // Dos columnas en cualquier ancho (la ficha comparte la pantalla con la
    // lista): nombre + vencimiento arriba, archivo + botón abajo.
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start">
      {error && <ErrorBanner className="sm:col-span-2">{error}</ErrorBanner>}
      <div>
        <Label>Nombre del documento</Label>
        <Input placeholder="p. ej. SCTR" defaultValue={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div>
        <Label>Vence el</Label>
        <DatePicker
          id={`fecha-vencimiento-documento-${personaId}`}
          placeholder="DD-MM-AAAA"
          value={fechaVencimiento}
          onChange={setFechaVencimiento}
        />
        <p className="mt-1 text-xs text-gray-400">Déjalo vacío si el documento no vence.</p>
      </div>
      <div>
        <Label>Archivo</Label>
        <FileInput onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
      </div>
      <div className="sm:pt-[26px]">
        <Button disabled={loading} className="w-full">
          {loading ? "Subiendo…" : "Subir documento"}
        </Button>
      </div>
    </form>
  );
}
