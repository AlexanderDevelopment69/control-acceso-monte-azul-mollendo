"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { integracionesApi } from "@/lib/api/endpoints";
import { connectEventosSocket } from "@/lib/ws";
import type { MarcacionG4 } from "@/lib/api/types";
import Badge from "@/components/ui/badge/Badge";
import Tarjeta from "@/components/ui/tarjeta/Tarjeta";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { FotoGuardada } from "@/components/personal/FotoPersonal";
import { ChevronDownIcon } from "@/icons";
import { ComprobandoBadge } from "./Insignias";

/** Filas que se ven sin desplegar. */
const VISIBLES = 10;
/** Respaldo del tiempo real: aunque el canal en vivo falle, se pone al día cada minuto. */
const RECARGA_RESPALDO_MS = 60_000;
/** Demora del aviso del G4 que ya se marca (lo normal medido: 10 a 12 s). */
const DEMORA_ALTA_S = 15;
/** El monitor se recuerda abierto o cerrado en cada navegador. */
const CLAVE_ABIERTO = "monitorG4Abierto";

/** "18:27:00", o "19/10 18:27:00" si no es de hoy. */
export function horaCorta(iso: string, hoy = new Date()): string {
  const fecha = new Date(iso);
  const hora = fecha.toLocaleTimeString("es-PE", { hour12: false });
  return fecha.toDateString() === hoy.toDateString()
    ? hora
    : `${fecha.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" })} ${hora}`;
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
        <span className="tabular-nums">{horaCorta(m.llegada)}</span>
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
              {horaCorta(m.ingreso.fechaHora)}
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

/** Tarjeta cerrada: la última prueba en una línea. */
function UltimaPrueba({ m }: { m: MarcacionG4 }) {
  const nombre = m.persona ? `${m.persona.nombres} ${m.persona.apellidos}` : `DNI ${m.dni ?? "—"}`;
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span>
        Última prueba: <span className="tabular-nums">{m.horaPrueba ? horaCorta(m.horaPrueba) : horaCorta(m.llegada)}</span> · {nombre}
      </span>
      {m.alcohol && <Badge color={m.aprobado ? "success" : "error"}>{grado(m.alcohol)}</Badge>}
      {m.ingreso && (
        <Badge color={m.ingreso.resultado === "autorizado" ? "success" : "error"}>
          {m.ingreso.resultado === "autorizado" ? "Autorizado" : "Denegado"}
        </Badge>
      )}
    </span>
  );
}

/**
 * Monitor en vivo del G4 Pro: cada prueba de rostro y alcohol que manda el
 * equipo, con quién la hizo, cuánto tardó en llegar, el grado y qué hizo el
 * sistema con ella (y el ingreso en que terminó). Se actualiza al instante.
 * Cerrado (al entrar) muestra solo la última prueba; al hacer clic, la tabla.
 */
export function MonitorG4() {
  const [marcaciones, setMarcaciones] = useState<MarcacionG4[] | null>(null);
  const [error, setError] = useState(false);
  const [todas, setTodas] = useState(false);
  const [enVivo, setEnVivo] = useState(false);
  const [abierto, setAbierto] = useState<boolean>(() => {
    try {
      return localStorage.getItem(CLAVE_ABIERTO) === "1";
    } catch {
      return false; // Sin almacenamiento (modo privado o en el servidor): empieza cerrado.
    }
  });
  const recarga = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const cargar = () =>
      integracionesApi
        .marcacionesG4()
        .then((lista) => {
          setMarcaciones(lista);
          setError(false);
        })
        .catch(() => setError(true));
    void cargar();
    let socket: Socket | undefined;
    try {
      socket = connectEventosSocket(() => void cargar());
      socket.on("connect", () => setEnVivo(true));
      socket.on("disconnect", () => setEnVivo(false));
      // Una prueba trae varios avisos seguidos (llega, se decide, termina en un ingreso): una sola recarga.
      socket.on("g4-marcacion", () => {
        if (recarga.current) clearTimeout(recarga.current);
        recarga.current = setTimeout(() => void cargar(), 400);
      });
    } catch {
      // sin tiempo real, se pone al día cada minuto
    }
    const intervalo = setInterval(() => void cargar(), RECARGA_RESPALDO_MS);
    return () => {
      socket?.disconnect();
      clearInterval(intervalo);
      if (recarga.current) clearTimeout(recarga.current);
    };
  }, []);

  // Cerrado no se dibuja la tabla (no descarga las fotos).
  const visibles = abierto && marcaciones ? (todas ? marcaciones : marcaciones.slice(0, VISIBLES)) : [];

  function alternar() {
    const nuevo = !abierto;
    setAbierto(nuevo);
    try {
      localStorage.setItem(CLAVE_ABIERTO, nuevo ? "1" : "0");
    } catch {
      // no se recuerda
    }
  }

  return (
    <Tarjeta className="mb-6 overflow-hidden">
      <button
        type="button"
        onClick={alternar}
        aria-expanded={abierto}
        className="flex w-full flex-wrap items-start justify-between gap-3 px-5 py-4 text-start hover:bg-gray-50 dark:hover:bg-white/[0.02]"
      >
        <span className="min-w-0">
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monitor del G4 Pro</span>
          <span className="mt-1 block text-xs text-gray-400">
            {abierto ? (
              "Cada prueba de rostro y alcohol que manda el equipo y qué hizo el sistema con ella. Se actualiza sola."
            ) : error ? (
              <span className="text-error-600 dark:text-error-400">No se pudo consultar las pruebas del G4 Pro.</span>
            ) : marcaciones?.[0] ? (
              <UltimaPrueba m={marcaciones[0]} />
            ) : marcaciones ? (
              "Todavía no llegó ninguna prueba."
            ) : (
              "Cada prueba de rostro y alcohol que manda el equipo, en vivo."
            )}
          </span>
        </span>
        <span className="flex items-center gap-3">
          {marcaciones && (
            <Badge color={enVivo ? "success" : "light"}>
              {enVivo && <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" aria-hidden />}
              {enVivo ? "En vivo" : "Cada minuto"}
            </Badge>
          )}
          <ChevronDownIcon
            className={`size-5 text-gray-400 transition-transform duration-300 ${abierto ? "rotate-180" : ""}`}
            aria-hidden
          />
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${abierto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-100 dark:border-gray-800">
            {error && <ErrorBanner className="m-5">No se pudo consultar las pruebas del G4 Pro.</ErrorBanner>}
            {!marcaciones && !error && (
              <div className="px-5 py-4">
                <ComprobandoBadge />
              </div>
            )}
            {marcaciones?.length === 0 && <p className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">Todavía no llegó ninguna prueba.</p>}

            {visibles.length > 0 && (
              <div className="overflow-x-auto">
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
                    {visibles.map((m) => (
                      <React.Fragment key={m.id}>
                        <FilaMarcacion m={m} />
                        {m.faltanAntes > 0 && <FilaFaltantes m={m} />}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {abierto && marcaciones && marcaciones.length > VISIBLES && (
              <div className="border-t border-gray-100 px-5 py-3 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setTodas((t) => !t)}
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  {todas ? "Ver menos" : `Ver las ${marcaciones.length} últimas`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Tarjeta>
  );
}
