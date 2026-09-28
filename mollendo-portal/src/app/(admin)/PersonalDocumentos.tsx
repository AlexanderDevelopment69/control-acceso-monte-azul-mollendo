"use client";

import React, { useCallback, useEffect, useState } from "react";
import { empresasApi, personasApi } from "@/lib/api/endpoints";
import type { Empresa, Persona } from "@/lib/api/types";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSearch } from "@/components/tables/TableSearch";
import { NuevaPersonaModal } from "@/components/personal/NuevaPersonaModal";
import { PersonaFicha, motivosCumplimiento } from "@/components/personal/PersonaFicha";

type Filtro = "todos" | "habilitados" | "no-habilitados";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [empresaFiltro, setEmpresaFiltro] = useState("todas");
  const [filtro, setFiltro] = useState<Filtro>("todos");

  // Tras registrar o subir un documento cambia el ✔/✖.
  const recargar = useCallback(async () => {
    setPersonas(await personasApi.list());
  }, []);

  useEffect(() => {
    Promise.all([personasApi.list(), empresasApi.list()])
      .then(([p, e]) => {
        setPersonas(p);
        setEmpresas(e);
      })
      .finally(() => setLoading(false));
  }, []);

  const q = busqueda.trim().toLowerCase();
  const filtradas = personas.filter((p) => {
    if (empresaFiltro !== "todas" && p.empresaId !== Number(empresaFiltro)) return false;
    if (filtro === "habilitados" && !p.cumplimiento?.habilitado) return false;
    if (filtro === "no-habilitados" && p.cumplimiento?.habilitado) return false;
    if (!q) return true;
    return (
      `${p.nombres} ${p.apellidos}`.toLowerCase().includes(q) ||
      p.numeroDocumento.includes(q) ||
      (p.empresa?.razonSocial.toLowerCase().includes(q) ?? false)
    );
  });
  const noHabilitados = personas.filter((p) => p.cumplimiento && !p.cumplimiento.habilitado).length;

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

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* Lista */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] lg:sticky lg:top-24 lg:w-96 lg:shrink-0">
          <div className="space-y-3 border-b border-gray-100 p-4 dark:border-gray-800">
            <TableSearch value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre, DNI o empresa…" />
            <Select
              key={`empresas-${empresas.length}`}
              defaultValue={empresaFiltro}
              onChange={setEmpresaFiltro}
              mostrarPlaceholder={false}
              options={[
                { value: "todas", label: "Todas las empresas" },
                ...[...empresas]
                  .sort((a, b) => a.razonSocial.localeCompare(b.razonSocial))
                  .map((e) => ({ value: String(e.id), label: e.razonSocial })),
              ]}
            />
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1 text-xs dark:bg-gray-900">
              {(
                [
                  ["todos", loading ? "Todos" : `Todos (${personas.length})`],
                  ["no-habilitados", loading ? "✖ No pueden" : `✖ No pueden (${noHabilitados})`],
                  ["habilitados", loading ? "✔ Pueden" : `✔ Pueden (${personas.length - noHabilitados})`],
                ] as [Filtro, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFiltro(id)}
                  className={`flex-1 rounded-md px-2 py-1.5 font-medium ${
                    filtro === id
                      ? "bg-white text-gray-900 shadow-theme-xs dark:bg-gray-800 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <ul className="max-h-[60vh] divide-y divide-gray-100 overflow-y-auto dark:divide-gray-800 lg:max-h-[calc(100vh-20rem)]">
            {loading && <li className="p-4 text-sm text-gray-400">Cargando…</li>}
            {!loading && filtradas.length === 0 && (
              <li className="p-4 text-sm text-gray-400">
                {personas.length === 0 ? "Todavía no hay personal registrado. Usa “+ Nuevo personal”." : "Sin resultados."}
              </li>
            )}
            {filtradas.map((p) => {
              const habilitado = p.cumplimiento?.habilitado;
              const motivos = p.cumplimiento ? motivosCumplimiento(p.cumplimiento) : [];
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setSeleccionada(p.id)}
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
          </ul>
        </div>

        {/* Ficha */}
        <div className="min-w-0 flex-1">
          {seleccionada ? (
            <PersonaFicha
              key={seleccionada}
              personaId={seleccionada}
              onCambio={recargar}
            />
          ) : (
            <div className="flex h-60 items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-400 dark:border-gray-700">
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
          recargar();
          empresasApi.list().then(setEmpresas);
          setSeleccionada(persona.id);
        }}
        empresas={empresas}
      />
    </div>
  );
}
