"use client";

import React, { useEffect, useState } from "react";
import { eventosAccesoApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { EstadoModoIngreso } from "@/lib/api/types";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Badge from "@/components/ui/badge/Badge";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import Tarjeta from "@/components/ui/tarjeta/Tarjeta";
import { ComprobandoBadge } from "./Insignias";

/**
 * Orden del ingreso (pedido de TMAM): normal, primero el DNI; "facial
 * primero", todo el personal activo con permiso fijo en el G4 Pro, rostro y
 * alcohol y al final el DNI. Activarlo pide confirmación; volver al normal, no.
 */
export function OrdenIngreso() {
  const [estado, setEstado] = useState<EstadoModoIngreso | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const facialPrimero = !!estado?.facialPrimero;

  useEffect(() => {
    eventosAccesoApi
      .modoIngreso()
      .then(setEstado)
      .catch(() => setError("No se pudo consultar el orden del ingreso"));
  }, []);

  async function cambiar(valor: boolean) {
    setConfirmar(false);
    setGuardando(true);
    setError(null);
    try {
      setEstado(await eventosAccesoApi.cambiarModoIngreso(valor));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar el orden del ingreso");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Tarjeta className="mb-6 p-5">
      <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Orden del ingreso</h2>
      <p className="mt-1 text-xs text-gray-400">
        Normal: primero el DNI, después rostro y alcohol. Facial primero: rostro y alcohol, y al final el DNI.
      </p>
      <div className="mt-3 flex min-h-8 flex-wrap items-center gap-3">
        {!estado && !error ? (
          <ComprobandoBadge />
        ) : (
          estado && (
            <>
              <button
                type="button"
                role="switch"
                aria-checked={facialPrimero}
                aria-label="Facial primero"
                disabled={guardando}
                onClick={() => (facialPrimero ? void cambiar(false) : setConfirmar(true))}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-60 ${
                  facialPrimero ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`inline-block size-5 rounded-full bg-white shadow-theme-xs transition-transform duration-200 ${
                    facialPrimero ? "translate-x-[22px]" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">Facial primero</span>
              {facialPrimero ? (
                <>
                  <Badge color="warning">Activo</Badge>
                  {estado.desde && (
                    <span className="text-xs text-gray-400">
                      desde {new Date(estado.desde).toLocaleString("es-PE")}
                      {estado.cambiadoPor && ` · ${estado.cambiadoPor}`}
                    </span>
                  )}
                </>
              ) : null}
            </>
          )
        )}
      </div>

      {error && <ErrorBanner className="mt-3">{error}</ErrorBanner>}

      <Modal isOpen={confirmar} onClose={() => setConfirmar(false)} className="max-w-lg p-6 sm:p-8">
        <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">Activar “Facial primero”</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">Desde ahora, el ingreso será así:</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-300">
          <li>La persona se pone frente al equipo facial: la reconoce y le pide soplar.</li>
          <li>Sopla. Si pasa la prueba, tiene <strong>20 segundos</strong> para pasar su DNI.</li>
          <li>Pasa su DNI: se abre el molinete si sus documentos están en regla.</li>
        </ol>
        <ErrorBanner tono="aviso" className="mt-3">
          <strong>Importante:</strong> el equipo facial no dice quién sopló, así que el sistema no puede confirmar que el DNI
          sea de esa persona. El vigilante debe comparar la foto que aparece en el panel con quien pasa el molinete.
        </ErrorBanner>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          Se da permiso fijo en el equipo facial a todo el personal activo. Avise al personal y a los vigilantes antes de
          activarlo. Se puede volver al orden normal en cualquier momento.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setConfirmar(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => void cambiar(true)}>
            Activar
          </Button>
        </div>
      </Modal>
    </Tarjeta>
  );
}
