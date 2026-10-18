"use client";

// Una sección del manual como PANTALLA INTERACTIVA: la captura real con números
// que se tocan; cada número explica esa parte y qué hacer, con Anterior /
// Siguiente (o las flechas del teclado). Una pantalla sin captura muestra su
// contenido (por ejemplo, los recorridos de la introducción).
import React, { useEffect, useRef, useState } from "react";
import Badge from "@/components/ui/badge/Badge";
import capturas from "./capturas.json";

export type ClaveCaptura = keyof typeof capturas;

export interface PuntoManual {
  titulo: string;
  texto: React.ReactNode;
}

export type PantallaManual = {
  titulo: string;
  descripcion: string;
} & ({ clave: ClaveCaptura; puntos: PuntoManual[] } | { contenido: React.ReactNode });

/** Un motivo de denegación con lo que significa y qué hacer. */
export const Motivo = ({ m, hacer }: { m: string; hacer: React.ReactNode }) => (
  <li className="flex flex-col gap-0.5 py-1.5">
    <span>
      <Badge color="error">{m}</Badge>
    </span>
    <span className="text-gray-600 dark:text-gray-300">→ {hacer}</span>
  </li>
);

/** Lista con viñetas para el texto de un punto. */
export const Lista = ({ children }: { children: React.ReactNode }) => (
  <ul className="mt-2 list-disc space-y-1 pl-5">{children}</ul>
);

/** El número va pegado al lado del elemento que señala, sin taparlo. */
const LADO = {
  izq: "-translate-x-[110%] -translate-y-1/2",
  der: "translate-x-[10%] -translate-y-1/2",
  arriba: "-translate-x-1/2 -translate-y-[110%]",
  abajo: "-translate-x-1/2 translate-y-[10%]",
} as const;

/** Si no hay espacio al lado (el elemento está en el borde), el número entra un poco sobre él para no salirse de la imagen. */
function dentro(m: { x: number; y: number; lado: string }) {
  const x = m.lado === "izq" ? Math.max(5, m.x) : m.lado === "der" ? Math.min(95, m.x) : Math.min(97, Math.max(3, m.x));
  const y = m.lado === "arriba" ? Math.max(6, m.y) : m.lado === "abajo" ? Math.min(94, m.y) : Math.min(96, Math.max(4, m.y));
  return { x, y };
}

/** Pasos de una pantalla: uno por número; una pantalla sin captura cuenta como uno. */
const pasos = (p: PantallaManual) => ("puntos" in p ? p.puntos.length : 1);

