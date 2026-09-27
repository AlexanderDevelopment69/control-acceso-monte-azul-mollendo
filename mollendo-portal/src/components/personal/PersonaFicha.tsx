"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { documentosApi, personasApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { Cumplimiento, DocumentoPersona, Persona } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { Modal } from "@/components/ui/modal";
import { SubirDocumentoForm } from "./SubirDocumentoForm";
import { FotoGuardada, validarFoto } from "./FotoPersonal";

/** Las columnas DATE llegan como medianoche UTC: se muestran en UTC para no correrse un día. */
export function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-PE", { timeZone: "UTC" });
}

export function motivosCumplimiento(c: Cumplimiento): string[] {
  if (c.dadoDeBaja) return ["Dado de baja"];
  const motivos: string[] = [];
  if (c.sinDocumentos) motivos.push("Sin documentos cargados");
  if (c.documentosVencidos.length > 0) motivos.push(`Vencido: ${c.documentosVencidos.join(", ")}`);
  return motivos;
}

function Seccion({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{titulo}</h3>
      {descripcion && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{descripcion}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * Ficha de un trabajador en la pantalla principal del administrador: si puede
 * ingresar hoy, sus documentos (última versión de cada uno, con botón para
 * renovar o eliminar), agregar documentos, foto, dar de baja e historial.
 */
export function PersonaFicha({
  personaId,
  onCambio,
}: {
  personaId: number;
  /** Avisa a la pantalla que cambió el cumplimiento del trabajador. */
  onCambio: () => void;
}) {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Ventana abierta: agregar un documento nuevo o renovar uno existente (por su nombre). */
  const [ventana, setVentana] = useState<{ modo: "agregar" } | { modo: "renovar"; nombre: string } | null>(null);
  /** Documento a eliminar (pide confirmación). */
  const [aEliminar, setAEliminar] = useState<{ tipoDocumentoId: number; nombre: string } | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);

  const obtener = useCallback(() => personasApi.get(personaId), [personaId]);

  const aplicar = useCallback((p: Persona) => {
    setPersona(p);
    setError(null);
  }, []);

  const fallar = useCallback((err: unknown) => {
    setError(err instanceof ApiError ? err.message : "No se pudo cargar al personal");
  }, []);

  const cargar = useCallback(() => obtener().then(aplicar).catch(fallar), [obtener, aplicar, fallar]);

  // Se monta de nuevo por cada persona (key en el padre), así que no hace falta limpiar el estado aquí.
  useEffect(() => {
    let activo = true;
    obtener()
      .then((datos) => activo && aplicar(datos))
      .catch((err) => activo && fallar(err));
    return () => {
      activo = false;
    };
  }, [obtener, aplicar, fallar]);

  function recargarTodo() {
    cargar();
    onCambio();
  }

  function documentoSubido() {
    setVentana(null);
    recargarTodo();
  }

  async function confirmarEliminar() {
    if (!aEliminar) return;
    setEliminando(true);
    setErrorEliminar(null);
    try {
      await documentosApi.eliminar(personaId, aEliminar.tipoDocumentoId);
      setAEliminar(null);
      recargarTodo();
    } catch (err) {
      setErrorEliminar(err instanceof ApiError ? err.message : "No se pudo eliminar el documento");
    } finally {
      setEliminando(false);
    }
  }

  async function cambiarFoto(archivo: File) {
    const problema = validarFoto(archivo);
    if (problema) {
      setErrorFoto(problema);
      return;
    }
    setErrorFoto(null);
    setSubiendoFoto(true);
    try {
      await personasApi.subirFoto(personaId, archivo);
      cargar();
    } catch (err) {
      setErrorFoto(err instanceof ApiError ? err.message : "No se pudo subir la foto");
    } finally {
      setSubiendoFoto(false);
    }
  }

  async function toggleEstado() {
    if (!persona) return;
    await personasApi.updateEstado(persona.id, persona.estado === "activo" ? "inactivo" : "activo");
    recargarTodo();
  }

  if (error) return <ErrorBanner>{error}</ErrorBanner>;
  if (!persona) return <div className="p-6 text-sm text-gray-400">Cargando…</div>;

  const cumplimiento = persona.cumplimiento;
  const actuales = persona.documentosActuales ?? [];
  const historial: DocumentoPersona[] = persona.documentos ?? [];
  const idsActuales = new Set(actuales.map((d) => d.id));

  return (
    <div className="space-y-5">
      {/* Encabezado + ¿puede ingresar? */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="space-y-2 text-center">
              <FotoGuardada personaId={persona.id} tieneFoto={!!persona.fotoUrl} version={persona.fotoUrl} tamano="size-24" />
              <button
                type="button"
                disabled={subiendoFoto}
                onClick={() => fotoInputRef.current?.click()}
                className="text-xs font-medium text-brand-500 hover:text-brand-600 disabled:opacity-50 dark:text-brand-400"
              >
                {subiendoFoto ? "Subiendo…" : persona.fotoUrl ? "Cambiar foto" : "Subir foto"}
              </button>
              <input
                ref={fotoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const archivo = e.target.files?.[0];
                  e.target.value = "";
                  if (archivo) cambiarFoto(archivo);
                }}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {persona.nombres} {persona.apellidos}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {persona.tipoDocumentoIdentidad} {persona.numeroDocumento}
                {persona.empresa && ` · ${persona.empresa.razonSocial}`}
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={toggleEstado}>
            {persona.estado === "activo" ? "Dar de baja" : "Reactivar"}
          </Button>
        </div>
        {errorFoto && <ErrorBanner className="mt-4">{errorFoto}</ErrorBanner>}
        {!persona.fotoUrl && (
          <div className="mt-4 rounded-lg bg-warning-50 px-4 py-3 text-sm text-warning-700 dark:bg-warning-500/15 dark:text-orange-400">
            Sin foto: no podrá identificarse por reconocimiento facial en el terminal. Usa “Subir foto”.
          </div>
        )}
        {cumplimiento && (
          <div
            className={`mt-4 rounded-lg px-4 py-3 text-sm ${
              cumplimiento.habilitado
                ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500"
                : "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500"
            }`}
          >
            {cumplimiento.habilitado ? (
              <>✔ Puede ingresar hoy (sujeto a la prueba de alcohol en garita).</>
            ) : (
              <>✖ No puede ingresar: {motivosCumplimiento(cumplimiento).join(" · ")}.</>
            )}
          </div>
        )}
      </section>

      <Modal isOpen={ventana !== null} onClose={() => setVentana(null)} className="max-w-2xl p-6 sm:p-8">
        <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          {ventana?.modo === "renovar" ? "Renovar documento" : "Agregar documento"}
        </h2>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          {ventana?.modo === "renovar"
            ? "Se guarda como versión nueva; la anterior queda en el historial."
            : "Queda válido desde que se carga. Si ya tiene un documento con ese nombre, se guarda como versión nueva."}
        </p>
        {ventana?.modo === "renovar" && (
          <SubirDocumentoForm key={ventana.nombre} personaId={persona.id} nombreFijo={ventana.nombre} onSubido={documentoSubido} />
        )}
        {ventana?.modo === "agregar" && <SubirDocumentoForm personaId={persona.id} onSubido={documentoSubido} />}
      </Modal>

      <Modal isOpen={aEliminar !== null} onClose={() => setAEliminar(null)} className="max-w-md p-6 sm:p-8">
        <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">Eliminar documento</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Se eliminará <strong>{aEliminar?.nombre}</strong> de {persona.nombres} {persona.apellidos}, con todas sus
          versiones y archivos. Esta acción no se puede deshacer.
          {actuales.length === 1 && " Es su único documento: después no podrá ingresar hasta que se le agregue otro."}
        </p>
        {errorEliminar && <ErrorBanner className="mt-4">{errorEliminar}</ErrorBanner>}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setAEliminar(null)}>
            Cancelar
          </Button>
          <Button type="button" variant="danger" disabled={eliminando} onClick={confirmarEliminar}>
            {eliminando ? "Eliminando…" : "Eliminar"}
          </Button>
        </div>
      </Modal>

      <Seccion
        titulo="Documentos"
        descripcion="Cuenta la última versión de cada documento. Uno que vence hoy sigue válido todo el día."
      >
        {actuales.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Todavía no tiene documentos: sin documentos no puede ingresar. Usa “+ Agregar documento”.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="py-2 pr-4 text-start text-xs font-medium text-gray-500">Documento</TableCell>
                  <TableCell isHeader className="py-2 pr-4 text-start text-xs font-medium text-gray-500">Vence</TableCell>
                  <TableCell isHeader className="py-2 pr-4 text-start text-xs font-medium text-gray-500">Estado</TableCell>
                  <TableCell isHeader className="py-2 text-start text-xs font-medium text-gray-500"></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {actuales.map((d) => (
                  <TableRow key={d.tipoDocumentoId}>
                    <TableCell className="py-3 pr-4 text-sm text-gray-700 dark:text-gray-300">{d.nombre}</TableCell>
                    <TableCell className="py-3 pr-4 text-sm text-gray-700 dark:text-gray-300">
                      {d.fechaVencimiento ? formatearFecha(d.fechaVencimiento) : "No vence"}
                    </TableCell>
                    <TableCell className="py-3 pr-4 text-sm">
                      {d.vigente ? <Badge color="success">Vigente</Badge> : <Badge color="error">Vencido</Badge>}
                    </TableCell>
                    <TableCell className="py-3 text-sm">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setVentana({ modo: "renovar", nombre: d.nombre })}>
                          Renovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => {
                            setErrorEliminar(null);
                            setAEliminar({ tipoDocumentoId: d.tipoDocumentoId, nombre: d.nombre });
                          }}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="mt-4">
          <Button size="sm" variant="outline" onClick={() => setVentana({ modo: "agregar" })}>
            + Agregar documento
          </Button>
        </div>
      </Seccion>

      {historial.length > actuales.length && (
        <details className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
            Historial de documentos ({historial.length})
          </summary>
          <ul className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
            {historial.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                <span>
                  {d.tipoDocumento?.nombre} v{d.version}
                  <span className="text-gray-400">
                    {" "}
                    · cargado {new Date(d.creadoEn).toLocaleDateString("es-PE")}
                    {d.fechaVencimiento && ` · vence ${formatearFecha(d.fechaVencimiento)}`}
                  </span>
                </span>
                {!idsActuales.has(d.id) && <Badge color="light">Reemplazado</Badge>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
