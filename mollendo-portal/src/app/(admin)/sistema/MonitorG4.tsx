"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Socket } from "socket.io-client";
import { integracionesApi } from "@/lib/api/endpoints";
import { connectEventosSocket } from "@/lib/ws";
import type { MarcacionG4, Paginado } from "@/lib/api/types";
import { hoy, pieDePagina } from "@/lib/paginaServidor";
import { useDiferido } from "@/lib/useDiferido";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import DatePicker from "@/components/form/date-picker";
import { AltoEstable } from "@/components/tables/AltoEstable";
import { TableFooter } from "@/components/tables/TableFooter";
import { TableSearch } from "@/components/tables/TableSearch";
import Tarjeta from "@/components/ui/tarjeta/Tarjeta";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { FotoGuardada } from "@/components/personal/FotoPersonal";
import { PageHeader } from "@/components/common/PageHeader";
import { ArrowRightIcon } from "@/icons";
import { ComprobandoBadge } from "./Insignias";

/** Pruebas por página (como el Panel de vigilancia). */
const POR_PAGINA = 10;
/** Respaldo del tiempo real: aunque el canal en vivo falle, se pone al día cada minuto. */
const RECARGA_RESPALDO_MS = 60_000;
/** Demora del aviso del G4 que ya se marca (lo normal medido: 10 a 12 s). */
const DEMORA_ALTA_S = 15;

/**
 * "20/10 18:27:00". Con `dia` (el de la prueba), solo "18:27:00" si es el mismo
 * día: la llegada y el ingreso son segundos después y no repiten la fecha.
 */
export function horaCorta(iso: string, dia?: string | null): string {
  const fecha = new Date(iso);
  const hora = fecha.toLocaleTimeString("es-PE", { hour12: false });
  if (dia && new Date(dia).toDateString() === fecha.toDateString()) return hora;
  return `${fecha.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" })} ${hora}`;
}

/** "0.00g/L" → "0.00 g/L". */
export function grado(alcohol: string): string {
  return alcohol.replace(/\s*g\/L$/i, " g/L");
}

const celda = "px-4 py-3 text-sm text-gray-700 dark:text-gray-300";
const encabezado = "px-4 py-3 text-start text-xs font-medium text-gray-500";

