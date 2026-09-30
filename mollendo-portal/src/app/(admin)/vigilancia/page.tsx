"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { RequireRole } from "@/lib/auth/RequireRole";
import { connectEventosSocket } from "@/lib/ws";
import { eventosAccesoApi, panelApi, personasApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { EventoAcceso, Paginado, Persona, ResumenPanel } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import Button from "@/components/ui/button/Button";
import { TableFooter } from "@/components/tables/TableFooter";
import { TableSearch } from "@/components/tables/TableSearch";
import { useDiferido } from "@/lib/useDiferido";
import { hoy, pieDePagina } from "@/lib/paginaServidor";
import DatePicker from "@/components/form/date-picker";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

// Payload del WebSocket (ver EventosAccesoService en el backend): aquí solo
// se usa el id del evento, para resaltar su fila cuando la tabla se recarga.
interface EventoLive {
  eventoId: number;
}

// Cuánto tiempo queda resaltado el último evento (si no llega otro antes).
const RESALTE_MS = 8000;

/** `value` null = todavía no se cargó (se muestra "—" en vez de un 0 que luego salta). */
function StatCard({ label, value, color }: { label: string; value: number | null; color: string }) {
  return (
    // Número abajo: queda alineado entre tarjetas aunque un título ocupe más líneas.
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5">
      <p className="text-xs leading-snug text-gray-500 dark:text-gray-400 sm:text-sm">{label}</p>
      <p className={`mt-auto pt-1 text-xl font-semibold sm:pt-2 sm:text-2xl ${value === null ? "text-gray-300 dark:text-gray-600" : color}`}>
        {value ?? "—"}
      </p>
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (personaId === null) return;
    let activo = true;
    personasApi
      .get(personaId)
      .then((p) => activo && setPersona(p))
      .catch((err) => activo && setError(err instanceof ApiError ? err.message : "No se pudieron cargar los documentos"));
    return () => {
      activo = false;
      setPersona(null);
      setError(null);
    };
  }, [personaId]);

  const actuales = persona?.documentosActuales ?? [];

  return (
    <Modal isOpen={personaId !== null} onClose={onClose} className="max-w-lg p-6 sm:p-8">
      <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">Documentos</h2>
      {error ? (
        <ErrorBanner>{error}</ErrorBanner>
      ) : !persona ? (
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

const POR_PAGINA = 10;

function VigilanciaContent() {
  const [resumen, setResumen] = useState<ResumenPanel | null>(null);
  const [lista, setLista] = useState<Paginado<EventoAcceso> | null>(null);
  // Último evento llegado en vivo: solo su fila se resalta, unos segundos.
  const [ultimo, setUltimo] = useState<number | null>(null);
  const [servidorCaido, setServidorCaido] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Filtros del historial: se aplican en el servidor. El día empieza en hoy;
  // vacío = todos los días.
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const busquedaDiferida = useDiferido(busqueda.trim());
  const [dia, setDia] = useState(hoy);

  // Contadores e historial. Se vuelve a pedir con cada evento en vivo, así
  // "Denegaciones hoy" y la tabla quedan al día sin recargar la página.
  const cargar = useCallback(async () => {
    try {
      const [r, e] = await Promise.all([
        panelApi.resumen(),
        eventosAccesoApi.list({ pagina, porPagina: POR_PAGINA, busqueda: busquedaDiferida, desde: dia, hasta: dia }),
      ]);
      setResumen(r);
      // Si la página quedó fuera del total (p. ej. tras filtrar), vuelve a la primera.
      if (e.datos.length === 0 && e.total > 0 && pagina > 1) {
        setPagina(1);
        return;
      }
      setLista(e);
      setErrorCarga(null);
    } catch (err) {
      setErrorCarga(err instanceof ApiError ? err.message : "No se pudieron cargar los datos del panel");
    } finally {
      setLoading(false);
    }
  }, [pagina, busquedaDiferida, dia]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // El socket se conecta una sola vez; siempre recarga con los filtros vigentes.
  const cargarActual = useRef(cargar);
  useEffect(() => {
    cargarActual.current = cargar;
  }, [cargar]);

  // Cada evento en vivo recarga la tabla y los contadores (si llegan varios
  // seguidos, una sola recarga medio segundo después) y pasa a ser el resaltado.
  const recargaPendiente = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finResalte = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    let socket: Socket | undefined;
    try {
      socket = connectEventosSocket();
      socket.on("evento-acceso", (payload: EventoLive) => {
        setUltimo(payload.eventoId);
        if (finResalte.current) clearTimeout(finResalte.current);
        finResalte.current = setTimeout(() => setUltimo(null), RESALTE_MS);
        if (recargaPendiente.current) clearTimeout(recargaPendiente.current);
        recargaPendiente.current = setTimeout(() => void cargarActual.current(), 500);
      });
    } catch {
      // el panel sigue funcionando sin tiempo real si el socket falla
    }
    return () => {
      socket?.disconnect();
      if (recargaPendiente.current) clearTimeout(recargaPendiente.current);
      if (finResalte.current) clearTimeout(finResalte.current);
    };
  }, []);

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

  const [personaDocumentos, setPersonaDocumentos] = useState<number | null>(null);
  const eventos = lista?.datos ?? [];
  const pie = pieDePagina(lista);
  const esHoy = dia === hoy();
  const sinEventos = busquedaDiferida
    ? "Sin resultados para esa búsqueda."
    : !dia
      ? "Sin eventos registrados todavía."
      : esHoy
        ? "Todavía no hay ingresos ni salidas hoy."
        : "Sin ingresos ni salidas ese día.";

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

      {/* En el celular, los tres contadores en una fila y compactos. */}
      <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
        <StatCard label="Denegaciones hoy" value={resumen?.denegacionesHoy ?? null} color="text-error-500" />
        <StatCard label="Alcohol no conforme hoy" value={resumen?.alcoholNoConformeHoy ?? null} color="text-warning-500" />
        <StatCard label="Documentos vencidos" value={resumen?.documentosVencidos ?? null} color="text-gray-700 dark:text-gray-300" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:flex-1">
          <TableSearch
            value={busqueda}
            onChange={(v) => {
              setBusqueda(v);
              setPagina(1);
            }}
            placeholder="Buscar por nombre o DNI…"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1 sm:w-44 sm:flex-none">
            <DatePicker
              id="dia-vigilancia"
              placeholder="Todos los días"
              max={hoy()}
              value={dia}
              onChange={(v) => {
                setDia(v);
                setPagina(1);
              }}
            />
          </div>
          {!esHoy && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setDia(hoy());
                setPagina(1);
              }}
            >
              Hoy
            </Button>
          )}
          {dia && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setDia("");
                setPagina(1);
              }}
            >
              Todos los días
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Una línea por celda: en el celular la tabla se desliza hacia los lados. */}
        <div className="overflow-x-auto [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
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
              {!loading && errorCarga && !lista && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={6}>No se pudo cargar el historial.</TableCell>
                </TableRow>
              )}
              {!loading && lista && eventos.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={6}>{sinEventos}</TableCell>
                </TableRow>
              )}
              {!loading && eventos.map((ev) => (
                <TableRow
                  key={ev.id}
                  className={`transition-colors duration-700 ${ev.id === ultimo ? "bg-brand-50 dark:bg-brand-500/10" : ""}`}
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
        {!loading && <TableFooter {...pie} onPageChange={setPagina} />}
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
