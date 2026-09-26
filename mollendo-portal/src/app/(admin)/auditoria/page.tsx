"use client";

import React, { useEffect, useState } from "react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { auditoriaApi } from "@/lib/api/endpoints";
import type { AuditoriaEntry } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { PageHeader } from "@/components/common/PageHeader";
import { TableFooter } from "@/components/tables/TableFooter";
import { TableSearch } from "@/components/tables/TableSearch";
import { usePagination } from "@/lib/usePagination";

const ACCION_COLOR: Record<string, "success" | "warning" | "error" | "info"> = {
  crear: "success",
  modificar: "info",
  eliminar: "error",
};

function AuditoriaContent() {
  const [entradas, setEntradas] = useState<AuditoriaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    auditoriaApi.list().then((data) => {
      setEntradas(data);
      setLoading(false);
    });
  }, []);

  const filtradas = entradas.filter((e) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (e.usuario?.correo ?? "").toLowerCase().includes(q) || e.tablaAfectada.toLowerCase().includes(q);
  });
  const { page, setPage, totalPages, paginated, total, from, to } = usePagination(filtradas, 15);

  return (
    <div>
      <PageHeader
        title="Auditoría"
        description="Registro de quién creó o modificó cada dato del sistema, y cuándo."
      />

      <div className="mb-4">
        <TableSearch value={busqueda} onChange={setBusqueda} placeholder="Buscar por usuario o tabla…" />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Fecha</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Usuario</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Tabla</TableCell>
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
              {!loading && entradas.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={5}>Sin registros de auditoría todavía.</TableCell>
                </TableRow>
              )}
              {!loading && entradas.length > 0 && filtradas.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={5}>Sin resultados para esa búsqueda.</TableCell>
                </TableRow>
              )}
              {paginated.map((entrada) => (
                <TableRow key={entrada.id}>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {new Date(entrada.fechaHora).toLocaleString("es-PE")}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {entrada.usuario?.correo ?? "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{entrada.tablaAfectada}</TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">#{entrada.registroId}</TableCell>
                  <TableCell className="px-5 py-4 text-sm">
                    <Badge color={ACCION_COLOR[entrada.accion] ?? "light"}>{entrada.accion}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {!loading && <TableFooter from={from} to={to} total={total} page={page} totalPages={totalPages} onPageChange={setPage} />}
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
