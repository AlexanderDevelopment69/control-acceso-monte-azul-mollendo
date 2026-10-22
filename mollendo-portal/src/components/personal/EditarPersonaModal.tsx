"use client";

import React, { useEffect, useState } from "react";
import { empresasApi, personasApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { Empresa, Persona } from "@/lib/api/types";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { OPCIONES_PERFIL, type Perfil } from "@/lib/perfiles";
import { validarNumeroDocumento } from "./archivoDocumento";

type Tipo = Persona["tipoDocumentoIdentidad"];

/** Lo que cambió respecto de la persona (solo eso se envía). */
export function cambiosPersona(
  persona: Persona,
  datos: {
    perfil: Perfil | "";
    empresaId: string;
    tipoDocumentoIdentidad: Tipo;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
  },
) {
  const cambios: Parameters<typeof personasApi.update>[1] = {};
  if (datos.perfil && datos.perfil !== persona.perfil) cambios.perfil = datos.perfil;
  if (Number(datos.empresaId) !== persona.empresaId) cambios.empresaId = Number(datos.empresaId);
  if (datos.tipoDocumentoIdentidad !== persona.tipoDocumentoIdentidad) cambios.tipoDocumentoIdentidad = datos.tipoDocumentoIdentidad;
  if (datos.numeroDocumento !== persona.numeroDocumento) cambios.numeroDocumento = datos.numeroDocumento;
  if (datos.nombres.trim() !== persona.nombres) cambios.nombres = datos.nombres.trim();
  if (datos.apellidos.trim() !== persona.apellidos) cambios.apellidos = datos.apellidos.trim();
  return cambios;
}

/**
 * Corregir los datos de una persona (perfil, empresa, documento, nombres y
 * apellidos). La foto, los documentos y el período se cambian en la ficha. El G4 Pro se
 * actualiza solo si cambian el número o el nombre.
 */
function Formulario({ persona, onClose, onGuardado, onGuardando }: {
  persona: Persona;
  onClose: () => void;
  onGuardado: () => void;
  onGuardando: (guardando: boolean) => void;
}) {
  const [empresas, setEmpresas] = useState<Empresa[] | null>(null);
  const [perfil, setPerfil] = useState<Perfil | "">(persona.perfil ?? "");
  const [empresaId, setEmpresaId] = useState(String(persona.empresaId));
  const [tipo, setTipo] = useState<Tipo>(persona.tipoDocumentoIdentidad);
  const [numero, setNumero] = useState(persona.numeroDocumento);
  const [nombres, setNombres] = useState(persona.nombres);
  const [apellidos, setApellidos] = useState(persona.apellidos);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  /** Se intentó guardar sin cambios: aviso suave, que se va solo al cambiar algo. */
  const [sinCambiosAviso, setSinCambiosAviso] = useState(false);

  useEffect(() => {
    empresasApi
      .list()
      .then((lista) => setEmpresas([...lista].sort((a, b) => a.razonSocial.localeCompare(b.razonSocial))))
      .catch(() => setError("No se pudo cargar la lista de empresas"));
  }, []);

  const cambiaDocumento = tipo !== persona.tipoDocumentoIdentidad || numero !== persona.numeroDocumento;
  const cambios = cambiosPersona(persona, {
    perfil,
    empresaId,
    tipoDocumentoIdentidad: tipo,
    numeroDocumento: numero,
    nombres,
    apellidos,
  });
  const hayCambios = Object.keys(cambios).length > 0;

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil) return setError("Elija el perfil del personal");
    if (!numero || !nombres.trim() || !apellidos.trim()) return setError("Complete número de documento, nombres y apellidos");
    const problema = validarNumeroDocumento(tipo, numero);
    if (problema) return setError(problema);
    setError(null);
    if (!hayCambios) return setSinCambiosAviso(true);
    setGuardando(true);
    onGuardando(true);
    try {
      await personasApi.update(persona.id, cambios);
      onGuardando(false);
      onGuardado();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar");
    } finally {
      setGuardando(false);
      onGuardando(false);
    }
  }

  // Empresas activas, y la actual aunque esté inactiva (para no perderla al abrir).
  const opcionesEmpresa = (empresas ?? [])
    .filter((e) => e.estado === "activa" || e.id === persona.empresaId)
    .map((e) => ({ value: String(e.id), label: e.razonSocial }));

  return (
    <form onSubmit={guardar} className="space-y-4">
      {error && <ErrorBanner>{error}</ErrorBanner>}
      {sinCambiosAviso && !hayCambios && !error && <ErrorBanner tono="aviso">No cambió ningún dato.</ErrorBanner>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Perfil</Label>
          <Select defaultValue={perfil} onChange={(v) => setPerfil(v as Perfil)} placeholder="Seleccione un perfil" options={OPCIONES_PERFIL} />
        </div>
        <div>
          <Label>Empresa</Label>
          {empresas ? (
            <Select defaultValue={empresaId} onChange={setEmpresaId} placeholder="Seleccione una empresa" options={opcionesEmpresa} />
          ) : (
            <p className="flex h-11 items-center text-sm text-gray-400">Cargando…</p>
          )}
        </div>
        <div>
          <Label>Tipo de documento</Label>
          <Select
            defaultValue={tipo}
            onChange={(v) => setTipo(v as Tipo)}
            options={[
              { value: "DNI", label: "DNI" },
              { value: "CE", label: "Carné de extranjería" },
              { value: "PASAPORTE", label: "Pasaporte" },
            ]}
          />
        </div>
        <div>
          <Label>Número de documento</Label>
          <Input defaultValue={numero} onChange={(e) => setNumero(e.target.value.trim().toUpperCase())} />
        </div>
        <div>
          <Label>Nombres</Label>
          <Input defaultValue={nombres} onChange={(e) => setNombres(e.target.value)} />
        </div>
        <div>
          <Label>Apellidos</Label>
          <Input defaultValue={apellidos} onChange={(e) => setApellidos(e.target.value)} />
        </div>
      </div>
      {cambiaDocumento && (
        <ErrorBanner tono="aviso">
          Cambia el documento: desde que guarde, la persona debe pasar el <strong>documento nuevo</strong> por el lector. El
          terminal facial se actualiza solo. Los ingresos y salidas anteriores conservan el documento con el que se registraron.
        </ErrorBanner>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" size="sm" variant="outline" disabled={guardando} onClick={onClose}>
          Cancelar
        </Button>
        <Button size="sm" disabled={guardando || !empresas}>
          {guardando ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}

export function EditarPersonaModal({
  persona,
  isOpen,
  onClose,
  onGuardado,
}: {
  persona: Persona;
  isOpen: boolean;
  onClose: () => void;
  onGuardado: () => void;
}) {
  const [guardando, setGuardando] = useState(false);
  return (
    <Modal isOpen={isOpen} onClose={onClose} bloqueado={guardando} className="max-w-2xl p-6 sm:p-8">
      <h2 className="mb-1 pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">Editar datos del personal</h2>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        Para corregir errores. La foto, los documentos y el período se cambian en la ficha. El perfil solo clasifica a la persona: no
        cambia lo que se valida en el molinete.
      </p>
      {/* Se monta de nuevo cada vez que se abre: siempre con los datos actuales. */}
      {isOpen && <Formulario persona={persona} onClose={onClose} onGuardado={onGuardado} onGuardando={setGuardando} />}
    </Modal>
  );
}
