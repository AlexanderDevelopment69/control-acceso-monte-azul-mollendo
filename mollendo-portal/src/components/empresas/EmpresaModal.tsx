"use client";

import React, { useState } from "react";
import { empresasApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { Empresa } from "@/lib/api/types";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { ErrorBanner } from "@/components/common/ErrorBanner";

interface DatosEmpresa {
  ruc: string;
  razonSocial: string;
  correoContacto: string;
  telefonoContacto: string;
}

/** El mismo control que hace el servidor, para avisar antes de enviar. */
export function problemaEmpresa(d: DatosEmpresa): string | null {
  if (!/^\d{11}$/.test(d.ruc)) return "El RUC debe tener 11 dígitos";
  if (!d.razonSocial.trim()) return "La razón social es obligatoria";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correoContacto.trim())) return "Ingresa un correo válido";
  return null;
}

/** Lo que cambió respecto de la empresa (solo eso se envía). */
export function cambiosEmpresa(empresa: Empresa, d: DatosEmpresa) {
  const cambios: Parameters<typeof empresasApi.update>[1] = {};
  if (d.ruc !== empresa.ruc) cambios.ruc = d.ruc;
  if (d.razonSocial.trim() !== empresa.razonSocial) cambios.razonSocial = d.razonSocial.trim();
  if (d.correoContacto.trim() !== empresa.correoContacto) cambios.correoContacto = d.correoContacto.trim();
  if (d.telefonoContacto.trim() !== (empresa.telefonoContacto ?? "")) cambios.telefonoContacto = d.telefonoContacto.trim();
  return cambios;
}

function Formulario({
  empresa,
  onClose,
  onGuardada,
  onGuardando,
}: {
  empresa?: Empresa;
  onClose: () => void;
  onGuardada: (empresa: Empresa) => void;
  onGuardando: (guardando: boolean) => void;
}) {
  const [datos, setDatos] = useState<DatosEmpresa>({
    ruc: empresa?.ruc ?? "",
    razonSocial: empresa?.razonSocial ?? "",
    correoContacto: empresa?.correoContacto ?? "",
    telefonoContacto: empresa?.telefonoContacto ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [sinCambiosAviso, setSinCambiosAviso] = useState(false);

  const cambios = empresa ? cambiosEmpresa(empresa, datos) : null;
  const hayCambios = !cambios || Object.keys(cambios).length > 0;
  const campo = (clave: keyof DatosEmpresa) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDatos((d) => ({ ...d, [clave]: clave === "ruc" ? e.target.value.replace(/\s+/g, "") : e.target.value }));

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const problema = problemaEmpresa(datos);
    if (problema) return setError(problema);
    setError(null);
    if (!hayCambios) return setSinCambiosAviso(true);
    setGuardando(true);
    onGuardando(true);
    try {
      const guardada =
        empresa && cambios
          ? await empresasApi.update(empresa.id, cambios)
          : await empresasApi.create({
              ruc: datos.ruc,
              razonSocial: datos.razonSocial.trim(),
              correoContacto: datos.correoContacto.trim(),
              telefonoContacto: datos.telefonoContacto.trim() || undefined,
            });
      onGuardando(false);
      onGuardada(guardada);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar la empresa");
    } finally {
      setGuardando(false);
      onGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar} className="space-y-4">
      {error && <ErrorBanner>{error}</ErrorBanner>}
      {sinCambiosAviso && !hayCambios && !error && <ErrorBanner tono="aviso">No cambiaste ningún dato.</ErrorBanner>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="empresa-ruc">RUC</Label>
          <Input id="empresa-ruc" defaultValue={datos.ruc} onChange={campo("ruc")} placeholder="11 dígitos" />
        </div>
        <div>
          <Label htmlFor="empresa-razon">Razón social</Label>
          <Input id="empresa-razon" defaultValue={datos.razonSocial} onChange={campo("razonSocial")} />
        </div>
        <div>
          <Label htmlFor="empresa-correo">Correo de contacto</Label>
          <Input id="empresa-correo" type="email" defaultValue={datos.correoContacto} onChange={campo("correoContacto")} />
        </div>
        <div>
          <Label htmlFor="empresa-telefono">
            Teléfono de contacto <span className="font-normal text-gray-400">(opcional)</span>
          </Label>
          <Input id="empresa-telefono" defaultValue={datos.telefonoContacto} onChange={campo("telefonoContacto")} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" size="sm" variant="outline" disabled={guardando} onClick={onClose}>
          Cancelar
        </Button>
        <Button size="sm" disabled={guardando}>
          {guardando ? "Guardando…" : empresa ? "Guardar" : "Registrar empresa"}
        </Button>
      </div>
    </form>
  );
}

/** Registrar una empresa nueva o, con `empresa`, corregir sus datos. */
export function EmpresaModal({
  empresa,
  isOpen,
  onClose,
  onGuardada,
}: {
  empresa?: Empresa;
  isOpen: boolean;
  onClose: () => void;
  onGuardada: (empresa: Empresa) => void;
}) {
  const [guardando, setGuardando] = useState(false);
  return (
    <Modal isOpen={isOpen} onClose={onClose} bloqueado={guardando} className="max-w-2xl p-6 sm:p-8">
      <h2 className="mb-1 pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">
        {empresa ? "Editar empresa" : "Nueva empresa"}
      </h2>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        {empresa
          ? "Corrige los datos de la empresa. Su personal no cambia."
          : "Registra la empresa a la que pertenece el personal."}
      </p>
      {/* Se monta de nuevo cada vez que se abre: siempre con los datos actuales. */}
      {isOpen && <Formulario empresa={empresa} onClose={onClose} onGuardada={onGuardada} onGuardando={setGuardando} />}
    </Modal>
  );
}
