"use client";

import React, { useState } from "react";
import { controladorApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { ErrorBanner } from "@/components/common/ErrorBanner";

/**
 * Botón "Reiniciar" del recuadro del Controlador (PC) (administrador y soporte):
 * pide confirmación con el motivo (queda en la Auditoría) y manda la orden.
 * Mientras el equipo vuelve (`reiniciando`), el botón queda en "Reiniciando…".
 */
export function ReiniciarControlador({ reiniciando, onEnviado }: { reiniciando: boolean; onEnviado: () => void }) {
  const [abierto, setAbierto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cerrar() {
    setAbierto(false);
    setMotivo("");
    setError(null);
  }

  async function reiniciar() {
    if (!motivo.trim()) {
      setError("Escriba el motivo del reinicio");
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await controladorApi.reiniciar(motivo.trim());
      cerrar();
      onEnviado();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo enviar la orden de reinicio");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={reiniciando}
        onClick={() => setAbierto(true)}
        startIcon={<span aria-hidden="true">↻</span>}
      >
        {reiniciando ? "Reiniciando…" : "Reiniciar"}
      </Button>

      <Modal isOpen={abierto} onClose={cerrar} bloqueado={enviando} className="max-w-md p-6 sm:p-8">
        <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">Reiniciar el Controlador (PC)</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          El equipo se apagará y volverá a encender. Tarda unos 2 minutos. Mientras tanto, los lectores de DNI y los molinetes no
          funcionan y se activa la contingencia.
        </p>
        {error && <ErrorBanner className="mt-4">{error}</ErrorBanner>}
        <label htmlFor="motivo-reinicio" className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Motivo *
        </label>
        <textarea
          id="motivo-reinicio"
          rows={3}
          maxLength={150}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Por ejemplo: el lector de salida no responde"
          className="mt-1.5 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
        />
        <p className="mt-1 text-right text-xs text-gray-400">{motivo.length}/150</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" disabled={enviando} onClick={cerrar}>
            Cancelar
          </Button>
          <Button type="button" variant="danger" disabled={enviando} onClick={() => void reiniciar()}>
            {enviando ? "Reiniciando…" : "Reiniciar"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
