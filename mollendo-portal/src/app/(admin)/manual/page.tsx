"use client";

import React, { useEffect, useRef, useSyncExternalStore } from "react";
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

  // En el celular las secciones se deslizan de lado: la elegida queda a la vista.
  const lista = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = lista.current;
    const boton = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !boton || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollTo({ left: boton.offsetLeft - (nav.clientWidth - boton.offsetWidth) / 2, behavior: "smooth" });
  }, [activa?.id]);

  return (
    <div>
      <PageHeader title="Manual" description="Guía de uso del sistema, dividida por secciones." />

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
        {/* Secciones: en la computadora, la lista de la izquierda; en el celular se deslizan de lado,
            sin barras de desplazamiento (la sección cortada al final ya indica que hay más). */}
        <nav
          ref={lista}
          aria-label="Secciones del manual"
          className="no-scrollbar relative -mx-1 overflow-x-auto overflow-y-hidden px-1 lg:sticky lg:top-24 lg:mx-0 lg:overflow-visible lg:rounded-2xl lg:border lg:border-gray-200 lg:bg-white lg:p-4 lg:shadow-theme-xs dark:lg:border-gray-800 dark:lg:bg-white/[0.02]"
        >
          <p className="mb-2 hidden px-3 text-xs font-semibold uppercase tracking-wide text-gray-400 lg:block">Secciones</p>
          <ul className="flex min-w-max gap-1 border-b border-gray-200 lg:min-w-0 lg:flex-col lg:border-0 dark:border-gray-800">
            {secciones.map((s) => {
              const actual = s.id === activa?.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => ir(s.id)}
                    aria-current={actual ? "page" : undefined}
                    className={`-mb-px block w-full whitespace-nowrap border-b-2 px-3 py-2.5 text-left text-sm transition-colors lg:mb-0 lg:whitespace-normal lg:rounded-lg lg:border-0 ${
                      actual
                        ? "border-brand-500 font-medium text-brand-500 lg:bg-brand-50 dark:text-brand-400 dark:lg:bg-brand-500/15"
                        : "border-transparent text-gray-600 hover:text-gray-800 lg:hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white/90 dark:lg:hover:bg-white/[0.04]"
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
          <section key={activa.id} className="min-w-0">
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
    </div>
  );
}

export default function ManualPage() {
  return (
    <RequireRole roles={["administrador", "vigilancia", "soporte"]}>
      <ManualContent />
    </RequireRole>
  );
}
