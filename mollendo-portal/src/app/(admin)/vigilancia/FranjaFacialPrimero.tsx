import React, { useEffect } from "react";
import type { EstadoModoIngreso } from "@/lib/api/types";
import { FotoGuardada } from "@/components/personal/FotoPersonal";

/**
 * Orden "facial primero": el vigilante sabe que el ingreso empieza por el
 * equipo facial. Compacto: un punto de color, ORDEN DEL INGRESO, el orden en
 * una píldora azul (el color del sistema) y la frase debajo (fondo blanco y borde fino).
 */
export function FranjaFacialPrimero({ estado }: { estado: EstadoModoIngreso | null }) {
  if (!estado?.facialPrimero) return null;
  return (
    <div
      role="status"
      className="mb-6 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {/* El punto late suave: el orden está activo ahora. */}
          <span aria-hidden className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-400 opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-brand-500" />
          </span>
          Orden del ingreso
        </span>
        <span className="rounded-full bg-brand-500 px-3 py-1 text-sm font-semibold text-white shadow-theme-xs">
          Facial + Alcohol → DNI
        </span>
      </div>
      <p className="mt-2 pl-[1.125rem] leading-relaxed text-gray-600 dark:text-gray-300">
        Primero rostro y alcohol; cuando el equipo dice <b className="text-gray-800 dark:text-white/90">correcto</b>, pasa su DNI en
        30 segundos.
      </p>
    </div>
  );
}

/** Ingreso autorizado con "facial primero" (llega en vivo): la foto del DNI para compararla con quien pasa. */
export interface IngresoParaComparar {
  eventoId: number;
  personaId: number;
  nombre: string;
  tieneFoto: boolean;
  fotoVersion?: string | null;
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
      <FotoGuardada personaId={ingreso.personaId} tieneFoto={ingreso.tieneFoto} version={ingreso.fotoVersion} tamano="size-20" miniatura />
      <p className="min-w-0 flex-1 leading-relaxed text-gray-700 dark:text-gray-300">
        <span className="font-semibold text-brand-600 dark:text-brand-400">Ingresó {ingreso.nombre}.</span>
      </p>
      <button type="button" onClick={onCerrar} className="text-xs font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400">
        Cerrar
      </button>
    </div>
  );
}
