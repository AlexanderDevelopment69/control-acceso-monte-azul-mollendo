"use client";

import React, { useCallback, useEffect, useState } from "react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthContext";
import { escucharEventos } from "@/lib/ws";
import { tarjetasContingenciaApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { Paginado, TarjetaContingencia, UsoTarjetaContingencia } from "@/lib/api/types";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Tarjeta from "@/components/ui/tarjeta/Tarjeta";
import { Modal } from "@/components/ui/modal";
import DatePicker from "@/components/form/date-picker";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { TableFooter } from "@/components/tables/TableFooter";
import { AltoEstable } from "@/components/tables/AltoEstable";
import { hoy, pieDePagina } from "@/lib/paginaServidor";
import { LockIcon, TrashBinIcon } from "@/icons";
import { Movimiento } from "../../vigilancia/CeldasEvento";
import { diaVisible } from "./imprimir";
import { ImprimirTarjeta } from "./ImprimirTarjeta";
import { PaginasTarjetas } from "./PaginasTarjetas";

const POR_PAGINA = 10;

/** "20/10/2026 08:30". */
function fechaYHora(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("es-PE")} ${d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`;
}

/** Estado de la tarjeta: solo una activa y sin vencer sirve en los lectores. */
function estadoDe(tarjeta: TarjetaContingencia): { texto: string; sirve: boolean } {
  if (!tarjeta.activa) return { texto: "Desactivada", sirve: false };
  if (tarjeta.vencida) return { texto: "Vencida", sirve: false };
  return { texto: "Activa", sirve: true };
}

/** QR de adorno (no es el de la tarjeta: ese solo sale al imprimir). */
function QrAdorno() {
  const celdas = [
    "1110101", "1010011", "1110110", "0001010", "1101011", "0110101", "1011101",
  ];
  return (
    <svg viewBox="0 0 7 7" className="size-14 rounded-md bg-white p-1.5 text-gray-900" aria-hidden>
      {celdas.flatMap((fila, y) => [...fila].map((c, x) => (c === "1" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" /> : null)))}
    </svg>
  );
}

/** Una tarjeta como el carné impreso: nombre, estado y vencimiento; debajo, último uso y botones. */
function TarjetaVisual({
  tarjeta,
  esAdministrador,
  onImprimir,
  onVencimiento,
  onAccion,
  resaltada = false,
}: {
  tarjeta: TarjetaContingencia;
  esAdministrador: boolean;
  /** Recién creada: se marca unos segundos para encontrarla. */
  resaltada?: boolean;
  onImprimir: () => void;
  onVencimiento: () => void;
  onAccion: (accion: Confirmacion["accion"]) => void;
}) {
  const estado = estadoDe(tarjeta);
  return (
    // El carné a la izquierda; los datos y los botones al costado (en el celular, debajo).
    <Tarjeta
      className={`flex flex-col gap-4 overflow-hidden p-4 transition-shadow duration-500 sm:flex-row ${
        // Por dentro: el carrusel recorta lo que sobresale.
        resaltada ? "ring-2 ring-inset ring-brand-500" : ""
      }`}
    >
      <div
        className={`relative flex aspect-[85.6/54] w-full shrink-0 flex-col self-start sm:w-80 justify-between overflow-hidden rounded-xl p-5 text-white shadow-md ${
          estado.sirve ? "bg-gradient-to-br from-brand-500 to-brand-800" : "bg-gradient-to-br from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800"
        }`}
      >
        {/* Círculos de fondo, solo de adorno. */}
        <span className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10" aria-hidden />
        <span className="pointer-events-none absolute -bottom-16 right-16 size-40 rounded-full bg-white/5" aria-hidden />
        <div className="relative flex items-start justify-between gap-3">
          <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/80">
            <LockIcon className="size-4" aria-hidden />
            Contingencia
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              estado.sirve ? "bg-white/20 text-white" : "bg-gray-900/30 text-white"
            }`}
          >
            {estado.texto}
          </span>
        </div>
        <div className="relative flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-lg font-semibold leading-tight">Tarjeta de contingencia</p>
            <p className="text-3xl font-bold leading-tight">N.º {tarjeta.numero}</p>
            <p className="mt-2 text-xs text-white/80">{tarjeta.venceEl ? `Vence el ${diaVisible(tarjeta.venceEl)}` : "No vence"}</p>
          </div>
          <QrAdorno />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 sm:max-w-sm">
        <div className="flex items-start gap-3">
          <dl className="grid flex-1 grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400">Último uso</dt>
              <dd className="text-gray-800 dark:text-white/90">
                {tarjeta.ultimoUso ? (
                  // El día arriba y la hora abajo, para que no se parta "p. m.".
                  <>
                    {new Date(tarjeta.ultimoUso).toLocaleDateString("es-PE")}
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {new Date(tarjeta.ultimoUso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </>
                ) : (
                  "Sin usar"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400">Código del</dt>
              <dd className="text-gray-800 dark:text-white/90">{new Date(tarjeta.codigoCambiadoEn).toLocaleDateString("es-PE")}</dd>
            </div>
          </dl>
          {esAdministrador && (
            // Solo una tarjeta que nunca se usó: la usada se desactiva, para conservar su historial.
            <span title={tarjeta.eliminable ? "Eliminar tarjeta" : "Ya se usó: desactívela para conservar su historial"}>
              <button
                type="button"
                aria-label="Eliminar tarjeta"
                disabled={!tarjeta.eliminable}
                onClick={() => onAccion("eliminar")}
                className="flex size-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-error-50 hover:text-error-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-400 dark:hover:bg-error-500/10"
              >
                <TrashBinIcon className="size-4" />
              </button>
            </span>
          )}
        </div>

        {esAdministrador && (
          <div className="grid grid-cols-2 gap-2 [&_button]:w-full [&_button]:px-3">
            <Button type="button" size="sm" onClick={onImprimir}>
              Imprimir
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={onVencimiento}>
              Vencimiento
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => onAccion("cambiar-codigo")}>
              Cambiar código
            </Button>
            <Button type="button" size="sm" variant={tarjeta.activa ? "outline-danger" : "outline"} onClick={() => onAccion(tarjeta.activa ? "desactivar" : "activar")}>
              {tarjeta.activa ? "Desactivar" : "Activar"}
            </Button>
          </div>
        )}
      </div>
    </Tarjeta>
  );
}

/** Nueva tarjeta, o cambiar el vencimiento de una: "No vence" o hasta un día (incluido). */
function VencimientoModal({
  abierta,
  tarjeta,
  onCerrar,
  onGuardar,
}: {
  abierta: boolean;
  /** Sin tarjeta: es una nueva. */
  tarjeta: TarjetaContingencia | null;
  onCerrar: () => void;
  onGuardar: (venceEl: string | null) => Promise<void>;
}) {
  const [vence, setVence] = useState(false);
  const [dia, setDia] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!abierta) return;
    setVence(!!tarjeta?.venceEl);
    setDia(tarjeta?.venceEl ?? "");
    setError(null);
  }, [abierta, tarjeta]);

  async function guardar() {
    setGuardando(true);
    setError(null);
    try {
      await onGuardar(vence ? dia : null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  }

  const opcion = (valor: boolean, texto: string) => (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
      <input type="radio" name="vencimiento-tarjeta" checked={vence === valor} onChange={() => setVence(valor)} className="size-4 accent-brand-500" />
      {texto}
    </label>
  );

  return (
    <Modal isOpen={abierta} onClose={onCerrar} bloqueado={guardando} className="max-w-md p-6 sm:p-8">
      <h2 className="mb-2 pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">
        {tarjeta ? `Vencimiento de la ${tarjeta.nombre.toLowerCase()}` : "Nueva tarjeta de contingencia"}
      </h2>
      {!tarjeta && (
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Después de crearla, imprímala y entréguela al vigilante.
        </p>
      )}
      <div className="mt-2 flex flex-col gap-3">
        {opcion(false, "No vence")}
        {opcion(true, "Vence el día:")}
        {vence && <DatePicker id="vence-tarjeta" value={dia} min={hoy()} onChange={setDia} placeholder="Elija el último día" />}
      </div>
      {error && <ErrorBanner className="mt-4">{error}</ErrorBanner>}
      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="outline" disabled={guardando} onClick={onCerrar}>
          Cancelar
        </Button>
        <Button type="button" disabled={guardando || (vence && !dia)} onClick={() => void guardar()}>
          {guardando ? "Guardando…" : tarjeta ? "Guardar" : "Crear tarjeta"}
        </Button>
      </div>
    </Modal>
  );
}

type Confirmacion = { tarjeta: TarjetaContingencia; accion: "desactivar" | "activar" | "cambiar-codigo" | "eliminar" };

/** Confirmación de desactivar, activar o cambiar el código (la tarjeta impresa deja de servir). */
function ConfirmarAccion({
  confirmacion,
  onCerrar,
  onConfirmar,
}: {
  confirmacion: Confirmacion | null;
  onCerrar: () => void;
  onConfirmar: () => Promise<void>;
}) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = confirmacion?.tarjeta;
  const accion = confirmacion?.accion;

  async function confirmar() {
    setGuardando(true);
    setError(null);
    try {
      await onConfirmar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  }

  function cerrar() {
    setError(null);
    onCerrar();
  }

  const titulo = { "cambiar-codigo": "Cambiar el código", desactivar: "Desactivar tarjeta", activar: "Activar tarjeta", eliminar: "Eliminar tarjeta" }[
    accion ?? "activar"
  ];
  return (
    <Modal isOpen={!!confirmacion} onClose={cerrar} bloqueado={guardando} className="max-w-lg p-6 sm:p-8">
      {t && (
        <>
          <h2 className="mb-2 pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">{titulo}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {accion === "cambiar-codigo" && (
              <>
                La <strong>{t.nombre}</strong> impresa dejará de servir. Úselo si se perdió o alguien le tomó una foto. Después
                imprímala otra vez y entréguela al vigilante.
              </>
            )}
            {accion === "desactivar" && (
              <>
                ¿Desactivar la <strong>{t.nombre}</strong>? Dejará de servir hasta que la vuelva a activar.
              </>
            )}
            {accion === "eliminar" && (
              <>
                ¿Eliminar la <strong>{t.nombre}</strong>? Nunca se usó: se borra definitivamente y queda en la Auditoría. Si ya la
                imprimió, deje de usarla.
              </>
            )}
            {accion === "activar" && (
              <>
                ¿Activar la <strong>{t.nombre}</strong>? Volverá a servir en los lectores.
              </>
            )}
          </p>
          {error && <ErrorBanner className="mt-4">{error}</ErrorBanner>}
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" size="sm" variant="outline" onClick={cerrar} disabled={guardando}>
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              variant={accion === "activar" ? "primary" : "danger"}
              onClick={() => void confirmar()}
              disabled={guardando}
            >
              {guardando
                ? "Guardando…"
                : { "cambiar-codigo": "Cambiar código", desactivar: "Desactivar", activar: "Activar", eliminar: "Eliminar" }[accion ?? "activar"]}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

function TarjetasContent() {
  const { user } = useAuth();
  const esAdministrador = user?.rol === "administrador";
  const [tarjetas, setTarjetas] = useState<TarjetaContingencia[] | null>(null);
  const [usos, setUsos] = useState<Paginado<UsoTarjetaContingencia> | null>(null);
  const [pagina, setPagina] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [nueva, setNueva] = useState(false);
  const [imprimiendo, setImprimiendo] = useState<TarjetaContingencia | null>(null);
  // La recién creada: el carrusel va hasta ella y queda marcada unos segundos.
  const [creada, setCreada] = useState<number | null>(null);
  const [vencimiento, setVencimiento] = useState<TarjetaContingencia | null>(null);
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null);

  // Se incrementa para volver a pedir las tarjetas y sus usos.
  const [version, setVersion] = useState(0);
  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let activo = true;
    Promise.all([tarjetasContingenciaApi.listar(), tarjetasContingenciaApi.usos({ pagina, porPagina: POR_PAGINA })])
      .then(([t, u]) => {
        if (!activo) return;
        setTarjetas(t);
        setUsos(u);
        setError(null);
      })
      .catch((err) => activo && setError(err instanceof ApiError ? err.message : "No se pudieron cargar las tarjetas"));
    return () => {
      activo = false;
    };
  }, [pagina, version]);

  // Cada vez que se pasa una tarjeta por un lector, se actualizan los usos.
  useEffect(() => escucharEventos({ "tarjeta-contingencia-uso": recargar }, recargar), [recargar]);

  function listo(texto: string) {
    setAviso(texto);
    setNueva(false);
    setVencimiento(null);
    setConfirmacion(null);
    recargar();
  }

  async function confirmarAccion() {
    if (!confirmacion) return;
    const { tarjeta, accion } = confirmacion;
    if (accion === "eliminar") {
      await tarjetasContingenciaApi.eliminar(tarjeta.id);
      listo(`Se eliminó la ${tarjeta.nombre.toLowerCase()}.`);
    } else if (accion === "cambiar-codigo") {
      await tarjetasContingenciaApi.cambiarCodigo(tarjeta.id);
      listo(`Se cambió el código de la ${tarjeta.nombre.toLowerCase()}. Imprímala otra vez: la anterior ya no sirve.`);
    } else {
      await tarjetasContingenciaApi.actualizar(tarjeta.id, { activa: accion === "activar" });
      listo(`La ${tarjeta.nombre.toLowerCase()} quedó ${accion === "activar" ? "activa" : "desactivada"}.`);
    }
  }

  const datosUsos = usos?.datos ?? [];

  return (
    <div>
      <PageHeader
        title="Tarjetas de contingencia"
        description="El vigilante la pasa por el lector en lugar del DNI cuando el trabajador lo olvidó o el lector no lo reconoce."
        actions={
          esAdministrador ? (
            <Button size="sm" onClick={() => setNueva(true)}>
              + Nueva tarjeta
            </Button>
          ) : undefined
        }
      />

      {aviso && (
        <ErrorBanner tono="exito" className="mb-4">
          {aviso}
        </ErrorBanner>
      )}
      {error && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <ErrorBanner className="flex-1">{error}</ErrorBanner>
          <Button type="button" variant="outline" size="sm" onClick={recargar}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Cada tarjeta como el carné impreso, con sus datos y botones debajo. */}
      {!tarjetas && !error && <p className="mb-8 text-sm text-gray-400">Cargando…</p>}
      {tarjetas?.length === 0 && (
        <div className="mb-8 rounded-2xl border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          {esAdministrador ? "Todavía no hay tarjetas. Use “+ Nueva tarjeta”." : "Todavía no hay tarjetas."}
        </div>
      )}
      {!!tarjetas?.length && (
        <div className="mb-8">
          <PaginasTarjetas
            mostrar={
              creada !== null && tarjetas.some((t) => t.id === creada)
                ? { indice: tarjetas.findIndex((t) => t.id === creada), clave: creada }
                : null
            }
          >
            {tarjetas.map((t) => (
              <TarjetaVisual
                key={t.id}
                tarjeta={t}
                resaltada={t.id === creada}
                esAdministrador={esAdministrador}
                onImprimir={() => setImprimiendo(t)}
                onVencimiento={() => setVencimiento(t)}
                onAccion={(accion) => setConfirmacion({ tarjeta: t, accion })}
              />
            ))}
          </PaginasTarjetas>
        </div>
      )}

      <h2 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">Usos de las tarjetas</h2>
      <Tarjeta className="overflow-hidden">
        <div className="overflow-x-auto [&_th]:whitespace-nowrap">
          <AltoEstable paginaCompleta={datosUsos.length === POR_PAGINA} variasPaginas={(usos?.total ?? 0) > POR_PAGINA}>
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  {["Fecha y hora", "Tarjeta", "Movimiento", "Resultado", "Trabajador o motivo"].map((c) => (
                    <TableCell key={c} isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">
                      {c}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {usos && datosUsos.length === 0 && (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={5}>
                      Todavía no se pasó ninguna tarjeta por los lectores.
                    </TableCell>
                  </TableRow>
                )}
                {datosUsos.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="whitespace-nowrap px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{fechaYHora(u.fechaHora)}</TableCell>
                    <TableCell className="whitespace-nowrap px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {u.tarjeta ?? <span className="text-gray-400">No registrada</span>}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <Movimiento tipo={u.tipoMovimiento} />
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm">
                      {/* Aceptada: el resultado del ingreso o la salida (puede denegarse, p. ej. por documentos). */}
                      {u.aceptada && u.resultado === "autorizado" ? (
                        <Badge color="success">Autorizado</Badge>
                      ) : (
                        <Badge color="error">{u.aceptada ? "Denegado" : "Rechazada"}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="min-w-64 px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {u.persona ? (
                        <>
                          {u.persona}
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            DNI {u.numeroDocumento}
                            {u.resultado === "denegado" ? " · ver el motivo en el Panel" : ""}
                          </span>
                        </>
                      ) : (
                        u.detalle
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AltoEstable>
        </div>
        {usos && <TableFooter {...pieDePagina(usos)} onPageChange={setPagina} />}
      </Tarjeta>

      <VencimientoModal
        abierta={nueva}
        tarjeta={null}
        onCerrar={() => setNueva(false)}
        onGuardar={async (venceEl) => {
          const t = await tarjetasContingenciaApi.crear(venceEl);
          listo(`Se creó la ${t.nombre.toLowerCase()}. Use “Imprimir” y entréguela al vigilante.`);
          setCreada(t.id);
          setTimeout(() => setCreada((actual) => (actual === t.id ? null : actual)), 4000);
        }}
      />
      <VencimientoModal
        abierta={!!vencimiento}
        tarjeta={vencimiento}
        onCerrar={() => setVencimiento(null)}
        onGuardar={async (venceEl) => {
          const t = await tarjetasContingenciaApi.actualizar(vencimiento!.id, { venceEl });
          listo(t.venceEl ? `La ${t.nombre.toLowerCase()} vence el ${diaVisible(t.venceEl)}.` : `La ${t.nombre.toLowerCase()} no vence.`);
        }}
      />
      <ImprimirTarjeta tarjeta={imprimiendo} onCerrar={() => setImprimiendo(null)} />
      <ConfirmarAccion confirmacion={confirmacion} onCerrar={() => setConfirmacion(null)} onConfirmar={confirmarAccion} />
    </div>
  );
}

export default function TarjetasContingenciaPage() {
  return (
    <RequireRole roles={["administrador", "vigilancia"]}>
      <TarjetasContent />
    </RequireRole>
  );
}
