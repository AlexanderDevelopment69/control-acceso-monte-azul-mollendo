"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon } from "@/icons";

/**
 * Una fila que se desliza hacia los lados (con el dedo, la rueda del mouse o
 * las flechas), para que muchas tarjetas no alarguen la página. Cada elemento
 * mide `anchoElemento`; abajo dice cuáles se ven ("1–2 de 9").
 */
export function Carrusel({ children, anchoElemento }: { children: React.ReactNode[]; anchoElemento: string }) {
  const carril = useRef<HTMLDivElement>(null);
  const [vista, setVista] = useState({ desde: 0, hasta: 0, izquierda: false, derecha: false });
  const total = children.length;

  const medir = useCallback(() => {
    const c = carril.current;
    const primero = c?.firstElementChild as HTMLElement | null;
    if (!c || !primero) return;
    const paso = primero.offsetWidth + parseFloat(getComputedStyle(c).columnGap || "0");
    const desde = Math.round(c.scrollLeft / paso);
    const caben = Math.max(1, Math.floor((c.clientWidth + 1) / paso) || 1);
    setVista({
      desde,
      hasta: Math.min(total, desde + caben),
      izquierda: c.scrollLeft > 1,
      derecha: c.scrollLeft + c.clientWidth < c.scrollWidth - 1,
    });
  }, [total]);

  useEffect(() => {
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [medir]);

  function mover(sentido: 1 | -1) {
    const c = carril.current;
    const primero = c?.firstElementChild as HTMLElement | null;
    if (!c || !primero) return;
    c.scrollBy({ left: sentido * (primero.offsetWidth + parseFloat(getComputedStyle(c).columnGap || "0")), behavior: "smooth" });
  }

  const flecha = (sentido: 1 | -1, visible: boolean) => (
    <button
      type="button"
      aria-label={sentido === 1 ? "Ver las siguientes" : "Ver las anteriores"}
      onClick={() => mover(sentido)}
      className={`absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-lg transition-opacity hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 ${
        sentido === 1 ? "-right-3" : "-left-3"
      } ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <ChevronLeftIcon className={`size-5 ${sentido === 1 ? "rotate-180" : ""}`} />
    </button>
  );

  return (
    <div>
      <div className="relative">
        {flecha(-1, vista.izquierda)}
        <div ref={carril} onScroll={medir} className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto">
          {children.map((hijo, i) => (
            <div key={i} className="max-w-full shrink-0 snap-start" style={{ width: anchoElemento }}>
              {hijo}
            </div>
          ))}
        </div>
        {flecha(1, vista.derecha)}
      </div>
      {(vista.izquierda || vista.derecha) && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Mostrando {vista.desde + 1}
          {vista.hasta > vista.desde + 1 ? `–${vista.hasta}` : ""} de {total}
        </p>
      )}
    </div>
  );
}
