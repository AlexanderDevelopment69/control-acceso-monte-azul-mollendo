"use client";

import React, { useCallback, useEffect, useState } from "react";
import { guardarArchivo } from "@/lib/descargas";
import { escucharEventos } from "@/lib/ws";
import { eventosAccesoApi, panelApi, reportesApi } from "@/lib/api/endpoints";
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
import { FotoGuardada } from "@/components/personal/FotoPersonal";
import { OPCIONES_PERFIL, textoPerfil, type Perfil } from "@/lib/perfiles";
import { ListaTarjetas, TarjetaFila } from "@/components/tables/TarjetaFila";
import { DownloadIcon } from "@/icons";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth/AuthContext";
import { FranjaSinLector, useSinLector } from "@/app/(admin)/vigilancia/SinLector";

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
  const { user } = useAuth();
  // El Excel es un reporte: solo el administrador.
  const esAdministrador = user?.rol === "administrador";
  // Lector de DNI de salida desconectado: cada fila tiene "Salida" (contingencia "sin lector").
  const sinLectorSalida = useSinLector().salida;
  const [saliendo, setSaliendo] = useState<PersonaPresente | null>(null);
  const [abriendo, setAbriendo] = useState(false);
  const [errorSalida, setErrorSalida] = useState<string | null>(null);
  const [salio, setSalio] = useState<string | null>(null);

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
    let pendiente: ReturnType<typeof setTimeout> | null = null;
    let ultimaRecarga = Date.now();
    const recargar = () => {
      pendiente = null;
      ultimaRecarga = Date.now();
      void cargar();
    };
    recargar();
    // Al recuperar la conexión, recarga lo que llegó mientras estaba cortada.
    const dejarDeEscuchar = escucharEventos(
      {
        "evento-acceso": () => {
          if (pendiente) return; // ya hay una recarga programada: la incluye
          pendiente = setTimeout(recargar, Math.max(500, ultimaRecarga + RECARGA_MINIMA_MS - Date.now()));
        },
      },
      recargar,
    );
    const intervalo = setInterval(recargar, 60_000);
    return () => {
      dejarDeEscuchar();
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

  async function abrirSalida() {
    if (!saliendo) return;
    setAbriendo(true);
    setErrorSalida(null);
    try {
      await eventosAccesoApi.salidaSinLector(saliendo.personaId);
      setSalio(`Se abrió la salida de ${saliendo.nombres} ${saliendo.apellidos}.`);
      setSaliendo(null);
      void cargar();
    } catch (err) {
      setErrorSalida(err instanceof ApiError ? err.message : "No se pudo abrir la salida");
    } finally {
      setAbriendo(false);
    }
  }

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
      {sinLectorSalida && (
        <FranjaSinLector titulo="Lector de DNI de salida sin conexión.">Abra la salida desde esta lista con el botón <b>Salida</b>.</FranjaSinLector>
      )}
      {salio && (
        <ErrorBanner tono="exito" className="mb-4">
          {salio}
        </ErrorBanner>
      )}
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
        {esAdministrador && (
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
        )}
      </div>

      <Tarjeta className="@container overflow-hidden">
        {/* Con espacio, la tabla; en el celular, una tarjeta por persona. */}
        <div className="overflow-x-auto [&_th]:whitespace-nowrap">
          <AltoEstable paginaCompleta={enPagina.length === POR_PAGINA} variasPaginas={totalPaginas > 1}>
            {presentes === null && !error ? (
              <p className="px-5 py-4 text-sm text-gray-400">Cargando…</p>
            ) : visibles.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400">
                {presentes?.length ? "Sin resultados." : "No hay nadie dentro del terminal en este momento."}
              </p>
            ) : (
              <>
                {/* Todas las columnas en porcentaje, según su contenido, y la tabla nunca más angosta que la suma de los contenidos.
                    Con la columna Salida (lector de salida desconectado) necesita más ancho: 64rem; con menos, las tarjetas. */}
                <Table className={`hidden table-fixed ${sinLectorSalida ? "w-[max(100%,64rem)] @5xl:table" : "w-[max(100%,56rem)] @4xl:table"}`}>
                  <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                    <TableRow>
                      {(sinLectorSalida
                        ? [
                            ["Persona", ""],
                            ["Perfil", "w-[18%]"],
                            ["Empresa", "w-[20%]"],
                            ["Ingreso", "w-[14%]"],
                            ["Tiempo dentro", "w-[12%]"],
                            ["", "w-[10.5%]"],
                          ]
                        : [
                            ["Persona", ""],
                            ["Perfil", "w-[20.5%]"],
                            ["Empresa", "w-[23%]"],
                            ["Ingreso", "w-[15.5%]"],
                            ["Tiempo dentro", "w-[12.5%]"],
                          ]
                      ).map(([c, ancho]) => (
                        <TableCell key={c} isHeader className={`${ancho} px-4 py-3 text-start text-xs font-medium text-gray-500`}>
                          {c}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {enPagina.map((p) => {
                      const largo = ahora - new Date(p.ingreso).getTime() > MS_PERMANENCIA_LARGA;
                      return (
                        // Todas las filas con el mismo alto (un perfil largo pasa a dos líneas): el paginador no se mueve.
                        <TableRow key={p.personaId} className="h-[4.625rem]">
                          <TableCell className="px-4 py-4 text-sm">
                            {/* Con su foto, como en el Panel: el vigilante reconoce a la persona. */}
                            <div className="flex min-w-0 items-center gap-3">
                              <FotoGuardada personaId={p.personaId} tieneFoto={p.tieneFoto} version={p.fotoVersion} tamano="size-10" miniatura />
                              <span className="min-w-0">
                                <span className="block truncate text-gray-800 dark:text-white/90" title={`${p.apellidos}, ${p.nombres}`}>
                                  {p.apellidos}, {p.nombres}
                                </span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400">{p.numeroDocumento}</span>
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4 text-sm whitespace-nowrap">
                            <EtiquetaPerfil perfil={p.perfil} />
                          </TableCell>
                          <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{p.empresa}</TableCell>
                          <TableCell className="px-4 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
                            {horaIngreso(p.ingreso)}
                          </TableCell>
                          <TableCell
                            className={`px-4 py-4 text-sm whitespace-nowrap ${largo ? "font-medium text-warning-600 dark:text-orange-400" : "text-gray-600 dark:text-gray-300"}`}
                          >
                            {/* En naranja: más de 12 horas dentro (permanencia larga). */}
                            <span title={largo ? "Más de 12 horas dentro" : undefined}>{tiempoDentro(p.ingreso, ahora)}</span>
                          </TableCell>
                          {sinLectorSalida && (
                            <TableCell className="px-4 py-4 text-end">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  setErrorSalida(null);
                                  setSalio(null);
                                  setSaliendo(p);
                                }}
                              >
                                Salida
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <ListaTarjetas ocultar={sinLectorSalida ? "@5xl:hidden" : "@4xl:hidden"}>
                  {enPagina.map((p) => {
                    const largo = ahora - new Date(p.ingreso).getTime() > MS_PERMANENCIA_LARGA;
                    return (
                      <TarjetaFila
                        key={p.personaId}
                        foto={<FotoGuardada personaId={p.personaId} tieneFoto={p.tieneFoto} version={p.fotoVersion} tamano="size-11" miniatura />}
                        titulo={`${p.apellidos}, ${p.nombres}`}
                        subtitulo={`DNI ${p.numeroDocumento} · ${textoPerfil(p.perfil)}`}
                        hora={
                          // En naranja: más de 12 horas dentro (permanencia larga).
                          <span className={largo ? "text-warning-600 dark:text-orange-400" : ""} title={largo ? "Más de 12 horas dentro" : undefined}>
                            {tiempoDentro(p.ingreso, ahora)}
                          </span>
                        }
                        fecha={horaIngreso(p.ingreso)}
                      >
                        <p>{p.empresa}</p>
                        {sinLectorSalida && (
                          <Button
                            type="button"
                            size="sm"
                            className="mt-1.5 w-full"
                            onClick={() => {
                              setErrorSalida(null);
                              setSalio(null);
                              setSaliendo(p);
                            }}
                          >
                            Salida
                          </Button>
                        )}
                      </TarjetaFila>
                    );
                  })}
                </ListaTarjetas>
              </>
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
      <Modal isOpen={!!saliendo} onClose={() => setSaliendo(null)} bloqueado={abriendo} className="max-w-md p-6 sm:p-8">
        {saliendo && (
          <>
            <h2 className="mb-2 pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">Salida sin lector</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              ¿Abrir la salida de {saliendo.nombres} {saliendo.apellidos} (DNI {saliendo.numeroDocumento})? Se abre el molinete de salida.
            </p>
            {errorSalida && <ErrorBanner className="mt-4">{errorSalida}</ErrorBanner>}
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" size="sm" variant="outline" disabled={abriendo} onClick={() => setSaliendo(null)}>
                Cancelar
              </Button>
              <Button type="button" size="sm" disabled={abriendo} onClick={() => void abrirSalida()}>
                {abriendo ? "Abriendo…" : "Abrir salida"}
              </Button>
            </div>
          </>
        )}
      </Modal>
      {presentes && visibles.length !== presentes.length && (
        <p className="mt-2 text-xs text-gray-400">
          Filtrando: {visibles.length} de {presentes.length} {presentes.length === 1 ? "persona dentro" : "personas dentro"}
        </p>
      )}
    </div>
  );
}
