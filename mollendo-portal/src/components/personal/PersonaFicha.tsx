"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { personasApi } from "@/lib/api/endpoints";
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
 * renovar), foto, dar de baja e historial. Los documentos solo se renuevan
 * (se agregan al registrar a la persona); si no tiene ninguno, se muestra el
 * formulario para subir el primero.
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
  /** Documento que se está renovando (abre la ventana de renovación). */
  const [aRenovar, setARenovar] = useState<string | null>(null);
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
    setARenovar(null);
    recargarTodo();
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

      {actuales.length === 0 && (
        <Seccion
          titulo="Subir documento"
          descripcion="No tiene documentos: sin ellos no puede ingresar. Queda válido desde que se carga."
        >
          <SubirDocumentoForm personaId={persona.id} onSubido={documentoSubido} />
        </Seccion>
      )}

      <Modal isOpen={aRenovar !== null} onClose={() => setARenovar(null)} className="max-w-2xl p-6 sm:p-8">
        <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">Renovar documento</h2>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          Se guarda como versión nueva; la anterior queda en el historial.
        </p>
        {aRenovar !== null && (
          <SubirDocumentoForm key={aRenovar} personaId={persona.id} nombreFijo={aRenovar} onSubido={documentoSubido} />
        )}
      </Modal>

      <Seccion
        titulo="Documentos"
        descripcion="Cuenta la última versión de cada documento. Uno que vence hoy sigue válido todo el día."
      >
        {actuales.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Todavía no tiene documentos. Súbelo arriba: sin documentos no puede ingresar.
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
                      <Button size="sm" variant="outline" onClick={() => setARenovar(d.nombre)}>
                        Renovar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
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
