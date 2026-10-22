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

/** Los dos órdenes del ingreso (por el valor de "facial primero"): nombre y pasos que se muestran al activarlo. */
const ORDENES = {
  normal: {
    nombre: "DNI → Facial + Alcohol → Molinete",
    pasos: [
      "Pasa su DNI por el lector de ingreso: se revisan sus documentos.",
      <>
        Si están en regla, tiene <strong>1 minuto</strong> para hacer rostro y prueba de alcohol en el equipo facial (el Panel muestra
        <b>en espera</b>).
      </>,
      "Si aprueba, se abre el molinete. Si da alcohol, se deniega con su nombre.",
      "Si hace rostro y alcohol sin haber pasado antes su DNI, la prueba no vale.",
    ],
  },
  facialPrimero: {
    nombre: "Facial + Alcohol → DNI → Molinete",
    pasos: [
      "Rostro y prueba de alcohol en el equipo facial.",
      <>
        Cuando el equipo dice <b>correcto</b>, pasa su DNI: tiene <strong>30 segundos</strong> desde que el Panel muestra <b>pase su DNI</b>.
      </>,
      "Se abre el molinete si el DNI es de quien sopló y sus documentos están en regla.",
      <>
        Si pasa el DNI sin haber hecho antes rostro y alcohol, se deniega (<b>DNI antes del facial</b>).
      </>,
    ],
  },
};

const ordenDe = (facialPrimero: boolean) => (facialPrimero ? ORDENES.facialPrimero : ORDENES.normal);

/** Un interruptor de "Orden del ingreso": los dos se excluyen; tocar el que ya está activo no hace nada. */
function Interruptor({
  nombre,
  detalle,
  activo,
  deshabilitado,
  onClick,
  desde,
  cambiadoPor,
}: {
  nombre: string;
  detalle: string;
  activo: boolean;
  deshabilitado: boolean;
  onClick: () => void;
  desde?: string | null;
  cambiadoPor?: string | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={activo}
        aria-label={nombre}
        disabled={deshabilitado}
        onClick={onClick}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-60 ${
          activo ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"
        }`}
      >
        <span
          className={`inline-block size-5 rounded-full bg-white shadow-theme-xs transition-transform duration-200 ${
            activo ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">{nombre}</span>
          {activo && <Badge color="success">Activo</Badge>}
          {desde && (
            <span className="text-xs text-gray-400">
              desde {new Date(desde).toLocaleString("es-PE")}
              {cambiadoPor && ` · ${cambiadoPor}`}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-gray-400">{detalle}</p>
      </div>
    </div>
  );
}

/**
 * Orden del ingreso (pedido de TMAM): normal, primero el DNI; "facial
 * primero", todo el personal activo con permiso fijo en el G4 Pro, rostro y
 * alcohol y al final el DNI. Cambiar a cualquiera de los dos pide
 * confirmación, con los pasos del orden nuevo.
 */
export function OrdenIngreso() {
  const [estado, setEstado] = useState<EstadoModoIngreso | null>(null);
  // Orden a confirmar: true = facial primero, false = normal, null = sin ventana.
  const [confirmar, setConfirmar] = useState<boolean | null>(null);
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
    setConfirmar(null);
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
      <p className="mt-1 text-xs text-gray-400">Rige uno solo: al encender uno, el otro se apaga.</p>
      <div className="mt-3 flex min-h-8 flex-wrap gap-x-10 gap-y-3">
        {!estado && !error ? (
          <ComprobandoBadge />
        ) : (
          estado && (
            <>
              <Interruptor
                nombre={ORDENES.normal.nombre}
                detalle="Primero el DNI: lo pasa por el lector de ingreso y después hace rostro y alcohol."
                activo={!facialPrimero}
                deshabilitado={guardando}
                onClick={() => facialPrimero && setConfirmar(false)}
                desde={facialPrimero ? null : estado.desde}
                cambiadoPor={estado.cambiadoPor}
              />
              <Interruptor
                nombre={ORDENES.facialPrimero.nombre}
                detalle="Primero el facial: rostro y alcohol en el equipo facial, y al final el DNI."
                activo={facialPrimero}
                deshabilitado={guardando}
                onClick={() => !facialPrimero && setConfirmar(true)}
                desde={facialPrimero ? estado.desde : null}
                cambiadoPor={estado.cambiadoPor}
              />
            </>
          )
        )}
      </div>

      {error && <ErrorBanner className="mt-3">{error}</ErrorBanner>}

      <Modal isOpen={confirmar !== null} onClose={() => setConfirmar(null)} className="max-w-lg p-6 sm:p-8">
        {confirmar !== null && (
          <>
            <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">Activar {ordenDe(confirmar).nombre}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Desde ahora, el ingreso será así:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-300">
              {ordenDe(confirmar).pasos.map((paso, i) => (
                <li key={i}>{paso}</li>
              ))}
            </ol>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              Avise al personal antes de activarlo. Puede volver a <b>{ordenDe(!confirmar).nombre}</b> cuando quiera.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setConfirmar(null)}>
                Cancelar
              </Button>
              <Button type="button" onClick={() => void cambiar(confirmar)}>
                Activar
              </Button>
            </div>
          </>
        )}
      </Modal>
    </Tarjeta>
  );
}
