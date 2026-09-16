"use client";

import React, { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { RequireRole } from "@/lib/auth/RequireRole";
import { connectEventosSocket } from "@/lib/ws";
import { eventosAccesoApi, panelApi } from "@/lib/api/endpoints";
import type { EventoAcceso, ResumenPanel } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { TableFooter } from "@/components/tables/TableFooter";
import { TableSearch } from "@/components/tables/TableSearch";
import { usePagination } from "@/lib/usePagination";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

interface EventoLive {
  eventoId: number;
  resultado: "autorizado" | "denegado";
  persona: { id: number; nombres: string; apellidos: string };
  motivos: Record<string, unknown>;
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function MotivoDenegacion({ evento }: { evento: Pick<EventoAcceso, "denegadoPorBaja" | "denegadoPorAlcohol" | "denegadoPorDocumentos" | "denegadoSinIngresoPrevio"> }) {
  if (evento.denegadoPorBaja) return <Badge color="error">Dado de baja</Badge>;
  const motivos: string[] = [];
  if (evento.denegadoPorAlcohol) motivos.push("Alcohol");
  if (evento.denegadoPorDocumentos) motivos.push("Documentos");
  if (evento.denegadoSinIngresoPrevio) motivos.push("Sin ingreso previo");
  if (motivos.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {motivos.map((m) => (
        <Badge key={m} color="error" size="sm">{m}</Badge>
      ))}
    </div>
  );
}

function VigilanciaContent() {
  const [resumen, setResumen] = useState<ResumenPanel | null>(null);
  const [eventos, setEventos] = useState<EventoAcceso[]>([]);
  const [eventosVivos, setEventosVivos] = useState<EventoLive[]>([]);
  const [contingencia, setContingencia] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      const [r, e] = await Promise.all([panelApi.resumen(), eventosAccesoApi.list()]);
      setResumen(r);
      setEventos(e);
      setLoading(false);
    }
    cargar();
  }, []);

  useEffect(() => {
    let socket: Socket | undefined;
    try {
      socket = connectEventosSocket();
      socket.on("evento-acceso", (payload: EventoLive) => {
        setEventosVivos((prev) => [payload, ...prev].slice(0, 20));
      });
    } catch {
      // el panel sigue funcionando sin tiempo real si el socket falla
    }
    return () => {
      socket?.disconnect();
    };
  }, []);

  // Modo contingencia: si /health deja de responder, el servidor central
  // no está disponible (spec, sección 4.5 / 9.9).
  useEffect(() => {
    async function chequear() {
      try {
        const res = await fetch(`${API_URL}/health`);
        setContingencia(!res.ok);
      } catch {
        setContingencia(true);
      }
    }
    chequear();
    const interval = setInterval(chequear, 15000);
    return () => clearInterval(interval);
  }, []);

  const [busqueda, setBusqueda] = useState("");
  const filtrados = eventos.filter((ev) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    const nombre = ev.persona ? `${ev.persona.nombres} ${ev.persona.apellidos}` : "";
    return nombre.toLowerCase().includes(q);
  });
  const { page, setPage, totalPages, paginated, total, from, to } = usePagination(filtrados, 10);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Panel de vigilancia</h1>
        {contingencia && (
          <Badge color="error" size="md">⚠ Modo contingencia — servidor central no responde</Badge>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Denegaciones hoy" value={resumen?.denegacionesHoy ?? 0} color="text-error-500" />
        <StatCard label="Alcohol no conforme hoy" value={resumen?.alcoholNoConformeHoy ?? 0} color="text-warning-500" />
        <StatCard label="Documentos vencidos" value={resumen?.documentosVencidos ?? 0} color="text-gray-700 dark:text-gray-300" />
      </div>

      {eventosVivos.length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Eventos en tiempo real</h2>
          <ul className="space-y-2">
            {eventosVivos.map((ev, i) => (
              <li key={`${ev.eventoId}-${i}`} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  {ev.persona.nombres} {ev.persona.apellidos}
                </span>
                <Badge color={ev.resultado === "autorizado" ? "success" : "error"}>{ev.resultado}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4">
        <TableSearch value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre…" />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Hora</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Persona</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Movimiento</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Resultado</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Motivo</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={5}>Cargando…</TableCell>
                </TableRow>
              )}
              {!loading && eventos.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={5}>Sin eventos registrados todavía.</TableCell>
                </TableRow>
              )}
              {!loading && eventos.length > 0 && filtrados.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={5}>Sin resultados para esa búsqueda.</TableCell>
                </TableRow>
              )}
              {paginated.map((ev) => (
                <TableRow key={ev.id}>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {new Date(ev.fechaHora).toLocaleString("es-PE")}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {ev.persona ? `${ev.persona.nombres} ${ev.persona.apellidos}` : `#${ev.personaId}`}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300 capitalize">{ev.tipoMovimiento}</TableCell>
                  <TableCell className="px-5 py-4 text-sm">
                    <Badge color={ev.resultado === "autorizado" ? "success" : "error"}>{ev.resultado}</Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm">
                    <MotivoDenegacion evento={ev} />
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

export default function VigilanciaPage() {
  return (
    <RequireRole roles={["vigilancia", "administracion"]}>
      <VigilanciaContent />
    </RequireRole>
  );
}
