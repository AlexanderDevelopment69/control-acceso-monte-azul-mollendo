"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { eventosAccesoApi, panelApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { AvisoSistema as Aviso } from "@/lib/api/types";
import {
  AlertIcon,
  BellIcon,
  BoltIcon,
  BoxCubeIcon,
  BoxIcon,
  ChevronDownIcon,
  DocsIcon,
  FolderIcon,
  LockIcon,
  PlugInIcon,
} from "@/icons";

const CADA_MS = 30_000;
const CLAVE_CONTRAIDO = "aviso-sistema-contraido";

/** El mismo ícono que la tarjeta de ese equipo en "Sistema y APIs". */
const ICONO: Record<Aviso["tipo"], React.ComponentType<{ className?: string }>> = {
  "base-de-datos": BoxCubeIcon,
  clave: LockIcon,
  respaldos: FolderIcon,
  controlador: BoxIcon,
  terminal: PlugInIcon,
  lector: DocsIcon,
  rele: BoltIcon,
  aviso: BellIcon,
  servidor: AlertIcon,
};

const SIN_SERVIDOR: Aviso = {
  tipo: "servidor",
  equipo: "Servidor",
  estado: "Sin respuesta",
  impacto: "No se puede consultar el estado de los equipos",
  desde: null,
};

const fechaCorta = (iso: string) => new Date(iso).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });

/**
 * Panel arriba de todas las páginas cuando algo de "Sistema y APIs" está caído:
 * el administrador lo ve sin entrar a esa pantalla y el vigilante puede
 * informarlo. Se revisa cada 30 s y desaparece solo cuando todo vuelve. Se
 * puede contraer al encabezado; se vuelve a abrir si cambia lo que falla.
 */
export function AvisoSistema() {
  const { user } = useAuth();
  const pathname = usePathname();
  const esAdmin = user?.rol === "administrador";
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [revisado, setRevisado] = useState<Date | null>(null);
  const [manualActiva, setManualActiva] = useState(true);
  const router = useRouter();
  // El Panel de vigilancia avisa cuando se activa o termina, sin esperar la próxima revisión.
  useEffect(() => {
    const alCambiar = (e: Event) => setManualActiva((e as CustomEvent<boolean>).detail);
    window.addEventListener("verificacion-manual", alCambiar);
    return () => window.removeEventListener("verificacion-manual", alCambiar);
  }, []);
  // El panel recién aparece cuando llega la primera respuesta, así que leer aquí no descuadra la hidratación.
  const [contraido, setContraido] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(CLAVE_CONTRAIDO);
    } catch {
      return null; // Sin almacenamiento (modo privado o en el servidor): no se recuerda.
    }
  });

  useEffect(() => {
    if (!user) return;
    let activo = true;
    const revisar = () =>
      panelApi
        .avisos()
        .then((r) => {
          if (!activo) return;
          setAvisos(r.avisos);
          setRevisado(new Date());
          // Con el equipo facial caído se ofrece la verificación manual (si no está ya activa).
          if (r.avisos.some((a) => a.tipo === "terminal")) {
            eventosAccesoApi
              .verificacionManual()
              .then((m) => activo && setManualActiva(m.activa))
              .catch(() => undefined);
          }
        })
        .catch((err) => {
          if (!activo) return;
          // Sin sesión o sin permiso no es una caída; sin respuesta del backend, sí.
          if (err instanceof ApiError && err.status < 500) return;
          setAvisos([SIN_SERVIDOR]);
          setRevisado(new Date());
        });
    revisar();
    const id = setInterval(revisar, CADA_MS);
    return () => {
      activo = false;
      clearInterval(id);
    };
  }, [user]);

  if (avisos.length === 0) return null;

  const firma = avisos.map((a) => `${a.equipo}:${a.estado}`).join("|");
  const cerrado = contraido === firma;

  const alternar = () => {
    const valor = cerrado ? null : firma;
    setContraido(valor);
    try {
      if (valor) sessionStorage.setItem(CLAVE_CONTRAIDO, valor);
      else sessionStorage.removeItem(CLAVE_CONTRAIDO);
    } catch {
      // Ver arriba.
    }
  };

  const titulo = avisos.length === 1 ? "1 equipo con problemas" : `${avisos.length} equipos con problemas`;

  return (
    <section
      role="alert"
      aria-label="Avisos del sistema"
      className="mb-4 overflow-hidden rounded-2xl border border-error-200 bg-white shadow-theme-xs dark:border-error-500/30 dark:bg-white/[0.03] md:mb-6"
    >
      {/* Encabezado */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-error-500 px-4 py-3 text-white sm:px-5">
        <span className="relative flex size-2.5 shrink-0" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-white" />
        </span>
        {/* Título y hora sobre la misma línea de base: con tamaños distintos, centrarlos los descuadra. */}
        <p className="flex flex-wrap items-baseline gap-x-3">
          <span className="font-semibold">{titulo}</span>
          {revisado && <span className="text-xs text-white/80">Revisado {revisado.toLocaleTimeString("es-PE")}</span>}
        </p>
        <div className="ml-auto flex items-center gap-2">
          {esAdmin && pathname !== "/sistema" && (
            <Link href="/sistema" className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/25">
              Ver Sistema y APIs
            </Link>
          )}
          <button
            type="button"
            onClick={alternar}
            aria-expanded={!cerrado}
            aria-label={cerrado ? "Mostrar detalle" : "Ocultar detalle"}
            title={cerrado ? "Mostrar detalle" : "Ocultar detalle"}
            className="p-1.5 focus:outline-none"
          >
            <ChevronDownIcon className={`size-4 transition-transform ${cerrado ? "" : "rotate-180"}`} />
          </button>
        </div>
      </div>

      {/* Un recuadro por equipo; se despliega y contrae animando el alto (grid 0fr ↔ 1fr). */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${cerrado ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`}
      >
        <div className="overflow-hidden">
          {/* Las tarjetas crecen hasta llenar cada fila: nunca queda un hueco al final, haya las que haya. */}
          <ul className="flex flex-wrap gap-px bg-gray-100 dark:bg-gray-800">
            {avisos.map((a) => {
              const Icono = ICONO[a.tipo];
              return (
                <li key={`${a.equipo}-${a.estado}`} className="flex min-w-0 flex-1 basis-full gap-3 bg-white p-4 dark:bg-gray-900 sm:basis-72">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400 [&_svg]:size-5">
                    <Icono />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{a.equipo}</p>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-error-600 dark:text-error-400">
                      <span className="relative flex size-2 shrink-0" aria-hidden>
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-error-400 opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-error-500" />
                      </span>
                      {a.estado}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-gray-500 dark:text-gray-400">{a.impacto}</p>
                    {a.desde && <p className="mt-1 text-xs text-gray-400">Última vez en línea: {fechaCorta(a.desde)}</p>}
                    {/* Contingencia por falla del equipo facial (contingencias, sección 4). */}
                    {a.tipo === "terminal" && !manualActiva && (
                      <button
                        type="button"
                        onClick={() =>
                          pathname === "/vigilancia"
                            ? window.dispatchEvent(new Event("activar-verificacion-manual"))
                            : router.push("/vigilancia?activarManual=1")
                        }
                        className="mt-2 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                      >
                        Activar verificación manual
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {!esAdmin && (
            <p className="border-t border-gray-100 px-4 py-2.5 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:px-5">
              Informa al administrador o al soporte técnico.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
