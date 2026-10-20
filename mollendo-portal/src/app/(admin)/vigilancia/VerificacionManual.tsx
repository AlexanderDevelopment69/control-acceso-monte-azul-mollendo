"use client";

import React, { useState } from "react";
import type { DecisionManual, EstadoVerificacionManual, IngresoEnEspera } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { FotoGuardada } from "@/components/personal/FotoPersonal";
import { CheckCircleIcon, InfoIcon } from "@/icons";

/*
 * Verificación manual (contingencia por falla del equipo facial,
 * docs/cliente/Contingencias_Equipos_Acceso.md, sección 4): el DNI y los
 * documentos se revisan igual; el vigilante compara el rostro con la foto y
 * toma la prueba de alcohol con el alcoholímetro de repuesto.
 */

/** "15/10 08:30". */
function diaYHora(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" })} ${d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`;
}

/** Franja fija mientras dura: desde cuándo, quién la activó y el motivo, con el botón para terminarla. */
export function FranjaVerificacionManual({
  estado,
  terminando,
  onTerminar,
}: {
  estado: EstadoVerificacionManual;
  terminando: boolean;
  onTerminar: () => void;
}) {
  const p = estado.periodo;
  if (!estado.activa || !p) return null;
  return (
    <div
      role="status"
      className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-300 bg-brand-50 px-4 py-3 text-sm dark:border-brand-500/40 dark:bg-brand-500/10"
    >
      <p className="flex min-w-0 items-start gap-2.5 leading-relaxed text-gray-700 dark:text-gray-300">
        <InfoIcon className="mt-0.5 size-5 shrink-0 text-brand-500 dark:text-brand-400" aria-hidden />
        <span>
        <span className="font-semibold text-brand-600 dark:text-brand-400">Verificación manual activa</span> desde{" "}
        {diaYHora(p.desde)}
        {p.activadaPor && (
          <>
            , activada por <strong>{p.activadaPor}</strong>
          </>
        )}
        .<br />
        Motivo: {p.motivo}
        </span>
      </p>
      <Button type="button" size="sm" variant="outline" disabled={terminando} onClick={onTerminar}>
        {terminando ? "Volviendo…" : "Volver a modo normal"}
      </Button>
    </div>
  );
}

/** El equipo facial volvió a conectarse durante la verificación manual: se pregunta, no se vuelve solo. */
export function AvisoEquipoVolvio({ terminando, onVolver, onSeguir }: { terminando: boolean; onVolver: () => void; onSeguir: () => void }) {
  return (
    <div
      role="status"
      className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-success-300 bg-success-50 px-4 py-3 text-sm dark:border-success-500/40 dark:bg-success-500/10"
    >
      <p className="flex min-w-0 items-start gap-2.5 text-gray-700 dark:text-gray-300">
        <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-success-600 dark:text-success-400" aria-hidden />
        <span>
          <span className="font-semibold text-success-700 dark:text-success-400">El equipo facial volvió a conectarse.</span> ¿Volver
          a modo normal?
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={terminando} onClick={onVolver}>
          {terminando ? "Volviendo…" : "Volver a modo normal"}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={terminando} onClick={onSeguir}>
          Seguir en manual
        </Button>
      </div>
    </div>
  );
}

