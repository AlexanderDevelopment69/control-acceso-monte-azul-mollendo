"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { RequireRole } from "@/lib/auth/RequireRole";
import { connectEventosSocket } from "@/lib/ws";
import { eventosAccesoApi, panelApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { EventoAcceso, IngresoEnEspera, Paginado, ResumenPanel } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import Button from "@/components/ui/button/Button";
import TarjetaIndicador from "@/components/ui/tarjeta/TarjetaIndicador";
import { TableFooter } from "@/components/tables/TableFooter";
import { AltoEstable } from "@/components/tables/AltoEstable";
import { TableSearch } from "@/components/tables/TableSearch";
import { useDiferido } from "@/lib/useDiferido";
import { hoy, pieDePagina } from "@/lib/paginaServidor";
import DatePicker from "@/components/form/date-picker";
import { AlertIcon, CheckLineIcon, CloseLineIcon, DocsIcon } from "@/icons";
import Tarjeta from "@/components/ui/tarjeta/Tarjeta";
import { FilasEnEspera } from "./FilasEnEspera";
import { documentoDelEvento, MotivoDenegacion, Movimiento } from "./CeldasEvento";
import { DocumentosModal } from "./DocumentosModal";
import {
  avisoDesdeHistorial,
  AvisoNoCompletoBanner,
  siguienteAviso,
  type AvisoNoCompleto,
  type EventoEnVivo,
} from "./AvisoNoCompleto";

// Cuánto tiempo queda resaltado el último evento (si no llega otro antes).
const RESALTE_MS = 8000;
/** Último aviso de "no completó" cerrado con la ✕ (su id de evento), para que no vuelva al recargar. */
const CLAVE_AVISO_CERRADO = "vigilancia.avisoNoCompletoCerrado";
/** Ingresos recientes que se miran al abrir el Panel para saber si corresponde el aviso. */
const EVENTOS_PARA_AVISO = 20;
/** Recarga de respaldo del panel, por si el canal en vivo se corta sin avisar. */
const RECARGA_RESPALDO_MS = 60_000;
const POR_PAGINA = 10;

function VigilanciaContent() {
  const [resumen, setResumen] = useState<ResumenPanel | null>(null);
  const [lista, setLista] = useState<Paginado<EventoAcceso> | null>(null);
  const [enEspera, setEnEspera] = useState<IngresoEnEspera[]>([]);
  const [ahora, setAhora] = useState(() => Date.now());
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
      const [r, e, espera] = await Promise.all([
        panelApi.resumen(),
        eventosAccesoApi.list({ pagina, porPagina: POR_PAGINA, busqueda: busquedaDiferida, desde: dia, hasta: dia }),
        eventosAccesoApi.enEspera(),
      ]);
      setResumen(r);
      setEnEspera(espera);
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

  // Aviso de "no completó rostro y alcohol": al abrir el Panel (y al recuperar
  // la conexión) se calcula con los ingresos de hoy, sin importar los filtros
  // de la tabla; después lo actualizan los eventos en vivo.
  const [aviso, setAviso] = useState<AvisoNoCompleto | null>(null);
  const [avisoCerrado, setAvisoCerrado] = useState<number | null>(() => {
    try {
      return Number(localStorage.getItem(CLAVE_AVISO_CERRADO)) || null;
    } catch {
      return null; // Sin almacenamiento (modo privado o en el servidor): no se recuerda.
    }
  });
  const cargarAviso = useCallback(async () => {
    try {
      const recientes = await eventosAccesoApi.list({ pagina: 1, porPagina: EVENTOS_PARA_AVISO, desde: hoy(), hasta: hoy() });
      setAviso(avisoDesdeHistorial(recientes.datos));
    } catch {
      // Si falla, la tabla ya avisa del error de carga; el aviso llega con el próximo evento en vivo.
    }
  }, []);
  useEffect(() => {
    void cargarAviso();
  }, [cargarAviso]);
  function cerrarAviso() {
    if (!aviso) return;
    setAvisoCerrado(aviso.eventoId);
    try {
      localStorage.setItem(CLAVE_AVISO_CERRADO, String(aviso.eventoId));
    } catch {
      // Ver arriba.
    }
  }

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
      // Al recuperar la conexión, recarga lo que llegó mientras estaba cortada.
      socket = connectEventosSocket(() => {
        void cargarActual.current();
        void cargarAviso();
      });
      socket.on("evento-acceso", (payload: EventoEnVivo) => {
        setAviso((actual) => siguienteAviso(actual, payload));
        setUltimo(payload.eventoId);
        if (finResalte.current) clearTimeout(finResalte.current);
        finResalte.current = setTimeout(() => setUltimo(null), RESALTE_MS);
        if (recargaPendiente.current) clearTimeout(recargaPendiente.current);
        recargaPendiente.current = setTimeout(() => void cargarActual.current(), 500);
      });
      // DNI en regla: aparece al instante; si la misma persona vuelve a pasar el DNI, queda la última.
      socket.on("ingreso-en-espera", (ingreso: IngresoEnEspera) => {
        setAhora(Date.now());
        // Llega también cuando una persona en cola pasa a su turno: se reemplaza su fila.
        setEnEspera((actuales) => [ingreso, ...actuales.filter((i) => i.id !== ingreso.id && i.personaId !== ingreso.personaId)]);
      });
      socket.on("ingreso-espera-terminada", ({ id }: { id: number }) => {
        setEnEspera((actuales) => actuales.filter((i) => i.id !== id));
      });
    } catch {
      // el panel sigue funcionando sin tiempo real si el socket falla
    }
    return () => {
      socket?.disconnect();
      if (recargaPendiente.current) clearTimeout(recargaPendiente.current);
      if (finResalte.current) clearTimeout(finResalte.current);
    };
  }, [cargarAviso]);

  // Respaldo del tiempo real: aunque el canal en vivo falle sin avisar, la
  // tabla, los contadores y las esperas se ponen al día cada minuto.
  useEffect(() => {
    const intervalo = setInterval(() => void cargarActual.current(), RECARGA_RESPALDO_MS);
    return () => clearInterval(intervalo);
  }, []);

  // Cuenta regresiva de las esperas; las vencidas se quitan solas.
  const hayEspera = enEspera.length > 0;
  useEffect(() => {
    if (!hayEspera) return;
    const intervalo = setInterval(() => {
      const t = Date.now();
      setAhora(t);
      setEnEspera((actuales) => {
        const vigentes = actuales.filter((i) => !i.hasta || new Date(i.hasta).getTime() > t);
        return vigentes.length === actuales.length ? actuales : vigentes;
      });
    }, 1000);
    return () => clearInterval(intervalo);
  }, [hayEspera]);

  function reintentar() {
    setLoading(true);
    void cargar();
  }

  // Aviso si el servidor deja de responder. El alcance base no incluye modo
  // contingencia: sin servidor no se valida ningún ingreso.
  useEffect(() => {
    async function chequear() {
      try {
        await panelApi.health();
        setServidorCaido(false);
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
  // Las esperas son de ahora: van en la primera página, al ver hoy (o todos los
  // días), y siguen la búsqueda por nombre o DNI.
  const textoBuscado = busquedaDiferida.toLowerCase();
  const esperasVisibles =
    pagina === 1 && (!dia || dia === hoy())
      ? enEspera.filter(
          (i) =>
            !textoBuscado ||
            `${i.nombres} ${i.apellidos} ${i.numeroDocumento}`.toLowerCase().includes(textoBuscado),
        )
      : [];
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

      {aviso && aviso.eventoId !== avisoCerrado && <AvisoNoCompletoBanner aviso={aviso} onCerrar={cerrarAviso} />}

      {/* En el celular, los tres contadores en una fila y compactos. */}
      <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
        <TarjetaIndicador
          tamano="celular"
          titulo="Denegaciones hoy"
          valor={resumen?.denegacionesHoy ?? null}
          colorValor="text-error-500"
          icono={<CloseLineIcon />}
          fondoIcono="bg-error-500"
          detalle="Ingresos y salidas rechazados en el día"
        />
        <TarjetaIndicador
          tamano="celular"
          titulo="Alcohol no conforme hoy"
          valor={resumen?.alcoholNoConformeHoy ?? null}
          colorValor="text-warning-500"
          icono={<AlertIcon />}
          fondoIcono="bg-warning-500"
          detalle="Ingresos denegados por la prueba de alcohol"
        />
        <TarjetaIndicador
          tamano="celular"
          titulo="Documentos vencidos"
          valor={resumen?.documentosVencidos ?? null}
          colorValor="text-gray-700 dark:text-gray-300"
          icono={<DocsIcon />}
          fondoIcono="bg-gray-500"
          detalle="Del personal activo; impiden su ingreso"
        />
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

      <Tarjeta className="overflow-hidden">
        {/* Una línea por celda: en el celular la tabla se desliza hacia los lados. */}
        <div className="overflow-x-auto [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
          <AltoEstable paginaCompleta={eventos.length === POR_PAGINA} variasPaginas={(lista?.total ?? 0) > POR_PAGINA}>
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
                {!loading && <FilasEnEspera ingresos={esperasVisibles} ahora={ahora} />}
                {!loading && lista && eventos.length === 0 && esperasVisibles.length === 0 && (
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
                      {dia ? new Date(ev.fechaHora).toLocaleTimeString("es-PE") : new Date(ev.fechaHora).toLocaleString("es-PE")}
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
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <Movimiento tipo={ev.tipoMovimiento} />
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm">
                      {ev.resultado === "autorizado" ? (
                        <Badge color="success" startIcon={<CheckLineIcon className="size-3.5" />}>
                          Autorizado
                        </Badge>
                      ) : (
                        <Badge color="error" startIcon={<CloseLineIcon className="size-3.5" />}>
                          Denegado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm">
                      <MotivoDenegacion evento={ev} onVerDocumentos={() => setPersonaDocumentos(ev.personaId)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AltoEstable>
        </div>
        {!loading && <TableFooter {...pie} onPageChange={setPagina} />}
      </Tarjeta>

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
