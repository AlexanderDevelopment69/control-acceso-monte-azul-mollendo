"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { documentosApi, personasApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { DocumentoPersona, Persona } from "@/lib/api/types";
import Button from "@/components/ui/button/Button";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { Modal } from "@/components/ui/modal";
import Tarjeta from "@/components/ui/tarjeta/Tarjeta";
import { SubirDocumentoForm } from "./SubirDocumentoForm";
import { FotoGuardada, validarFoto } from "./FotoPersonal";
import { EstadoIngreso } from "./EstadoIngreso";
import { DocumentosActuales } from "./DocumentosActuales";
import { HistorialDocumentos } from "./HistorialDocumentos";
import { BotonPerfil } from "./EtiquetaPerfil";
import Select from "@/components/form/Select";
import { OPCIONES_PERFIL, type Perfil } from "@/lib/perfiles";

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
  /**
   * Entrega a la pantalla los datos recién leídos del trabajador (tras un cambio
   * o un reintento), para actualizar su fila de la lista sin volver a pedirla entera.
   */
  onCambio: (persona: Persona) => void;
}) {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Ventana abierta: agregar un documento nuevo o renovar uno existente (por su nombre). */
  const [ventana, setVentana] = useState<{ modo: "agregar" } | { modo: "renovar"; nombre: string } | null>(null);
  /** Documento a eliminar (pide confirmación). */
  const [aEliminar, setAEliminar] = useState<{ tipoDocumentoId: number; nombre: string } | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);
  /** Cambio de estado por confirmar: "inactivo" = dar de baja, "activo" = reactivar. */
  const [confirmarEstado, setConfirmarEstado] = useState<"activo" | "inactivo" | null>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [errorEstado, setErrorEstado] = useState<string | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [verFoto, setVerFoto] = useState(false);
  const [subiendoDocumento, setSubiendoDocumento] = useState(false);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  /** Ventana para cambiar el perfil: el perfil elegido (vacío = todavía sin elegir). */
  const [nuevoPerfil, setNuevoPerfil] = useState<Perfil | "" | null>(null);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null);

  const obtener = useCallback(() => personasApi.get(personaId), [personaId]);

  const aplicar = useCallback((p: Persona) => {
    setPersona(p);
    setError(null);
  }, []);

  const fallar = useCallback((err: unknown) => {
    setError(err instanceof ApiError ? err.message : "No se pudo cargar al personal");
  }, []);

  // Vuelve a leer al trabajador; con esos datos se actualiza también su fila de la lista.
  const cargar = useCallback(
    () =>
      obtener()
        .then((p) => {
          aplicar(p);
          onCambio(p);
        })
        .catch(fallar),
    [obtener, aplicar, fallar, onCambio],
  );

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

  function documentoSubido() {
    setVentana(null);
    cargar();
  }

  async function confirmarEliminar() {
    if (!aEliminar) return;
    setEliminando(true);
    setErrorEliminar(null);
    try {
      await documentosApi.eliminar(personaId, aEliminar.tipoDocumentoId);
      setAEliminar(null);
      cargar();
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

  async function guardarPerfil() {
    if (!persona || !nuevoPerfil) return;
    setGuardandoPerfil(true);
    setErrorPerfil(null);
    try {
      await personasApi.update(persona.id, { perfil: nuevoPerfil });
      setNuevoPerfil(null);
      cargar();
    } catch (err) {
      setErrorPerfil(err instanceof ApiError ? err.message : "No se pudo cambiar el perfil");
    } finally {
      setGuardandoPerfil(false);
    }
  }

  // Motivo que se puede escribir al dar de baja (opcional).
  const [motivoBaja, setMotivoBaja] = useState("");

  async function cambiarEstado(estado: "activo" | "inactivo") {
    if (!persona) return;
    setCambiandoEstado(true);
    setErrorEstado(null);
    try {
      await personasApi.updateEstado(persona.id, estado, estado === "inactivo" ? motivoBaja.trim() || undefined : undefined);
      setConfirmarEstado(null);
      cargar();
    } catch (err) {
      setErrorEstado(err instanceof ApiError ? err.message : "No se pudo cambiar el estado");
    } finally {
      setCambiandoEstado(false);
    }
  }

  if (error) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <ErrorBanner className="flex-1">{error}</ErrorBanner>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setError(null);
            setPersona(null);
            cargar();
          }}
        >
          Reintentar
        </Button>
      </div>
    );
  }
  if (!persona) return <div className="p-6 text-sm text-gray-400">Cargando…</div>;

  const cumplimiento = persona.cumplimiento;
  const actuales = persona.documentosActuales ?? [];
  const historial: DocumentoPersona[] = persona.documentos ?? [];
  const idsActuales = new Set(actuales.map((d) => d.id));
  /** Lo que le impediría ingresar aunque se lo reactive (sin documentos o con alguno vencido). */
  const pendientesAlReactivar =
    actuales.length === 0
      ? ["no tiene documentos cargados"]
      : actuales.some((d) => !d.vigente)
        ? [`Vencido: ${actuales.filter((d) => !d.vigente).map((d) => d.nombre).join(", ")}`]
        : [];

  return (
    <div className="space-y-5">
      {/* Encabezado + ¿puede ingresar? */}
      <Tarjeta as="section" className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="space-y-2 text-center">
              {persona.fotoUrl ? (
                // Con foto: al pasar el mouse, "Ver foto" encima; un clic la muestra en grande.
                <button
                  type="button"
                  onClick={() => setVerFoto(true)}
                  title="Ver foto"
                  className="group relative block overflow-hidden rounded-xl focus:outline-none"
                >
                  <FotoGuardada personaId={persona.id} tieneFoto version={persona.fotoUrl} tamano="size-24" />
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gray-900/55 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span className="text-[11px] font-medium">Ver foto</span>
                  </span>
                </button>
              ) : (
                <FotoGuardada personaId={persona.id} tieneFoto={false} tamano="size-24" />
              )}
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
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {persona.nombres} {persona.apellidos}
                </h2>
                <BotonPerfil
                  perfil={persona.perfil}
                  onClick={() => {
                    setErrorPerfil(null);
                    setNuevoPerfil(persona.perfil ?? "");
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {persona.tipoDocumentoIdentidad} {persona.numeroDocumento}
                {persona.empresa && ` · ${persona.empresa.razonSocial}`}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={cambiandoEstado}
            onClick={() => {
              setErrorEstado(null);
              setMotivoBaja("");
              setConfirmarEstado(persona.estado === "activo" ? "inactivo" : "activo");
            }}
          >
            {persona.estado === "activo" ? "Dar de baja" : "Reactivar"}
          </Button>
        </div>
        {errorFoto && <ErrorBanner className="mt-4">{errorFoto}</ErrorBanner>}
        {errorEstado && !confirmarEstado && <ErrorBanner className="mt-4">{errorEstado}</ErrorBanner>}
        <Modal isOpen={nuevoPerfil !== null} onClose={() => setNuevoPerfil(null)} bloqueado={guardandoPerfil} className="max-w-md p-6 sm:p-8">
          <h2 className="mb-1 pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">Perfil del personal</h2>
          <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
            Solo clasifica a la persona (lista, Dashboard y reportes): no cambia lo que se valida en el molinete.
          </p>
          {errorPerfil && <ErrorBanner className="mb-4">{errorPerfil}</ErrorBanner>}
          {nuevoPerfil !== null && (
            <Select
              defaultValue={nuevoPerfil}
              onChange={(v) => setNuevoPerfil(v as Perfil)}
              placeholder="Selecciona un perfil"
              options={OPCIONES_PERFIL}
            />
          )}
          <div className="mt-6 flex justify-end gap-3">
            <Button size="sm" variant="outline" disabled={guardandoPerfil} onClick={() => setNuevoPerfil(null)}>
              Cancelar
            </Button>
            <Button size="sm" disabled={guardandoPerfil || !nuevoPerfil || nuevoPerfil === persona.perfil} onClick={guardarPerfil}>
              {guardandoPerfil ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </Modal>
        <Modal isOpen={verFoto} onClose={() => setVerFoto(false)} className="max-w-md p-6 sm:p-8">
          <h2 className="mb-1 pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">
            {persona.nombres} {persona.apellidos}
          </h2>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            {persona.tipoDocumentoIdentidad} {persona.numeroDocumento}
          </p>
          <div className="flex justify-center">
            <FotoGuardada personaId={persona.id} tieneFoto={!!persona.fotoUrl} version={persona.fotoUrl} tamano="size-72 sm:size-80" />
          </div>
        </Modal>
        {!persona.fotoUrl && (
          <div className="mt-4 rounded-lg bg-warning-50 px-4 py-3 text-sm text-warning-700 dark:bg-warning-500/15 dark:text-orange-400">
            Sin foto: no podrá identificarse por reconocimiento facial en el terminal. Usa “Subir foto”.
          </div>
        )}
        {cumplimiento && (
          <EstadoIngreso
            persona={persona}
            cumplimiento={cumplimiento}
            onAgregar={() => setVentana({ modo: "agregar" })}
            onRenovar={(nombre) => setVentana({ modo: "renovar", nombre })}
          />
        )}
      </Tarjeta>

      <Modal isOpen={ventana !== null} onClose={() => setVentana(null)} bloqueado={subiendoDocumento} className="max-w-2xl p-6 sm:p-8">
        <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          {ventana?.modo === "renovar" ? "Renovar documento" : "Agregar documento"}
        </h2>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          {ventana?.modo === "renovar"
            ? "Se guarda como versión nueva; la anterior queda en el historial."
            : "Queda válido desde que se carga. Si ya tiene un documento con ese nombre, se guarda como versión nueva."}
        </p>
        {ventana?.modo === "renovar" && (
          <SubirDocumentoForm
            key={ventana.nombre}
            personaId={persona.id}
            nombreFijo={ventana.nombre}
            onSubido={documentoSubido}
            onGuardando={setSubiendoDocumento}
          />
        )}
        {ventana?.modo === "agregar" && (
          <SubirDocumentoForm personaId={persona.id} onSubido={documentoSubido} onGuardando={setSubiendoDocumento} />
        )}
      </Modal>

      <Modal
        isOpen={confirmarEstado !== null}
        onClose={() => setConfirmarEstado(null)}
        bloqueado={cambiandoEstado}
        className="max-w-md p-6 sm:p-8"
      >
        {confirmarEstado === "inactivo" ? (
          <>
            <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">Dar de baja</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              ¿Dar de baja a <strong>{persona.nombres} {persona.apellidos}</strong>? Desde ese momento{" "}
              <strong>no podrá ingresar</strong> por los molinetes, aunque tenga sus documentos al día. Sí podrá salir si
              está dentro.
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Sus datos, documentos e historial se conservan, y se puede reactivar cuando sea necesario.
            </p>
            <label htmlFor="motivo-baja" className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Motivo de la baja <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <textarea
              id="motivo-baja"
              rows={3}
              maxLength={300}
              value={motivoBaja}
              onChange={(e) => setMotivoBaja(e.target.value)}
              placeholder="Por ejemplo: terminó su contrato, cambió de empresa, falta disciplinaria…"
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
            />
            <p className="mt-1 text-right text-xs text-gray-400">{motivoBaja.length}/300</p>
          </>
        ) : (
          <>
            <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">Reactivar</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              ¿Reactivar a <strong>{persona.nombres} {persona.apellidos}</strong>? Podrá volver a ingresar por los
              molinetes si tiene sus documentos al día y pasa la prueba de alcohol.
            </p>
            {pendientesAlReactivar.length > 0 && (
              <p className="mt-3 rounded-lg bg-warning-50 px-3 py-2 text-sm text-warning-700 dark:bg-warning-500/15 dark:text-orange-400">
                Aun reactivado no podrá ingresar hasta regularizar: {pendientesAlReactivar.join(" · ")}.
              </p>
            )}
          </>
        )}
        {errorEstado && <ErrorBanner className="mt-4">{errorEstado}</ErrorBanner>}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" disabled={cambiandoEstado} onClick={() => setConfirmarEstado(null)}>
            Cancelar
          </Button>
          {confirmarEstado === "inactivo" ? (
            <Button
              type="button"
              variant="danger"
              disabled={cambiandoEstado}
              onClick={() => void cambiarEstado("inactivo")}
            >
              {cambiandoEstado ? "Dando de baja…" : "Dar de baja"}
            </Button>
          ) : (
            <Button type="button" disabled={cambiandoEstado} onClick={() => void cambiarEstado("activo")}>
              {cambiandoEstado ? "Reactivando…" : "Reactivar"}
            </Button>
          )}
        </div>
      </Modal>

      <Modal isOpen={aEliminar !== null} onClose={() => setAEliminar(null)} bloqueado={eliminando} className="max-w-md p-6 sm:p-8">
        <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">Eliminar documento</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Se eliminará <strong>{aEliminar?.nombre}</strong> de {persona.nombres} {persona.apellidos}, con todas sus
          versiones y archivos. Esta acción no se puede deshacer.
          {actuales.length === 1 && " Es su único documento: después no podrá ingresar hasta que se le agregue otro."}
        </p>
        {errorEliminar && <ErrorBanner className="mt-4">{errorEliminar}</ErrorBanner>}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" disabled={eliminando} onClick={() => setAEliminar(null)}>
            Cancelar
          </Button>
          <Button type="button" variant="danger" disabled={eliminando} onClick={confirmarEliminar}>
            {eliminando ? "Eliminando…" : "Eliminar"}
          </Button>
        </div>
      </Modal>

      <DocumentosActuales
        personaId={persona.id}
        actuales={actuales}
        onAgregar={() => setVentana({ modo: "agregar" })}
        onRenovar={(nombre) => setVentana({ modo: "renovar", nombre })}
        onEliminar={(d) => {
          setErrorEliminar(null);
          setAEliminar({ tipoDocumentoId: d.tipoDocumentoId, nombre: d.nombre });
        }}
      />

      {historial.length > actuales.length && (
        <HistorialDocumentos personaId={persona.id} historial={historial} idsActuales={idsActuales} />
      )}
    </div>
  );
}
