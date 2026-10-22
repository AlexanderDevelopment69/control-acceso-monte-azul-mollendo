"use client";

import React, { useState } from "react";
import { personasApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { Persona } from "@/lib/api/types";
import Button from "@/components/ui/button/Button";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import Tarjeta from "@/components/ui/tarjeta/Tarjeta";
import { PERIODO_VACIO, cambioPeriodo, periodoDePersona, problemaPeriodo, type Periodo } from "@/lib/periodo";
import { PeriodoAutorizacionCampos } from "./PeriodoAutorizacionCampos";

/**
 * Período de autorización en la ficha (fuera de "Editar datos"): los campos
 * siempre a la vista, "Guardar período" (solo con cambios) y "Quitar período".
 * Mismo estilo que el recuadro "Documentos". Queda en la Auditoría (la API).
 */
export function PeriodoAutorizacionFicha({ persona, onGuardado }: { persona: Persona; onGuardado: () => void }) {
  const [periodo, setPeriodo] = useState<Periodo>(periodoDePersona(persona));
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<null | "guardar" | "quitar">(null);
  const tienePeriodo = !!persona.autorizadoDesde;
  const hayCambios = cambioPeriodo(persona, periodo) !== null;

  async function enviar(p: Periodo, accion: "guardar" | "quitar") {
    const problema = problemaPeriodo(p);
    if (problema) return setError(problema);
    const datos = cambioPeriodo(persona, p);
    if (!datos) return;
    setError(null);
    setGuardando(accion);
    try {
      await personasApi.update(persona.id, datos);
      onGuardado();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar el período");
    } finally {
      setGuardando(null);
    }
  }

  return (
    <Tarjeta as="section" className="p-5">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Período de autorización</h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Opcional. Fuera de estas fechas no podrá ingresar.</p>
      {error && <ErrorBanner className="mt-4">{error}</ErrorBanner>}
      <PeriodoAutorizacionCampos
        id={`ficha-periodo-${persona.id}`}
        periodo={periodo}
        onChange={(p) => {
          setPeriodo(p);
          setError(null);
        }}
        conTitulo={false}
        className="mt-4"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <Button size="sm" disabled={!hayCambios || guardando !== null} onClick={() => void enviar(periodo, "guardar")}>
          {guardando === "guardar" ? "Guardando…" : "Guardar período"}
        </Button>
        {tienePeriodo && (
          <Button
            size="sm"
            variant="outline"
            disabled={guardando !== null}
            onClick={() => {
              setPeriodo(PERIODO_VACIO);
              void enviar(PERIODO_VACIO, "quitar");
            }}
          >
            {guardando === "quitar" ? "Quitando…" : "Quitar período"}
          </Button>
        )}
      </div>
    </Tarjeta>
  );
}
