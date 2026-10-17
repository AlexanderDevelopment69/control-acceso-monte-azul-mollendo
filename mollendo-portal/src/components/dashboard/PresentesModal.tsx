"use client";

import React, { useEffect, useState } from "react";
import { panelApi, reportesApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { PersonaPresente } from "@/lib/api/types";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Combobox from "@/components/form/Combobox";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { TableSearch } from "@/components/tables/TableSearch";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { EtiquetaPerfil } from "@/components/personal/EtiquetaPerfil";
import { OPCIONES_PERFIL, type Perfil } from "@/lib/perfiles";
import { DownloadIcon } from "@/icons";

/** Más de 12 horas dentro: se resalta (permanencia larga). */
const MS_PERMANENCIA_LARGA = 12 * 3_600_000;

/** "45 min", "9 h 05 min", "3 días 4 h". */
export function tiempoDentro(desde: string, ahora: number): string {
  const minutos = Math.max(0, Math.floor((ahora - new Date(desde).getTime()) / 60_000));
  const horas = Math.floor(minutos / 60);
  if (horas >= 48) return `${Math.floor(horas / 24)} días ${horas % 24} h`;
  if (horas === 0) return `${minutos} min`;
  return `${horas} h ${String(minutos % 60).padStart(2, "0")} min`;
}

/** Hora del ingreso; si no fue hoy, también la fecha. */
function horaIngreso(iso: string): string {
  const fecha = new Date(iso);
  const hoy = new Date().toDateString() === fecha.toDateString();
  return hoy
    ? fecha.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
    : fecha.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

/** Guarda el archivo descargado con el nombre que manda el servidor. */
function guardar(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * Lista de quienes están dentro ahora (tarjeta "Presentes actualmente" del
 * Dashboard): de mayor a menor tiempo dentro, con buscador y filtro de perfil.
 * Se vuelve a leer cuando el Dashboard se actualiza (`actualizado`).
 */
export function PresentesModal({ isOpen, onClose, actualizado }: { isOpen: boolean; onClose: () => void; actualizado?: string }) {
  const [presentes, setPresentes] = useState<PersonaPresente[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [perfil, setPerfil] = useState<"todos" | Perfil>("todos");
  const [descargando, setDescargando] = useState(false);
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    if (!isOpen) return;
    let activo = true;
    panelApi
      .presentes()
      .then((r) => {
        if (!activo) return;
        setPresentes(r.datos);
        setAhora(new Date(r.generadoEn).getTime());
        setError(null);
      })
      .catch((err) => activo && setError(err instanceof ApiError ? err.message : "No se pudo cargar la lista"));
    return () => {
      activo = false;
    };
  }, [isOpen, actualizado]);

  const q = busqueda.trim().toLowerCase();
  const visibles = (presentes ?? []).filter(
    (p) =>
      (perfil === "todos" || p.perfil === perfil) &&
      (!q ||
        `${p.nombres} ${p.apellidos}`.toLowerCase().includes(q) ||
        p.numeroDocumento.includes(q) ||
        p.empresa.toLowerCase().includes(q)),
  );

  async function descargar() {
    setDescargando(true);
    try {
      const { blob, nombre } = await reportesApi.descargar("presentes", { formato: "xlsx", ...(perfil !== "todos" && { perfil }) });
      guardar(blob, nombre);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo descargar el reporte");
    } finally {
      setDescargando(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl p-6 sm:p-8">
      <h2 className="pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">
        Presentes ahora{presentes && `: ${presentes.length}`}
      </h2>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Personas cuyo último movimiento es un ingreso, de mayor a menor tiempo dentro (en naranja, más de 12 horas). Se
        actualiza sola con cada ingreso o salida.
      </p>
      {error && <ErrorBanner className="mb-4">{error}</ErrorBanner>}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <TableSearch value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre, DNI o empresa…" />
        </div>
        <Combobox
          className="sm:w-60"
          value={perfil}
          onChange={(v) => setPerfil(v as "todos" | Perfil)}
          aria-label="Perfil"
          options={[{ value: "todos", label: "Todos los perfiles" }, ...OPCIONES_PERFIL]}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void descargar()}
          disabled={descargando || !presentes?.length}
          startIcon={<DownloadIcon className="size-4" />}
        >
          {descargando ? "Descargando…" : "Descargar Excel"}
        </Button>
      </div>

      <div className="max-h-[55vh] overflow-auto rounded-lg border border-gray-100 dark:border-gray-800 [&_th]:whitespace-nowrap">
        {presentes === null && !error ? (
          <p className="p-4 text-sm text-gray-400">Cargando…</p>
        ) : visibles.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">
            {presentes?.length ? "Sin resultados." : "No hay nadie dentro del terminal en este momento."}
          </p>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
              <TableRow>
                {["Persona", "Perfil", "Empresa", "Ingreso", "Tiempo dentro"].map((c) => (
                  <TableCell key={c} isHeader className="px-4 py-3 text-start text-xs font-medium text-gray-500">
                    {c}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {visibles.map((p) => {
                const largo = ahora - new Date(p.ingreso).getTime() > MS_PERMANENCIA_LARGA;
                return (
                  <TableRow key={p.personaId}>
                    <TableCell className="px-4 py-3 text-sm">
                      <span className="block text-gray-800 dark:text-white/90">
                        {p.apellidos}, {p.nombres}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">{p.numeroDocumento}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm whitespace-nowrap">
                      <EtiquetaPerfil perfil={p.perfil} />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{p.empresa}</TableCell>
                    <TableCell className="px-4 py-3 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {horaIngreso(p.ingreso)}
                    </TableCell>
                    <TableCell
                      className={`px-4 py-3 text-sm whitespace-nowrap ${largo ? "font-medium text-warning-600 dark:text-orange-400" : "text-gray-600 dark:text-gray-300"}`}
                    >
                      {/* En naranja: más de 12 horas dentro (permanencia larga). */}
                      <span title={largo ? "Más de 12 horas dentro" : undefined}>{tiempoDentro(p.ingreso, ahora)}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
      {presentes && visibles.length !== presentes.length && (
        <p className="mt-2 text-xs text-gray-400">
          Mostrando {visibles.length} de {presentes.length}
        </p>
      )}
    </Modal>
  );
}