function FilaMarcacion({ m }: { m: MarcacionG4 }) {
  const nombre = m.persona ? `${m.persona.nombres} ${m.persona.apellidos}` : "No está en el sistema";
  return (
    <TableRow>
      <TableCell className={`${celda} whitespace-nowrap`}>
        <span className="tabular-nums">{m.horaPrueba ? horaCorta(m.horaPrueba) : "—"}</span>
        {m.numero !== null && <span className="block text-xs text-gray-400">N.º {m.numero}</span>}
      </TableCell>
      <TableCell className={`${celda} whitespace-nowrap`}>
        <span className="tabular-nums">{horaCorta(m.llegada, m.horaPrueba)}</span>
        {m.demoraSegundos !== null && (
          <span
            className={`block text-xs ${m.demoraSegundos > DEMORA_ALTA_S ? "text-warning-600 dark:text-orange-400" : "text-gray-400"}`}
          >
            {m.demoraSegundos} s después
          </span>
        )}
      </TableCell>
      <TableCell className={celda}>
        <div className="flex items-center gap-3">
          {m.persona ? (
            <FotoGuardada personaId={m.persona.id} tieneFoto={m.persona.tieneFoto} tamano="size-10" />
          ) : (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-white/[0.06]">?</span>
          )}
          <span>
            <span className={m.persona ? "" : "text-gray-500 dark:text-gray-400"}>{nombre}</span>
            <span className="block text-xs text-gray-400">DNI {m.dni ?? "—"}</span>
          </span>
        </div>
      </TableCell>
      <TableCell className={`${celda} whitespace-nowrap`}>
        {m.alcohol ? (
          <Badge color={m.aprobado ? "success" : "error"}>{grado(m.alcohol)}</Badge>
        ) : (
          <span className="text-gray-400">sin grado</span>
        )}
      </TableCell>
      <TableCell className={celda}>{m.decision ?? <span className="text-gray-400">—</span>}</TableCell>
      <TableCell className={`${celda} whitespace-nowrap`}>
        {m.ingreso ? (
          <>
            <Badge color={m.ingreso.resultado === "autorizado" ? "success" : "error"}>
              {m.ingreso.resultado === "autorizado" ? "Autorizado" : "Denegado"}
            </Badge>
            <span className="block pt-1 text-xs text-gray-400">
              {m.ingreso.motivo ? `${m.ingreso.motivo} · ` : ""}
              {horaCorta(m.ingreso.fechaHora, m.horaPrueba)}
            </span>
          </>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </TableCell>
    </TableRow>
  );
}

/** Aviso entre filas: el número de marcación saltó (pruebas que no llegaron al servidor). */
function FilaFaltantes({ m }: { m: MarcacionG4 }) {
  const desde = (m.numero ?? 0) - m.faltanAntes;
  const hasta = (m.numero ?? 0) - 1;
  return (
    <TableRow>
      <TableCell colSpan={6} className="bg-warning-50 px-4 py-2 text-xs text-warning-700 dark:bg-warning-500/10 dark:text-orange-300">
        {m.faltanAntes === 1 ? `No llegó la prueba N.º ${desde}` : `No llegaron ${m.faltanAntes} pruebas (N.º ${desde} a ${hasta})`}{" "}
        del equipo {m.serialNumber}.
      </TableCell>
    </TableRow>
  );
}

/** Insignia del canal en vivo (sin él, el monitor se pone al día cada minuto). */
function EnVivoBadge({ enVivo }: { enVivo: boolean }) {
  return (
    <Badge color={enVivo ? "success" : "light"}>
      {enVivo && <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" aria-hidden />}
      {enVivo ? "En vivo" : "Cada minuto"}
    </Badge>
  );
}

/** Canal en vivo: si está conectado, y `alLlegar` con cada prueba nueva (o al reconectar). */
function useCanalG4(alLlegar?: () => void) {
  const [enVivo, setEnVivo] = useState(false);
  const aviso = useRef(alLlegar);
  useEffect(() => {
    aviso.current = alLlegar;
  });
  useEffect(() => {
    let socket: Socket | undefined;
    let recarga: ReturnType<typeof setTimeout> | null = null;
    try {
      socket = connectEventosSocket(() => aviso.current?.());
      socket.on("connect", () => setEnVivo(true));
      socket.on("disconnect", () => setEnVivo(false));
      // Una prueba trae varios avisos seguidos (llega, se decide, termina en un ingreso): una sola recarga.
      socket.on("g4-marcacion", () => {
        if (recarga) clearTimeout(recarga);
        recarga = setTimeout(() => aviso.current?.(), 400);
      });
    } catch {
      // sin tiempo real, se pone al día cada minuto
    }
    return () => {
      socket?.disconnect();
      if (recarga) clearTimeout(recarga);
    };
  }, []);
  return enVivo;
}

/** Tarjeta de Sistema y APIs: qué es el monitor y el botón que abre su página. */
export function TarjetaMonitorG4() {
  const enVivo = useCanalG4();
  return (
    <Tarjeta className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Monitor del G4 Pro</h2>
          <p className="mt-1 text-xs text-gray-400">
            Cada prueba de rostro y alcohol que manda el equipo y qué hizo el sistema con ella, en vivo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <EnVivoBadge enVivo={enVivo} />
          <Link
            href="/sistema/monitor"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
          >
            Abrir monitor
            <ArrowRightIcon className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </Tarjeta>
  );
}

/**
 * Monitor del G4 Pro (página propia): cada prueba de rostro y alcohol que
 * manda el equipo, con quién la hizo, cuánto tardó en llegar, el grado y qué
 * hizo el sistema con ella (y el ingreso en que terminó). Como el Panel: por
 * día (empieza en hoy), con búsqueda y por páginas; hoy se actualiza al
 * instante con cada prueba nueva.
 */
export function MonitorG4() {
  const [lista, setLista] = useState<Paginado<MarcacionG4> | null>(null);
  const [error, setError] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const busquedaDiferida = useDiferido(busqueda.trim());
  const [dia, setDia] = useState(hoy);
  const [version, setVersion] = useState(0);
  // Las pruebas nuevas solo cambian la lista de hoy (o la de todos los días).
  const conPruebasNuevas = !dia || dia === hoy();
  const enVivo = useCanalG4(() => {
    if (conPruebasNuevas) setVersion((v) => v + 1);
  });

  useEffect(() => {
    let activo = true;
    integracionesApi
      .marcacionesG4({ pagina, porPagina: POR_PAGINA, busqueda: busquedaDiferida, desde: dia, hasta: dia })
      .then((l) => {
        if (!activo) return;
        // Si la página quedó fuera del total (p. ej. tras filtrar), vuelve a la primera.
        if (l.datos.length === 0 && l.total > 0 && pagina > 1) {
          setPagina(1);
          return;
        }
        setLista(l);
        setError(false);
      })
      .catch(() => {
        if (activo) setError(true);
      });
    return () => {
      activo = false;
    };
  }, [pagina, busquedaDiferida, dia, version]);

  useEffect(() => {
    if (!conPruebasNuevas) return;
    const intervalo = setInterval(() => setVersion((v) => v + 1), RECARGA_RESPALDO_MS);
    return () => clearInterval(intervalo);
  }, [conPruebasNuevas]);

  const marcaciones = lista?.datos ?? [];
  const pie = pieDePagina(lista);
  const esHoy = dia === hoy();
  const sinPruebas = busquedaDiferida
    ? "Sin resultados para esa búsqueda."
    : !dia
      ? "Todavía no llegó ninguna prueba."
      : esHoy
        ? "Todavía no hay pruebas hoy."
        : "Sin pruebas ese día.";

  function cambiarDia(valor: string) {
    setDia(valor);
    setPagina(1);
  }

  return (
    <>
      <PageHeader
        title="Monitor del G4 Pro"
        description="Cada prueba de rostro y alcohol que manda el equipo y qué hizo el sistema con ella. Hoy se actualiza sola."
        actions={lista && conPruebasNuevas ? <EnVivoBadge enVivo={enVivo} /> : undefined}
      />
      {error && <ErrorBanner className="mb-6">No se pudo consultar las pruebas del G4 Pro.</ErrorBanner>}

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
            <DatePicker id="dia-monitor-g4" placeholder="Todos los días" max={hoy()} value={dia} onChange={cambiarDia} />
          </div>
          {!esHoy && (
            <Button type="button" variant="outline" size="sm" onClick={() => cambiarDia(hoy())}>
              Hoy
            </Button>
          )}
          {dia && (
            <Button type="button" variant="outline" size="sm" onClick={() => cambiarDia("")}>
              Todos los días
            </Button>
          )}
        </div>
      </div>

      <Tarjeta className="overflow-hidden">
        <div className="overflow-x-auto">
          <AltoEstable paginaCompleta={marcaciones.length === POR_PAGINA} variasPaginas={(lista?.total ?? 0) > POR_PAGINA}>
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className={encabezado}>Prueba</TableCell>
                  <TableCell isHeader className={encabezado}>Llegó</TableCell>
                  <TableCell isHeader className={encabezado}>Persona</TableCell>
                  <TableCell isHeader className={encabezado}>Alcohol</TableCell>
                  <TableCell isHeader className={encabezado}>Qué hizo el sistema</TableCell>
                  <TableCell isHeader className={encabezado}>Ingreso</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {!lista && !error && (
                  <TableRow>
                    <TableCell className="px-5 py-4" colSpan={6}>
                      <ComprobandoBadge />
                    </TableCell>
                  </TableRow>
                )}
                {lista && marcaciones.length === 0 && (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={6}>
                      {sinPruebas}
                    </TableCell>
                  </TableRow>
                )}
                {marcaciones.map((m) => (
                  <React.Fragment key={m.id}>
                    <FilaMarcacion m={m} />
                    {m.faltanAntes > 0 && <FilaFaltantes m={m} />}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </AltoEstable>
        </div>
        {lista && <TableFooter {...pie} onPageChange={setPagina} />}
      </Tarjeta>
    </>
  );
}
