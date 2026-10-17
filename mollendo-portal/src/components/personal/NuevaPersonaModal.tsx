"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { documentosApi, personasApi, tiposDocumentoApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { Empresa, Persona } from "@/lib/api/types";
import { OPCIONES_PERFIL, PERFIL_LABEL, type Perfil } from "@/lib/perfiles";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import FileInput from "@/components/form/input/FileInput";
import {
  ACEPTA_DOCUMENTO,
  AYUDA_ARCHIVO_DOCUMENTO,
  validarArchivoDocumento,
  validarNumeroDocumento,
} from "./archivoDocumento";
import DatePicker from "@/components/form/date-picker";
import { hoy } from "@/lib/paginaServidor";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { CloseLineIcon } from "@/icons";
import { SelectorFoto, validarFoto } from "./FotoPersonal";

/**
 * Empresas para el desplegable: con un perfil elegido, primero las que ya
 * tienen personal activo de ese perfil (con cuántos), y después las demás.
 * Las empresas nuevas se registran en la vista Empresas.
 */
export function opcionesEmpresa(empresas: Empresa[], personas: Persona[], perfil: Perfil | "") {
  const activas = empresas.filter((e) => e.estado === "activa").sort((a, b) => a.razonSocial.localeCompare(b.razonSocial));
  if (!perfil) return activas.map((e) => ({ value: String(e.id), label: e.razonSocial }));
  const cuantas = new Map<number, number>();
  for (const p of personas) {
    if (p.perfil === perfil && p.estado === "activo") cuantas.set(p.empresaId, (cuantas.get(p.empresaId) ?? 0) + 1);
  }
  const con = activas.filter((e) => cuantas.has(e.id)).sort((a, b) => cuantas.get(b.id)! - cuantas.get(a.id)!);
  const sin = activas.filter((e) => !cuantas.has(e.id));
  const grupoCon = `Con personal ${PERFIL_LABEL[perfil]}`;
  return [
    ...con.map((e) => ({ value: String(e.id), label: e.razonSocial, detalle: String(cuantas.get(e.id)), grupo: grupoCon })),
    ...sin.map((e) => ({ value: String(e.id), label: e.razonSocial, grupo: con.length ? "Otras empresas" : undefined })),
  ];
}

interface FilaDocumento {
  clave: number;
  nombre: string;
  fechaVencimiento: string;
  archivo: File | null;
  /** Ya subido: al reintentar tras un error no se vuelve a subir. */
  subido: boolean;
}

const filaVacia = (clave: number): FilaDocumento => ({
  clave,
  nombre: "",
  fechaVencimiento: "",
  archivo: null,
  subido: false,
});

