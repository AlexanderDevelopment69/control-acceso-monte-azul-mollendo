"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { RequireRole } from "@/lib/auth/RequireRole";
import { personasApi, puestosApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { Persona, Puesto } from "@/lib/api/types";
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

function NuevaPersonaModal({
  isOpen,
  onClose,
  onCreated,
  puestos,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  puestos: Puesto[];
}) {
  const [tipoDocumentoIdentidad, setTipoDocumentoIdentidad] = useState("DNI");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [area, setArea] = useState("");
  const [puestoId, setPuestoId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTipoDocumentoIdentidad("DNI");
      setNumeroDocumento("");
      setNombres("");
      setApellidos("");
      setArea("");
      setPuestoId("");
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await personasApi.create({
        tipoDocumentoIdentidad,
        numeroDocumento,
        nombres,
        apellidos,
        area: area || undefined,
        puestoId: puestoId ? Number(puestoId) : undefined,
      });
      onCreated();
      onClose();
      setNumeroDocumento("");
      setNombres("");
      setApellidos("");
      setArea("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo registrar a la persona");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Nuevo trabajador / visita</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <ErrorBanner>{error}</ErrorBanner>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tipo de documento</Label>
            <Select
              defaultValue={tipoDocumentoIdentidad}
              onChange={setTipoDocumentoIdentidad}
              options={[
                { value: "DNI", label: "DNI" },
                { value: "CE", label: "Carné de extranjería" },
                { value: "PASAPORTE", label: "Pasaporte" },
              ]}
            />
          </div>
          <div>
            <Label>Número de documento</Label>
            <Input defaultValue={numeroDocumento} onChange={(e) => setNumeroDocumento(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nombres</Label>
            <Input defaultValue={nombres} onChange={(e) => setNombres(e.target.value)} />
          </div>
          <div>
            <Label>Apellidos</Label>
            <Input defaultValue={apellidos} onChange={(e) => setApellidos(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Puesto</Label>
          <Select
            defaultValue={puestoId}
            onChange={setPuestoId}
            placeholder="Sin asignar"
            options={puestos.map((p) => ({ value: String(p.id), label: p.nombre }))}
          />
        </div>
        <div>
          <Label>Área (opcional)</Label>
          <Input defaultValue={area} onChange={(e) => setArea(e.target.value)} />
        </div>
        <Button className="w-full" disabled={loading}>
          {loading ? "Guardando…" : "Registrar"}
        </Button>
      </form>
    </Modal>
  );
}

function PersonalContent() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  async function cargar() {
    setLoading(true);
    try {
      const [p, puestosData] = await Promise.all([personasApi.list(), puestosApi.list()]);
      setPersonas(p);
      setPuestos(puestosData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const [busqueda, setBusqueda] = useState("");
  const filtradas = personas.filter((p) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      p.nombres.toLowerCase().includes(q) ||
      p.apellidos.toLowerCase().includes(q) ||
      p.numeroDocumento.includes(q)
    );
  });
  const { page, setPage, totalPages, paginated, total, from, to } = usePagination(filtradas, 10);

  return (
    <div>
      <PageHeader
        title="Mi personal"
        description="Trabajadores y visitas registrados por tu empresa."
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            + Nuevo
          </Button>
        }
      />

      <div className="mb-4">
        <TableSearch value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre o documento…" />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Documento</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Nombre</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Puesto</TableCell>
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
              {!loading && personas.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={5}>Todavía no ha registrado personal.</TableCell>
                </TableRow>
              )}
              {!loading && personas.length > 0 && filtradas.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={5}>Sin resultados para esa búsqueda.</TableCell>
                </TableRow>
              )}
              {paginated.map((persona) => (
                <TableRow key={persona.id}>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {persona.tipoDocumentoIdentidad} {persona.numeroDocumento}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {persona.nombres} {persona.apellidos}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {persona.puesto?.nombre ?? "Sin asignar"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm">
                    <Badge color={persona.estado === "activo" ? "success" : "light"}>{persona.estado}</Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm">
                    <Link href={`/personal/${persona.id}`} className="text-brand-500 hover:text-brand-600">
                      Ver expediente
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {!loading && <TableFooter from={from} to={to} total={total} page={page} totalPages={totalPages} onPageChange={setPage} />}
      </div>

      <NuevaPersonaModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onCreated={cargar} puestos={puestos} />
    </div>
  );
}

export default function PersonalPage() {
  return (
    <RequireRole roles={["empresa"]}>
      <PersonalContent />
    </RequireRole>
  );
}
