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
import { Movimiento } from "../../vigilancia/CeldasEvento";
import { diaVisible, htmlTarjeta } from "./imprimir";

const POR_PAGINA = 10;

/** "20/10/2026 08:30". */
function fechaYHora(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("es-PE")} ${d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`;
}

function EstadoTarjeta({ tarjeta }: { tarjeta: TarjetaContingencia }) {
  if (!tarjeta.activa) return <Badge color="light">Desactivada</Badge>;
  if (tarjeta.vencida) return <Badge color="error">Vencida</Badge>;
  return <Badge color="success">Activa</Badge>;
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

type Confirmacion = { tarjeta: TarjetaContingencia; accion: "desactivar" | "activar" | "cambiar-codigo" };

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

  const titulo = accion === "cambiar-codigo" ? "Cambiar el código" : accion === "desactivar" ? "Desactivar tarjeta" : "Activar tarjeta";
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
              {guardando ? "Guardando…" : accion === "cambiar-codigo" ? "Cambiar código" : accion === "desactivar" ? "Desactivar" : "Activar"}
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

  /** Abre la tarjeta lista para imprimir en otra ventana (se abre antes de pedir el QR, para que el navegador no la bloquee). */
  async function imprimir(tarjeta: TarjetaContingencia) {
    const ventana = window.open("", "_blank", "width=720,height=520");
    if (!ventana) {
      setError("El navegador bloqueó la ventana para imprimir. Permita las ventanas emergentes de este sitio.");
      return;
    }
    try {
      const qr = await tarjetasContingenciaApi.qr(tarjeta.id);
      ventana.document.open();
      ventana.document.write(htmlTarjeta(tarjeta, qr));
      ventana.document.close();
    } catch (err) {
      ventana.close();
      setError(err instanceof ApiError ? err.message : "No se pudo preparar la tarjeta para imprimir");
    }
  }

  async function confirmarAccion() {
    if (!confirmacion) return;
    const { tarjeta, accion } = confirmacion;
    if (accion === "cambiar-codigo") {
      await tarjetasContingenciaApi.cambiarCodigo(tarjeta.id);
      listo(`Se cambió el código de la ${tarjeta.nombre.toLowerCase()}. Imprímala otra vez: la anterior ya no sirve.`);
    } else {
      await tarjetasContingenciaApi.actualizar(tarjeta.id, { activa: accion === "activar" });
      listo(`La ${tarjeta.nombre.toLowerCase()} quedó ${accion === "activar" ? "activa" : "desactivada"}.`);
    }
  }

  const columnas = esAdministrador ? 5 : 4;
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

      <Tarjeta className="mb-8 overflow-hidden">
        <div className="overflow-x-auto [&_th]:whitespace-nowrap">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                {["Tarjeta", "Vence", "Estado", "Último uso", ...(esAdministrador ? [""] : [])].map((c, i) => (
                  <TableCell key={i} isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">
                    {c}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {!tarjetas && !error && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={columnas}>
                    Cargando…
                  </TableCell>
                </TableRow>
              )}
              {tarjetas?.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={columnas}>
                    {esAdministrador ? "Todavía no hay tarjetas. Use “+ Nueva tarjeta”." : "Todavía no hay tarjetas."}
                  </TableCell>
                </TableRow>
              )}
              {tarjetas?.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="px-5 py-4 text-sm">
                    <span className="block whitespace-nowrap text-gray-800 dark:text-white/90">{t.nombre}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      Código del {new Date(t.codigoCambiadoEn).toLocaleDateString("es-PE")}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {t.venceEl ? diaVisible(t.venceEl) : "No vence"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm">
                    <EstadoTarjeta tarjeta={t} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {t.ultimoUso ? fechaYHora(t.ultimoUso) : "Sin usar"}
                  </TableCell>
                  {esAdministrador && (
                    <TableCell className="px-5 py-4 text-sm">
                      {/* Con poco espacio, los botones pasan a dos líneas. */}
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button type="button" size="sm" onClick={() => void imprimir(t)}>
                          Imprimir
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setVencimiento(t)}>
                          Vencimiento
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setConfirmacion({ tarjeta: t, accion: "cambiar-codigo" })}>
                          Cambiar código
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={t.activa ? "outline-danger" : "outline"}
                          onClick={() => setConfirmacion({ tarjeta: t, accion: t.activa ? "desactivar" : "activar" })}
                        >
                          {t.activa ? "Desactivar" : "Activar"}
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Tarjeta>

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
