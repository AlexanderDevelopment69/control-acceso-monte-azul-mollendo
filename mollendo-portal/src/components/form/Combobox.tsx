"use client";

import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckLineIcon, ChevronDownIcon } from "@/icons";

export interface Opcion {
  value: string;
  label: string;
  /** Texto suave a la derecha, solo en la lista (por ejemplo, una cantidad). */
  detalle?: string;
  /** Título de grupo: se muestra encima de la primera opción de cada grupo. */
  grupo?: string;
}

interface ComboboxProps {
  options: Opcion[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Buscador arriba de la lista (por defecto, sin buscador). */
  buscable?: boolean;
  className?: string;
  /** Más bajo (h-9), para usarlo junto a otros controles en una línea. */
  compacto?: boolean;
  /** Opciones largas: se ven completas (pasan a otra línea) en vez de cortarse con "…". */
  textoCompleto?: boolean;
  /**
   * La lista se dibuja sobre la página (fuera del recuadro que la contiene),
   * para usarla dentro de un contenedor con desplazamiento propio sin que la corte.
   */
  flotante?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
}

/**
 * Lleva la opción a la vista desplazando solo la lista (scrollIntoView también
 * desplazaba la página o el modal de atrás, y la ventana se movía al abrir).
 */
function mostrarEnLista(lista: HTMLElement | null, opcion: HTMLElement | null | undefined) {
  if (!lista || !opcion) return;
  const arriba = opcion.offsetTop;
  const abajo = arriba + opcion.offsetHeight;
  if (arriba < lista.scrollTop) lista.scrollTop = arriba;
  else if (abajo > lista.scrollTop + lista.clientHeight) lista.scrollTop = abajo - lista.clientHeight;
}

/**
 * Desplegable propio (en vez de la lista nativa del navegador): panel con
 * animación, buscador, ✓ en la opción elegida y manejo con teclado (flechas,
 * Enter, Esc, Inicio/Fin).
 */
export default function Combobox({
  options,
  value,
  onChange,
  placeholder = "Seleccione una opción",
  buscable,
  className = "",
  compacto = false,
  textoCompleto = false,
  flotante = false,
  disabled = false,
  "aria-label": ariaLabel,
}: ComboboxProps) {
  const id = useId();
  const raiz = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  // Siempre "fixed", también cerrada: si quedara en el flujo de la página, al abrirla el navegador
  // desplazaba la página (y la ventana del modal se movía) para mostrar la opción elegida.
  const [posicion, setPosicion] = useState<React.CSSProperties>({ position: "fixed", top: 0, left: 0 });
  const buscador = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [activa, setActiva] = useState(0);
  const conBuscador = buscable ?? false;

  const elegida = options.find((o) => o.value === value);
  const visibles = useMemo(() => {
    const f = filtro.trim().toLocaleLowerCase("es");
    return f ? options.filter((o) => o.label.toLocaleLowerCase("es").includes(f)) : options;
  }, [options, filtro]);

  function abrir() {
    setFiltro("");
    setActiva(Math.max(0, options.findIndex((o) => o.value === value)));
    setAbierto(true);
  }
  function elegir(o: Opcion) {
    onChange(o.value);
    setAbierto(false);
  }

  // Al abrir: foco en el buscador y la opción elegida a la vista.
  useEffect(() => {
    if (!abierto) return;
    if (conBuscador) buscador.current?.focus();
    mostrarEnLista(lista.current, lista.current?.querySelector<HTMLElement>('[aria-selected="true"]'));
  }, [abierto, conBuscador]);

  // Un clic fuera la cierra.
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!raiz.current?.contains(t) && !panel.current?.contains(t)) setAbierto(false);
    };
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, [abierto]);

  // Flotante: la lista sigue al campo (al desplazar o cambiar el tamaño); abre hacia arriba si abajo no hay lugar.
  useLayoutEffect(() => {
    if (!flotante || !abierto) return;
    const ubicar = () => {
      const r = raiz.current?.getBoundingClientRect();
      if (!r) return;
      const abajo = window.innerHeight - r.bottom;
      const arriba = abajo < 320 && r.top > abajo;
      setPosicion(
        arriba
          ? { position: "fixed", left: r.left, width: r.width, bottom: window.innerHeight - r.top + 4 }
          : { position: "fixed", left: r.left, width: r.width, top: r.bottom + 4 },
      );
    };
    ubicar();
    window.addEventListener("scroll", ubicar, true);
    window.addEventListener("resize", ubicar);
    return () => {
      window.removeEventListener("scroll", ubicar, true);
      window.removeEventListener("resize", ubicar);
    };
  }, [flotante, abierto]);

  // La opción marcada con el teclado siempre a la vista.
  useEffect(() => {
    if (abierto) mostrarEnLista(lista.current, lista.current?.querySelectorAll<HTMLElement>("[role=option]")[activa]);
  }, [activa, abierto]);

  function teclado(e: React.KeyboardEvent) {
    if (!abierto) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        abrir();
      }
      return;
    }
    if (e.key === "Escape") {
      // Cierra solo la lista, no la ventana (modal) en la que esté.
      e.stopPropagation();
      setAbierto(false);
    } else if (e.key === "Tab") setAbierto(false);
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiva((i) => Math.min(visibles.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiva((i) => Math.max(0, i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiva(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiva(visibles.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (visibles[activa]) elegir(visibles[activa]);
    }
  }

  return (
    <div ref={raiz} className={`relative ${className}`} onKeyDown={teclado}>
      <button
        type="button"
        role="combobox"
        aria-expanded={abierto}
        aria-controls={`${id}-lista`}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (abierto ? setAbierto(false) : abrir())}
        className={`flex ${compacto ? "h-9 px-3" : textoCompleto ? "min-h-11 px-4 py-2" : "h-11 px-4"} w-full disabled:cursor-not-allowed disabled:opacity-60 items-center justify-between gap-2 rounded-lg border bg-transparent text-left text-sm shadow-theme-xs transition-colors focus:outline-hidden dark:bg-gray-900 ${
          abierto
            ? "border-brand-300 ring-3 ring-brand-500/10 dark:border-brand-800"
            : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
        }`}
      >
        <span className={`${textoCompleto ? "min-w-0" : "truncate"} ${elegida ? "text-gray-800 dark:text-white/90" : "text-gray-400"}`}>
          {elegida?.label ?? placeholder}
        </span>
        <ChevronDownIcon
          className={`size-5 shrink-0 text-gray-500 transition-transform duration-200 dark:text-gray-400 ${abierto ? "rotate-180" : ""}`}
        />
      </button>

      {/* Siempre montado: se abre (150 ms) y se cierra (100 ms) con un fundido y un leve desplazamiento. */}
      {(() => {
        const contenido = (
      <div
        ref={panel}
        style={flotante ? posicion : undefined}
        onKeyDown={flotante ? teclado : undefined}
        className={`${flotante ? "z-[100000]" : "absolute top-full right-0 left-0 z-50 mt-1"} origin-top overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-lg transition dark:border-gray-800 dark:bg-gray-900 ${
          abierto
            ? "visible translate-y-0 scale-100 opacity-100 duration-150 ease-out"
            : "invisible -translate-y-1 scale-[0.98] opacity-0 duration-100 ease-in"
        }`}
      >
        {conBuscador && (
          <div className="border-b border-gray-100 p-2 dark:border-gray-800">
            <input
              ref={buscador}
              value={filtro}
              onChange={(e) => {
                setFiltro(e.target.value);
                setActiva(0);
              }}
              placeholder="Buscar…"
              aria-label="Buscar en la lista"
              name={`${id}-buscar`}
              autoComplete="off"
              className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:bg-white focus:outline-hidden dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
            />
          </div>
        )}
        <ul
          ref={lista}
          id={`${id}-lista`}
          role="listbox"
          className="relative max-h-72 overflow-y-auto p-1.5"
        >
          {visibles.length === 0 && <li className="px-3 py-2.5 text-sm text-gray-400">Sin resultados</li>}
          {visibles.map((o, i) => {
            const seleccionada = o.value === value;
            const tituloGrupo = o.grupo && o.grupo !== visibles[i - 1]?.grupo ? o.grupo : null;
            return (
              <React.Fragment key={o.value}>
                {tituloGrupo && (
                  <li role="presentation" className="px-3 pt-2 pb-1 text-xs font-medium text-gray-400 dark:text-gray-500">
                    {tituloGrupo}
                  </li>
                )}
                <li
                  role="option"
                  aria-selected={seleccionada}
                  onMouseEnter={() => setActiva(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => elegir(o)}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    i === activa ? "bg-gray-100 dark:bg-white/[0.06]" : ""
                  } ${seleccionada ? "font-medium text-brand-600 dark:text-brand-400" : "text-gray-700 dark:text-gray-300"}`}
                >
                  <span className={textoCompleto ? "min-w-0" : "truncate"}>{o.label}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    {o.detalle && <span className="text-xs font-normal text-gray-400 dark:text-gray-500">{o.detalle}</span>}
                    {seleccionada && <CheckLineIcon className="size-4 shrink-0" />}
                  </span>
                </li>
              </React.Fragment>
            );
          })}
        </ul>
      </div>
        );
        // Flotante: fuera del modal (que tiene transform), para que "fixed" sea respecto a la ventana.
        return flotante && typeof document !== "undefined" ? createPortal(contenido, document.body) : contenido;
      })()}
    </div>
  );
}