/** Ventana para activarla: el motivo es obligatorio y queda en la auditoría. */
export function ActivarVerificacionManual({
  abierta,
  onCerrar,
  onActivar,
}: {
  abierta: boolean;
  onCerrar: () => void;
  onActivar: (motivo: string) => Promise<void>;
}) {
  const [motivo, setMotivo] = useState("Equipo facial desconectado");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function activar() {
    setGuardando(true);
    setError(null);
    try {
      await onActivar(motivo.trim());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo activar la verificación manual");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal isOpen={abierta} onClose={onCerrar} bloqueado={guardando} className="max-w-md p-6 sm:p-8">
      <h2 className="mb-2 pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">Activar verificación manual</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Mientras esté activa, cada ingreso lo aprueba el vigilante: compara el rostro con la foto y toma la prueba de alcohol
        con el alcoholímetro de repuesto.
      </p>
      <label htmlFor="motivo-verificacion-manual" className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Motivo *
      </label>
      <textarea
        id="motivo-verificacion-manual"
        rows={3}
        maxLength={300}
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
      />
      {error && <ErrorBanner className="mt-3">{error}</ErrorBanner>}
      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="outline" disabled={guardando} onClick={onCerrar}>
          Cancelar
        </Button>
        <Button type="button" disabled={guardando || motivo.trim().length < 3} onClick={() => void activar()}>
          {guardando ? "Activando…" : "Activar"}
        </Button>
      </div>
    </Modal>
  );
}

/** "1:42". */
function restante(hasta: string, ahora: number): string {
  const s = Math.max(0, Math.round((new Date(hasta).getTime() - ahora) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * La persona en su turno: foto grande, datos y los tres botones. Se cierra
 * sola al decidir, al vencer los 2 minutos o si otro vigilante decidió antes
 * (desaparece de las esperas).
 */
export function DecisionManualVentana({
  ingreso,
  ahora,
  onDecidir,
}: {
  ingreso: IngresoEnEspera | null;
  ahora: number;
  onDecidir: (id: number, decision: DecisionManual) => Promise<void>;
}) {
  const [enviando, setEnviando] = useState<DecisionManual | null>(null);
  const [error, setError] = useState<{ id: number; texto: string } | null>(null);

  async function decidir(decision: DecisionManual) {
    if (!ingreso) return;
    setEnviando(decision);
    setError(null);
    try {
      await onDecidir(ingreso.id, decision);
    } catch (err) {
      setError({ id: ingreso.id, texto: err instanceof ApiError ? err.message : "No se pudo registrar la decisión" });
    } finally {
      setEnviando(null);
    }
  }

  const mensaje = error && ingreso && error.id === ingreso.id ? error.texto : null;
  return (
    // Sin ✕ ni Esc: la persona espera en el molinete; si no se decide, vence sola a los 2 minutos.
    <Modal isOpen={!!ingreso} onClose={() => undefined} showCloseButton={false} bloqueado className="max-w-xl p-6 sm:p-8">
      {ingreso && (
        <>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Verificación manual de ingreso</h2>
          {ingreso.hasta && (
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Tiempo para decidir:{" "}
              <span className="font-semibold tabular-nums text-warning-600 dark:text-orange-400">{restante(ingreso.hasta, ahora)}</span>
            </p>
          )}
          <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
            <FotoGuardada personaId={ingreso.personaId} tieneFoto={ingreso.tieneFoto} version={ingreso.fotoVersion} tamano="size-40" />
            <div className="min-w-0 text-sm">
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                <dt className="text-gray-500 dark:text-gray-400">Nombre</dt>
                <dd className="font-medium text-gray-800 dark:text-white/90">
                  {ingreso.nombres} {ingreso.apellidos}
                </dd>
                <dt className="text-gray-500 dark:text-gray-400">DNI</dt>
                <dd className="font-medium text-gray-800 dark:text-white/90">{ingreso.numeroDocumento}</dd>
                <dt className="text-gray-500 dark:text-gray-400">Empresa</dt>
                <dd className="font-medium text-gray-800 dark:text-white/90">{ingreso.empresa ?? "—"}</dd>
              </dl>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-700 dark:bg-success-500/15 dark:text-success-400">
                ✓ Documentos vigentes
              </span>
              {!ingreso.tieneFoto && (
                <ErrorBanner tono="aviso" className="mt-3">
                  No tiene foto registrada: compare con su DNI.
                </ErrorBanner>
              )}
              <ol className="mt-3 list-decimal space-y-0.5 pl-5 text-gray-600 dark:text-gray-400">
                <li>Compare el rostro con la foto.</li>
                <li>Tome la prueba con el alcoholímetro de repuesto.</li>
              </ol>
            </div>
          </div>
          {mensaje && <ErrorBanner className="mt-4">{mensaje}</ErrorBanner>}
          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {/* Verde, como "Autorizado" (Button no tiene una variante de éxito). */}
            <button
              type="button"
              disabled={!!enviando}
              onClick={() => void decidir("apto")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-success-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-success-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando === "apto" ? "Abriendo…" : "✓ Apto: abrir"}
            </button>
            <Button type="button" variant="danger" disabled={!!enviando} onClick={() => void decidir("alcohol")}>
              {enviando === "alcohol" ? "Registrando…" : "Alcohol: no apto"}
            </Button>
            <Button type="button" variant="outline" disabled={!!enviando} onClick={() => void decidir("no-es-la-persona")}>
              {enviando === "no-es-la-persona" ? "Registrando…" : "No es la persona"}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
