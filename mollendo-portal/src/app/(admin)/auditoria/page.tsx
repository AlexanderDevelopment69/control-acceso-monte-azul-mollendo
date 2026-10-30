"use client";

import React, { useCallback, useEffect, useState } from "react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { auditoriaApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { AuditoriaEntry, Paginado } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import Button from "@/components/ui/button/Button";
import { TableFooter } from "@/components/tables/TableFooter";
import { AltoEstable } from "@/components/tables/AltoEstable";
import { AvisoTarjetas, ListaTarjetas, TarjetaFila } from "@/components/tables/TarjetaFila";
import { TableSearch } from "@/components/tables/TableSearch";
import { useDiferido } from "@/lib/useDiferido";
import { hoy, pieDePagina } from "@/lib/paginaServidor";
import DatePicker from "@/components/form/date-picker";
import Tarjeta from "@/components/ui/tarjeta/Tarjeta";

// Nombres de las tablas de la base de datos, como los entiende quien usa el sistema.
const TABLA_LABEL: Record<string, string> = {
  persona: "Personal",
  empresa: "Empresa",
  documento_persona: "Documento",
  tipo_documento: "Tipo de documento",
  usuario: "Usuario",
  evento_acceso: "Ingreso o salida (corrección manual)",
  periodo_verificacion_manual: "Verificación manual",
  ajuste_sistema: "Orden de ingreso",
  tarjeta_contingencia: "Tarjeta de contingencia",
  equipo: "Equipos",
  molinete: "Molinete",
  salida_sin_dni: "Salida sin DNI",
  sincronizacion_g4: "Sincronización con el equipo facial",
  reporte: "Reporte",
};
const tablaLabel = (tabla: string) => TABLA_LABEL[tabla] ?? tabla;

const ACCION_COLOR: Record<string, "success" | "warning" | "error" | "info"> = {
  crear: "success",
  modificar: "info",
  eliminar: "error",
  inicio_sesion: "success",
  inicio_sesion_fallido: "warning",
  desconexion: "error",
  reconexion: "success",
  apertura: "warning",
  ejecucion: "info",
  descarga: "info",
  consulta: "info",
};

const ACCION_LABEL: Record<string, string> = {
  inicio_sesion: "inicio de sesión",
  inicio_sesion_fallido: "inicio rechazado",
  desconexion: "desconectado",
  reconexion: "conectado",
  apertura: "apertura manual",
  ejecucion: "ejecución",
  descarga: "descarga",
  consulta: "consulta",
};

/** Lo que hace el propio sistema, sin un usuario (desconexiones, revisión diaria con el equipo facial). */
const DEL_SISTEMA = ["equipo", "sincronizacion_g4"];

const esInicioSesion = (accion: string) => accion === "inicio_sesion" || accion === "inicio_sesion_fallido";

/** Quién lo hizo: el usuario; si no hay (inicio rechazado, equipos, cargas), lo que corresponda. */
function quienLoHizo(entrada: AuditoriaEntry): string {
  return (
    entrada.usuario?.correo ??
    (esInicioSesion(entrada.accion)
      ? (entrada.detalle?.split(" · ")[0] ?? "—")
      : DEL_SISTEMA.includes(entrada.tablaAfectada)
        ? "Sistema"
        : "Carga de datos (script)")
  );
}

/**
 * Columna Registro: desde dónde se inició sesión (y por qué se rechazó), o qué se hizo.
 * `completo`: todo el texto (en la tarjeta del celular, donde no se puede pasar el mouse para verlo).
 */
function Registro({ entrada, completo = false }: { entrada: AuditoriaEntry; completo?: boolean }) {
  if (esInicioSesion(entrada.accion)) {
    // Inicio de sesión: desde dónde y, si se rechazó, por qué.
    return (
      <span className="text-xs">
        {entrada.ip ? `IP ${entrada.ip}` : "—"}
        {entrada.detalle?.includes(" · ") && <span className="block text-gray-500">{entrada.detalle.split(" · ")[1]}</span>}
      </span>
    );
  }
  // Qué se hizo: el equipo y cuánto estuvo sin conexión, el reporte y sus filtros, el documento abierto…
  // En la tabla, hasta dos líneas (completo al pasar el mouse): todas las filas miden lo mismo.
  if (entrada.detalle) {
    return (
      <span className={`text-xs ${completo ? "break-words" : "line-clamp-2"}`} title={completo ? undefined : entrada.detalle}>
        {entrada.detalle}
      </span>
    );
  }
  return <>{`#${entrada.registroId}`}</>;
}

const POR_PAGINA = 10;

