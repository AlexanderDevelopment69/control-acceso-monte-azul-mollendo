"use client";

import React, { useLayoutEffect, useRef, useState } from "react";

/**
 * Mantiene el alto de la tabla al cambiar de página: el de la página completa
 * más alta que se vio. Así ni la última página (con menos filas) ni una página
 * con filas de una sola línea la acortan, y el paginador no sube ni baja
 * (29/10/2026: en Auditoría bajaba en las páginas con filas de dos líneas).
 *
 * - `paginaCompleta`: la página actual tiene todas sus filas; entonces se mide
 *   y se guarda su alto si es el mayor.
 * - `variasPaginas`: hay más de una página; solo entonces se aplica ese alto
 *   (con una sola página, la tabla mide lo que ocupa).
 *
 * Si cambia el ancho (girar el celular, cambiar el tamaño de la ventana) se
 * vuelve a medir desde cero: con otro ancho las filas miden otra cosa.
 *
 * Va dentro del contenedor con scroll horizontal, para que su barra (si la tabla no entra) cuente
 * igual en todas las páginas. Envuelve también las tarjetas del celular: mantienen el alto igual.
 */
export function AltoEstable({
  paginaCompleta,
  variasPaginas,
  children,
}: {
  paginaCompleta: boolean;
  variasPaginas: boolean;
  children: React.ReactNode;
}) {
  const contenido = useRef<HTMLDivElement>(null);
  const [medida, setMedida] = useState({ ancho: 0, alto: 0 });

  useLayoutEffect(() => {
    const el = contenido.current;
    if (!el) return;
    // Se observa siempre: aunque la página no esté completa, un cambio de ancho borra el alto guardado
    // (con otro ancho no sirve); solo una página completa guarda su alto.
    const medir = () =>
      setMedida((anterior) => {
        const ancho = el.offsetWidth;
        const mismoAncho = ancho === anterior.ancho;
        const alto = paginaCompleta ? Math.max(mismoAncho ? anterior.alto : 0, el.offsetHeight) : mismoAncho ? anterior.alto : 0;
        return alto === anterior.alto && mismoAncho ? anterior : { ancho, alto };
      });
    medir();
    // Sin ResizeObserver (navegadores muy antiguos, pruebas): solo la medida inicial.
    if (typeof ResizeObserver === "undefined") return;
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [paginaCompleta]);

  const minimo = variasPaginas ? medida.alto : 0;
  return (
    <div style={{ minHeight: minimo || undefined }}>
      <div ref={contenido}>{children}</div>
    </div>
  );
}
