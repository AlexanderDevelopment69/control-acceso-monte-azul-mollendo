"use client";

import React, { useState } from "react";
import { integracionesApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { EstadoSincronizacionG4, ResultadoSincronizacionG4 } from "@/lib/api/types";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Badge from "@/components/ui/badge/Badge";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import Combobox from "@/components/form/Combobox";
import Tarjeta from "@/components/ui/tarjeta/Tarjeta";
import { ComprobandoBadge } from "./Insignias";
import { personas } from "./TarjetasEstado";

/** "1 persona, con rostro" · "5 personas, todas con rostro" · "5 personas, 3 con rostro". */
export function resumenEquipo({ usuarios, conRostro }: { usuarios: number; conRostro: number }): string {
  if (usuarios === 0) return "ninguna persona";
  const rostro = conRostro === usuarios ? (usuarios === 1 ? "con rostro" : "todas con rostro") : `${conRostro} con rostro`;
  return `${personas(usuarios)}, ${rostro}`;
}

/**
 * Sincronización con los G4 Pro: si la diaria está activa, el último resultado
 * y los botones para simularla o ejecutarla (la real pide confirmación).
 */
export function SincronizacionG4({
  estado,
  onTerminada,
}: {
  estado?: EstadoSincronizacionG4;
  onTerminada: () => void;
}) {
  const [ejecutando, setEjecutando] = useState<"simular" | "sincronizar" | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [resultado, setResultado] = useState<ResultadoSincronizacionG4 | null>(null);
  const [error, setError] = useState<string | null>(null);
  // "Simulando…" y el aviso de espera solo si tarda: si responde al instante (p. ej. con el
  // equipo desconectado), aparecerían y desaparecerían de golpe y la tarjeta parpadearía.
  const [lento, setLento] = useState(false);
  // La barra de arriba se ve al menos 0,7 s, para que siempre se note que se consultó.
  const [barra, setBarra] = useState(false);
  // Revisión diaria: hora a activar (pide confirmación) y si se está guardando el cambio.
  const [confirmarDiaria, setConfirmarDiaria] = useState<number | null>(null);
  const [guardandoDiaria, setGuardandoDiaria] = useState(false);
  const diariaActiva = !!estado?.diaria.activa;

  async function cambiarDiaria(hora: number | null) {
    setConfirmarDiaria(null);
    setGuardandoDiaria(true);
    setError(null);
    try {
      await integracionesApi.sincronizacionDiaria(hora);
      onTerminada();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar la revisión diaria");
    } finally {
      setGuardandoDiaria(false);
    }
  }
  const ultima = resultado ?? estado?.ultima ?? null;
  const ocupado = ejecutando !== null || !!estado?.enCurso;

  async function ejecutar(simular: boolean) {
    setConfirmar(false);
    setEjecutando(simular ? "simular" : "sincronizar");
    setError(null);
    const aviso = setTimeout(() => setLento(true), 500);
    const inicio = Date.now();
    setBarra(true);
    try {
      setResultado(await integracionesApi.sincronizarG4(simular));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo sincronizar con el G4 Pro");
    } finally {
      clearTimeout(aviso);
      setLento(false);
      setTimeout(() => setBarra(false), Math.max(0, 700 - (Date.now() - inicio)));
      setEjecutando(null);
      onTerminada();
    }
  }

  return (
    <Tarjeta className="relative mb-6 overflow-hidden p-5">
      {/* Barra arriba mientras se consulta al equipo: superpuesta, no mueve la tarjeta. */}
      <div
        aria-hidden
        className={`absolute inset-x-0 top-0 h-1 overflow-hidden bg-brand-100 transition-opacity duration-300 dark:bg-brand-500/20 ${barra ? "opacity-100" : "opacity-0"}`}
      >
        <div className="h-full w-2/5 animate-barra-carga rounded-full bg-brand-500" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sincronización con el G4 Pro</h2>
          <p className="mt-1 text-xs text-gray-400">
            Deja el terminal igual al sistema: borra a quien no está registrado (por ejemplo, registrado a mano en el
            equipo), quita permisos de paso sueltos, registra con foto al personal activo que falte y corrige los datos cambiados a
            mano en el equipo (contraseña, administrador, tarjeta o nombre).
          </p>
          <div className="mt-3 flex min-h-8 flex-wrap items-center gap-3">
            {!estado ? (
              <ComprobandoBadge />
            ) : (
              <>
                <button
                  type="button"
                  role="switch"
                  aria-checked={diariaActiva}
                  aria-label="Revisión diaria"
                  disabled={guardandoDiaria}
                  onClick={() => (diariaActiva ? void cambiarDiaria(null) : setConfirmarDiaria(estado.diaria.hora ?? 0))}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-60 ${
                    diariaActiva ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`inline-block size-5 rounded-full bg-white shadow-theme-xs transition-transform duration-200 ${
                      diariaActiva ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">Revisión diaria</span>
                {diariaActiva ? (
                  <Combobox
                    compacto
                    buscable={false}
                    className="w-40"
                    aria-label="Hora de la revisión diaria"
                    disabled={guardandoDiaria}
                    value={String(estado.diaria.hora ?? 0)}
                    onChange={(v) => void cambiarDiaria(Number(v))}
                    options={Array.from({ length: 24 }, (_, h) => ({ value: String(h), label: `a las ${String(h).padStart(2, "0")}:00` }))}
                  />
                ) : null}
              </>
            )}
            {estado?.enCurso && !ejecutando && <Badge color="info">En curso…</Badge>}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="outline" size="sm" disabled={ocupado} onClick={() => void ejecutar(true)}>
            {lento && ejecutando === "simular" ? "Simulando…" : "Simular"}
          </Button>
          <Button type="button" size="sm" disabled={ocupado} onClick={() => setConfirmar(true)}>
            {lento && ejecutando === "sincronizar" ? "Sincronizando…" : "Sincronizar ahora"}
          </Button>
        </div>
      </div>

      {error && <ErrorBanner className="mt-3">{error}</ErrorBanner>}

      {ultima && (
        <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-sm dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Última: {new Date(ultima.fecha).toLocaleString("es-PE")} · {ultima.origen === "diaria" ? "diaria" : "manual"}
            {ultima.simulacion && " · simulación (no se cambió nada)"}
          </p>
          {ultima.error ? (
            <p className="mt-1 text-error-600 dark:text-error-400">Falló: {ultima.error}</p>
          ) : (
            <>
              <p className="mt-1 text-gray-700 dark:text-gray-300">
                {ultima.simulacion ? "Agregaría" : "Agregadas"}: <strong>{ultima.agregadas}</strong> ·{" "}
                {ultima.simulacion ? "Borraría" : "Borrados"}: <strong>{ultima.borradas}</strong> ·{" "}
                {ultima.simulacion ? "Permisos a quitar" : "Permisos quitados"}: <strong>{ultima.permisosQuitados}</strong> ·{" "}
                {ultima.simulacion ? "Datos a corregir" : "Datos corregidos"}: <strong>{ultima.corregidas ?? 0}</strong>
              </p>
              {(ultima.corregidas ?? 0) > 0 && (
                <p className="mt-1 text-xs text-brand-500 dark:text-brand-400">
                  Datos cambiados a mano en el equipo (contraseña, administrador, tarjeta o nombre): se vuelven a poner los del
                  sistema. El rostro no cambia.
                </p>
              )}
              {ultima.usuariosABorrar.length > 0 && (
                <p className="mt-1 text-xs text-brand-500 dark:text-brand-400">
                  En el equipo pero no registradas en el sistema: {personas(ultima.usuariosABorrar.length)}{" "}
                  (probablemente creadas a mano en el equipo)
                </p>
              )}
              {ultima.equipos === 0 ? (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Ningún terminal facial conectado a este servidor: no se revisó nada.
                </p>
              ) : (
                ultima.agregadas + ultima.borradas + ultima.permisosQuitados + (ultima.corregidas ?? 0) === 0 &&
                ultima.equiposSinRespuesta === 0 && (
                  <p className="mt-1 text-xs text-success-600 dark:text-success-500">
                    ✔ Todo en orden: el terminal {ultima.simulacion ? "tiene" : "ya tenía"} a las mismas
                    personas que el sistema
                    {ultima.porEquipo.length === 1 && ` (${resumenEquipo(ultima.porEquipo[0])})`}.
                  </p>
                )
              )}
              {ultima.equiposSinRespuesta > 0 && (
                <p className="mt-1 text-xs text-error-600 dark:text-error-400">
                  {ultima.equiposSinRespuesta} equipo(s) no respondieron.
                </p>
              )}
            </>
          )}
        </div>
      )}

      <Modal isOpen={confirmarDiaria !== null} onClose={() => setConfirmarDiaria(null)} className="max-w-md p-6 sm:p-8">
        <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">Activar la revisión diaria</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Cada día, a las <strong>{String(confirmarDiaria ?? 0).padStart(2, "0")}:00</strong>, se sincronizará el G4 Pro
          con el sistema: se <strong>borrarán del terminal</strong> los usuarios que el sistema no conoce y se registrará
          con su foto al personal activo que falte. La hora se puede cambiar después.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setConfirmarDiaria(null)}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => void cambiarDiaria(confirmarDiaria)}>
            Activar
          </Button>
        </div>
      </Modal>

      <Modal isOpen={confirmar} onClose={() => setConfirmar(false)} className="max-w-md p-6 sm:p-8">
        <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">Sincronizar con el G4 Pro</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Se <strong>borrarán del terminal</strong> los usuarios que el sistema no conoce y se registrará con su foto al
          personal activo que falte. Conviene usar antes <strong>“Simular”</strong> para ver qué cambiará.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setConfirmar(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => void ejecutar(false)}>
            Sincronizar
          </Button>
        </div>
      </Modal>
    </Tarjeta>
  );
}
