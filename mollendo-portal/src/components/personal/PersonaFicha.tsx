"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { personasApi, solicitudesVisitaApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { Cumplimiento, DocumentoPersona, Persona, Puesto, SolicitudVisita, TipoDocumento } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { CambiarPuesto } from "./CambiarPuesto";
import { SubirDocumentoForm } from "./SubirDocumentoForm";

/** Las columnas DATE llegan como medianoche UTC: se muestran en UTC para no correrse un día. */
export function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-PE", { timeZone: "UTC" });
}

export function motivosCumplimiento(c: Cumplimiento): string[] {
  if (c.dadoDeBaja) return ["Dado de baja"];
  const motivos: string[] = [];
  if (c.sinPuesto) motivos.push("Sin puesto asignado");
  if (c.documentosFaltantes.length > 0) motivos.push(`Falta o venció: ${c.documentosFaltantes.join(", ")}`);
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

function AgendarVisitaForm({ personaId, onAgendada }: { personaId: number; onAgendada: () => void }) {
  const [personaVisitada, setPersonaVisitada] = useState("");
  const [motivo, setMotivo] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fechaHora) {
      setError("Indica la fecha y hora de la visita");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await solicitudesVisitaApi.create({
        personaId,
        personaVisitada,
        motivo,
        fechaHoraProgramada: new Date(fechaHora).toISOString(),
      });
      setPersonaVisitada("");
      setMotivo("");
      setFechaHora("");
      setFormKey((k) => k + 1);
      onAgendada();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo agendar la visita");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form key={formKey} onSubmit={handleSubmit} className="flex flex-col flex-wrap gap-4 sm:flex-row sm:items-end">
      {error && <ErrorBanner className="w-full">{error}</ErrorBanner>}
      <div className="flex-1">
        <Label>A quién visita</Label>
        <Input defaultValue={personaVisitada} onChange={(e) => setPersonaVisitada(e.target.value)} />
      </div>
      <div className="flex-1">
        <Label>Motivo</Label>
        <Input defaultValue={motivo} onChange={(e) => setMotivo(e.target.value)} />
      </div>
      <div className="flex-1">
        <Label>Fecha y hora</Label>
        <Input type="datetime-local" defaultValue={fechaHora} onChange={(e) => setFechaHora(e.target.value)} />
      </div>
      <Button disabled={loading} className="min-w-[152px] shrink-0">
        {loading ? "Agendando…" : "Agendar visita"}
      </Button>
    </form>
  );
}

const VISITA_COLOR: Record<string, "success" | "warning" | "light"> = {
  programada: "success",
  completada: "light",
  cancelada: "warning",
};

/**
 * Ficha de una persona en la pantalla principal del administrador: si puede
 * ingresar hoy, los documentos que exige su puesto (con botón para subir cada
 * uno), cambio de puesto, baja, historial de documentos y visitas.
 */
