"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { CheckLineIcon, ChevronDownIcon } from "@/icons";

interface Opcion {
  value: string;
  label: string;
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
  disabled?: boolean;
  "aria-label"?: string;
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
  placeholder = "Selecciona una opción",
  buscable,
  className = "",
  compacto = false,
  disabled = false,
  "aria-label": ariaLabel,
}: ComboboxProps) {
  const id = useId();
  const raiz = useRef<HTMLDivElement>(null);
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
    lista.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [abierto, conBuscador]);

  // Un clic fuera la cierra.
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, [abierto]);

  // La opción marcada con el teclado siempre a la vista.
  useEffect(() => {
    if (abierto) lista.current?.querySelectorAll<HTMLElement>("[role=option]")[activa]?.scrollIntoView({ block: "nearest" });
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
        className={`flex ${compacto ? "h-9 px-3" : "h-11 px-4"} w-full disabled:cursor-not-allowed disabled:opacity-60 items-center justify-between gap-2 rounded-lg border bg-transparent text-left text-sm shadow-theme-xs transition-colors focus:outline-hidden dark:bg-gray-900 ${
          abierto
            ? "border-brand-300 ring-3 ring-brand-500/10 dark:border-brand-800"
            : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
        }`}
      >
        <span className={`truncate ${elegida ? "text-gray-800 dark:text-white/90" : "text-gray-400"}`}>
          {elegida?.label ?? placeholder}
        </span>
        <ChevronDownIcon
          className={`size-5 shrink-0 text-gray-500 transition-transform duration-200 dark:text-gray-400 ${abierto ? "rotate-180" : ""}`}
        />
      </button>

      {/* Siempre montado: se abre (150 ms) y se cierra (100 ms) con un fundido y un leve desplazamiento. */}
      <div
        className={`absolute top-full right-0 left-0 z-50 mt-1 origin-top overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-lg transition dark:border-gray-800 dark:bg-gray-900 ${
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
              className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:bg-white focus:outline-hidden dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
            />
          </div>
        )}
        <ul
          ref={lista}
          id={`${id}-lista`}
          role="listbox"
          className="max-h-72 overflow-y-auto p-1.5"
        >
          {visibles.length === 0 && <li className="px-3 py-2.5 text-sm text-gray-400">Sin resultados</li>}
          {visibles.map((o, i) => {
            const seleccionada = o.value === value;
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={seleccionada}
                onMouseEnter={() => setActiva(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => elegir(o)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  i === activa ? "bg-gray-100 dark:bg-white/[0.06]" : ""
                } ${seleccionada ? "font-medium text-brand-600 dark:text-brand-400" : "text-gray-700 dark:text-gray-300"}`}
              >
                <span className="truncate">{o.label}</span>
                {seleccionada && <CheckLineIcon className="size-4 shrink-0" />}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
