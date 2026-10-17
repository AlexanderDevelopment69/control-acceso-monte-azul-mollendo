"use client";

import React, { useState } from "react";
import { eventosAccesoApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { EventoAcceso } from "@/lib/api/types";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { ErrorBanner } from "@/components/common/ErrorBanner";

/**
 * Corrección manual del antipassback, desde un movimiento denegado:
 * - "Ya figura dentro" (quiso ingresar sin haber registrado su salida): se
 *   registra su salida.
 * - "No registra ingreso" (quiso salir sin ingreso registrado): se registra su
 *   ingreso.
 * No abre el molinete: después la persona vuelve a pasar su DNI.
 */
export function CorreccionAntipassback({
  evento,
  onCerrar,
  onCorregido,
}: {
  evento: EventoAcceso | null;
  onCerrar: () => void;
  onCorregido: () => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Lo que se registra es lo contrario de lo que se denegó.
  const registrar = evento?.denegadoYaDentro ? "salida" : "ingreso";
  const persona = evento?.persona ? `${evento.persona.nombres} ${evento.persona.apellidos}` : "";

  function cerrar() {
    setMotivo("");
    setError(null);
    onCerrar();
  }

  async function guardar() {
    if (!evento?.personaId) return;
    setGuardando(true);
    setError(null);
    try {
      await eventosAccesoApi.corregir(evento.personaId, registrar, motivo.trim());
      setMotivo("");
      onCorregido();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo registrar la corrección");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal isOpen={!!evento} onClose={cerrar} bloqueado={guardando} className="max-w-md p-6 sm:p-8">
      <h2 className="mb-2 pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">
        {registrar === "salida" ? "Registrar salida manual" : "Registrar ingreso manual"}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {registrar === "salida" ? (
          <>
            <strong>{persona}</strong> figura dentro: no registró su salida. Regístrala solo si de verdad salió (por ejemplo,
            en una emergencia con los brazos del molinete liberados).
          </>
        ) : (
          <>
            <strong>{persona}</strong> no registra ingreso. Regístralo solo si de verdad está dentro (por ejemplo, entró sin
            marcar).
          </>
        )}
      </p>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        No abre el molinete: después, la persona vuelve a pasar su DNI.
      </p>
      <label htmlFor="motivo-correccion" className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Motivo *
      </label>
      <textarea
        id="motivo-correccion"
        rows={3}
        maxLength={300}
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
      />
      {error && <ErrorBanner className="mt-3">{error}</ErrorBanner>}
      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="outline" disabled={guardando} onClick={cerrar}>
          Cancelar
        </Button>
        <Button type="button" disabled={guardando || motivo.trim().length < 3} onClick={() => void guardar()}>
          {guardando ? "Registrando…" : registrar === "salida" ? "Registrar salida" : "Registrar ingreso"}
        </Button>
      </div>
    </Modal>
  );
}
