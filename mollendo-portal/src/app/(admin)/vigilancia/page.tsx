"use client";

import React, { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { RequireRole } from "@/lib/auth/RequireRole";
import { connectEventosSocket } from "@/lib/ws";
import { eventosAccesoApi, panelApi } from "@/lib/api/endpoints";
import type { EventoAcceso, ResumenPanel } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { PageHeader } from "@/components/common/PageHeader";
import { TableFooter } from "@/components/tables/TableFooter";
import { TableSearch } from "@/components/tables/TableSearch";
import { usePagination } from "@/lib/usePagination";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

// Payload del WebSocket (ver EventosAccesoService en el backend). Una persona
// no registrada llega sin eventoId ni persona.
interface EventoLive {
  eventoId: number | null;
  tipoMovimiento: "ingreso" | "salida";
  resultado: "autorizado" | "denegado";
  fechaHora: string;
  persona: { id: number; nombres: string; apellidos: string } | null;
  numeroDocumento: string;
  motivos: {
    personaNoRegistrada?: boolean;
    dadoDeBaja?: boolean;
    sinDocumentos?: boolean;
    alcohol?: boolean;
    documentos?: boolean;
    documentosVencidos?: string[];
  };
}

function motivosEnVivo(motivos: EventoLive["motivos"]): string[] {
  if (motivos.personaNoRegistrada) return ["Persona no registrada"];
  if (motivos.dadoDeBaja) return ["Dado de baja"];
  const lista: string[] = [];
  if (motivos.sinDocumentos) lista.push("Sin documentos cargados");
  if (motivos.alcohol) lista.push("Alcohol no conforme");
  if (motivos.documentos) {
    lista.push(
      motivos.documentosVencidos?.length
        ? `Documento vencido: ${motivos.documentosVencidos.join(", ")}`
        : "Documento vencido",
    );
  }
  return lista;
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function MotivoDenegacion({ evento }: { evento: Pick<EventoAcceso, "denegadoPorBaja" | "denegadoSinDocumentos" | "denegadoPorAlcohol" | "denegadoPorDocumentos"> }) {
  if (evento.denegadoPorBaja) return <Badge color="error">Dado de baja</Badge>;
  const motivos: string[] = [];
  if (evento.denegadoSinDocumentos) motivos.push("Sin documentos");
  if (evento.denegadoPorAlcohol) motivos.push("Alcohol");
  if (evento.denegadoPorDocumentos) motivos.push("Documentos");
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
  const [servidorCaido, setServidorCaido] = useState(false);
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

  // Aviso si el servidor deja de responder. El alcance base no incluye modo
  // contingencia: sin servidor no se valida ningún ingreso.
  useEffect(() => {
    async function chequear() {
      try {
        const res = await fetch(`${API_URL}/health`, { headers: { "ngrok-skip-browser-warning": "true" } });
        setServidorCaido(!res.ok);
      } catch {
        setServidorCaido(true);
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
    return nombre.toLowerCase().includes(q) || (ev.persona?.numeroDocumento.includes(q) ?? false);
  });
  const { page, setPage, totalPages, paginated, total, from, to } = usePagination(filtrados, 10);

  return (
    <div>
      <PageHeader
        title="Panel de vigilancia"
        description="Resultado de cada ingreso y salida en tiempo real, con el motivo cuando se deniega."
        actions={
          servidorCaido ? (
            <Badge color="error" size="md">⚠ El servidor no responde — no se están validando ingresos</Badge>
          ) : undefined
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Denegaciones hoy" value={resumen?.denegacionesHoy ?? 0} color="text-error-500" />
        <StatCard label="Alcohol no conforme hoy" value={resumen?.alcoholNoConformeHoy ?? 0} color="text-warning-500" />
        <StatCard label="Documentos vencidos" value={resumen?.documentosVencidos ?? 0} color="text-gray-700 dark:text-gray-300" />
      </div>

      {eventosVivos.length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Eventos en tiempo real</h2>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {eventosVivos.map((ev, i) => {
              const motivos = motivosEnVivo(ev.motivos);
              return (
                <li key={`${ev.eventoId ?? "sin-registro"}-${i}`} className="flex items-start justify-between gap-4 py-2 text-sm">
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {ev.persona ? `${ev.persona.nombres} ${ev.persona.apellidos}` : "No registrado"}
                      <span className="ml-2 text-gray-500 dark:text-gray-400">DNI {ev.numeroDocumento}</span>
                      <span className="ml-2 text-xs text-gray-400">
                        {ev.tipoMovimiento} · {new Date(ev.fechaHora).toLocaleTimeString("es-PE")}
                      </span>
                    </p>
                    {motivos.length > 0 && (
                      <p className="mt-0.5 text-xs text-error-600 dark:text-error-400">{motivos.join(" · ")}</p>
                    )}
                  </div>
                  <Badge color={ev.resultado === "autorizado" ? "success" : "error"}>{ev.resultado}</Badge>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mb-4">
        <TableSearch value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre o DNI…" />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Hora</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">DNI</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Persona</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Movimiento</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Resultado</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Motivo</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={6}>Cargando…</TableCell>
                </TableRow>
              )}
              {!loading && eventos.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={6}>Sin eventos registrados todavía.</TableCell>
                </TableRow>
              )}
              {!loading && eventos.length > 0 && filtrados.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={6}>Sin resultados para esa búsqueda.</TableCell>
                </TableRow>
              )}
              {paginated.map((ev) => (
                <TableRow key={ev.id}>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {new Date(ev.fechaHora).toLocaleString("es-PE")}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {ev.persona
                      ? `${ev.persona.tipoDocumentoIdentidad === "DNI" ? "" : `${ev.persona.tipoDocumentoIdentidad} `}${ev.persona.numeroDocumento}`
                      : "—"}
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
    <RequireRole roles={["vigilancia", "administrador"]}>
      <VigilanciaContent />
    </RequireRole>
  );
}