export function Recorrido({
  pantallas,
  siguienteSeccion,
  onSiguienteSeccion,
}: {
  pantallas: PantallaManual[];
  /** Título de la sección que sigue: el último "Siguiente" lleva a ella. */
  siguienteSeccion?: string;
  onSiguienteSeccion?: () => void;
}) {
  const [pantalla, setPantalla] = useState(0);
  const [punto, setPunto] = useState(0);
  const p = pantallas[pantalla];
  const total = pantallas.reduce((n, x) => n + pasos(x), 0);
  const posicion = pantallas.slice(0, pantalla).reduce((n, x) => n + pasos(x), 0) + punto + 1;
  const esUltimo = posicion === total;

  function ir(pa: number, pu: number) {
    setPantalla(pa);
    setPunto(pu);
  }
  const siguiente = () => {
    if (punto < pasos(p) - 1) ir(pantalla, punto + 1);
    else if (pantalla < pantallas.length - 1) ir(pantalla + 1, 0);
    else if (onSiguienteSeccion) onSiguienteSeccion();
    else ir(0, 0);
  };
  const anterior = () => {
    if (punto > 0) ir(pantalla, punto - 1);
    else if (pantalla > 0) ir(pantalla - 1, pasos(pantallas[pantalla - 1]) - 1);
  };

  // Flechas del teclado (salvo mientras se escribe en un campo).
  const teclas = useRef({ siguiente, anterior });
  useEffect(() => {
    teclas.current = { siguiente, anterior };
  });
  useEffect(() => {
    const alPresionar = (e: KeyboardEvent) => {
      const destino = e.target as HTMLElement | null;
      if (destino?.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "ArrowRight") teclas.current.siguiente();
      if (e.key === "ArrowLeft") teclas.current.anterior();
    };
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, []);

  // En el celular la captura es más ancha que la pantalla: lleva el número elegido a la vista.
  const marcaActiva = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    marcaActiva.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [pantalla, punto]);

  // La fila de pantallas también se desliza de lado: la actual queda a la vista.
  const fila = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const f = fila.current;
    const boton = f?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!f || !boton || f.scrollWidth <= f.clientWidth) return;
    f.scrollTo({ left: boton.offsetLeft - (f.clientWidth - boton.offsetWidth) / 2, behavior: "smooth" });
  }, [pantalla]);

  const botones = (
    <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
      <button
        type="button"
        onClick={anterior}
        disabled={posicion === 1}
        className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-white/[0.06]"
      >
        ← Anterior
      </button>
      <button type="button" onClick={siguiente} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
        {!esUltimo ? "Siguiente →" : siguienteSeccion ? `${siguienteSeccion} →` : "Volver al inicio"}
      </button>
    </div>
  );

  const progreso = (
    <div className="mb-3 flex items-center justify-end gap-3 text-xs font-medium text-gray-500 dark:text-gray-400">
      <span>
        {posicion} de {total}
      </span>
      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06]">
        <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${(posicion / total) * 100}%` }} />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Pantallas de la sección */}
      {pantallas.length > 1 && (
        <div ref={fila} className="relative -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
          {pantallas.map((x, i) => (
            <button
              key={x.titulo}
              type="button"
              onClick={() => ir(i, 0)}
              aria-current={i === pantalla ? "step" : undefined}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3.5 py-2 text-left transition-all ${
                i === pantalla
                  ? "border-brand-500 bg-brand-50 shadow-theme-xs dark:bg-brand-500/15"
                  : "border-gray-200 bg-white hover:border-brand-200 dark:border-gray-800 dark:bg-white/[0.02]"
              }`}
            >
              <span
                className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                  i === pantalla ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-500 dark:bg-white/[0.06]"
                }`}
              >
                {i + 1}
              </span>
              <span>
                <span className="block text-sm font-semibold text-gray-800 dark:text-white/90">{x.titulo}</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">{x.descripcion}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {"puntos" in p ? (
        <PantallaConCaptura key={pantalla} pantalla={p} punto={punto} setPunto={setPunto} marcaActiva={marcaActiva}>
          {progreso}
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
              {punto + 1}
            </span>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{p.puntos[punto].titulo}</h3>
          </div>
          <div className="mt-3 flex-1 text-[15px] leading-relaxed text-gray-600 dark:text-gray-300 [&_p+p]:mt-2">
            {p.puntos[punto].texto}
          </div>
          {botones}
        </PantallaConCaptura>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.02]">
          {progreso}
          <div className="text-[15px] leading-relaxed text-gray-600 dark:text-gray-300">{p.contenido}</div>
          {botones}
        </div>
      )}
      {"puntos" in p && <p className="text-center text-xs text-gray-400">Toque los números o use Siguiente. Los datos son de demostración.</p>}
    </div>
  );
}

function PantallaConCaptura({
  pantalla: p,
  punto,
  setPunto,
  marcaActiva,
  children,
}: {
  pantalla: Extract<PantallaManual, { clave: ClaveCaptura }>;
  punto: number;
  setPunto: (n: number) => void;
  marcaActiva: React.RefObject<HTMLButtonElement | null>;
  children: React.ReactNode;
}) {
  const c = capturas[p.clave];
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
      {/* La pantalla real con sus números */}
      <div className="overflow-x-auto overflow-y-hidden rounded-2xl border border-gray-200 bg-gray-100 p-4 sm:p-5 xl:sticky xl:top-24 dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Una captura ancha no se achica de más en el celular: se desliza de lado. Una chica (una ventana) entra entera. */}
        <div className={`relative mx-auto ${c.ancho < 700 ? "" : "min-w-[560px] sm:min-w-0"}`} style={{ maxWidth: c.ancho < 700 ? 600 : undefined }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- captura estática con números encima */}
          <img src={c.imagen} alt={p.titulo} width={c.ancho} height={c.alto} className="block h-auto w-full rounded-lg shadow-theme-md" />
          {c.puntos.map((m, i) => {
            const activo = i === punto;
            return (
              <button
                key={m.n}
                ref={activo ? marcaActiva : undefined}
                type="button"
                onClick={() => setPunto(i)}
                aria-label={`${m.n}. ${p.puntos[i]?.titulo}`}
                className={`absolute flex items-center justify-center rounded-full font-bold text-white transition-all ${
                  LADO[m.lado as keyof typeof LADO] ?? LADO.izq
                } ${activo ? "size-7 bg-brand-500 text-xs ring-4 ring-brand-500/30" : "size-5 bg-gray-800/80 text-[11px] hover:bg-brand-500"}`}
                style={{ left: `${dentro(m).x}%`, top: `${dentro(m).y}%` }}
              >
                {activo && <span className="absolute inset-0 animate-ping rounded-full bg-brand-500 opacity-40" />}
                <span className="relative">{m.n}</span>
              </button>
            );
          })}
        </div>
      </div>
      {c.ancho >= 700 && <p className="-mt-3 text-center text-xs text-gray-400 sm:hidden">← Deslice la imagen de lado para verla entera →</p>}

      {/* Lo que explica el número elegido */}
      <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.02]">
        {children}
      </div>
    </div>
  );
}
