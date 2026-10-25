"use client";

import React, { useEffect, useRef, useState } from "react";
import type { PersonaDentro, SalidaSinDni } from "@/lib/api/types";
import { eventosAccesoApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { TableSearch } from "@/components/tables/TableSearch";
import { FotoGuardada } from "@/components/personal/FotoPersonal";
import { useDiferido } from "@/lib/useDiferido";
import { AvisoPanel } from "./AvisoPanel";

/*
 * Salida sin DNI (tarjeta de contingencia): en la salida no hay equipo facial
 * que diga quién es, así que el vigilante elige al trabajador aquí y después
 * pasa la tarjeta por el lector de salida.
 */

/** "1:45". */
function minutosYSegundos(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Ventana para elegir al trabajador (solo quienes figuran dentro). */
export function ElegirSalidaSinDni({
  abierta,
  onCerrar,
  onElegida,
}: {
  abierta: boolean;
  onCerrar: () => void;
  onElegida: (salida: SalidaSinDni) => void;
}) {
  const [busqueda, setBusqueda] = useState("");
  const buscada = useDiferido(busqueda.trim());
  const [personas, setPersonas] = useState<PersonaDentro[] | null>(null);
  const [eligiendo, setEligiendo] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const buscador = useRef<HTMLDivElement>(null);

  // Al abrir, el cursor queda en el buscador.
  useEffect(() => {
    if (abierta) buscador.current?.querySelector("input")?.focus();
  }, [abierta]);

  useEffect(() => {
    if (!abierta || buscada.length < 2) {
      setPersonas(null);
      return;
    }
    let activo = true;
    eventosAccesoApi
      .candidatosSalidaSinDni(buscada)
      .then((r) => activo && setPersonas(r))
      .catch((err) => activo && setError(err instanceof ApiError ? err.message : "No se pudo buscar"));
    return () => {
      activo = false;
    };
  }, [abierta, buscada]);

  function cerrar() {
    setBusqueda("");
    setPersonas(null);
    setError(null);
    onCerrar();
  }

  async function elegir(persona: PersonaDentro) {
    setEligiendo(persona.id);
    setError(null);
    try {
      onElegida(await eventosAccesoApi.prepararSalidaSinDni(persona.id));
      cerrar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo elegir al personal");
    } finally {
      setEligiendo(null);
    }
  }

  return (
    <Modal isOpen={abierta} onClose={cerrar} bloqueado={eligiendo !== null} className="max-w-lg p-6 sm:p-8">
      <h2 className="mb-2 pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">Salida sin DNI</h2>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        Elija al personal y después pase la tarjeta de contingencia por el lector de salida.
      </p>
      <div ref={buscador}>{abierta && <TableSearch value={busqueda} onChange={setBusqueda} placeholder="Nombre o DNI…" />}</div>
      {error && <ErrorBanner className="mt-3">{error}</ErrorBanner>}
      <ul className="mt-3 max-h-80 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-800">
        {personas?.length === 0 && <li className="py-3 text-sm text-gray-400">Nadie que figure dentro con ese nombre o DNI.</li>}
        {personas?.map((p) => (
          <li key={p.id} className="flex items-center gap-3 py-2.5">
            <FotoGuardada personaId={p.id} tieneFoto={p.tieneFoto} version={p.fotoVersion} tamano="size-10" miniatura />
            <span className="min-w-0 flex-1 text-sm text-gray-700 dark:text-gray-300">
              {p.nombres} {p.apellidos}
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                DNI {p.numeroDocumento}
                {p.empresa ? ` · ${p.empresa}` : ""}
              </span>
            </span>
            <Button type="button" size="sm" disabled={eligiendo !== null} onClick={() => void elegir(p)}>
              {eligiendo === p.id ? "Eligiendo…" : "Elegir"}
            </Button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

/** Franja mientras la salida elegida espera la tarjeta: a quién, cuánto queda y para cancelar. */
// Sin onCancelar (soporte, que solo consulta), la franja se ve sin el botón.
export function FranjaSalidaSinDni({ salida, onCancelar }: { salida: SalidaSinDni | null; onCancelar?: () => void }) {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    if (!salida) return;
    const intervalo = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(intervalo);
  }, [salida]);
  if (!salida) return null;
  const queda = new Date(salida.hasta).getTime() - ahora;
  if (queda <= 0) return null;
  return (
    <AvisoPanel
      tono="warning"
      etiqueta="Salida sin DNI"
      pildora={`${salida.nombres} ${salida.apellidos} (DNI ${salida.numeroDocumento})`}
      acciones={
        onCancelar && (
          <Button type="button" size="sm" variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
        )
      }
    >
      Pase la tarjeta por el lector de salida.{" "}
      <span className="whitespace-nowrap font-medium tabular-nums text-gray-800 dark:text-white/90">Quedan {minutosYSegundos(queda)}</span>
    </AvisoPanel>
  );
}
