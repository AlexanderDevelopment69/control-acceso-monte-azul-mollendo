"use client";

import React, { useSyncExternalStore } from "react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Recorrido } from "./Recorrido";
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

  // Una sección a la vez: elegir otra la muestra arriba, desde su primera pantalla.
  function ir(id: string) {
    if (id !== leerHash()) {
      window.history.pushState(null, "", `#${id}`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const siguiente = secciones[indice + 1];

  return (
    <div>
      <PageHeader title="Manual" description="Toca los números de cada pantalla para ver qué es y qué hacer." />

      {/* Secciones: en el celular se deslizan de lado. */}
      <nav aria-label="Secciones del manual" className="-mx-1 mb-6 overflow-x-auto px-1">
        <ul className="flex min-w-max gap-1 border-b border-gray-200 dark:border-gray-800">
          {secciones.map((s) => {
            const actual = s.id === activa?.id;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => ir(s.id)}
                  aria-current={actual ? "page" : undefined}
                  className={`-mb-px block whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors ${
                    actual
                      ? "border-brand-500 font-medium text-brand-500 dark:text-brand-400"
                      : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                  }`}
                >
                  {s.titulo}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {activa && (
        <section key={activa.id}>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">{activa.titulo}</h2>
            <p className="mt-1 text-gray-500 dark:text-gray-400">{activa.descripcion}</p>
          </div>
          <Recorrido
            pantallas={activa.pantallas}
            siguienteSeccion={siguiente?.titulo}
            onSiguienteSeccion={siguiente ? () => ir(siguiente.id) : undefined}
          />
        </section>
      )}
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
