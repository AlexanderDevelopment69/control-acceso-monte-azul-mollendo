import React from "react";
import { textoPerfil, type Perfil } from "@/lib/perfiles";

/** Perfil de la persona (lista, ficha y Panel): una píldora suave; "Sin perfil" en ámbar, para completarlo. */
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
