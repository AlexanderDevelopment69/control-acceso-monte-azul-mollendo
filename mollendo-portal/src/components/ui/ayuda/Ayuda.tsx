import React from "react";

/**
 * Globo de ayuda al pasar el mouse (o al enfocar con el teclado) sobre un
 * botón: aparece al instante, con el estilo del sistema, en lugar del `title`
 * del navegador (que tarda y casi no se ve). Sale debajo, alineado a la
 * derecha (para botones en la esquina de una tarjeta o al final de una fila).
 */
export function Ayuda({ texto, children, className = "" }: { texto: string; children: React.ReactNode; className?: string }) {
  return (
    <span className={`group/ayuda relative inline-flex ${className}`}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-max max-w-56 rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium leading-snug text-white opacity-0 shadow-theme-lg transition-opacity duration-150 group-hover/ayuda:opacity-100 group-focus-within/ayuda:opacity-100 dark:bg-gray-700"
      >
        {/* Flechita hacia el botón. */}
        <span aria-hidden className="absolute -top-1 right-3 size-2 rotate-45 bg-gray-900 dark:bg-gray-700" />
        {texto}
      </span>
    </span>
  );
}
