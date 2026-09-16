"use client";

import React, { useEffect, useState } from "react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { empresasApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { Empresa } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Pagination from "@/components/tables/Pagination";
import { usePagination } from "@/lib/usePagination";

function NuevaEmpresaModal({ isOpen, onClose, onCreated }: { isOpen: boolean; onClose: () => void; onCreated: () => void }) {
  const [ruc, setRuc] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [correoContacto, setCorreoContacto] = useState("");
  const [telefonoContacto, setTelefonoContacto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await empresasApi.create({ ruc, razonSocial, correoContacto, telefonoContacto: telefonoContacto || undefined });
      onCreated();
      onClose();
      setRuc("");
      setRazonSocial("");
      setCorreoContacto("");
      setTelefonoContacto("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear la empresa");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Nueva empresa</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-500">
            {error}
          </div>
        )}
        <div>
          <Label>RUC</Label>
          <Input defaultValue={ruc} onChange={(e) => setRuc(e.target.value)} placeholder="20123456789" />
        </div>
        <div>
          <Label>Razón social</Label>
          <Input defaultValue={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} />
        </div>
        <div>
          <Label>Correo de contacto</Label>
          <Input type="email" defaultValue={correoContacto} onChange={(e) => setCorreoContacto(e.target.value)} />
        </div>
        <div>
          <Label>Teléfono (opcional)</Label>
          <Input defaultValue={telefonoContacto} onChange={(e) => setTelefonoContacto(e.target.value)} />
        </div>
        <Button className="w-full" disabled={loading}>
          {loading ? "Creando…" : "Crear empresa"}
        </Button>
      </form>
    </Modal>
  );
}

function EmpresasPageContent() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function cargar() {
    setLoading(true);
    try {
      setEmpresas(await empresasApi.list());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function invitar(id: number) {
    try {
      const { mensaje } = await empresasApi.invitar(id);
      setMensaje(mensaje);
    } catch (err) {
      setMensaje(err instanceof ApiError ? err.message : "No se pudo enviar la invitación");
    }
  }

  async function cambiarEstado(empresa: Empresa) {
    const nuevoEstado = empresa.estado === "activa" ? "inactiva" : "activa";
    await empresasApi.update(empresa.id, { estado: nuevoEstado } as Partial<Empresa>);
    cargar();
  }

  const { page, setPage, totalPages, paginated } = usePagination(empresas, 10);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Empresas</h1>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          + Nueva empresa
        </Button>
      </div>

      {mensaje && (
        <div className="mb-4 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
          {mensaje}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">RUC</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Razón social</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Correo</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Estado</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Acciones</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={5}>Cargando…</TableCell>
                </TableRow>
              )}
              {!loading && empresas.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={5}>No hay empresas registradas todavía.</TableCell>
                </TableRow>
              )}
              {paginated.map((empresa) => (
                <TableRow key={empresa.id}>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{empresa.ruc}</TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{empresa.razonSocial}</TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{empresa.correoContacto}</TableCell>
                  <TableCell className="px-5 py-4 text-sm">
                    <Badge color={empresa.estado === "activa" ? "success" : "light"}>{empresa.estado}</Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => invitar(empresa.id)}>
                        Invitar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => cambiarEstado(empresa)}>
                        {empresa.estado === "activa" ? "Desactivar" : "Activar"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {!loading && totalPages > 1 && (
          <div className="flex justify-center border-t border-gray-100 px-5 py-4 dark:border-gray-800">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <NuevaEmpresaModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onCreated={cargar} />
    </div>
  );
}

export default function EmpresasPage() {
  return (
    <RequireRole roles={["administracion"]}>
      <EmpresasPageContent />
    </RequireRole>
  );
}
