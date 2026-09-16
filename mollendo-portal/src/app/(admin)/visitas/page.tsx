"use client";

import React, { useEffect, useState } from "react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { personasApi, solicitudesVisitaApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { Persona, SolicitudVisita } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { PageHeader } from "@/components/common/PageHeader";
import { TableFooter } from "@/components/tables/TableFooter";
import { TableSearch } from "@/components/tables/TableSearch";
import { usePagination } from "@/lib/usePagination";
import TextArea from "@/components/form/input/TextArea";

const ESTADO_COLOR: Record<string, "success" | "warning" | "light"> = {
  programada: "success",
  completada: "light",
  cancelada: "warning",
};

function NuevaSolicitudModal({
  isOpen,
  onClose,
  onCreated,
  personas,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  personas: Persona[];
}) {
  const [personaId, setPersonaId] = useState("");
  const [personaVisitada, setPersonaVisitada] = useState("");
  const [motivo, setMotivo] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPersonaId("");
      setPersonaVisitada("");
      setMotivo("");
      setFechaHora("");
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!personaId) {
      setError("Seleccione a la persona que visita");
      return;
    }
    setLoading(true);
    try {
      await solicitudesVisitaApi.create({
        personaId: Number(personaId),
        personaVisitada,
        motivo,
        fechaHoraProgramada: new Date(fechaHora).toISOString(),
      });
      onCreated();
      onClose();
      setPersonaVisitada("");
      setMotivo("");
      setFechaHora("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo registrar la solicitud");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Nueva solicitud de visita</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <ErrorBanner>{error}</ErrorBanner>
        )}
        <div>
          <Label>Persona que visita</Label>
          <Select
            defaultValue={personaId}
            onChange={setPersonaId}
            options={personas.map((p) => ({ value: String(p.id), label: `${p.nombres} ${p.apellidos}` }))}
          />
        </div>
        <div>
          <Label>Persona a visitar</Label>
          <Input defaultValue={personaVisitada} onChange={(e) => setPersonaVisitada(e.target.value)} />
        </div>
        <div>
          <Label>Motivo</Label>
          <TextArea value={motivo} onChange={setMotivo} rows={3} />
        </div>
        <div>
          <Label>Fecha y hora programada</Label>
          <Input type="datetime-local" defaultValue={fechaHora} onChange={(e) => setFechaHora(e.target.value)} />
        </div>
        <Button className="w-full" disabled={loading}>
          {loading ? "Registrando…" : "Registrar visita"}
        </Button>
      </form>
    </Modal>
  );
}

function VisitasContent() {
  const [solicitudes, setSolicitudes] = useState<SolicitudVisita[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  async function cargar() {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([solicitudesVisitaApi.list(), personasApi.list()]);
      setSolicitudes(s);
      setPersonas(p);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function cancelar(id: number) {
    await solicitudesVisitaApi.update(id, { estado: "cancelada" });
    cargar();
  }

  const [busqueda, setBusqueda] = useState("");
  const filtradas = solicitudes.filter((s) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    const nombreVisita = s.persona ? `${s.persona.nombres} ${s.persona.apellidos}` : "";
    return nombreVisita.toLowerCase().includes(q) || s.personaVisitada.toLowerCase().includes(q);
  });
  const { page, setPage, totalPages, paginated, total, from, to } = usePagination(filtradas, 10);

  return (
    <div>
      <PageHeader
        title="Solicitudes de visita"
        description="Visitas programadas por tu empresa al Terminal."
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            + Nueva solicitud
          </Button>
        }
      />

      <div className="mb-4">
        <TableSearch value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre…" />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Visita</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">A quién visita</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Fecha programada</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Estado</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500"></TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={5}>Cargando…</TableCell>
                </TableRow>
              )}
              {!loading && solicitudes.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={5}>No hay solicitudes de visita registradas.</TableCell>
                </TableRow>
              )}
              {!loading && solicitudes.length > 0 && filtradas.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={5}>Sin resultados para esa búsqueda.</TableCell>
                </TableRow>
              )}
              {paginated.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {s.persona ? `${s.persona.nombres} ${s.persona.apellidos}` : `#${s.personaId}`}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{s.personaVisitada}</TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {new Date(s.fechaHoraProgramada).toLocaleString("es-PE")}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm">
                    <Badge color={ESTADO_COLOR[s.estado] ?? "light"}>{s.estado}</Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm">
                    {s.estado === "programada" && (
                      <Button size="sm" variant="outline" onClick={() => cancelar(s.id)}>
                        Cancelar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {!loading && <TableFooter from={from} to={to} total={total} page={page} totalPages={totalPages} onPageChange={setPage} />}
      </div>

      <NuevaSolicitudModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onCreated={cargar} personas={personas} />
    </div>
  );
}

export default function VisitasPage() {
  return (
    <RequireRole roles={["empresa"]}>
      <VisitasContent />
    </RequireRole>
  );
}