function AuditoriaContent() {
  const [lista, setLista] = useState<Paginado<AuditoriaEntry> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros: se aplican en el servidor, sobre todos los registros.
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const busquedaDiferida = useDiferido(busqueda.trim());
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const cargar = useCallback(async () => {
    try {
      const datos = await auditoriaApi.list({ pagina, porPagina: POR_PAGINA, busqueda: busquedaDiferida, desde, hasta });
      // Si la página quedó fuera del total (p. ej. tras filtrar), vuelve a la primera.
      if (datos.datos.length === 0 && datos.total > 0 && pagina > 1) {
        setPagina(1);
        return;
      }
      setLista(datos);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar la auditoría");
    } finally {
      setLoading(false);
    }
  }, [pagina, busquedaDiferida, desde, hasta]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  function reintentar() {
    setLoading(true);
    void cargar();
  }

  const entradas = lista?.datos ?? [];
  const pie = pieDePagina(lista);
  const filtrando = !!(busquedaDiferida || desde || hasta);

  return (
    <div>
      <PageHeader
        title="Auditoría"
        description="Registro de quién hizo cada cambio o acción en el sistema, y cuándo."
      />

      {error && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <ErrorBanner className="flex-1">{error}</ErrorBanner>
          <Button type="button" variant="outline" size="sm" onClick={reintentar} disabled={loading}>
            {loading ? "Cargando…" : "Reintentar"}
          </Button>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:flex-1">
          <TableSearch
            value={busqueda}
            onChange={(v) => {
              setBusqueda(v);
              setPagina(1);
            }}
            placeholder="Buscar por usuario, dato o registro (nombre, DNI…)"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-0 flex-1 sm:w-40 sm:flex-none">
            <DatePicker
              id="auditoria-desde"
              placeholder="Desde"
              max={hasta || hoy()}
              value={desde}
              onChange={(v) => {
                setDesde(v);
                setPagina(1);
              }}
            />
          </div>
          <div className="min-w-0 flex-1 sm:w-40 sm:flex-none">
            <DatePicker
              id="auditoria-hasta"
              placeholder="Hasta"
              min={desde || undefined}
              max={hoy()}
              value={hasta}
              onChange={(v) => {
                setHasta(v);
                setPagina(1);
              }}
            />
          </div>
          {(desde || hasta) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setDesde("");
                setHasta("");
                setPagina(1);
              }}
            >
              Todas las fechas
            </Button>
          )}
        </div>
      </div>

      <Tarjeta className="@container overflow-hidden">
        {/* Con espacio, la tabla; en el celular, una tarjeta por registro. */}
        <div className="overflow-x-auto [&_th]:whitespace-nowrap">
          <AltoEstable paginaCompleta={entradas.length === POR_PAGINA} variasPaginas={(lista?.total ?? 0) > POR_PAGINA}>
            {/* Todas las columnas en porcentaje, según su contenido, y la tabla nunca más angosta que la suma de los contenidos:
                en pantalla ancha el espacio se reparte entre todas, nada se pega en el ancho mínimo y las columnas
                no cambian de lugar al pasar de página. */}
            <Table className="hidden w-[max(100%,58rem)] table-fixed @4xl:table">
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="w-[22%] px-5 py-3 text-start text-xs font-medium text-gray-500">Fecha</TableCell>
                  <TableCell isHeader className="w-[26%] px-5 py-3 text-start text-xs font-medium text-gray-500">Usuario</TableCell>
                  <TableCell isHeader className="w-[12%] px-5 py-3 text-start text-xs font-medium text-gray-500">Dato</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Registro</TableCell>
                  <TableCell isHeader className="w-[17%] px-5 py-3 text-start text-xs font-medium text-gray-500">Acción</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading && (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={5}>Cargando…</TableCell>
                  </TableRow>
                )}
                {!loading && error && !lista && (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={5}>No se pudo cargar la auditoría.</TableCell>
                  </TableRow>
                )}
                {!loading && lista && entradas.length === 0 && (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={5}>
                      {filtrando ? "Sin resultados para esa búsqueda o esas fechas." : "Sin registros de auditoría todavía."}
                    </TableCell>
                  </TableRow>
                )}
                {!loading && entradas.map((entrada) => (
                  // Todas las filas con el alto de las de dos líneas (inicio de sesión con su motivo, un dato largo; el detalle, hasta dos):
                  // así cada página mide lo mismo y el paginador no se mueve.
                  <TableRow key={entrada.id} className="h-[4.625rem]">
                    <TableCell className="whitespace-nowrap px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(entrada.fechaHora).toLocaleString("es-PE")}
                    </TableCell>
                    <TableCell className="break-words px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{quienLoHizo(entrada)}</TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{tablaLabel(entrada.tablaAfectada)}</TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <Registro entrada={entrada} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-5 py-4 text-sm">
                      <Badge color={ACCION_COLOR[entrada.accion] ?? "light"}>{ACCION_LABEL[entrada.accion] ?? entrada.accion}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ListaTarjetas>
              {loading && <AvisoTarjetas>Cargando…</AvisoTarjetas>}
              {!loading && error && !lista && <AvisoTarjetas>No se pudo cargar la auditoría.</AvisoTarjetas>}
              {!loading && lista && entradas.length === 0 && (
                <AvisoTarjetas>{filtrando ? "Sin resultados para esa búsqueda o esas fechas." : "Sin registros de auditoría todavía."}</AvisoTarjetas>
              )}
              {!loading &&
                entradas.map((entrada) => {
                  const d = new Date(entrada.fechaHora);
                  return (
                    <TarjetaFila
                      key={entrada.id}
                      titulo={quienLoHizo(entrada)}
                      subtitulo={tablaLabel(entrada.tablaAfectada)}
                      hora={d.toLocaleTimeString("es-PE")}
                      fecha={d.toLocaleDateString("es-PE")}
                    >
                      <div>
                        <Badge color={ACCION_COLOR[entrada.accion] ?? "light"}>{ACCION_LABEL[entrada.accion] ?? entrada.accion}</Badge>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        <Registro entrada={entrada} completo />
                      </div>
                    </TarjetaFila>
                  );
                })}
            </ListaTarjetas>
          </AltoEstable>
        </div>
        {!loading && <TableFooter {...pie} onPageChange={setPagina} />}
      </Tarjeta>
    </div>
  );
}

export default function AuditoriaPage() {
  return (
    <RequireRole roles={["administrador", "soporte"]}>
      <AuditoriaContent />
    </RequireRole>
  );
}
