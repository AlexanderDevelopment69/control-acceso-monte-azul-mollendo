"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon } from "@/icons";

/** Ancho mínimo y máximo de cada tarjeta (con su carné y sus botones al costado), y separación entre ellas. */
const ANCHO_MINIMO = 592;
const ANCHO_MAXIMO = 704;
const SEPARACION = 20;
/** Lo que ocupa cada flecha a los costados (botón + espacio). */
const FLECHA = 52;

/**
 * Carrusel de tarjetas: tantas a la vista como entran completas (1 en el
 * celular, 2 o 3 en una pantalla), con flechas a los costados y, abajo al
 * centro, un punto por página y "1–2 de 9 tarjetas". Al cambiar de página
 * las tarjetas se deslizan; en el celular también se desliza con el dedo.
 */
export function PaginasTarjetas({ children }: { children: React.ReactNode[] }) {
  const caja = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState(0);
  const [pagina, setPagina] = useState(0);
  const toque = useRef<number | null>(null);
  const total = children.length;

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const observador = new ResizeObserver(() => setAncho(el.clientWidth));
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  // En el celular las flechas no caben a los lados: se desliza con el dedo.
  const conFlechas = ancho >= 640;
  const disponible = Math.max(0, ancho - (conFlechas ? 2 * FLECHA : 0));
  const porPagina = Math.min(3, Math.max(1, Math.floor((disponible + SEPARACION) / (ANCHO_MINIMO + SEPARACION))));
  const anchoTarjeta = Math.min(ANCHO_MAXIMO, (disponible - (porPagina - 1) * SEPARACION) / porPagina);
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  // Si se eliminan tarjetas o cambia el ancho, la página actual sigue existiendo.
  const actual = Math.min(pagina, paginas - 1);
  // La última página muestra las últimas tarjetas, sin huecos.
  const desde = Math.max(0, Math.min(actual * porPagina, total - porPagina));
  const hasta = Math.min(total, desde + porPagina);

  const ir = (destino: number) => setPagina(Math.max(0, Math.min(paginas - 1, destino)));

  const flecha = (sentido: 1 | -1) => (
    <button
      type="button"
      aria-label={sentido === 1 ? "Tarjetas siguientes" : "Tarjetas anteriores"}
      disabled={sentido === 1 ? actual >= paginas - 1 : actual <= 0}
      onClick={() => ir(actual + sentido)}
      className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:pointer-events-none disabled:opacity-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
    >
      <ChevronLeftIcon className={`size-5 ${sentido === 1 ? "rotate-180" : ""}`} />
    </button>
  );

  return (
    <div ref={caja}>
      {ancho > 0 && (
        <div className="flex items-center justify-center gap-3">
          {conFlechas && paginas > 1 && flecha(-1)}
          <div
            className="overflow-hidden"
            style={{ width: porPagina * anchoTarjeta + (porPagina - 1) * SEPARACION }}
            onTouchStart={(e) => (toque.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (toque.current === null) return;
              const recorrido = e.changedTouches[0].clientX - toque.current;
              toque.current = null;
              if (Math.abs(recorrido) > 50) ir(actual + (recorrido < 0 ? 1 : -1));
            }}
          >
            <div
              className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
              style={{ gap: SEPARACION, transform: `translateX(-${desde * (anchoTarjeta + SEPARACION)}px)` }}
            >
              {children.map((hijo, i) => (
                <div
                  key={i}
                  className="shrink-0"
                  style={{ width: anchoTarjeta }}
                  // Las que no se ven no reciben el foco del teclado.
                  inert={i < desde || i >= hasta}
                >
                  {hijo}
                </div>
              ))}
            </div>
          </div>
          {conFlechas && paginas > 1 && flecha(1)}
        </div>
      )}
      {paginas > 1 && (
        <nav aria-label="Páginas de tarjetas" className="mt-5 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: paginas }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Página ${i + 1}`}
                aria-current={i === actual ? "page" : undefined}
                onClick={() => ir(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === actual ? "w-6 bg-brand-500" : "w-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {desde + 1}
            {hasta > desde + 1 ? `–${hasta}` : ""} de {total} tarjetas
          </p>
        </nav>
      )}
    </div>
  );
}
