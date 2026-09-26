"use client";

import React, { useEffect, useState } from "react";
import { puestosApi, tiposDocumentoApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { Puesto, TipoDocumento } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Checkbox from "@/components/form/input/Checkbox";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { SectionHeader } from "@/components/common/PageHeader";
import { TableFooter } from "@/components/tables/TableFooter";
import { TableSearch } from "@/components/tables/TableSearch";
import { usePagination } from "@/lib/usePagination";

const CASO_LABEL: Record<string, string> = {
  visita: "Visita",
  personal_propio: "Personal propio",
  contratista: "Contratista",
  tercero: "Tercero",
};

function RequisitosModal({
  puesto,
  tiposDocumento,
  onClose,
}: {
  puesto: Puesto;
  tiposDocumento: TipoDocumento[];
  onClose: () => void;
}) {
  const [seleccion, setSeleccion] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    puestosApi.requisitos(puesto.id).then((requisitos) => {
      const map: Record<number, boolean> = {};
      requisitos.forEach((r) => {
        map[r.tipoDocumentoId] = r.obligatorio;
      });
      setSeleccion(map);
      setLoading(false);
    });
  }, [puesto.id]);

  async function guardar() {
    setGuardando(true);
    const requisitos = Object.entries(seleccion)
      .filter(([, obligatorio]) => obligatorio)
      .map(([tipoDocumentoId]) => ({ tipoDocumentoId: Number(tipoDocumentoId), obligatorio: true }));
    try {
      await puestosApi.setRequisitos(puesto.id, requisitos);
      onClose();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} className="max-w-md p-6">
      <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
        Documentos obligatorios
      </h2>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">{puesto.nombre}</p>

      {loading ? (
        <p className="text-sm text-gray-400">Cargando…</p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {tiposDocumento.length === 0 && (
            <p className="text-sm text-gray-400">No hay tipos de documento creados todavía.</p>
          )}
          {tiposDocumento.map((tipo) => (
            <Checkbox
              key={tipo.id}
              label={tipo.nombre}
              checked={!!seleccion[tipo.id]}
              onChange={(checked) => setSeleccion((prev) => ({ ...prev, [tipo.id]: checked }))}
            />
          ))}
        </div>
      )}

      <Button className="mt-6 w-full" onClick={guardar} disabled={loading || guardando}>
        {guardando ? "Guardando…" : "Guardar"}
      </Button>
    </Modal>
  );
}

function NuevoPuestoModal({ isOpen, onClose, onCreated }: { isOpen: boolean; onClose: () => void; onCreated: () => void }) {
  const [nombre, setNombre] = useState("");
  const [caso, setCaso] = useState("personal_propio");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setNombre("");
      setCaso("personal_propio");
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await puestosApi.create({ nombre, caso });
      onCreated();
      onClose();
      setNombre("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear el puesto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Nuevo puesto</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <ErrorBanner>{error}</ErrorBanner>
        )}
        <div>
          <Label>Nombre</Label>
          <Input defaultValue={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Estibador" />
        </div>
        <div>
          <Label>Caso</Label>
          <Select
            defaultValue={caso}
            onChange={setCaso}
            options={[
              { value: "visita", label: "Visita" },
              { value: "personal_propio", label: "Personal propio" },
              { value: "contratista", label: "Contratista" },
              { value: "tercero", label: "Tercero" },
            ]}
          />
        </div>
        <Button className="w-full" disabled={loading}>
          {loading ? "Creando…" : "Crear puesto"}
        </Button>
      </form>
    </Modal>
  );
}

export function PuestosTab() {
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [puestoRequisitos, setPuestoRequisitos] = useState<Puesto | null>(null);

  async function cargar() {
    setLoading(true);
    try {
      const [p, t] = await Promise.all([puestosApi.list(), tiposDocumentoApi.list()]);
      setPuestos(p);
      setTiposDocumento(t);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const [busqueda, setBusqueda] = useState("");
  const filtrados = puestos.filter((p) => !busqueda.trim() || p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()));
  const { page, setPage, totalPages, paginated, total, from, to } = usePagination(filtrados, 10);

  return (
    <div>
      <SectionHeader
        title="Puestos"
        description="Catálogo de puestos y los documentos obligatorios que exige cada uno."
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            + Nuevo puesto
          </Button>
        }
      />

      <div className="mb-4">
        <TableSearch value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre…" />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Nombre</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Caso</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Acciones</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading && (
              <TableRow>
                <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={3}>Cargando…</TableCell>
              </TableRow>
            )}
            {!loading && puestos.length === 0 && (
              <TableRow>
                <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={3}>
                  No hay puestos registrados. El catálogo completo está pendiente de definir con el cliente.
                </TableCell>
              </TableRow>
            )}
            {!loading && puestos.length > 0 && filtrados.length === 0 && (
              <TableRow>
                <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={3}>Sin resultados para esa búsqueda.</TableCell>
              </TableRow>
            )}
            {paginated.map((puesto) => (
              <TableRow key={puesto.id}>
                <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{puesto.nombre}</TableCell>
                <TableCell className="px-5 py-4 text-sm">
                  <Badge color="info">{CASO_LABEL[puesto.caso] ?? puesto.caso}</Badge>
                </TableCell>
                <TableCell className="px-5 py-4 text-sm">
                  <Button size="sm" variant="outline" onClick={() => setPuestoRequisitos(puesto)}>
                    Documentos requeridos
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!loading && <TableFooter from={from} to={to} total={total} page={page} totalPages={totalPages} onPageChange={setPage} />}
      </div>

      <NuevoPuestoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onCreated={cargar} />
      {puestoRequisitos && (
        <RequisitosModal
          puesto={puestoRequisitos}
          tiposDocumento={tiposDocumento}
          onClose={() => setPuestoRequisitos(null)}
        />
      )}
    </div>
  );
}
