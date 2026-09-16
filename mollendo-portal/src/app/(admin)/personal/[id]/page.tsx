"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RequireRole } from "@/lib/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthContext";
import { documentosApi, personasApi, tiposDocumentoApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { DocumentoPersona, Persona, TipoDocumento } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import FileInput from "@/components/form/input/FileInput";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { TableFooter } from "@/components/tables/TableFooter";
import { usePagination } from "@/lib/usePagination";

const ESTADO_APROBACION_COLOR: Record<string, "success" | "warning" | "error"> = {
  pendiente: "warning",
  aprobado: "success",
  rechazado: "error",
};

function SubirDocumentoForm({ personaId, tiposDocumento, onSubido }: { personaId: number; tiposDocumento: TipoDocumento[]; onSubido: () => void }) {
  const [tipoDocumentoId, setTipoDocumentoId] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!archivo || !tipoDocumentoId) {
      setError("Seleccione el tipo de documento y el archivo");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("tipoDocumentoId", tipoDocumentoId);
      if (fechaVencimiento) formData.append("fechaVencimiento", fechaVencimiento);
      formData.append("archivo", archivo);
      await documentosApi.subir(personaId, formData);
      onSubido();
      setTipoDocumentoId("");
      setFechaVencimiento("");
      setArchivo(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo subir el documento");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-wrap gap-4 sm:flex-row sm:items-end">
      {error && (
        <ErrorBanner className="w-full">{error}</ErrorBanner>
      )}
      <div className="flex-1">
        <Label>Tipo de documento</Label>
        <Select
          defaultValue={tipoDocumentoId}
          onChange={setTipoDocumentoId}
          options={tiposDocumento.map((t) => ({ value: String(t.id), label: t.nombre }))}
        />
      </div>
      <div className="flex-1">
        <Label>Fecha de vencimiento (si aplica)</Label>
        <Input type="date" defaultValue={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
      </div>
      <div className="flex-1">
        <Label>Archivo</Label>
        <FileInput onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
      </div>
      <Button disabled={loading} className="min-w-[152px] shrink-0">{loading ? "Subiendo…" : "Subir documento"}</Button>
    </form>
  );
}

function PersonaDetailContent() {
  const params = useParams<{ id: string }>();
  const personaId = Number(params.id);
  const { user } = useAuth();

  const [persona, setPersona] = useState<Persona | null>(null);
  const [documentos, setDocumentos] = useState<DocumentoPersona[]>([]);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [p, docs, tipos] = await Promise.all([
        personasApi.get(personaId),
        documentosApi.historial(personaId),
        tiposDocumentoApi.list(),
      ]);
      setPersona(p);
      setDocumentos(docs);
      setTiposDocumento(tipos);
    } finally {
      setLoading(false);
    }
  }, [personaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const puedeGestionar = user?.rol === "empresa" && persona?.empresaId === user.empresaId;

  async function toggleEstado() {
    if (!persona) return;
    await personasApi.updateEstado(persona.id, persona.estado === "activo" ? "inactivo" : "activo");
    cargar();
  }

  async function actualizarEstadoDocumento(documentoId: number, estado: "aprobado" | "rechazado") {
    await documentosApi.updateEstado(documentoId, estado);
    cargar();
  }

  const { page, setPage, totalPages, paginated, total, from, to } = usePagination(documentos, 10);

  if (loading || !persona) {
    return <div className="text-sm text-gray-400">Cargando…</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {persona.nombres} {persona.apellidos}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {persona.tipoDocumentoIdentidad} {persona.numeroDocumento} · {persona.puesto?.nombre ?? "Sin puesto asignado"}
            {persona.empresa && ` · ${persona.empresa.razonSocial}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge color={persona.estado === "activo" ? "success" : "light"}>{persona.estado}</Badge>
          {puedeGestionar && (
            <Button size="sm" variant="outline" onClick={toggleEstado}>
              {persona.estado === "activo" ? "Dar de baja" : "Reactivar"}
            </Button>
          )}
        </div>
      </div>

      {puedeGestionar && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">Subir documento</h2>
          <SubirDocumentoForm personaId={persona.id} tiposDocumento={tiposDocumento} onSubido={cargar} />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Documento</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Versión</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Vencimiento</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Vigencia</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Aprobación</TableCell>
                {puedeGestionar && <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Acciones</TableCell>}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {documentos.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={6}>Sin documentos cargados todavía.</TableCell>
                </TableRow>
              )}
              {paginated.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{doc.tipoDocumento?.nombre}</TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">v{doc.version}</TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {doc.fechaVencimiento ? new Date(doc.fechaVencimiento).toLocaleDateString("es-PE") : "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm">
                    <Badge color={doc.vigente ? "success" : "error"}>{doc.vigente ? "Vigente" : "Vencido"}</Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm">
                    <Badge color={ESTADO_APROBACION_COLOR[doc.estadoAprobacion]}>{doc.estadoAprobacion}</Badge>
                  </TableCell>
                  {puedeGestionar && (
                    <TableCell className="px-5 py-4 text-sm">
                      {doc.estadoAprobacion === "pendiente" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => actualizarEstadoDocumento(doc.id, "aprobado")}>
                            Aprobar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => actualizarEstadoDocumento(doc.id, "rechazado")}>
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <TableFooter from={from} to={to} total={total} page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}

export default function PersonaDetailPage() {
  return (
    <RequireRole roles={["administracion", "empresa", "vigilancia"]}>
      <PersonaDetailContent />
    </RequireRole>
  );
}
