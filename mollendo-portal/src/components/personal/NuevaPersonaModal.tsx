"use client";

import React, { useEffect, useState } from "react";
import { personasApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { Empresa, Persona, Puesto } from "@/lib/api/types";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { ErrorBanner } from "@/components/common/ErrorBanner";

export function NuevaPersonaModal({
  isOpen,
  onClose,
  onCreated,
  puestos,
  empresas,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (persona: Persona) => void;
  puestos: Puesto[];
  empresas: Empresa[];
}) {
  const [empresaId, setEmpresaId] = useState("");
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
      setEmpresaId("");
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
    if (!empresaId) {
      setError("Seleccione la empresa");
      return;
    }
    if (!puestoId) {
      setError("Seleccione el puesto: sin puesto, el ingreso se deniega");
      return;
    }
    setLoading(true);
    try {
      const persona = await personasApi.create({
        empresaId: Number(empresaId),
        tipoDocumentoIdentidad,
        numeroDocumento,
        nombres,
        apellidos,
        area: area || undefined,
        puestoId: puestoId ? Number(puestoId) : undefined,
      });
      onCreated(persona);
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
        <div>
          <Label>Empresa</Label>
          <Select
            defaultValue={empresaId}
            onChange={setEmpresaId}
            placeholder="Selecciona una empresa"
            options={empresas
              .filter((e) => e.estado === "activa")
              .map((e) => ({ value: String(e.id), label: e.razonSocial }))}
          />
        </div>
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
            placeholder="Selecciona un puesto"
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
