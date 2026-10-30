import React from "react";
import type { IngresoEnEspera } from "@/lib/api/types";
import Badge from "@/components/ui/badge/Badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { FotoGuardada } from "@/components/personal/FotoPersonal";
import { RenglonTarjeta, TarjetaFila } from "@/components/tables/TarjetaFila";
import { Movimiento } from "./CeldasEvento";

/** Segundos que faltan hasta `hasta`, como "1:42". */
function tiempoRestante(hasta: string, ahora: number): string {
  const s = Math.max(0, Math.round((new Date(hasta).getTime() - ahora) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Fracción de la espera que queda (1 al habilitarlo, 0 al vencer). */
function fraccionRestante(i: IngresoEnEspera, ahora: number): number {
  if (!i.hasta) return 1;
  const total = new Date(i.hasta).getTime() - new Date(i.desde).getTime();
  return total > 0 ? Math.min(1, Math.max(0, (new Date(i.hasta).getTime() - ahora) / total)) : 0;
}

/** Lo que dice la insignia de la espera: "en cola", "pase su DNI" o "en espera". */
function estadoEspera(i: IngresoEnEspera): string {
  return i.enCola ? "en cola" : i.esperaDni ? "pase su DNI" : "en espera";
}

/** Qué falta para completar el ingreso. */
function textoEspera(i: IngresoEnEspera): string {
  return i.esperaDni
    ? i.numeroDocumento !== "—"
      ? "Falta que pase su DNI"
      : "Falta que pase su DNI (consultando quién sopló)"
    : i.manual
      ? i.enCola
        ? "Esperando su turno (verificación manual)"
        : "Verificación manual: el vigilante decide"
      : i.enCola
        ? "Esperando su turno en el terminal facial"
        : "Esperando rostro y alcohol";
}

/**
 * DNI en regla que esperan el rostro y el alcohol del G4 Pro: filas arriba
 * del historial, con las mismas columnas. Al llegar el resultado, la fila se
 * reemplaza por la del evento (que se resalta); al vencer la espera, se quita.
 */
export function FilasEnEspera({ ingresos, ahora }: { ingresos: IngresoEnEspera[]; ahora: number }) {
  return (
    <>
      {ingresos.map((i) => (
        <TableRow key={`espera-${i.id}`}>
          <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
            {new Date(i.desde).toLocaleTimeString("es-PE")}
          </TableCell>
          <TableCell className="hidden @5xl:table-cell px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{i.numeroDocumento}</TableCell>
          <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
            {/* Foto para comparar con quien está frente al terminal facial. */}
            <div className="flex items-center gap-3">
              {!i.personaId ? (
                // Sin persona todavía: la aprobación de facial primero (quién sopló va en el nombre, si se sabe) o la tarjeta de contingencia que espera rostro y alcohol.
                <span className="flex size-12 items-center justify-center rounded-full bg-gray-100 text-lg text-gray-400 dark:bg-white/[0.06]">?</span>
              ) : (
                <FotoGuardada personaId={i.personaId} tieneFoto={i.tieneFoto} version={i.fotoVersion} tamano="size-12" miniatura />
              )}
              <span>
                {i.nombres} {i.apellidos}
                {/* Con poco espacio la columna DNI se oculta: el DNI va bajo el nombre. */}
                {i.numeroDocumento && i.numeroDocumento !== "—" && (
                  <span className="block text-xs text-gray-500 @5xl:hidden dark:text-gray-400">DNI {i.numeroDocumento}</span>
                )}
              </span>
            </div>
          </TableCell>
          <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
            <Movimiento tipo="ingreso" />
          </TableCell>
          <TableCell className="px-5 py-4 text-sm">
            <Badge color={i.enCola ? "light" : "success"}>
              <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" aria-hidden />
              {estadoEspera(i)}
            </Badge>
          </TableCell>
          <TableCell className="px-5 py-4 text-sm">
            <div className="flex items-center justify-between gap-3 text-gray-700 dark:text-gray-300">
              <span>{textoEspera(i)}</span>
              {i.hasta && (
                <span className="tabular-nums text-xs text-gray-500 dark:text-gray-400" title={i.esperaDni ? "Tiempo para pasar su DNI" : "Tiempo para completar el ingreso en el terminal facial"}>
                  {tiempoRestante(i.hasta, ahora)}
                </span>
              )}
            </div>
            <div className={`mt-1.5 h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 ${i.enCola ? "invisible" : ""}`}>
              <div
                className="h-full rounded-full bg-success-500 transition-[width] duration-1000 ease-linear"
                style={{ width: `${fraccionRestante(i, ahora) * 100}%` }}
              />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

/** Las mismas esperas en tarjetas, para el celular (con el orden de TarjetaEvento en page.tsx). */
export function TarjetasEnEspera({ ingresos, ahora }: { ingresos: IngresoEnEspera[]; ahora: number }) {
  return (
    <>
      {ingresos.map((i) => (
        <TarjetaFila
          key={`espera-${i.id}`}
          estado="espera"
          foto={
            !i.personaId ? (
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400 dark:bg-gray-800">?</span>
            ) : (
              <FotoGuardada personaId={i.personaId} tieneFoto={i.tieneFoto} version={i.fotoVersion} tamano="size-11" miniatura />
            )
          }
          titulo={`${i.nombres} ${i.apellidos}`}
          subtitulo={i.numeroDocumento && i.numeroDocumento !== "—" ? `DNI ${i.numeroDocumento}` : undefined}
          hora={new Date(i.desde).toLocaleTimeString("es-PE")}
        >
          <RenglonTarjeta
            izquierda={<Movimiento tipo="ingreso" />}
            derecha={
              <Badge color={i.enCola ? "light" : "success"}>
                <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" aria-hidden />
                {estadoEspera(i)}
              </Badge>
            }
          />
          <RenglonTarjeta
            izquierda={textoEspera(i)}
            derecha={i.hasta && <span className="tabular-nums text-xs text-gray-500 dark:text-gray-400">{tiempoRestante(i.hasta, ahora)}</span>}
          />
          <div className={`h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 ${i.enCola ? "invisible" : ""}`}>
            <div
              className="h-full rounded-full bg-success-500 transition-[width] duration-1000 ease-linear"
              style={{ width: `${fraccionRestante(i, ahora) * 100}%` }}
            />
          </div>
        </TarjetaFila>
      ))}
    </>
  );
}
