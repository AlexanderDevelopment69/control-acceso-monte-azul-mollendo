"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { empresasApi, personasApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import type { Empresa, Persona } from "@/lib/api/types";
import Button from "@/components/ui/button/Button";
import Combobox from "@/components/form/Combobox";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSearch } from "@/components/tables/TableSearch";
import { NuevaPersonaModal } from "@/components/personal/NuevaPersonaModal";
import { PersonaFicha, motivosCumplimiento } from "@/components/personal/PersonaFicha";

type Filtro = "todos" | "no-habilitados" | "habilitados";
/** En el orden de las pestañas (para deslizar el fondo de la elegida). */
const FILTROS: Filtro[] = ["todos", "no-habilitados", "habilitados"];

/**
 * Filas que se dibujan de una vez. Con miles de personas, dibujar toda la lista
 * congela la página al abrirla (~300 ms con 2 000); se muestran por partes y se
 * agregan más al acercarse al final de la lista.
 */
const FILAS_POR_TANDA = 100;
/** Dentro de "No pueden": por documentos (sin cargar o vencidos) o dados de baja. */
type MotivoFiltro = "todos" | "documentos" | "baja";

/**
 * Pantalla principal del administrador (alcance base, "una sola vista"):
 * a la izquierda el personal con un ✔/✖ de si hoy puede ingresar; a la
 * derecha la ficha de la persona elegida para subir sus documentos.
 */
