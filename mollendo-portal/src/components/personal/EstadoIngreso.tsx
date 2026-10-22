import { fechaCorta, textoPeriodo } from "@/lib/periodo";
import React from "react";
import type { Cumplimiento, Persona } from "@/lib/api/types";
import Button from "@/components/ui/button/Button";
import { CalenderIcon, CheckLineIcon, CloseLineIcon, FileIcon } from "@/icons";
// Los mismos íconos del recorrido de ingreso del manual.
import { IconoDni, IconoDocumentos, IconoRostro } from "@/app/(admin)/manual/Figuras";
import { diasDesde, formatearFecha } from "./cumplimiento";
import { idRecuadroPeriodo } from "./PeriodoAutorizacionFicha";

type EstadoPaso = "ok" | "falla" | "aviso";

/** Recuadro del ícono de cada paso, según cómo está. */
const CAJA_PASO: Record<EstadoPaso, string> = {
  ok: "bg-white text-success-600 ring-success-200 dark:bg-gray-900 dark:text-success-500 dark:ring-success-500/30",
  falla: "bg-white text-error-600 ring-error-200 dark:bg-gray-900 dark:text-error-500 dark:ring-error-500/40",
  aviso: "bg-white text-warning-600 ring-warning-200 dark:bg-gray-900 dark:text-orange-400 dark:ring-warning-500/30",
};

/** Insignia de la esquina (✓, ✕, !) de cada paso. */
const INSIGNIA_PASO: Record<EstadoPaso, { clase: string; marca: string }> = {
  ok: { clase: "bg-success-500", marca: "✓" },
  falla: { clase: "bg-error-500", marca: "✕" },
  aviso: { clase: "bg-warning-500", marca: "!" },
};

const TEXTO_PASO: Record<EstadoPaso, string> = {
  ok: "text-success-700 dark:text-success-500",
  falla: "text-error-600 dark:text-error-500",
  aviso: "text-warning-700 dark:text-orange-400",
};

/**
 * Los pasos del ingreso que se pueden revisar desde la ficha (DNI → período →
 * documentos → rostro, en el orden en que se revisan en el molinete), con los
 * íconos del recorrido del manual. La prueba de alcohol no aparece: solo se mide
 * al pasar por el molinete.
 */
function RecorridoValidacion({
  pasos,
}: {
  pasos: { nombre: string; estado: EstadoPaso; detalle: string; Icono: React.ComponentType<{ className?: string }> }[];
}) {
  return (
    <ol className="mt-4 grid grid-cols-4 gap-1">
      {pasos.map(({ nombre, estado, detalle, Icono }, i) => (
        <li key={nombre} className="relative flex flex-col items-center text-center">
          {/* Línea que une cada paso con el siguiente. */}
          {i < pasos.length - 1 && (
            <span
              aria-hidden
              className="absolute left-[calc(50%+1.75rem)] top-[22px] h-px w-[calc(100%-3.5rem)] bg-gray-300 dark:bg-gray-700"
            />
          )}
          <span
            className={`relative flex size-11 items-center justify-center rounded-2xl shadow-theme-xs ring-1 ${CAJA_PASO[estado]}`}
          >
            <Icono className="size-6" />
            <span
              className={`absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full text-[11px] font-bold text-white ${INSIGNIA_PASO[estado].clase}`}
            >
              {INSIGNIA_PASO[estado].marca}
            </span>
          </span>
          <span className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">{nombre}</span>
          <span className={`text-[11px] leading-tight ${TEXTO_PASO[estado]}`}>{detalle}</span>
        </li>
      ))}
    </ol>
  );
}

/** Fila de un problema dentro de la tarjeta de estado: qué falta, desde cuándo y el botón que lo resuelve. */
function FilaProblema({ titulo, detalle, accion }: { titulo: string; detalle?: string; accion?: React.ReactNode }) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-lg bg-white px-3 py-2.5 dark:bg-gray-900">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-white/[0.05] dark:text-gray-400">
        <FileIcon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-gray-800 dark:text-white/90">{titulo}</span>
        {detalle && <span className="block text-xs text-error-600 dark:text-error-400">{detalle}</span>}
      </span>
      {accion}
    </li>
  );
}

