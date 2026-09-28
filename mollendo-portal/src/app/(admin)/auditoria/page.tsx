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
import { TableSearch } from "@/components/tables/TableSearch";
import { useDiferido } from "@/lib/useDiferido";
import { pieDePagina } from "@/lib/paginaServidor";
import DatePicker from "@/components/form/date-picker";

// Nombres de las tablas de la base de datos, como los entiende quien usa el sistema.
const TABLA_LABEL: Record<string, string> = {
  persona: "Personal",
  empresa: "Empresa",
  documento_persona: "Documento",
  tipo_documento: "Tipo de documento",
  usuario: "Usuario",
};
const tablaLabel = (tabla: string) => TABLA_LABEL[tabla] ?? tabla;

const ACCION_COLOR: Record<string, "success" | "warning" | "error" | "info"> = {
  crear: "success",
  modificar: "info",
  eliminar: "error",
};

const POR_PAGINA = 15;

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
        description="Registro de quién creó o modificó cada dato del sistema, y cuándo."
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
            placeholder="Buscar por usuario o dato (personal, documento…)"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-0 flex-1 sm:w-40 sm:flex-none">
            <DatePicker
              id="auditoria-desde"
              placeholder="Desde"
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

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Fecha</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Usuario</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Dato</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Registro</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Acción</TableCell>
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
                <TableRow key={entrada.id}>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {new Date(entrada.fechaHora).toLocaleString("es-PE")}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {entrada.usuario?.correo ?? "Carga de datos (script)"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{tablaLabel(entrada.tablaAfectada)}</TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">#{entrada.registroId}</TableCell>
                  <TableCell className="px-5 py-4 text-sm">
                    <Badge color={ACCION_COLOR[entrada.accion] ?? "light"}>{entrada.accion}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {!loading && <TableFooter {...pie} onPageChange={setPagina} />}
      </div>
    </div>
  );
}

export default function AuditoriaPage() {
  return (
    <RequireRole roles={["administrador"]}>
      <AuditoriaContent />
    </RequireRole>
  );
}