export function PersonaFicha({
  personaId,
  puestos,
  tiposDocumento,
  onCambio,
}: {
  personaId: number;
  puestos: Puesto[];
  tiposDocumento: TipoDocumento[];
  /** Avisa a la lista que el cumplimiento o los datos de la persona cambiaron. */
  onCambio: () => void;
}) {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [visitas, setVisitas] = useState<SolicitudVisita[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tipoASubir, setTipoASubir] = useState<number | undefined>(undefined);
  const [subirKey, setSubirKey] = useState(0);
  const subirRef = useRef<HTMLDivElement>(null);

  const obtener = useCallback(
    () => Promise.all([personasApi.get(personaId), solicitudesVisitaApi.list({ personaId })]),
    [personaId],
  );

  const aplicar = useCallback(([p, v]: [Persona, SolicitudVisita[]]) => {
    setPersona(p);
    setVisitas(v);
    setError(null);
  }, []);

  const fallar = useCallback((err: unknown) => {
    setError(err instanceof ApiError ? err.message : "No se pudo cargar la persona");
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

  function elegirDocumentoASubir(tipoDocumentoId: number) {
    setTipoASubir(tipoDocumentoId);
    setSubirKey((k) => k + 1);
    subirRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function toggleEstado() {
    if (!persona) return;
    await personasApi.updateEstado(persona.id, persona.estado === "activo" ? "inactivo" : "activo");
    recargarTodo();
  }

  async function cancelarVisita(id: number) {
    await solicitudesVisitaApi.update(id, { estado: "cancelada" });
    cargar();
  }

  if (error) return <ErrorBanner>{error}</ErrorBanner>;
  if (!persona) return <div className="p-6 text-sm text-gray-400">Cargando…</div>;

  const cumplimiento = persona.cumplimiento;
  const requisitos = persona.requisitos ?? [];
  const historial: DocumentoPersona[] = persona.documentos ?? [];
  const ultimaVersionIds = new Set(requisitos.map((r) => r.documento?.id).filter(Boolean));

  return (
    <div className="space-y-5">
      {/* Encabezado + ¿puede ingresar? */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {persona.nombres} {persona.apellidos}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {persona.tipoDocumentoIdentidad} {persona.numeroDocumento}
              {persona.empresa && ` · ${persona.empresa.razonSocial}`}
              {` · ${persona.puesto?.nombre ?? "Sin puesto"}`}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={toggleEstado}>
            {persona.estado === "activo" ? "Dar de baja" : "Reactivar"}
          </Button>
        </div>
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

      {/* Documentos exigidos */}
      <Seccion
        titulo="Documentos exigidos por su puesto"
        descripcion="Solo cuenta la última versión de cada documento. Un documento que vence hoy sigue válido todo el día."
      >
        {!persona.puesto ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Asígnale un puesto para ver qué documentos necesita.</p>
        ) : requisitos.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Este puesto no exige documentos.</p>
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
                {requisitos.map((r) => (
                  <TableRow key={r.tipoDocumentoId}>
                    <TableCell className="py-3 pr-4 text-sm text-gray-700 dark:text-gray-300">
                      {r.nombre}
                      {!r.obligatorio && <span className="ml-2 text-xs text-gray-400">(opcional)</span>}
                    </TableCell>
                    <TableCell className="py-3 pr-4 text-sm text-gray-700 dark:text-gray-300">
                      {r.documento?.fechaVencimiento ? formatearFecha(r.documento.fechaVencimiento) : r.documento ? "No vence" : "—"}
                    </TableCell>
                    <TableCell className="py-3 pr-4 text-sm">
                      {!r.documento ? (
                        <Badge color="error">Falta</Badge>
                      ) : r.vigente ? (
                        <Badge color="success">Vigente</Badge>
                      ) : (
                        <Badge color="error">Vencido</Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-sm">
                      <Button size="sm" variant="outline" onClick={() => elegirDocumentoASubir(r.tipoDocumentoId)}>
                        {r.documento ? "Renovar" : "Subir"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Seccion>

      <div ref={subirRef}>
        <Seccion titulo="Subir documento" descripcion="Queda válido desde que se carga; no hay aprobación.">
          <SubirDocumentoForm
            key={`${personaId}-${subirKey}`}
            personaId={persona.id}
            tiposDocumento={tiposDocumento}
            tipoDocumentoIdInicial={tipoASubir}
            onSubido={recargarTodo}
          />
        </Seccion>
      </div>

      <Seccion titulo="Puesto">
        <CambiarPuesto key={`${persona.id}-${persona.puestoId ?? "sin-puesto"}`} persona={persona} puestos={puestos} onGuardado={recargarTodo} />
      </Seccion>

      <Seccion titulo="Visitas" descripcion="Solo informativas: en garita la persona se valida igual que cualquier otra.">
        <AgendarVisitaForm personaId={persona.id} onAgendada={cargar} />
        {visitas.length > 0 && (
          <ul className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
            {visitas.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  {new Date(v.fechaHoraProgramada).toLocaleString("es-PE")} · {v.personaVisitada}
                  <span className="text-gray-400"> — {v.motivo}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Badge color={VISITA_COLOR[v.estado] ?? "light"}>{v.estado}</Badge>
                  {v.estado === "programada" && (
                    <Button size="sm" variant="outline" onClick={() => cancelarVisita(v.id)}>
                      Cancelar
                    </Button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Seccion>

      {historial.length > 0 && (
        <details className="group rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
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
                {!ultimaVersionIds.has(d.id) && requisitos.some((r) => r.tipoDocumentoId === d.tipoDocumentoId) && (
                  <Badge color="light">Reemplazado</Badge>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