/**
 * Si la persona puede ingresar hoy: tarjeta de estado con cada problema y el
 * botón que lo resuelve, y debajo los pasos de la validación de ingreso.
 */
export function EstadoIngreso({
  persona,
  cumplimiento,
  onAgregar,
  onRenovar,
  onReactivar,
  soloLectura = false,
}: {
  persona: Persona;
  cumplimiento: Cumplimiento;
  /** Abre la ventana para agregar un documento. */
  onAgregar: () => void;
  /** Abre la ventana para renovar el documento con ese nombre. */
  onRenovar: (nombre: string) => void;
  /** De baja: abre la ventana de "Reactivar" (la misma del botón de arriba). */
  onReactivar: () => void;
  /** El vigilante: sin los botones ni las indicaciones de qué cambiar. */
  soloLectura?: boolean;
}) {
  return (
    <>
      {/* Tarjeta de estado: ícono, título, resumen y, si no puede ingresar, cada problema
          con el botón que lo resuelve (renovar o agregar documento; si está de baja, el enlace Reactivar). */}
      <div
        className={`mt-4 rounded-xl p-4 ${
          cumplimiento.habilitado ? "bg-success-50 dark:bg-success-500/10" : "bg-error-50 dark:bg-error-500/10"
        }`}
      >
        <div className="flex items-start gap-3">
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
              cumplimiento.habilitado
                ? "bg-success-100 text-success-600 dark:bg-success-500/20 dark:text-success-500"
                : "bg-error-100 text-error-600 dark:bg-error-500/20 dark:text-error-500"
            }`}
          >
            {cumplimiento.habilitado ? <CheckLineIcon className="size-5" /> : <CloseLineIcon className="size-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <p
              className={`font-semibold ${
                cumplimiento.habilitado ? "text-success-700 dark:text-success-500" : "text-error-600 dark:text-error-500"
              }`}
            >
              {cumplimiento.habilitado ? "Puede ingresar hoy" : "No puede ingresar"}
            </p>
            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">
              {cumplimiento.habilitado
                ? "Todos sus documentos están vigentes. Al ingresar se validan su DNI, su rostro y la prueba de alcohol."
                : persona.estado === "inactivo"
                  ? (
                      // En dos líneas, como el aviso del período: la baja con su motivo; luego qué hacer.
                      <>
                        <span className="block">
                          Dado de baja{persona.fechaBaja ? ` el ${new Date(persona.fechaBaja).toLocaleDateString("es-PE")}` : ""}
                          {persona.motivoBaja ? `. Motivo: ${persona.motivoBaja}` : ""}.
                        </span>
                        {!soloLectura && (
                        <span className="block">
                          Para que vuelva a ingresar, use{" "}
                          <button
                            type="button"
                            onClick={onReactivar}
                            className="font-semibold text-gray-800 underline-offset-2 hover:underline dark:text-white/90"
                          >
                            Reactivar
                          </button>
                          .
                        </span>
                        )}
                      </>
                    )
                  : cumplimiento.fueraDePeriodo
                    ? (
                        // En dos líneas (en una sola se leía como un bloque): el período con su motivo; luego dónde cambiarlo.
                        <>
                          <span className="block">
                            Fuera del período autorizado ({textoPeriodo(persona)})
                            {persona.motivoAutorizacion ? `. Motivo: ${persona.motivoAutorizacion}` : ""}.
                          </span>
                          {!soloLectura && (
                          <span className="block">
                            Puede cambiarlo abajo, en{" "}
                            {/* Lleva al recuadro del período, más abajo en la ficha. */}
                            <button
                              type="button"
                              onClick={() =>
                                document
                                  .getElementById(idRecuadroPeriodo(persona.id))
                                  ?.scrollIntoView({ behavior: "smooth", block: "center" })
                              }
                              className="font-semibold text-gray-800 underline-offset-2 hover:underline dark:text-white/90"
                            >
                              Período de autorización
                            </button>
                            .
                          </span>
                          )}
                        </>
                      )
                  : cumplimiento.sinDocumentos
                    ? soloLectura
                      ? "No tiene documentos cargados: no puede ingresar hasta que el administrador los agregue."
                      : "No tiene documentos cargados. Agregue al menos uno para que pueda ingresar."
                    : cumplimiento.documentosVencidos.length === 1
                      ? soloLectura
                        ? "1 documento vencido: no puede ingresar hasta que el administrador lo renueve."
                        : "1 documento vencido. Renuévelo para que pueda ingresar."
                      : soloLectura
                        ? `${cumplimiento.documentosVencidos.length} documentos vencidos: no puede ingresar hasta que el administrador los renueve.`
                        : `${cumplimiento.documentosVencidos.length} documentos vencidos. Renuévelos para que pueda ingresar.`}
            </p>
            {persona.estado !== "inactivo" && !cumplimiento.fueraDePeriodo && persona.autorizadoDesde && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Autorizado {textoPeriodo(persona)}
                {persona.motivoAutorizacion ? `. Motivo: ${persona.motivoAutorizacion}` : ""}
              </p>
            )}
            {persona.estado !== "inactivo" && persona.fechaReactivacion && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Reactivado el {new Date(persona.fechaReactivacion).toLocaleDateString("es-PE")}
                {persona.motivoReactivacion ? `. Motivo: ${persona.motivoReactivacion}` : ""}
              </p>
            )}
          </div>
        </div>

        {!cumplimiento.habilitado && persona.estado !== "inactivo" && (
          <ul className="mt-4 space-y-2">
            {cumplimiento.sinDocumentos && (
              <FilaProblema
                titulo="Sin documentos cargados"
                accion={
                  !soloLectura && (
                    <Button size="sm" variant="outline" onClick={onAgregar}>
                      Agregar documento
                    </Button>
                  )
                }
              />
            )}
            {cumplimiento.documentosVencidos.map((nombre) => {
              const doc = persona.documentosActuales?.find((d) => d.nombre === nombre);
              const dias = doc?.fechaVencimiento ? diasDesde(doc.fechaVencimiento) : null;
              return (
                <FilaProblema
                  key={nombre}
                  titulo={nombre}
                  detalle={
                    doc?.fechaVencimiento
                      ? `Venció el ${formatearFecha(doc.fechaVencimiento)}${
                          dias !== null && dias > 0 ? ` · hace ${dias} ${dias === 1 ? "día" : "días"}` : ""
                        }`
                      : "Vencido"
                  }
                  accion={
                    !soloLectura && (
                      <Button size="sm" variant="outline" onClick={() => onRenovar(nombre)}>
                        Renovar
                      </Button>
                    )
                  }
                />
              );
            })}
          </ul>
        )}
      </div>

      {/* Validación de ingreso, aparte de la tarjeta de estado. */}
      <div className="mt-3 rounded-xl bg-gray-50 px-4 py-4 dark:bg-white/[0.03]">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Validación de ingreso</p>
          <RecorridoValidacion
            pasos={[
              {
                nombre: "DNI",
                Icono: IconoDni,
                ...(persona.estado === "inactivo"
                  ? { estado: "falla" as const, detalle: "Dado de baja" }
                  : { estado: "ok" as const, detalle: "Registrado" }),
              },
              {
                // Período de autorización: su propio paso (antes se marcaba en el DNI).
                nombre: "Período",
                Icono: CalenderIcon,
                ...(cumplimiento.fueraDePeriodo
                  ? { estado: "falla" as const, detalle: "Fuera del período" }
                  : persona.autorizadoHasta
                    ? { estado: "ok" as const, detalle: `Hasta el ${fechaCorta(persona.autorizadoHasta)}` }
                    : { estado: "ok" as const, detalle: "Sin límite" }),
              },
              {
                nombre: "Documentos",
                Icono: IconoDocumentos,
                ...(cumplimiento.sinDocumentos
                  ? { estado: "falla" as const, detalle: "Sin documentos" }
                  : cumplimiento.documentosVencidos.length > 0
                    ? {
                        estado: "falla" as const,
                        detalle:
                          cumplimiento.documentosVencidos.length === 1
                            ? "1 vencido"
                            : `${cumplimiento.documentosVencidos.length} vencidos`,
                      }
                    : { estado: "ok" as const, detalle: "Vigentes" }),
              },
              {
                nombre: "Rostro",
                Icono: IconoRostro,
                ...(persona.fotoUrl
                  ? { estado: "ok" as const, detalle: "Con foto" }
                  : { estado: "aviso" as const, detalle: "Sin foto" }),
              },
            ]}
          />
      </div>
    </>
  );
}
