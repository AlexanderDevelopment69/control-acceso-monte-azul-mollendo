"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { auditoriaApi, empresasApi, panelApi } from "@/lib/api/endpoints";
import type { AuditoriaEntry, Empresa, ResumenPanel } from "@/lib/api/types";
import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { AlertIcon, DocsIcon, GroupIcon, TaskIcon } from "@/icons";

const ACCION_COLOR: Record<string, "success" | "warning" | "error" | "info"> = {
  crear: "success",
  modificar: "info",
  aprobar: "success",
  eliminar: "error",
};

export function AdminHome() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [resumen, setResumen] = useState<ResumenPanel | null>(null);
  const [auditoria, setAuditoria] = useState<AuditoriaEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([empresasApi.list(), panelApi.resumen(), auditoriaApi.list()]).then(
      ([empresasData, resumenData, auditoriaData]) => {
        setEmpresas(empresasData);
        setResumen(resumenData);
        setAuditoria(auditoriaData.slice(0, 5));
        setLoading(false);
      },
    );
  }, []);

  const activas = empresas.filter((e) => e.estado === "activa").length;

  return (
    <div>
      <PageHeader
        title="Inicio"
        description="Resumen general del sistema: empresas, denegaciones de acceso y actividad reciente."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<GroupIcon className="text-gray-800 size-6 dark:text-white/90" />}
          label="Empresas registradas"
          value={loading ? "…" : empresas.length}
          caption={loading ? undefined : `${activas} activas`}
        />
        <MetricCard
          icon={<AlertIcon className="text-gray-800 size-6 dark:text-white/90" />}
          label="Denegaciones hoy"
          value={loading || !resumen ? "…" : resumen.denegacionesHoy}
        />
        <MetricCard
          icon={<AlertIcon className="text-gray-800 size-6 dark:text-white/90" />}
          label="Alcohol no conforme hoy"
          value={loading || !resumen ? "…" : resumen.alcoholNoConformeHoy}
        />
        <MetricCard
          icon={<DocsIcon className="text-gray-800 size-6 dark:text-white/90" />}
          label="Documentos vencidos"
          value={loading || !resumen ? "…" : resumen.documentosVencidos}
        />
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <h2 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">Accesos rápidos</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Link href="/empresas" className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5">
            <GroupIcon className="size-4" /> Empresas
          </Link>
          <Link href="/puestos" className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5">
            <TaskIcon className="size-4" /> Puestos
          </Link>
          <Link href="/tipos-documento" className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5">
            <DocsIcon className="size-4" /> Tipos de documento
          </Link>
          <Link href="/vigilancia" className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5">
            <AlertIcon className="size-4" /> Vigilancia
          </Link>
          <Link href="/sistema" className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5">
            <DocsIcon className="size-4" /> Sistema y APIs
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Actividad reciente</h2>
          <Link href="/auditoria" className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
            Ver toda la auditoría
          </Link>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Fecha</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Usuario</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Tabla</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Acción</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={4}>Cargando…</TableCell>
                </TableRow>
              )}
              {!loading && auditoria.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={4}>Sin actividad todavía.</TableCell>
                </TableRow>
              )}
              {auditoria.map((entrada) => (
                <TableRow key={entrada.id}>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {new Date(entrada.fechaHora).toLocaleString("es-PE")}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {entrada.usuario?.correo ?? "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{entrada.tablaAfectada}</TableCell>
                  <TableCell className="px-5 py-4 text-sm">
                    <Badge color={ACCION_COLOR[entrada.accion] ?? "light"}>{entrada.accion}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
