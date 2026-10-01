"use client";

import React, { useState } from "react";
import DatePicker from "@/components/form/date-picker";
import { hoy } from "@/lib/paginaServidor";

export type Periodo = "hoy" | "7dias" | "mes" | "rango";

const PERIODOS: [Periodo, string][] = [
  ["hoy", "Hoy"],
  ["7dias", "Últimos 7 días"],
  ["mes", "Este mes"],
  ["rango", "Personalizado"],
];

/** Fecha AAAA-MM-DD desplazada `dias` días. */
export function sumarDias(fecha: string, dias: number): string {
  const [a, m, d] = fecha.split("-").map(Number);
  const f = new Date(a, m - 1, d + dias);
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;
}

function rangoDelPeriodo(periodo: Periodo, desde: string, hasta: string): { desde: string; hasta: string } {
  const hoyDia = hoy();
  if (periodo === "hoy") return { desde: hoyDia, hasta: hoyDia };
  if (periodo === "7dias") return { desde: sumarDias(hoyDia, -6), hasta: hoyDia };
  if (periodo === "mes") return { desde: `${hoyDia.slice(0, 8)}01`, hasta: hoyDia };
  return { desde, hasta };
}

/** Periodo elegido (hoy, 7 días, este mes o personalizado) y sus fechas desde/hasta. */
export function usePeriodo(inicial: Periodo = "hoy") {
  const [periodo, setPeriodo] = useState<Periodo>(inicial);
  const [desdeRango, setDesdeRango] = useState(() => sumarDias(hoy(), -6));
  const [hastaRango, setHastaRango] = useState(hoy);
  const { desde, hasta } = rangoDelPeriodo(periodo, desdeRango, hastaRango);
  return {
    periodo,
    setPeriodo,
    desdeRango,
    setDesdeRango,
    hastaRango,
    setHastaRango,
    desde,
    hasta,
    rangoValido: !!desde && !!hasta && desde <= hasta,
  };
}

/**
 * Botones Hoy / Últimos 7 días / Este mes / Personalizado y, con
 * "Personalizado", las fechas desde y hasta. En pantallas anchas la fila tiene
 * el alto de los campos de fecha, así los botones no se mueven al aparecer;
 * en las demás, las fechas van debajo.
 */
export function SelectorPeriodo({
  estado,
  id,
  className = "",
  children,
}: {
  estado: ReturnType<typeof usePeriodo>;
  /** Prefijo de los id de los campos de fecha. */
  id: string;
  className?: string;
  /** Otros controles que van a la derecha (p. ej. filtros). */
  children?: React.ReactNode;
}) {
  const { periodo, setPeriodo, desdeRango, setDesdeRango, hastaRango, setHastaRango } = estado;
  return (
    <div className={`flex flex-col items-start gap-3 xl:min-h-11 xl:flex-row xl:items-center xl:justify-between ${className}`}>
      <div className="flex shrink-0 flex-wrap gap-1 rounded-lg bg-gray-100 p-1 text-sm dark:bg-gray-900">
        {PERIODOS.map(([valor, texto]) => (
          <button
            key={valor}
            type="button"
            onClick={() => setPeriodo(valor)}
            className={`rounded-md px-3 py-1.5 font-medium ${
              periodo === valor
                ? "bg-white text-gray-900 shadow-theme-xs dark:bg-gray-800 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {texto}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {periodo === "rango" && (
          <div className="flex items-center gap-2">
            <div className="w-full sm:w-40">
              <DatePicker id={`${id}-desde`} placeholder="Desde" max={hastaRango || hoy()} value={desdeRango} onChange={setDesdeRango} />
            </div>
            <span className="text-sm text-gray-400">a</span>
            <div className="w-full sm:w-40">
              <DatePicker id={`${id}-hasta`} placeholder="Hasta" min={desdeRango} max={hoy()} value={hastaRango} onChange={setHastaRango} />
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