export function PersonalDocumentos() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  // En el celular la ficha queda debajo de la lista: al elegir a alguien se
  // baja hasta ella, para que se vea que se abrió.
  const fichaRef = useRef<HTMLDivElement>(null);
  function elegir(id: number) {
    setSeleccionada(id);
    if (window.innerWidth < 1024) {
      requestAnimationFrame(() => fichaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }
  const [modalOpen, setModalOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [empresaFiltro, setEmpresaFiltro] = useState("todas");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [motivoFiltro, setMotivoFiltro] = useState<MotivoFiltro>("todos");

  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Tras registrar o subir un documento cambia el ✔/✖. Si falla, se avisa
  // (con "Reintentar"): si no, la lista quedaría con el ✔/✖ anterior sin que se note.
  const recargar = useCallback(async () => {
    try {
      setPersonas(await personasApi.list());
      setErrorCarga(null);
    } catch (err) {
      setErrorCarga(
        err instanceof ApiError
          ? `No se pudo actualizar la lista: ${err.message}`
          : "No se pudo actualizar la lista; puede no reflejar el último cambio.",
      );
    }
  }, []);

  const cargarTodo = useCallback(async () => {
    try {
      const [p, e] = await Promise.all([personasApi.list(), empresasApi.list()]);
      setPersonas(p);
      setEmpresas(e);
      setErrorCarga(null);
    } catch (err) {
      setErrorCarga(err instanceof ApiError ? err.message : "No se pudo cargar el personal");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarTodo();
  }, [cargarTodo]);

  function reintentar() {
    setLoading(true);
    void cargarTodo();
  }

  const q = busqueda.trim().toLowerCase();
  // Primero empresa y búsqueda; las pestañas cuentan sobre ese resultado, así
  // sus números coinciden con lo que se ve en la lista.
  const visibles = personas.filter((p) => {
    if (empresaFiltro !== "todas" && p.empresaId !== Number(empresaFiltro)) return false;
    if (!q) return true;
    return (
      `${p.nombres} ${p.apellidos}`.toLowerCase().includes(q) ||
      p.numeroDocumento.includes(q) ||
      (p.empresa?.razonSocial.toLowerCase().includes(q) ?? false)
    );
  });
  const noHabilitados = visibles.filter((p) => p.cumplimiento && !p.cumplimiento.habilitado).length;
  const deBaja = visibles.filter((p) => p.cumplimiento?.dadoDeBaja).length;
  const filtradas = visibles.filter((p) => {
    if (filtro === "habilitados") return !!p.cumplimiento?.habilitado;
    if (filtro === "no-habilitados") {
      if (p.cumplimiento?.habilitado) return false;
      if (motivoFiltro === "documentos") return !p.cumplimiento?.dadoDeBaja;
      if (motivoFiltro === "baja") return !!p.cumplimiento?.dadoDeBaja;
    }
    return true;
  });

  // Cuántas filas se dibujan; vuelve a la primera tanda al cambiar la búsqueda o los filtros.
  const claveLista = `${q}|${empresaFiltro}|${filtro}|${motivoFiltro}`;
  const [tanda, setTanda] = useState({ clave: claveLista, cantidad: FILAS_POR_TANDA });
  const cantidad = tanda.clave === claveLista ? tanda.cantidad : FILAS_POR_TANDA;
  const mostradas = filtradas.slice(0, cantidad);
  const hayMas = filtradas.length > cantidad;
  const listaRef = useRef<HTMLUListElement>(null);
  const finalRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    const final = finalRef.current;
    if (!hayMas || !final) return;
    // Al acercarse al final de la lista (600 px antes), se agrega otra tanda.
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) setTanda({ clave: claveLista, cantidad: cantidad + FILAS_POR_TANDA });
      },
      { root: listaRef.current, rootMargin: "600px 0px" },
    );
    observador.observe(final);
    return () => observador.disconnect();
  }, [hayMas, claveLista, cantidad]);

  return (
    <div>
      <PageHeader
        title="Personal y documentos"
        description="Registra al personal, sube sus documentos y revisa quién puede ingresar hoy."
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            + Nuevo personal
          </Button>
        }
      />

      {errorCarga && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <ErrorBanner className="flex-1">{errorCarga}</ErrorBanner>
          <Button type="button" variant="outline" size="sm" onClick={reintentar} disabled={loading}>
            {loading ? "Cargando…" : "Reintentar"}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* Lista */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] lg:sticky lg:top-24 lg:w-96 lg:shrink-0">
          <div className="space-y-3 border-b border-gray-100 p-4 dark:border-gray-800">
            <TableSearch value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre, DNI o empresa…" />
            <Combobox
              value={empresaFiltro}
              onChange={setEmpresaFiltro}
              aria-label="Empresa"
              options={[
                { value: "todas", label: "Todas las empresas" },
                ...[...empresas]
                  .sort((a, b) => a.razonSocial.localeCompare(b.razonSocial))
                  .map((e) => ({ value: String(e.id), label: e.razonSocial })),
              ]}
            />
            {/* Pestañas con un fondo blanco que se desliza hasta la elegida. */}
            <div className="relative flex rounded-lg bg-gray-100 p-1 text-xs dark:bg-gray-900">
              <span
                aria-hidden
                className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-md bg-white shadow-theme-xs transition-transform duration-200 ease-out dark:bg-gray-800"
                style={{ transform: `translateX(${FILTROS.indexOf(filtro) * 100}%)` }}
              />
              {(
                [
                  ["todos", loading ? "Todos" : `Todos (${visibles.length})`],
                  ["no-habilitados", loading ? "✖ No pueden" : `✖ No pueden (${noHabilitados})`],
                  ["habilitados", loading ? "✔ Pueden" : `✔ Pueden (${visibles.length - noHabilitados})`],
                ] as [Filtro, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFiltro(id)}
                  className={`relative flex-1 rounded-md px-2 py-1.5 font-medium transition-colors duration-200 ${
                    filtro === id ? "text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {filtro === "no-habilitados" && !loading && (
              <div className="flex gap-1 text-xs">
                {(
                  [
                    ["todos", `Todos (${noHabilitados})`, "Todos los que no pueden ingresar"],
                    [
                      "documentos",
                      `Documentos (${noHabilitados - deBaja})`,
                      "Activos con documentos sin cargar o vencidos: podrán ingresar al regularizarlos",
                    ],
                    ["baja", `De baja (${deBaja})`, "Dados de baja: no pueden ingresar"],
                  ] as [MotivoFiltro, string, string][]
                ).map(([id, label, ayuda]) => (
                  <button
                    key={id}
                    type="button"
                    title={ayuda}
                    onClick={() => setMotivoFiltro(id)}
                    className={`flex-1 whitespace-nowrap rounded-full px-2 py-1 font-medium transition-colors ${
                      motivoFiltro === id
                        ? "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400"
                        : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.05]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ul ref={listaRef} className="max-h-[60vh] divide-y divide-gray-100 overflow-y-auto dark:divide-gray-800 lg:max-h-[calc(100vh-20rem)]">
            {loading && <li className="p-4 text-sm text-gray-400">Cargando…</li>}
            {!loading && filtradas.length === 0 && (
              <li className="p-4 text-sm text-gray-400">
                {errorCarga && personas.length === 0
                  ? "No se pudo cargar el personal."
                  : personas.length === 0
                    ? "Todavía no hay personal registrado. Usa “+ Nuevo personal”."
                    : "Sin resultados."}
              </li>
            )}
            {mostradas.map((p) => {
              const habilitado = p.cumplimiento?.habilitado;
              const motivos = p.cumplimiento ? motivosCumplimiento(p.cumplimiento, p.motivoBaja) : [];
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => elegir(p.id)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/[0.03] ${
                      seleccionada === p.id ? "bg-brand-50 dark:bg-brand-500/10" : ""
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                        habilitado ? "bg-success-500" : "bg-error-500"
                      }`}
                      aria-label={habilitado ? "Puede ingresar" : "No puede ingresar"}
                    >
                      {habilitado ? "✔" : "✖"}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-gray-800 dark:text-white/90">
                        {p.apellidos}, {p.nombres}
                      </span>
                      <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                        {p.numeroDocumento} · {p.empresa?.razonSocial}
                      </span>
                      {motivos.length > 0 && (
                        <span className="block truncate text-xs text-error-600 dark:text-error-500">{motivos.join(" · ")}</span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
            {hayMas && (
              <li ref={finalRef} className="p-3 text-center text-xs text-gray-400">
                Mostrando {cantidad} de {filtradas.length}…
              </li>
            )}
          </ul>
        </div>

        {/* Ficha */}
        {/* Con alguien elegido, en el celular ocupa al menos una pantalla: así se
            puede bajar hasta la ficha aunque todavía esté cargando. */}
        <div
          ref={fichaRef}
          className={`min-w-0 flex-1 scroll-mt-20 ${seleccionada ? "min-h-[calc(100vh-5rem)] lg:min-h-0" : ""}`}
        >
          {seleccionada ? (
            <PersonaFicha
              key={seleccionada}
              personaId={seleccionada}
              onCambio={recargar}
            />
          ) : (
            // En el celular no se muestra: la lista ya ocupa la pantalla.
            <div className="hidden h-60 items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-400 dark:border-gray-700 lg:flex">
              Elige a una persona de la lista para ver y subir sus documentos.
            </div>
          )}
        </div>
      </div>


      <NuevaPersonaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(persona) => {
          // Puede haber una empresa nueva, y cambia el ✔/✖.
          void recargar();
          empresasApi.list().then(setEmpresas).catch(() => {}); // si falla, queda la lista anterior
          elegir(persona.id);
        }}
        empresas={empresas}
      />
    </div>
  );
}
