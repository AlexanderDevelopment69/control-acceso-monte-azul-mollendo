"use client";

import React, { useState } from "react";
import { personasApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { Persona, Puesto } from "@/lib/api/types";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { ErrorBanner } from "@/components/common/ErrorBanner";

export function CambiarPuesto({ persona, puestos, onGuardado }: { persona: Persona; puestos: Puesto[]; onGuardado: () => void }) {
  const [puestoId, setPuestoId] = useState(persona.puestoId ? String(persona.puestoId) : "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function guardar() {
    if (!puestoId) return;
    setLoading(true);
    setError(null);
    try {
      await personasApi.update(persona.id, { puestoId: Number(puestoId) });
      onGuardado();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar el puesto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      {error && <ErrorBanner className="w-full">{error}</ErrorBanner>}
      <div className="flex-1">
        <Label>Puesto</Label>
        <Select
          defaultValue={puestoId}
          onChange={setPuestoId}
          placeholder="Selecciona un puesto"
          options={puestos.map((p) => ({ value: String(p.id), label: p.nombre }))}
        />
      </div>
      <Button
        variant="outline"
        disabled={loading || !puestoId || Number(puestoId) === persona.puestoId}
        onClick={guardar}
        className="min-w-[152px] shrink-0"
      >
        {loading ? "Guardando…" : "Cambiar puesto"}
      </Button>
    </div>
  );
}
