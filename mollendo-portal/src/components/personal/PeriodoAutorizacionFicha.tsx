"use client";

import React, { useState } from "react";
import { personasApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { Persona } from "@/lib/api/types";
import Button from "@/components/ui/button/Button";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import Tarjeta from "@/components/ui/tarjeta/Tarjeta";
import { PERIODO_INCOMPLETO, PERIODO_VACIO, cambioPeriodo, periodoDePersona, problemaPeriodo, type Periodo } from "@/lib/periodo";
import { PeriodoAutorizacionCampos } from "./PeriodoAutorizacionCampos";

/** id del recuadro, para llegar a él desde el aviso "Fuera del período autorizado". */
export const idRecuadroPeriodo = (personaId: number) => `periodo-autorizacion-${personaId}`;

/**
 * Período de autorización en la ficha (fuera de "Editar datos"): los campos
 * siempre a la vista, "Guardar período" (solo con cambios) y "Quitar período".
 * Mismo estilo que el recuadro "Documentos". Queda en la Auditoría (la API).
 */
export function PeriodoAutorizacionFicha({ persona, onGuardado }: { persona: Persona; onGuardado: () => void }) {
  const [periodo, setPeriodo] = useState<Periodo>(periodoDePersona(persona));
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<null | "guardar" | "quitar">(null);
  /** Se presionó "Guardar período" sin cambiar nada: aviso suave, como en "Editar datos". */
  const [sinCambios, setSinCambios] = useState(false);
  const tienePeriodo = !!persona.autorizadoDesde;

  async function enviar(p: Periodo, accion: "guardar" | "quitar") {
    // El botón siempre está habilitado: si no hay nada que guardar, se explica con un mensaje.
    // Sin período y todo vacío: no hay nada que guardar, falta completarlo.
    const vacio = !p.desde && !p.hasta && !p.motivo.trim();
    const problema = !tienePeriodo && vacio ? PERIODO_INCOMPLETO : problemaPeriodo(p);
    if (problema) return setError(problema);
    const datos = cambioPeriodo(persona, p);
    if (!datos) return setSinCambios(true);
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
    <Tarjeta as="section" id={idRecuadroPeriodo(persona.id)} className="p-5">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Período de autorización</h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Opcional. Fuera de estas fechas no podrá ingresar.</p>
      {error && <ErrorBanner className="mt-4">{error}</ErrorBanner>}
      {sinCambios && !error && (
        <ErrorBanner tono="aviso" className="mt-4">
          No cambió ningún dato.
        </ErrorBanner>
      )}
      <PeriodoAutorizacionCampos
        id={`ficha-periodo-${persona.id}`}
        periodo={periodo}
        onChange={(p) => {
          setPeriodo(p);
          setError(null);
          setSinCambios(false);
        }}
        conTitulo={false}
        className="mt-4"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <Button size="sm" disabled={guardando !== null} onClick={() => void enviar(periodo, "guardar")}>
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
