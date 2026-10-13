"use client";

import React, { useSyncExternalStore } from "react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import Tarjeta from "@/components/ui/tarjeta/Tarjeta";
import { SECCIONES } from "./secciones";

// La sección elegida vive en el "#" de la dirección (/manual#reportes): se puede
// enlazar y el botón Atrás vuelve a la anterior.
function suscribirHash(avisar: () => void) {
  window.addEventListener("hashchange", avisar);
  window.addEventListener("popstate", avisar);
  return () => {
    window.removeEventListener("hashchange", avisar);
    window.removeEventListener("popstate", avisar);
  };
}
const leerHash = () => decodeURIComponent(window.location.hash.slice(1));

function ManualContent() {
  const { user } = useAuth();
  const secciones = SECCIONES.filter((s) => !user || s.roles.includes(user.rol));
  const hash = useSyncExternalStore(suscribirHash, leerHash, () => "");
  const indice = Math.max(0, secciones.findIndex((s) => s.id === hash));
  const activa = secciones[indice];

  // Una sección a la vez: elegir otra la muestra arriba, sin desplazamientos largos.
  function ir(id: string) {
    if (id !== leerHash()) {
      window.history.pushState(null, "", `#${id}`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const anterior = secciones[indice - 1];
  const siguiente = secciones[indice + 1];

  return (
    <div>
      <PageHeader title="Manual" description="Guía de uso del sistema, dividida por secciones." />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Índice: fijo debajo de la barra superior en pantallas anchas; en el celular, botones que se deslizan. */}
        <Tarjeta as="nav" className="p-2 lg:sticky lg:top-24 lg:w-64 lg:shrink-0 lg:p-4">
          <p className="mb-2 hidden px-1 text-xs font-medium uppercase tracking-wide text-gray-400 lg:block">Secciones</p>
          <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {secciones.map((s) => {
              const actual = s.id === activa?.id;
              return (
                <li key={s.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => ir(s.id)}
                    aria-current={actual ? "page" : undefined}
                    className={`block w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      actual
                        ? "bg-brand-50 font-medium text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400"
                        : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    {s.titulo}
                  </button>
                </li>
              );
            })}
          </ul>
        </Tarjeta>

        {activa && (
          <Tarjeta as="section" key={activa.id} className="min-w-0 flex-1 p-5 md:p-6">
            <h2 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">{activa.titulo}</h2>
            <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{activa.contenido}</div>

            {/* Leer en orden */}
            <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
              {anterior ? (
                <button
                  type="button"
                  onClick={() => ir(anterior.id)}
                  className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  ← {anterior.titulo}
                </button>
              ) : (
                <span />
              )}
              {siguiente && (
                <button
                  type="button"
                  onClick={() => ir(siguiente.id)}
                  className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  {siguiente.titulo} →
                </button>
              )}
            </div>
          </Tarjeta>
        )}
      </div>
    </div>
  );
}

export default function ManualPage() {
  return (
    <RequireRole roles={["administrador", "vigilancia"]}>
      <ManualContent />
    </RequireRole>
  );
}
