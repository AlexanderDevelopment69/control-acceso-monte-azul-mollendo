"use client";

import React, { useEffect, useState } from "react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { auditoriaApi } from "@/lib/api/endpoints";
import type { AuditoriaEntry } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Pagination from "@/components/tables/Pagination";
import { usePagination } from "@/lib/usePagination";

const ACCION_COLOR: Record<string, "success" | "warning" | "error" | "info"> = {
  crear: "success",
  modificar: "info",
  aprobar: "success",
  eliminar: "error",
};

function AuditoriaContent() {
  const [entradas, setEntradas] = useState<AuditoriaEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditoriaApi.list().then((data) => {
      setEntradas(data);
      setLoading(false);
    });
  }, []);

  const { page, setPage, totalPages, paginated } = usePagination(entradas, 15);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">Auditoría</h1>

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
        {!loading && totalPages > 1 && (
          <div className="flex justify-center border-t border-gray-100 px-5 py-4 dark:border-gray-800">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuditoriaPage() {
  return (
    <RequireRole roles={["administracion"]}>
      <AuditoriaContent />
    </RequireRole>
  );
}
