"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import capturas from "./capturas.json";

type Clave = keyof typeof capturas;

const LADO = {
  izq: "-translate-x-[120%] -translate-y-1/2",
  der: "translate-x-[20%] -translate-y-1/2",
  arriba: "-translate-x-1/2 -translate-y-[120%]",
} as const;

/** Número sobre la captura, al lado del elemento que señala (donde haya espacio libre). */
function Marca({ n, x, y, lado }: { n: number; x: number; y: number; lado: string }) {
  return (
    <span
      className={`absolute flex size-6 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white shadow-theme-md ring-2 ring-white dark:ring-gray-900 ${LADO[lado as keyof typeof LADO] ?? LADO.izq}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      aria-hidden
    >
      {n}
    </span>
  );
}

function Imagen({ clave, alt, grande = false }: { clave: Clave; alt: string; grande?: boolean }) {
  const c = capturas[clave];
  return (
    <div className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element -- captura estática con números encima, a su tamaño real */}
      <img
        src={c.imagen}
        alt={alt}
        width={c.ancho}
        height={c.alto}
        loading={grande ? "eager" : "lazy"}
        className="block h-auto w-full"
      />
      {c.puntos.map((p) => (
        <Marca key={p.n} {...p} />
      ))}
    </div>
  );
}

/**
 * Captura de una pantalla del portal con números y, debajo, qué es cada uno.
 * Un clic la amplía. Las capturas y la posición de los números las genera
 * scripts/capturas-manual.mjs (public/manual/ y capturas.json).
 */
export function Captura({ clave, alt, pasos }: { clave: Clave; alt: string; pasos: React.ReactNode[] }) {
  const [ampliada, setAmpliada] = useState(false);
  return (
    <figure className="my-2 space-y-3">
      <button
        type="button"
        onClick={() => setAmpliada(true)}
        title="Ver en grande"
        className="group block w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 px-7 text-left shadow-theme-xs transition-shadow hover:shadow-theme-md dark:border-gray-800 dark:bg-white/[0.03]"
      >
        <Imagen clave={clave} alt={alt} />
      </button>
      <figcaption>
        <ol className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {pasos.map((paso, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[11px] font-semibold text-white">
                {i + 1}
              </span>
              <span>{paso}</span>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs text-gray-400">Haz clic en la imagen para verla en grande. Los datos son de demostración.</p>
      </figcaption>

      <Modal isOpen={ampliada} onClose={() => setAmpliada(false)} className="max-w-6xl p-4 sm:p-6">
        <div className="overflow-hidden rounded-lg border border-gray-200 px-7 dark:border-gray-800">
          <Imagen clave={clave} alt={alt} grande />
        </div>
      </Modal>
    </figure>
  );
}

/** Un paso del recorrido: número, qué pasa y dónde. */
function Paso({ n, titulo, detalle, final = false }: { n: number; titulo: string; detalle: string; final?: boolean }) {
  return (
    <li className="relative flex flex-1 gap-3 md:flex-col md:items-center md:text-center">
      {!final && (
        <span
          aria-hidden
          className="absolute top-8 left-4 h-[calc(100%-1rem)] w-px bg-brand-200 md:top-4 md:left-[calc(50%+1.25rem)] md:h-px md:w-[calc(100%-2.5rem)] dark:bg-brand-500/30"
        />
      )}
      <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
        {n}
      </span>
      <span className="pb-4 md:pb-0">
        <span className="block font-medium text-gray-800 dark:text-white/90">{titulo}</span>
        <span className="block text-xs text-gray-500 dark:text-gray-400">{detalle}</span>
      </span>
    </li>
  );
}

/** El recorrido de ingreso y el de salida, paso a paso. */
export function RecorridoGarita() {
  return (
    <div className="my-2 space-y-5 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5">
      <div>
        <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">Ingreso</p>
        <ol className="flex flex-col md:flex-row md:gap-2">
          <Paso n={1} titulo="Pasa su DNI" detalle="por el lector de ingreso" />
          <Paso n={2} titulo="Se revisan sus documentos" detalle="registrado, activo y sin vencidos" />
          <Paso n={3} titulo="Muestra su rostro" detalle="el terminal facial lo reconoce" />
          <Paso n={4} titulo="Sopla" detalle="en el alcoholímetro" />
          <Paso n={5} titulo="Se abre el molinete" detalle="y queda en el Panel de vigilancia" final />
        </ol>
      </div>
      <div>
        <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">Salida</p>
        <ol className="flex flex-col md:flex-row md:gap-2">
          <Paso n={1} titulo="Pasa su DNI" detalle="por el lector de salida" />
          <Paso n={2} titulo="Se revisa que esté registrado" detalle="también si está de baja" />
          <Paso n={3} titulo="Se abre el molinete" detalle="y queda en el Panel de vigilancia" final />
        </ol>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Si algo falla en cualquier paso, el molinete no se abre, suena el aviso de denegado y el Panel de vigilancia
        muestra el motivo.
      </p>
    </div>
  );
}
