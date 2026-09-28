"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { RequireRole } from "@/lib/auth/RequireRole";
import { connectEventosSocket } from "@/lib/ws";
import { eventosAccesoApi, panelApi, personasApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { EventoAcceso, Persona, ResumenPanel } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import Button from "@/components/ui/button/Button";
import { TableFooter } from "@/components/tables/TableFooter";
import { TableSearch } from "@/components/tables/TableSearch";
import { usePagination } from "@/lib/usePagination";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

// Payload del WebSocket (ver EventosAccesoService en el backend): aquí solo
// se usa el id del evento, para resaltar su fila cuando la tabla se recarga.
interface EventoLive {
  eventoId: number;
}

// Cuánto tiempo queda resaltada una fila nueva.
const RESALTE_MS = 8000;

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function MotivoDenegacion({
  evento,
  onVerDocumentos,
}: {
  evento: Pick<
    EventoAcceso,
    "denegadoNoRegistrado" | "denegadoPorBaja" | "denegadoSinDocumentos" | "denegadoPorAlcohol" | "denegadoPorDocumentos"
  >;
  onVerDocumentos: () => void;
}) {
  if (evento.denegadoNoRegistrado) return <Badge color="error">No registrado</Badge>;
  if (evento.denegadoPorBaja) return <Badge color="error">Dado de baja</Badge>;
  const motivos: string[] = [];
  if (evento.denegadoSinDocumentos) motivos.push("Sin documentos");
  if (evento.denegadoPorAlcohol) motivos.push("Alcohol");
  if (evento.denegadoPorDocumentos) motivos.push("Documentos");
  if (motivos.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {motivos.map((m) =>
        m === "Alcohol" ? (
          <Badge key={m} color="error">{m}</Badge>
        ) : (
          // Documentos: clic para ver qué debe regularizar.
          <button key={m} type="button" onClick={onVerDocumentos} title="Ver documentos" className="underline-offset-2 hover:underline">
            <Badge color="error">{m} ›</Badge>
          </button>
        ),
      )}
    </div>
  );
}

/** Documento con el que se identificó (el leído por el equipo; si falta, el de la persona). */
function documentoDelEvento(ev: EventoAcceso): string {
  const tipo = ev.tipoDocumentoIdentidad ?? ev.persona?.tipoDocumentoIdentidad;
  const numero = ev.numeroDocumento ?? ev.persona?.numeroDocumento;
  if (!numero) return "—";
  return tipo && tipo !== "DNI" ? `${tipo} ${numero}` : numero;
}

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-PE", { timeZone: "UTC" });
}

