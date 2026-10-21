"use client";

import React, { useEffect, useRef, useState } from "react";
import type { TarjetaContingencia } from "@/lib/api/types";
import { tarjetasContingenciaApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { htmlTarjeta, logoIncluido, LOGO_TARJETA } from "./imprimir";

/**
 * Imprimir una tarjeta sin salir del portal: la vista previa (tal como sale
 * impresa, con el QR real) y el botón que abre la ventana de impresión del
 * navegador solo con la tarjeta.
 */
export function ImprimirTarjeta({ tarjeta, onCerrar }: { tarjeta: TarjetaContingencia | null; onCerrar: () => void }) {
  const [vista, setVista] = useState<{ id: number; html: string } | null>(null);
  const [error, setError] = useState<{ id: number; texto: string } | null>(null);
  const marco = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!tarjeta) return;
    let activo = true;
    // Si el logo no se puede incluir, va por su dirección (igual se ve en la vista previa).
    Promise.all([tarjetasContingenciaApi.qr(tarjeta.id), logoIncluido().catch(() => LOGO_TARJETA)])
      .then(([qr, logo]) => activo && setVista({ id: tarjeta.id, html: htmlTarjeta(tarjeta, qr, logo) }))
      .catch(
        (err) =>
          activo && setError({ id: tarjeta.id, texto: err instanceof ApiError ? err.message : "No se pudo preparar la tarjeta para imprimir" }),
      );
    return () => {
      activo = false;
    };
  }, [tarjeta]);

  // Solo lo de la tarjeta abierta (al abrir otra, no se ve la anterior).
  const html = vista && vista.id === tarjeta?.id ? vista.html : null;
  const textoError = error && error.id === tarjeta?.id ? error.texto : null;

  return (
    <Modal isOpen={!!tarjeta} onClose={onCerrar} className="max-w-lg p-6 sm:p-8">
      {tarjeta && (
        <>
          <h2 className="mb-2 pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">Imprimir {tarjeta.nombre.toLowerCase()}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Sale en tamaño real de carné. En la ventana de impresión elija su impresora y la escala al 100 %; después recórtela por la
            línea punteada y plastifíquela.
          </p>
          <div className="mt-4 flex h-64 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700">
            {html ? (
              <iframe ref={marco} title={`Vista previa de la ${tarjeta.nombre.toLowerCase()}`} srcDoc={html} className="size-full" />
            ) : (
              !textoError && <p className="text-sm text-gray-400">Preparando…</p>
            )}
          </div>
          {textoError && <ErrorBanner className="mt-4">{textoError}</ErrorBanner>}
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" size="sm" variant="outline" onClick={onCerrar}>
              Cerrar
            </Button>
            <Button type="button" size="sm" disabled={!html} onClick={() => marco.current?.contentWindow?.print()}>
              Imprimir
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
