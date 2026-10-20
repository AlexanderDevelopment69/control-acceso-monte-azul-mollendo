import React, { useEffect } from "react";
import type { EstadoModoIngreso } from "@/lib/api/types";
import { FotoGuardada } from "@/components/personal/FotoPersonal";
import { InfoIcon } from "@/icons";

/** Orden "facial primero": el vigilante sabe que el ingreso empieza por el equipo facial. */
export function FranjaFacialPrimero({ estado }: { estado: EstadoModoIngreso | null }) {
  if (!estado?.facialPrimero) return null;
  return (
    <div
      role="status"
      className="mb-6 flex items-start gap-2.5 rounded-xl border border-warning-300 bg-warning-50 px-4 py-3 text-sm leading-relaxed text-gray-700 dark:border-warning-500/40 dark:bg-warning-500/10 dark:text-gray-300"
    >
      <InfoIcon className="mt-0.5 size-5 shrink-0 text-warning-600 dark:text-orange-400" aria-hidden />
      <span>
        <span className="font-semibold text-warning-700 dark:text-orange-400">Orden “facial primero”.</span> La persona hace
        rostro y alcohol en el equipo facial y, cuando el equipo dice “correcto”, pasa su DNI (tiene 15 segundos desde que
        aparece “pase su DNI”). Si pasa el DNI sin haber hecho antes rostro y alcohol, no se abre el molinete.
      </span>
    </div>
  );
}

/** Ingreso autorizado con "facial primero" (llega en vivo): la foto del DNI para compararla con quien pasa. */
export interface IngresoParaComparar {
  eventoId: number;
  personaId: number;
  nombre: string;
  tieneFoto: boolean;
}

/** Cuánto se muestra la foto para comparar. */
const COMPARAR_MS = 20_000;

/**
 * Orden "facial primero": al autorizar un ingreso, su foto y su nombre quedan
 * arriba unos segundos.
 */
export function CompararFoto({ ingreso, onCerrar }: { ingreso: IngresoParaComparar | null; onCerrar: () => void }) {
  // Se cierra sola; otro ingreso la reemplaza y vuelve a contar.
  useEffect(() => {
    if (!ingreso) return;
    const fin = setTimeout(onCerrar, COMPARAR_MS);
    return () => clearTimeout(fin);
  }, [ingreso, onCerrar]);
  if (!ingreso) return null;
  return (
    <div
      role="alert"
      className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-brand-300 bg-brand-50 px-4 py-3 text-sm dark:border-brand-500/40 dark:bg-brand-500/10"
    >
      <FotoGuardada personaId={ingreso.personaId} tieneFoto={ingreso.tieneFoto} tamano="size-20" miniatura />
      <p className="min-w-0 flex-1 leading-relaxed text-gray-700 dark:text-gray-300">
        <span className="font-semibold text-brand-600 dark:text-brand-400">Ingresó {ingreso.nombre}.</span>
      </p>
      <button type="button" onClick={onCerrar} className="text-xs font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400">
        Cerrar
      </button>
    </div>
  );
}
