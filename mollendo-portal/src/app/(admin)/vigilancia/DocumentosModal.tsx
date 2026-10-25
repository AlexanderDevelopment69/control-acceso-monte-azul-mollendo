"use client";

import React, { useEffect, useState } from "react";
import { personasApi } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api/client";
import type { Persona } from "@/lib/api/types";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { VerDocumento } from "@/components/personal/VerDocumento";
import { formatearFecha } from "@/components/personal/cumplimiento";

/** Modal de solo lectura: documentos actuales de la persona y cuáles debe regularizar. */
export function DocumentosModal({ personaId, onClose }: { personaId: number | null; onClose: () => void }) {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [error, setError] = useState<string | null>(null);
  // El vigilante solo ve si está vigente o vencido; abrir el archivo es del administrador y soporte.
  const puedeVerArchivo = useAuth().user?.rol !== "vigilancia";

  useEffect(() => {
    if (personaId === null) return;
    let activo = true;
    personasApi
      .get(personaId)
      .then((p) => activo && setPersona(p))
      .catch((err) => activo && setError(err instanceof ApiError ? err.message : "No se pudieron cargar los documentos"));
    return () => {
      activo = false;
      setPersona(null);
      setError(null);
    };
  }, [personaId]);

  const actuales = persona?.documentosActuales ?? [];

  return (
    <Modal isOpen={personaId !== null} onClose={onClose} className="max-w-lg p-6 sm:p-8">
      <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">Documentos</h2>
      {error ? (
        <ErrorBanner>{error}</ErrorBanner>
      ) : !persona ? (
        <p className="text-sm text-gray-400">Cargando…</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            {persona.nombres} {persona.apellidos} · DNI {persona.numeroDocumento}
            {persona.empresa && ` · ${persona.empresa.razonSocial}`}
          </p>
          {actuales.length === 0 ? (
            <ErrorBanner>No tiene ningún documento cargado.</ErrorBanner>
          ) : (
            <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
              {actuales.map((d) => (
                <li key={d.tipoDocumentoId} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span>
                    <span className="font-medium text-gray-800 dark:text-white/90">{d.nombre}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {d.fechaVencimiento
                        ? `${d.vigente ? "Vence" : "Venció"} el ${formatearFecha(d.fechaVencimiento)}`
                        : "No vence"}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    {puedeVerArchivo && <VerDocumento personaId={persona.id} documentoId={d.id} variante="enlace" />}
                    {d.vigente ? <Badge color="success">Vigente</Badge> : <Badge color="error">Vencido</Badge>}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-gray-400">
            Estado de hoy. Para regularizar, debe entregar el documento actualizado al administrador.
          </p>
        </>
      )}
    </Modal>
  );
}
