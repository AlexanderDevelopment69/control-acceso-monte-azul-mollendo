"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon } from "@/icons";

/** Ancho mínimo de cada tarjeta (con su carné y sus botones al costado) y separación entre ellas. */
const ANCHO_MINIMO = 592;
const SEPARACION = 20;

/**
 * Las tarjetas de a páginas: tantas por página como entran completas en el
 * ancho (1 en el celular, 2 o 3 en una pantalla), para que muchas tarjetas no
 * alarguen la página. Abajo, al centro, un paginador con un punto por página.
 */
export function PaginasTarjetas({ children }: { children: React.ReactNode[] }) {
  const caja = useRef<HTMLDivElement>(null);
  const [porPagina, setPorPagina] = useState(1);
  const [pagina, setPagina] = useState(0);
  const total = children.length;
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  // Si se eliminan tarjetas o cambia el ancho, la página actual sigue existiendo.
  const actual = Math.min(pagina, paginas - 1);

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const medir = () => setPorPagina(Math.min(3, Math.max(1, Math.floor((el.clientWidth + SEPARACION) / (ANCHO_MINIMO + SEPARACION)))));
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  const desde = actual * porPagina;
  const visibles = children.slice(desde, desde + porPagina);

  const flecha = (sentido: 1 | -1) => {
    const destino = actual + sentido;
    const deshabilitada = destino < 0 || destino >= paginas;
    return (
      <button
        type="button"
        aria-label={sentido === 1 ? "Página siguiente" : "Página anterior"}
        disabled={deshabilitada}
        onClick={() => setPagina(destino)}
        className="flex size-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        <ChevronLeftIcon className={`size-4 ${sentido === 1 ? "rotate-180" : ""}`} />
      </button>
    );
  };

  return (
    <div ref={caja}>
      {/* Cada tarjeta hasta 44rem de ancho; centradas, como el paginador de abajo. */}
      <div className="grid justify-center gap-5" style={{ gridTemplateColumns: `repeat(${porPagina}, minmax(0, 44rem))` }}>
        {visibles}
      </div>
      {paginas > 1 && (
        <nav aria-label="Páginas de tarjetas" className="mt-5 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            {flecha(-1)}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: paginas }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Página ${i + 1}`}
                  aria-current={i === actual ? "page" : undefined}
                  onClick={() => setPagina(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === actual ? "w-6 bg-brand-500" : "w-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
                  }`}
                />
              ))}
            </div>
            {flecha(1)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {desde + 1}
            {visibles.length > 1 ? `–${desde + visibles.length}` : ""} de {total} tarjetas
          </p>
        </nav>
      )}
    </div>
  );
}
