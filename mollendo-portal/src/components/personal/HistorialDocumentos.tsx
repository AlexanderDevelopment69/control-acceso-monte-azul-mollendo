"use client";

import React, { useState } from "react";
import type { DocumentoPersona } from "@/lib/api/types";
import Badge from "@/components/ui/badge/Badge";
import Tarjeta from "@/components/ui/tarjeta/Tarjeta";
import { ChevronDownIcon } from "@/icons";
import { VerDocumento } from "./VerDocumento";
import { formatearFecha } from "./cumplimiento";

/** Todas las versiones de los documentos (las reemplazadas también), en un bloque que se despliega. */
export function HistorialDocumentos({
  personaId,
  historial,
  idsActuales,
  soloLectura = false,
}: {
  personaId: number;
  historial: DocumentoPersona[];
  /** Ids de la última versión de cada documento: el resto se marca "Reemplazado". */
  idsActuales: Set<number>;
  /** El vigilante: sin Ver (no abre los archivos). */
  soloLectura?: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  return (
    <Tarjeta as="section">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex w-full items-center justify-between gap-3 p-5 text-left text-sm font-medium text-gray-700 focus:outline-none dark:text-gray-300"
      >
        Historial de documentos ({historial.length})
        <ChevronDownIcon
          className={`size-4 shrink-0 text-gray-400 transition-transform duration-300 ease-in-out ${abierto ? "rotate-180" : ""}`}
        />
      </button>
      {/* Igual que las filas de "APIs de integración" (Sistema y APIs): se abre el alto
          (filas de grilla 0fr ↔ 1fr) y el contenido aparece 100 ms después con un fundido. */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${abierto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        {/* Cerrado: sus enlaces no se alcanzan con Tab. */}
        <div className="overflow-hidden" inert={!abierto}>
          <ul
            className={`divide-y divide-gray-100 px-5 pb-4 transition-opacity duration-300 ease-in-out dark:divide-gray-800 ${
              abierto ? "opacity-100 delay-100" : "opacity-0"
            }`}
          >
            {historial.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                <span>
                  {d.tipoDocumento?.nombre} v{d.version}
                  <span className="text-gray-400">
                    {" "}
                    · cargado {new Date(d.creadoEn).toLocaleDateString("es-PE")}
                    {d.fechaVencimiento && ` · vence ${formatearFecha(d.fechaVencimiento)}`}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  {!idsActuales.has(d.id) && <Badge color="light">Reemplazado</Badge>}
                  {!soloLectura && <VerDocumento personaId={personaId} documentoId={d.id} variante="enlace" />}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Tarjeta>
  );
}