function Seccion({
  numero,
  titulo,
  descripcion,
  children,
}: {
  numero: number;
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
          {numero}
        </span>
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">{titulo}</h3>
          {descripcion && <p className="text-xs text-gray-500 dark:text-gray-400">{descripcion}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

/**
 * Alta de un trabajador con sus documentos, todo en un solo formulario
 * (alcance base: lo carga el administrador). La empresa se elige de la lista
 * o se crea aquí mismo; de cada documento se escribe su nombre (si ya existe
 * uno igual, se reutiliza), su vencimiento y el archivo. Si algo falla a mitad de camino, al reintentar no se duplica lo que
 * ya se guardó (empresa, trabajador, documentos ya subidos).
 */
function Formulario({
  onClose,
  onCreated,
  empresas,
  personas,
  onGuardando,
  onRecargarEmpresas,
}: {
  onClose: () => void;
  onCreated: (persona: Persona) => void;
  empresas: Empresa[];
  /** Vuelve a leer las empresas (al volver de registrar una en otra pestaña). */
  onRecargarEmpresas: () => void;
  /** Para ordenar las empresas según el perfil elegido. */
  personas: Persona[];
  /** Avisa si está guardando: mientras tanto la ventana no se cierra. */
  onGuardando: (guardando: boolean) => void;
}) {
  const [perfil, setPerfil] = useState<Perfil | "">("");
  const [empresaId, setEmpresaId] = useState("");
  const [tipoDocumentoIdentidad, setTipoDocumentoIdentidad] = useState("DNI");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [filas, setFilas] = useState<FilaDocumento[]>([filaVacia(0)]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [personaCreada, setPersonaCreada] = useState<Persona | null>(null);
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoSubida, setFotoSubida] = useState(false);

  // Al volver a esta pestaña (p. ej. después de registrar una empresa en Empresas), la lista se actualiza sola.
  useEffect(() => {
    window.addEventListener("focus", onRecargarEmpresas);
    return () => window.removeEventListener("focus", onRecargarEmpresas);
  }, [onRecargarEmpresas]);

  // La lista de documentos tiene altura máxima con scroll propio; al agregar
  // una fila, bajar hasta ella para que se vea.
  const listaRef = useRef<HTMLDivElement>(null);
  const cantidadFilas = useRef(filas.length);
  useEffect(() => {
    if (filas.length > cantidadFilas.current && listaRef.current) {
      listaRef.current.scrollTo({ top: listaRef.current.scrollHeight, behavior: "smooth" });
    }
    cantidadFilas.current = filas.length;
  }, [filas.length]);

  function actualizarFila(clave: number, cambios: Partial<FilaDocumento>) {
    setFilas((prev) => prev.map((f) => (f.clave === clave ? { ...f, ...cambios } : f)));
  }

  function validar(): string | null {
    if (!personaCreada) {
      if (!perfil) return "Elige el perfil del personal";
      if (!empresaId) return "Elige la empresa";
      if (!numeroDocumento || !nombres.trim() || !apellidos.trim()) {
        return "Completa número de documento, nombres y apellidos";
      }
      const problemaNumero = validarNumeroDocumento(tipoDocumentoIdentidad, numeroDocumento);
      if (problemaNumero) return problemaNumero;
    }
    if (!fotoSubida) {
      if (!foto) return "Elige la foto del personal (se usa para el reconocimiento facial)";
      const problemaFoto = validarFoto(foto);
      if (problemaFoto) return problemaFoto;
    }
    for (const [i, f] of filas.entries()) {
      if (f.subido) continue;
      const n = filas.length > 1 ? ` ${i + 1}` : "";
      if (!f.nombre.trim()) return `Documento${n}: escribe su nombre`;
      if (!f.archivo) return `Documento${n}: adjunta el archivo`;
      const problemaArchivo = validarArchivoDocumento(f.archivo);
      if (problemaArchivo) return `Documento${n}: ${problemaArchivo}`;
      if (f.fechaVencimiento && f.fechaVencimiento < hoy()) {
        return `Documento${n}: la fecha de vencimiento ya pasó (quedaría vencido). Revisa la fecha.`;
      }
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const problema = validar();
    if (problema) {
      setError(problema);
      return;
    }
    setError(null);
    setLoading(true);
    onGuardando(true);
    try {
      let persona = personaCreada;
      if (!persona) {
        persona = await personasApi.create({
          empresaId: Number(empresaId),
          perfil: perfil as Perfil,
          tipoDocumentoIdentidad,
          numeroDocumento,
          nombres,
          apellidos,
        });
        setPersonaCreada(persona);
        // Aparece en la lista aunque luego falle algún documento y se cierre el formulario.
        onCreated(persona);
      }

      if (!fotoSubida) {
        await personasApi.subirFoto(persona.id, foto!);
        setFotoSubida(true);
      }

      for (const f of filas) {
        if (f.subido) continue;
        // Si el nombre ya existe (sin distinguir mayúsculas), el backend devuelve el existente.
        const tipoId = (await tiposDocumentoApi.create({ nombre: f.nombre.trim() })).id;
        const formData = new FormData();
        formData.append("tipoDocumentoId", String(tipoId));
        if (f.fechaVencimiento) formData.append("fechaVencimiento", f.fechaVencimiento);
        formData.append("archivo", f.archivo!);
        await documentosApi.subir(persona.id, formData);
        actualizarFila(f.clave, { subido: true });
      }

      onGuardando(false);
      onCreated(persona);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar");
    } finally {
      setLoading(false);
      onGuardando(false);
    }
  }

  const bloqueado = !!personaCreada; // datos del trabajador ya guardados

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorBanner>{error}</ErrorBanner>}
      {personaCreada && (
        <p className="rounded-lg bg-success-50 px-4 py-3 text-sm text-success-700 dark:bg-success-500/15 dark:text-success-500">
          Personal <strong>{personaCreada.nombres} {personaCreada.apellidos}</strong> ya registrado. Corrige lo que
          falló (foto o documento) y vuelve a guardar.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Seccion numero={1} titulo="Datos del personal">
          <fieldset disabled={bloqueado} className="space-y-4 disabled:opacity-60">
            <div>
              <Label>Perfil</Label>
              <Select
                defaultValue={perfil}
                onChange={(v) => setPerfil(v as Perfil)}
                placeholder="Selecciona un perfil"
                options={OPCIONES_PERFIL}
              />
            </div>

            <div>
              <Label>Empresa</Label>
              <Select
                defaultValue={empresaId}
                onChange={setEmpresaId}
                placeholder="Selecciona una empresa"
                options={opcionesEmpresa(empresas, personas, perfil)}
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                ¿No está la empresa? Regístrala en{" "}
                <Link href="/empresas" target="_blank" className="font-medium text-brand-500 hover:underline">
                  Empresas
                </Link>{" "}
                (se abre en otra pestaña) y vuelve aquí: la lista se actualiza sola.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <Input defaultValue={numeroDocumento} onChange={(e) => setNumeroDocumento(e.target.value.trim())} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Nombres</Label>
                <Input defaultValue={nombres} onChange={(e) => setNombres(e.target.value)} />
              </div>
              <div>
                <Label>Apellidos</Label>
                <Input defaultValue={apellidos} onChange={(e) => setApellidos(e.target.value)} />
              </div>
            </div>
          </fieldset>

          <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800">
            <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Foto del personal</p>
            {fotoSubida ? (
              <p className="text-sm text-success-600 dark:text-success-500">✔ Foto subida.</p>
            ) : (
              <SelectorFoto archivo={foto} onChange={setFoto} />
            )}
          </div>
        </Seccion>

        <Seccion numero={2} titulo="Documentos" descripcion="Al menos uno. Quedan válidos desde que se cargan.">
          <div className="space-y-3">
            <div ref={listaRef} className="max-h-[45vh] space-y-3 overflow-y-auto pr-1">
              {filas.map((f, i) => (
                <div key={f.clave} className="relative space-y-3 rounded-lg bg-gray-50 p-3 pr-10 dark:bg-white/[0.03]">
                  {filas.length > 1 && !f.subido && (
                    <button
                      type="button"
                      aria-label={`Quitar documento ${i + 1}`}
                      title="Quitar este documento"
                      onClick={() => setFilas((prev) => prev.filter((x) => x.clave !== f.clave))}
                      className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-error-50 hover:text-error-500 dark:hover:bg-error-500/15"
                    >
                      <CloseLineIcon className="size-4" />
                    </button>
                  )}
                  {f.subido ? (
                    <p className="text-sm text-success-600 dark:text-success-500">✔ Documento {i + 1} subido.</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <Label>Nombre del documento</Label>
                          <Input
                            placeholder="p. ej. SCTR"
                            defaultValue={f.nombre}
                            onChange={(e) => actualizarFila(f.clave, { nombre: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Vence el</Label>
                          <DatePicker
                            id={`vence-documento-${f.clave}`}
                            placeholder="DD-MM-AAAA"
                            min={hoy()}
                            value={f.fechaVencimiento}
                            onChange={(v) => actualizarFila(f.clave, { fechaVencimiento: v })}
                          />
                          <p className="mt-1 text-xs text-gray-400">Vacío si no vence.</p>
                        </div>
                      </div>
                      <div>
                        <Label>Archivo</Label>
                        <FileInput
                          accept={ACEPTA_DOCUMENTO}
                          onChange={(e) => actualizarFila(f.clave, { archivo: e.target.files?.[0] ?? null })}
                        />
                        <p className="mt-1 text-xs text-gray-400">{AYUDA_ARCHIVO_DOCUMENTO}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setFilas((prev) => [...prev, filaVacia(Math.max(...prev.map((x) => x.clave)) + 1)])}
              className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              + Agregar otro documento
            </button>
          </div>
        </Seccion>
      </div>

      <Button className="w-full" disabled={loading}>
        {loading ? "Guardando…" : bloqueado ? "Subir documentos pendientes" : "Registrar personal y documentos"}
      </Button>
    </form>
  );
}

export function NuevaPersonaModal({
  isOpen,
  onClose,
  ...props
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (persona: Persona) => void;
  onRecargarEmpresas: () => void;
  empresas: Empresa[];
  personas: Persona[];
}) {
  const [guardando, setGuardando] = useState(false);
  return (
    <Modal isOpen={isOpen} onClose={onClose} bloqueado={guardando} className="max-w-5xl p-6 sm:p-8">
      <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Nuevo personal</h2>
      {/* Se monta de nuevo cada vez que se abre: el formulario siempre empieza vacío. */}
      {isOpen && <Formulario onClose={onClose} onGuardando={setGuardando} {...props} />}
    </Modal>
  );
}
