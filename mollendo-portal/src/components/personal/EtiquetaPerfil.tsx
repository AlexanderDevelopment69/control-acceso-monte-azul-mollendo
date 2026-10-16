import React from "react";
import { textoPerfil, type Perfil } from "@/lib/perfiles";

/** Perfil de la persona en la lista: una píldora suave; "Sin perfil" en ámbar, para completarlo. */
export function EtiquetaPerfil({ perfil }: { perfil: Perfil | null }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        perfil
          ? "bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-300"
          : "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-orange-400"
      }`}
    >
      {textoPerfil(perfil)}
    </span>
  );
}

/** En la ficha: la misma etiqueta, como botón; un clic abre la ventana para cambiar el perfil. */
export function BotonPerfil({ perfil, onClick }: { perfil: Perfil | null; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={perfil ? "Cambiar el perfil" : "Asignar el perfil"}
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
        perfil
          ? "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/[0.06] dark:text-gray-300 dark:hover:bg-white/10"
          : "bg-warning-50 text-warning-700 hover:bg-warning-100 dark:bg-warning-500/15 dark:text-orange-400"
      }`}
    >
      {perfil ? textoPerfil(perfil) : "Sin perfil · Asignar"}
    </button>
  );
}
