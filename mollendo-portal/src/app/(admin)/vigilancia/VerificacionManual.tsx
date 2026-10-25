"use client";

import React, { useEffect, useState } from "react";
import type { CausaVerificacionManual, DecisionManual, EstadoVerificacionManual, IngresoEnEspera } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { FotoGuardada } from "@/components/personal/FotoPersonal";
import { AvisoPanel } from "./AvisoPanel";

/*
 * Verificación manual (contingencia por falla del equipo facial o del
 * alcoholímetro, docs/cliente/Contingencias_Equipos_Acceso.md, secciones 3 y 4):
 * el DNI y los documentos se revisan igual; el vigilante compara el rostro con
 * la foto, toma la prueba con el alcoholímetro de repuesto y escribe el grado
 * (decide el sistema).
 */

/** Motivo que viene escrito según desde dónde se activa (se puede cambiar). */
export const MOTIVO_POR_CAUSA: Record<CausaVerificacionManual, string> = {
  terminal: "Equipo facial desconectado",
  alcoholimetro: "Alcoholímetro desconectado",
  ambar: "El equipo facial no toma la prueba",
};

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
  /** Sin él (soporte, que solo consulta), la franja se ve sin el botón. */
  onTerminar?: () => void;
}) {
  const p = estado.periodo;
  if (!estado.activa || !p) return null;
  return (
    <AvisoPanel
      tono="brand"
      etiqueta="Verificación manual"
      pildora="Activa"
      acciones={
        onTerminar && (
          <Button type="button" size="sm" variant="outline" disabled={terminando} onClick={onTerminar}>
            {terminando ? "Volviendo…" : "Volver a modo normal"}
          </Button>
        )
      }
    >
      Desde {diaYHora(p.desde)}
      {p.activadaPor && (
        <>
          , activada por <strong className="text-gray-800 dark:text-white/90">{p.activadaPor}</strong>
        </>
      )}
      .<br />
      Motivo: {p.motivo}
    </AvisoPanel>
  );
}

/**
 * Volvió lo que motivó la verificación manual (el equipo facial o el
 * alcoholímetro): se pregunta, no se vuelve solo.
 */
export function AvisoEquipoVolvio({
  equipo = "El equipo facial",
  terminando,
  onVolver,
  onSeguir,
}: {
  equipo?: string;
  terminando: boolean;
  onVolver: () => void;
  onSeguir: () => void;
}) {
  return (
    <AvisoPanel
      tono="success"
      etiqueta="Verificación manual"
      pildora={`${equipo} volvió a conectarse`}
      acciones={
        <>
          <Button type="button" size="sm" disabled={terminando} onClick={onVolver}>
            {terminando ? "Volviendo…" : "Volver a modo normal"}
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={terminando} onClick={onSeguir}>
            Seguir en manual
          </Button>
        </>
      }
    >
      ¿Volver a modo normal?
    </AvisoPanel>
  );
}

