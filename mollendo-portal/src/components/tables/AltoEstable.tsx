"use client";

import React, { useLayoutEffect, useRef, useState } from "react";

/**
 * Mantiene el alto de una página completa de la tabla cuando se muestra la
 * última, con menos filas. Así la página no se acorta y la vista no salta al
 * volver a otra página.
 *
 * - `paginaCompleta`: la página actual tiene todas sus filas; entonces se mide
 *   y se guarda su alto.
 * - `variasPaginas`: hay más de una página; solo entonces se aplica ese alto a
 *   una página incompleta (con una sola página, la tabla mide lo que ocupa).
 *
 * Va dentro del contenedor con scroll horizontal, para que su barra (en el
 * celular) cuente igual en todas las páginas.
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
  const [altoPagina, setAltoPagina] = useState(0);

  useLayoutEffect(() => {
    const el = contenido.current;
    if (!el || !paginaCompleta) return;
    const medir = () => setAltoPagina(el.offsetHeight);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [paginaCompleta]);

  const minimo = variasPaginas && !paginaCompleta ? altoPagina : 0;
  return (
    <div style={{ minHeight: minimo || undefined }}>
      <div ref={contenido}>{children}</div>
    </div>
  );
}
