import React, { useEffect } from "react";
import type { EstadoModoIngreso } from "@/lib/api/types";
import { FotoGuardada } from "@/components/personal/FotoPersonal";

/** Orden "facial primero": el vigilante sabe que el ingreso empieza por el equipo facial y que debe comparar la foto. */
export function FranjaFacialPrimero({ estado }: { estado: EstadoModoIngreso | null }) {
  if (!estado?.facialPrimero) return null;
  return (
    <div
      role="status"
      className="mb-6 rounded-xl border border-warning-300 bg-warning-50 px-4 py-3 text-sm leading-relaxed text-gray-700 dark:border-warning-500/40 dark:bg-warning-500/10 dark:text-gray-300"
    >
      <span className="font-semibold text-warning-700 dark:text-orange-400">Orden “facial primero”.</span> La persona hace
      rostro y alcohol en el equipo facial y después pasa su DNI (tiene 20 segundos). El equipo no dice quién sopló:{" "}
      <strong>compara la foto</strong> que aparece al autorizar con quien pasa el molinete.
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
 * Orden "facial primero": al autorizar un ingreso, su foto queda arriba unos
 * segundos para que el vigilante compruebe que quien pasa el molinete es la
 * persona del DNI (el equipo no confirma quién sopló).
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
      <FotoGuardada personaId={ingreso.personaId} tieneFoto={ingreso.tieneFoto} tamano="size-20" />
      <p className="min-w-0 flex-1 leading-relaxed text-gray-700 dark:text-gray-300">
        <span className="font-semibold text-brand-600 dark:text-brand-400">Ingresó {ingreso.nombre}.</span>
        <br />
        ¿Es la persona que está pasando el molinete? Si no, avise al supervisor.
      </p>
      <button type="button" onClick={onCerrar} className="text-xs font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400">
        Cerrar
      </button>
    </div>
  );
}
