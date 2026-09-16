"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { personasApi, solicitudesVisitaApi } from "@/lib/api/endpoints";
import type { Persona, SolicitudVisita } from "@/lib/api/types";
import { MetricCard } from "@/components/common/MetricCard";
import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { CalenderIcon, GroupIcon, TaskIcon } from "@/icons";

export function EmpresaHome() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudVisita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([personasApi.list(), solicitudesVisitaApi.list()]).then(([personasData, solicitudesData]) => {
      setPersonas(personasData);
      setSolicitudes(solicitudesData);
      setLoading(false);
    });
  }, []);

  const activos = personas.filter((p) => p.estado === "activo").length;
  const proximasVisitas = solicitudes
    .filter((s) => s.estado === "programada")
    .sort((a, b) => new Date(a.fechaHoraProgramada).getTime() - new Date(b.fechaHoraProgramada).getTime())
    .slice(0, 5);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">Inicio</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          icon={<GroupIcon className="text-gray-800 size-6 dark:text-white/90" />}
          label="Personal registrado"
          value={loading ? "…" : personas.length}
          caption={loading ? undefined : `${activos} activos`}
        />
        <MetricCard
          icon={<TaskIcon className="text-gray-800 size-6 dark:text-white/90" />}
          label="Personal sin puesto asignado"
          value={loading ? "…" : personas.filter((p) => !p.puestoId).length}
        />
        <MetricCard
          icon={<CalenderIcon className="text-gray-800 size-6 dark:text-white/90" />}
          label="Visitas programadas"
          value={loading ? "…" : solicitudes.filter((s) => s.estado === "programada").length}
        />
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <h2 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">Accesos rápidos</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          <Link href="/personal" className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5">
            <GroupIcon className="size-4" /> Mi personal
          </Link>
          <Link href="/visitas" className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5">
            <CalenderIcon className="size-4" /> Solicitudes de visita
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Próximas visitas</h2>
          <Link href="/visitas" className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
            Ver todas
          </Link>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Visita</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">A quién visita</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Fecha</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Estado</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={4}>Cargando…</TableCell>
                </TableRow>
              )}
              {!loading && proximasVisitas.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={4}>No hay visitas programadas.</TableCell>
                </TableRow>
              )}
              {proximasVisitas.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {s.persona ? `${s.persona.nombres} ${s.persona.apellidos}` : `#${s.personaId}`}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{s.personaVisitada}</TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {new Date(s.fechaHoraProgramada).toLocaleString("es-PE")}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm">
                    <Badge color="success">{s.estado}</Badge>
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
