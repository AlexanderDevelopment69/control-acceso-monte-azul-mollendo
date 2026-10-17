"use client";

import React, { useCallback, useEffect, useState } from "react";
import { guardarArchivo } from "@/lib/descargas";
import type { Socket } from "socket.io-client";
import { connectEventosSocket } from "@/lib/ws";
import { panelApi, reportesApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { PersonaPresente } from "@/lib/api/types";
import Button from "@/components/ui/button/Button";
import Tarjeta from "@/components/ui/tarjeta/Tarjeta";
import Combobox from "@/components/form/Combobox";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { TableSearch } from "@/components/tables/TableSearch";
import { TableFooter } from "@/components/tables/TableFooter";
import { AltoEstable } from "@/components/tables/AltoEstable";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { EtiquetaPerfil } from "@/components/personal/EtiquetaPerfil";
import { OPCIONES_PERFIL, type Perfil } from "@/lib/perfiles";
import { DownloadIcon } from "@/icons";

/** Más de 12 horas dentro: se resalta (permanencia larga). */
const MS_PERMANENCIA_LARGA = 12 * 3_600_000;

/** Con movimiento continuo (cambio de turno), la lista se recarga como máximo cada tanto. */
const RECARGA_MINIMA_MS = 3_000;

const POR_PAGINA = 10;

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

/**
 * Lista de quienes están dentro ahora (vista "Presentes ahora", se llega desde
 * la tarjeta "Presentes actualmente" del Dashboard): de mayor a menor tiempo
 * dentro, con buscador, filtro de perfil y páginas de 10 (la lista llega
 * completa del servidor y se pagina aquí). Se actualiza con cada ingreso o
 * salida (tiempo real) y cada minuto, para que el tiempo dentro avance.
 */
export function Presentes() {
  const [presentes, setPresentes] = useState<PersonaPresente[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [perfil, setPerfil] = useState<"todos" | Perfil>("todos");
  const [pagina, setPagina] = useState(1);
  const [descargando, setDescargando] = useState(false);
  const [ahora, setAhora] = useState(() => Date.now());

  const cargar = useCallback(async () => {
    try {
      const r = await panelApi.presentes();
      setPresentes(r.datos);
      setAhora(new Date(r.generadoEn).getTime());
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar la lista");
    }
  }, []);

  useEffect(() => {
    let socket: Socket | undefined;
    let pendiente: ReturnType<typeof setTimeout> | null = null;
    let ultimaRecarga = Date.now();
    const recargar = () => {
      pendiente = null;
      ultimaRecarga = Date.now();
      void cargar();
    };
    recargar();
    try {
      // Al recuperar la conexión, recarga lo que llegó mientras estaba cortada.
      socket = connectEventosSocket(recargar);
      socket.on("evento-acceso", () => {
        if (pendiente) return; // ya hay una recarga programada: la incluye
        pendiente = setTimeout(recargar, Math.max(500, ultimaRecarga + RECARGA_MINIMA_MS - Date.now()));
      });
    } catch {
      // sin tiempo real, se actualiza cada minuto
    }
    const intervalo = setInterval(recargar, 60_000);
    return () => {
      socket?.disconnect();
      if (pendiente) clearTimeout(pendiente);
      clearInterval(intervalo);
    };
  }, [cargar]);

  const q = busqueda.trim().toLowerCase();
  const visibles = (presentes ?? []).filter(
    (p) =>
      (perfil === "todos" || p.perfil === perfil) &&
      (!q ||
        `${p.nombres} ${p.apellidos}`.toLowerCase().includes(q) ||
        p.numeroDocumento.includes(q) ||
        p.empresa.toLowerCase().includes(q)),
  );
  // Si salió gente y la página quedó fuera del total, se muestra la última.
  const totalPaginas = Math.max(1, Math.ceil(visibles.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const desde = (paginaActual - 1) * POR_PAGINA;
  const enPagina = visibles.slice(desde, desde + POR_PAGINA);

  async function descargar() {
    setDescargando(true);
    try {
      const { blob, nombre } = await reportesApi.descargar("presentes", { formato: "xlsx", ...(perfil !== "todos" && { perfil }) });
      guardarArchivo(blob, nombre);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo descargar el reporte");
    } finally {
      setDescargando(false);
    }
  }

  return (
    <div>
      {error && <ErrorBanner className="mb-4">{error}</ErrorBanner>}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:flex-1">
          <TableSearch value={busqueda} onChange={(v) => {
              setBusqueda(v);
              setPagina(1);
            }}
            placeholder="Buscar por nombre, DNI o empresa…" />
        </div>
        <Combobox
          className="sm:w-60"
          value={perfil}
          onChange={(v) => {
            setPerfil(v as "todos" | Perfil);
            setPagina(1);
          }}
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

      <Tarjeta className="overflow-hidden">
        {/* En el celular la tabla se desliza hacia los lados. */}
        <div className="overflow-x-auto [&_th]:whitespace-nowrap">
          <AltoEstable paginaCompleta={enPagina.length === POR_PAGINA} variasPaginas={totalPaginas > 1}>
            {presentes === null && !error ? (
              <p className="px-5 py-4 text-sm text-gray-400">Cargando…</p>
            ) : visibles.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400">
                {presentes?.length ? "Sin resultados." : "No hay nadie dentro del terminal en este momento."}
              </p>
            ) : (
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                  <TableRow>
                    {["Persona", "Perfil", "Empresa", "Ingreso", "Tiempo dentro"].map((c) => (
                      <TableCell key={c} isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">
                        {c}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {enPagina.map((p) => {
                    const largo = ahora - new Date(p.ingreso).getTime() > MS_PERMANENCIA_LARGA;
                    return (
                      <TableRow key={p.personaId}>
                        <TableCell className="px-5 py-4 text-sm">
                          <span className="block text-gray-800 dark:text-white/90">
                            {p.apellidos}, {p.nombres}
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">{p.numeroDocumento}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm whitespace-nowrap">
                          <EtiquetaPerfil perfil={p.perfil} />
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{p.empresa}</TableCell>
                        <TableCell className="px-5 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {horaIngreso(p.ingreso)}
                        </TableCell>
                        <TableCell
                          className={`px-5 py-4 text-sm whitespace-nowrap ${largo ? "font-medium text-warning-600 dark:text-orange-400" : "text-gray-600 dark:text-gray-300"}`}
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
          </AltoEstable>
        </div>
        <TableFooter
          from={visibles.length ? desde + 1 : 0}
          to={desde + enPagina.length}
          total={visibles.length}
          page={paginaActual}
          totalPages={totalPaginas}
          onPageChange={setPagina}
        />
      </Tarjeta>
      {presentes && visibles.length !== presentes.length && (
        <p className="mt-2 text-xs text-gray-400">
          Filtrando: {visibles.length} de {presentes.length} {presentes.length === 1 ? "persona dentro" : "personas dentro"}
        </p>
      )}
    </div>
  );
}
