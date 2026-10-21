"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon } from "@/icons";

/** Ancho mínimo y máximo de cada tarjeta (con su carné y sus botones al costado), y separación entre ellas. */
const ANCHO_MINIMO = 592;
const ANCHO_MAXIMO = 704;
const SEPARACION = 20;
/** Lo que ocupa cada flecha a los costados (botón + espacio). */
const FLECHA = 52;
/** Desde cuántos píxeles un gesto es arrastre (y no un clic), y cuánto hay que arrastrar para cambiar de página. */
const UMBRAL_ARRASTRE = 6;
const UMBRAL_CAMBIO = 60;

/**
 * Carrusel de tarjetas: tantas a la vista como entran completas (1 en el
 * celular, 2 o 3 en una pantalla), con flechas a los costados y, abajo al
 * centro, un punto por página y "1–2 de 9 tarjetas". Al cambiar de página
 * las tarjetas se deslizan. También se arrastran con el mouse o con el dedo:
 * siguen al gesto y, al soltar, pasan de página o vuelven a su lugar.
 */
export function PaginasTarjetas({
  children,
  mostrar,
}: {
  children: React.ReactNode[];
  /** Llevar el carrusel hasta esta tarjeta (p. ej. la recién creada); `clave` distingue un pedido de otro. */
  mostrar?: { indice: number; clave: number } | null;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState(0);
  const [pagina, setPagina] = useState(0);
  // Arrastre en curso: dónde empezó y cuánto se movió (null: no se arrastra).
  const inicio = useRef<{ x: number; id: number } | null>(null);
  const [arrastre, setArrastre] = useState<number | null>(null);
  // Si hubo arrastre, el clic que llega al soltar no debe activar un botón de la tarjeta.
  const huboArrastre = useRef(false);
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

  // Pedido de mostrar una tarjeta: se va a su página (una sola vez por pedido, ya medido el ancho).
  const [mostrada, setMostrada] = useState<number | null>(null);
  if (mostrar && ancho > 0 && mostrar.clave !== mostrada) {
    setMostrada(mostrar.clave);
    setPagina(Math.floor(mostrar.indice / porPagina));
  }

  function empezar(e: React.PointerEvent<HTMLDivElement>) {
    if (paginas < 2 || (e.pointerType === "mouse" && e.button !== 0)) return;
    inicio.current = { x: e.clientX, id: e.pointerId };
    huboArrastre.current = false;
  }
  function mover(e: React.PointerEvent<HTMLDivElement>) {
    if (!inicio.current || inicio.current.id !== e.pointerId) return;
    const dx = e.clientX - inicio.current.x;
    if (arrastre === null && Math.abs(dx) < UMBRAL_ARRASTRE) return;
    if (arrastre === null) e.currentTarget.setPointerCapture(e.pointerId);
    huboArrastre.current = true;
    // En los extremos se mueve menos, como un resorte.
    const borde = (dx > 0 && actual === 0) || (dx < 0 && actual >= paginas - 1);
    setArrastre(borde ? dx / 3 : dx);
  }
  function soltar() {
    if (!inicio.current) return;
    inicio.current = null;
    if (arrastre !== null && Math.abs(arrastre) > UMBRAL_CAMBIO) ir(actual + (arrastre < 0 ? 1 : -1));
    setArrastre(null);
  }

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
            // touch-pan-y: en el celular, el gesto vertical sigue moviendo la página.
            className={`touch-pan-y overflow-hidden ${paginas > 1 ? (arrastre !== null ? "cursor-grabbing select-none" : "cursor-grab") : ""}`}
            style={{ width: porPagina * anchoTarjeta + (porPagina - 1) * SEPARACION }}
            onPointerDown={empezar}
            onPointerMove={mover}
            onPointerUp={soltar}
            onPointerCancel={soltar}
            onClickCapture={(e) => {
              if (huboArrastre.current) {
                e.preventDefault();
                e.stopPropagation();
                huboArrastre.current = false;
              }
            }}
            onDragStart={(e) => e.preventDefault()}
          >
            <div
              className={`flex ${arrastre !== null ? "" : "transition-transform duration-500 ease-out motion-reduce:transition-none"}`}
              style={{ gap: SEPARACION, transform: `translateX(${-desde * (anchoTarjeta + SEPARACION) + (arrastre ?? 0)}px)` }}
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