/** Ventana para activarla: el motivo es obligatorio y queda en la auditoría. */
export function ActivarVerificacionManual({
  abierta,
  causa = "terminal",
  onCerrar,
  onActivar,
}: {
  abierta: boolean;
  causa?: CausaVerificacionManual;
  onCerrar: () => void;
  onActivar: (motivo: string) => Promise<void>;
}) {
  const [motivo, setMotivo] = useState(MOTIVO_POR_CAUSA[causa]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Cada vez que se abre, el motivo de esa causa.
  useEffect(() => {
    if (abierta) {
      setMotivo(MOTIVO_POR_CAUSA[causa]);
      setError(null);
    }
  }, [abierta, causa]);

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
        Mientras esté activa, el vigilante compara el rostro con la foto, toma la prueba con el alcoholímetro de repuesto y
        escribe el grado; el sistema decide si puede entrar.
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

/** "0.000" o "0,125" → número (mg/L); null si no es un grado válido. */
export function leerGrado(texto: string): number | null {
  const limpio = texto.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(limpio)) return null;
  const valor = Number(limpio);
  return Number.isFinite(valor) && valor <= 10 ? valor : null;
}

const GRADO_INVALIDO = "Escriba el grado que marcó el alcoholímetro (por ejemplo, 0.000).";

/**
 * La persona en su turno: foto grande, datos, el grado que marcó el
 * alcoholímetro de repuesto (o, si no muestra el número, lo que marcó) y "No es
 * la persona". Se cierra sola al decidir, al vencer los 2 minutos o si otro
 * vigilante decidió antes (desaparece de las esperas).
 */
export function DecisionManualVentana({
  ingreso,
  ahora,
  onDecidir,
}: {
  ingreso: IngresoEnEspera | null;
  ahora: number;
  onDecidir: (id: number, decision: DecisionManual, grado?: number) => Promise<void>;
}) {
  return (
    // Sin ✕ ni Esc: la persona espera en el molinete; si no se decide, vence sola a los 2 minutos.
    <Modal isOpen={!!ingreso} onClose={() => undefined} showCloseButton={false} bloqueado className="max-w-xl p-6 sm:p-8">
      {/* key: con cada persona, el campo vacío y de nuevo con número. */}
      {ingreso && <ContenidoDecision key={ingreso.id} ingreso={ingreso} ahora={ahora} onDecidir={onDecidir} />}
    </Modal>
  );
}

function ContenidoDecision({
  ingreso,
  ahora,
  onDecidir,
}: {
  ingreso: IngresoEnEspera;
  ahora: number;
  onDecidir: (id: number, decision: DecisionManual, grado?: number) => Promise<void>;
}) {
  const [enviando, setEnviando] = useState<DecisionManual | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [grado, setGrado] = useState("");
  const [sinNumero, setSinNumero] = useState(false);

  async function decidir(decision: DecisionManual) {
    let valor: number | undefined;
    if (decision === "grado") {
      const leido = leerGrado(grado);
      if (leido === null) {
        setError(GRADO_INVALIDO);
        return;
      }
      valor = leido;
    }
    setEnviando(decision);
    setError(null);
    try {
      await onDecidir(ingreso.id, decision, valor);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo registrar la decisión");
    } finally {
      setEnviando(null);
    }
  }

  const enlace =
    "text-sm font-medium text-brand-600 underline-offset-2 hover:underline disabled:opacity-50 dark:text-brand-400";
  return (
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
            <li>Tómele la prueba con el alcoholímetro de repuesto y escriba lo que marca.</li>
          </ol>
        </div>
      </div>
      {!sinNumero && (
        <form
          className="mt-5"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void decidir("grado");
          }}
        >
          <label htmlFor="grado-manual" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Grado de alcohol (mg/L)
          </label>
          <input
            id="grado-manual"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.000"
            value={grado}
            onChange={(e) => setGrado(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 sm:w-48 dark:border-gray-700 dark:text-white/90"
          />
          <button type="button" className={`${enlace} mt-2 block`} disabled={!!enviando} onClick={() => { setSinNumero(true); setError(null); }}>
            Mi alcoholímetro no muestra el número
          </button>
        </form>
      )}
      {error && <ErrorBanner className="mt-4">{error}</ErrorBanner>}
      {sinNumero ? (
        <>
          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {/* Verde, como "Autorizado" (Button no tiene una variante de éxito). */}
            <button
              type="button"
              disabled={!!enviando}
              onClick={() => void decidir("marco-apto")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-success-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-success-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando === "marco-apto" ? "Abriendo…" : "Marcó apto"}
            </button>
            <Button type="button" variant="danger" disabled={!!enviando} onClick={() => void decidir("marco-alcohol")}>
              {enviando === "marco-alcohol" ? "Registrando…" : "Marcó alcohol"}
            </Button>
            <Button type="button" variant="outline" disabled={!!enviando} onClick={() => void decidir("no-es-la-persona")}>
              {enviando === "no-es-la-persona" ? "Registrando…" : "No es la persona"}
            </Button>
          </div>
          <button type="button" className={`${enlace} mt-3`} disabled={!!enviando} onClick={() => { setSinNumero(false); setError(null); }}>
            Volver a escribir el grado
          </button>
        </>
      ) : (
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Button type="button" disabled={!!enviando} onClick={() => void decidir("grado")}>
            {enviando === "grado" ? "Registrando…" : "Registrar prueba"}
          </Button>
          <Button type="button" variant="outline" disabled={!!enviando} onClick={() => void decidir("no-es-la-persona")}>
            {enviando === "no-es-la-persona" ? "Registrando…" : "No es la persona"}
          </Button>
        </div>
      )}
    </>
  );
}