/** Modal de solo lectura: documentos actuales de la persona y cuáles debe regularizar. */
function DocumentosModal({ personaId, onClose }: { personaId: number | null; onClose: () => void }) {
  const [persona, setPersona] = useState<Persona | null>(null);

  useEffect(() => {
    if (personaId === null) return;
    let activo = true;
    personasApi.get(personaId).then((p) => activo && setPersona(p));
    return () => {
      activo = false;
      setPersona(null);
    };
  }, [personaId]);

  const actuales = persona?.documentosActuales ?? [];

  return (
    <Modal isOpen={personaId !== null} onClose={onClose} className="max-w-lg p-6 sm:p-8">
      <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">Documentos</h2>
      {!persona ? (
        <p className="text-sm text-gray-400">Cargando…</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            {persona.nombres} {persona.apellidos} · DNI {persona.numeroDocumento}
            {persona.empresa && ` · ${persona.empresa.razonSocial}`}
          </p>
          {actuales.length === 0 ? (
            <p className="rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-500">
              No tiene ningún documento cargado.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
              {actuales.map((d) => (
                <li key={d.tipoDocumentoId} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span>
                    <span className="font-medium text-gray-800 dark:text-white/90">{d.nombre}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {d.fechaVencimiento
                        ? `${d.vigente ? "Vence" : "Venció"} el ${formatearFecha(d.fechaVencimiento)}`
                        : "No vence"}
                    </span>
                  </span>
                  {d.vigente ? <Badge color="success">Vigente</Badge> : <Badge color="error">Vencido</Badge>}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-gray-400">
            Estado de hoy. Para regularizar, debe entregar el documento actualizado al administrador.
          </p>
        </>
      )}
    </Modal>
  );
}

function VigilanciaContent() {
  const [resumen, setResumen] = useState<ResumenPanel | null>(null);
  const [eventos, setEventos] = useState<EventoAcceso[]>([]);
  // Eventos recién llegados en vivo: su fila se resalta unos segundos.
  const [nuevos, setNuevos] = useState<Set<number>>(new Set());
  const [servidorCaido, setServidorCaido] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Contadores e historial. Se vuelve a pedir con cada evento en vivo, así
  // "Denegaciones hoy" y la tabla quedan al día sin recargar la página.
  const cargar = useCallback(async () => {
    try {
      const [r, e] = await Promise.all([panelApi.resumen(), eventosAccesoApi.list()]);
      setResumen(r);
      setEventos(e);
      setErrorCarga(null);
    } catch (err) {
      setErrorCarga(err instanceof ApiError ? err.message : "No se pudieron cargar los datos del panel");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Cada evento en vivo recarga la tabla y los contadores (si llegan varios
  // seguidos, una sola recarga medio segundo después) y resalta su fila.
  const recargaPendiente = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resaltes = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    let socket: Socket | undefined;
    try {
      socket = connectEventosSocket();
      socket.on("evento-acceso", (payload: EventoLive) => {
        setNuevos((prev) => new Set(prev).add(payload.eventoId));
        resaltes.current.push(
          setTimeout(() => {
            setNuevos((prev) => {
              const siguiente = new Set(prev);
              siguiente.delete(payload.eventoId);
              return siguiente;
            });
          }, RESALTE_MS),
        );
        if (recargaPendiente.current) clearTimeout(recargaPendiente.current);
        recargaPendiente.current = setTimeout(() => void cargar(), 500);
      });
    } catch {
      // el panel sigue funcionando sin tiempo real si el socket falla
    }
    const pendientes = resaltes.current;
    return () => {
      socket?.disconnect();
      if (recargaPendiente.current) clearTimeout(recargaPendiente.current);
      pendientes.forEach(clearTimeout);
    };
  }, [cargar]);

  function reintentar() {
    setLoading(true);
    void cargar();
  }

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
  const [personaDocumentos, setPersonaDocumentos] = useState<number | null>(null);
  const filtrados = eventos.filter((ev) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    const nombre = ev.persona ? `${ev.persona.nombres} ${ev.persona.apellidos}` : "no registrado";
    const numero = ev.numeroDocumento ?? ev.persona?.numeroDocumento ?? "";
    return nombre.toLowerCase().includes(q) || numero.toLowerCase().includes(q);
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

      {errorCarga && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <ErrorBanner className="flex-1">{errorCarga}</ErrorBanner>
          <Button type="button" variant="outline" size="sm" onClick={reintentar} disabled={loading}>
            {loading ? "Cargando…" : "Reintentar"}
          </Button>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Denegaciones hoy" value={resumen?.denegacionesHoy ?? 0} color="text-error-500" />
        <StatCard label="Alcohol no conforme hoy" value={resumen?.alcoholNoConformeHoy ?? 0} color="text-warning-500" />
        <StatCard label="Documentos vencidos" value={resumen?.documentosVencidos ?? 0} color="text-gray-700 dark:text-gray-300" />
      </div>

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
              {!loading && errorCarga && eventos.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={6}>No se pudo cargar el historial.</TableCell>
                </TableRow>
              )}
              {!loading && !errorCarga && eventos.length === 0 && (
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
                <TableRow
                  key={ev.id}
                  className={`transition-colors duration-700 ${nuevos.has(ev.id) ? "bg-brand-50 dark:bg-brand-500/10" : ""}`}
                >
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {new Date(ev.fechaHora).toLocaleString("es-PE")}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {documentoDelEvento(ev)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {ev.persona ? (
                      `${ev.persona.nombres} ${ev.persona.apellidos}`
                    ) : (
                      <span className="text-gray-400">No registrado</span>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300 capitalize">{ev.tipoMovimiento}</TableCell>
                  <TableCell className="px-5 py-4 text-sm">
                    <Badge color={ev.resultado === "autorizado" ? "success" : "error"}>{ev.resultado}</Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm">
                    <MotivoDenegacion evento={ev} onVerDocumentos={() => setPersonaDocumentos(ev.personaId)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {!loading && <TableFooter from={from} to={to} total={total} page={page} totalPages={totalPages} onPageChange={setPage} />}
      </div>

      <DocumentosModal personaId={personaDocumentos} onClose={() => setPersonaDocumentos(null)} />
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
