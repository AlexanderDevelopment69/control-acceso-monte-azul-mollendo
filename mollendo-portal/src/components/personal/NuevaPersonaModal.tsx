"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { documentosApi, personasApi, tiposDocumentoApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { Empresa, Persona } from "@/lib/api/types";
import { OPCIONES_PERFIL, PERFIL_LABEL, type Perfil } from "@/lib/perfiles";
import { OPCIONES_DOCUMENTO } from "@/lib/documentos";
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
import { PeriodoAutorizacionCampos } from "./PeriodoAutorizacionCampos";
import { PERIODO_VACIO, periodoParaApi, problemaPeriodo, type Periodo } from "@/lib/periodo";

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
  ajustado = false,
  children,
}: {
  numero: number;
  titulo: string;
  descripcion?: string;
  /** Con tres columnas, no agranda la fila: toma el alto de los otros recuadros (su contenido se desplaza). */
  ajustado?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-xl border border-gray-200 p-5 dark:border-gray-800 ${ajustado ? "xl:flex xl:flex-col" : ""}`}>
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
          {numero}
        </span>
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">{titulo}</h3>
          {descripcion && <p className="text-xs text-gray-500 dark:text-gray-400">{descripcion}</p>}
        </div>
      </div>
      {ajustado ? (
        <div className="xl:relative xl:min-h-0 xl:flex-1">
          <div className="xl:absolute xl:inset-0 xl:flex xl:flex-col">{children}</div>
        </div>
      ) : (
        children
      )}
    </section>
  );
}

/**
 * Alta de un trabajador con su foto, su período de autorización (opcional) y sus
 * documentos, todo en un solo formulario (lo carga el administrador). La empresa
 * se elige de la lista (las nuevas se registran en Empresas); cada documento se
 * elige de la lista fija, con su vencimiento y el archivo. Si algo falla a mitad
 * de camino, al reintentar no se duplica lo que ya se guardó (trabajador, foto,
 * documentos ya subidos).
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
  // Período de autorización (opcional).
  const [periodo, setPeriodo] = useState<Periodo>(PERIODO_VACIO);
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

  // Al agregar una fila, la lista (con desplazamiento propio) baja hasta ella para que se vea.
  const listaRef = useRef<HTMLDivElement>(null);
  const cantidadFilas = useRef(filas.length);
  useEffect(() => {
    if (filas.length > cantidadFilas.current && listaRef.current) {
      listaRef.current.scrollTo({ top: listaRef.current.scrollHeight, behavior: "smooth" });
    }
    cantidadFilas.current = filas.length;
  }, [filas.length]);

  // El mensaje va arriba, bajo la descripción: si se presionó el botón de abajo (en el celular la
  // ventana es larga), se sube hasta el mensaje para que se lea.
  // Cuenta cada vez que se muestra un error, para subir también si se repite el mismo mensaje.
  const mensajeRef = useRef<HTMLDivElement>(null);
  const [vecesError, setVecesError] = useState(0);
  useLayoutEffect(() => {
    if (vecesError) mensajeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [vecesError]);
  function mostrarError(mensaje: string) {
    setError(mensaje);
    setVecesError((n) => n + 1);
  }

  function actualizarFila(clave: number, cambios: Partial<FilaDocumento>) {
    setFilas((prev) => prev.map((f) => (f.clave === clave ? { ...f, ...cambios } : f)));
  }

  function validar(): string | null {
    if (!personaCreada) {
      if (!perfil) return "Elija el perfil del personal";
      if (!empresaId) return "Elija la empresa";
      if (!numeroDocumento || !nombres.trim() || !apellidos.trim()) {
        return "Complete número de documento, nombres y apellidos";
      }
      const problemaNumero = validarNumeroDocumento(tipoDocumentoIdentidad, numeroDocumento);
      if (problemaNumero) return problemaNumero;
      // Con la lista ya cargada se avisa sin consultar a la API (el mismo mensaje que daría ella).
      if (personas.some((p) => p.tipoDocumentoIdentidad === tipoDocumentoIdentidad && p.numeroDocumento === numeroDocumento)) {
        return "Ya existe una persona registrada con ese documento";
      }
      const problemaDelPeriodo = problemaPeriodo(periodo);
      if (problemaDelPeriodo) return problemaDelPeriodo;
    }
    if (!fotoSubida) {
      if (!foto) return "Elija la foto del personal (se usa para el reconocimiento facial)";
      const problemaFoto = validarFoto(foto);
      if (problemaFoto) return problemaFoto;
    }
    for (const [i, f] of filas.entries()) {
      if (f.subido) continue;
      const n = filas.length > 1 ? ` ${i + 1}` : "";
      if (!f.nombre.trim()) return n ? `Documento${n}: seleccione el documento` : "Seleccione el documento";
      if (!f.archivo) return `Documento${n}: adjunte el archivo`;
      const problemaArchivo = validarArchivoDocumento(f.archivo);
      if (problemaArchivo) return `Documento${n}: ${problemaArchivo}`;
      if (f.fechaVencimiento && f.fechaVencimiento < hoy()) {
        return `Documento${n}: la fecha de vencimiento ya pasó (quedaría vencido). Revise la fecha.`;
      }
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const problema = validar();
    if (problema) {
      mostrarError(problema);
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
          ...periodoParaApi(periodo),
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
      mostrarError(err instanceof ApiError ? err.message : "No se pudo guardar");
    } finally {
      setLoading(false);
      onGuardando(false);
    }
  }

  const bloqueado = !!personaCreada; // datos del trabajador ya guardados

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div ref={mensajeRef} className="scroll-mt-4">
          <ErrorBanner>{error}</ErrorBanner>
        </div>
      )}
      {personaCreada && (
        <ErrorBanner tono="exito">
          Personal <strong>{personaCreada.nombres} {personaCreada.apellidos}</strong> ya registrado. Corrija lo que
          falló (foto o documento) y vuelva a guardar.
        </ErrorBanner>
      )}

      {/* En pantallas anchas, tres recuadros iguales: datos, foto y período, documentos. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Seccion numero={1} titulo="Datos del personal" descripcion="Datos de identificación de la persona.">
          {/* min-w-0: un fieldset no se encoge por defecto y, con un nombre de empresa largo, los campos se salían en el celular. */}
          <fieldset disabled={bloqueado} className="min-w-0 space-y-4 disabled:opacity-60">
            <div>
              <Label>Perfil</Label>
              <Select
                defaultValue={perfil}
                onChange={(v) => setPerfil(v as Perfil)}
                placeholder="Seleccione un perfil"
                options={OPCIONES_PERFIL}
              />
            </div>

            <div>
              <Label>Empresa</Label>
              <Select
                defaultValue={empresaId}
                onChange={setEmpresaId}
                placeholder="Seleccione una empresa"
                options={opcionesEmpresa(empresas, personas, perfil)}
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                ¿No está? Regístrela en{" "}
                <Link href="/empresas" target="_blank" className="font-medium text-brand-500 hover:underline">
                  Empresas
                </Link>
                .
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
                <Input defaultValue={numeroDocumento} onChange={(e) => setNumeroDocumento(e.target.value.trim().toUpperCase())} />
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
        </Seccion>

        <Seccion numero={2} titulo="Foto y período" descripcion="La foto es obligatoria; el período de autorización, opcional.">
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Foto del personal</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Se usa para el reconocimiento facial.</p>
          </div>
          {fotoSubida ? (
            <p className="text-sm text-success-600 dark:text-success-500">✔ Foto subida.</p>
          ) : (
            <SelectorFoto archivo={foto} onChange={setFoto} />
          )}
          {!personaCreada && <PeriodoAutorizacionCampos id="nuevo-periodo" periodo={periodo} onChange={setPeriodo} />}
        </Seccion>

        <Seccion ajustado numero={3} titulo="Documentos" descripcion="Al menos uno. Quedan válidos desde que se cargan.">
          <div className="space-y-3 xl:flex xl:min-h-0 xl:flex-1 xl:flex-col">
            {/* Con desplazamiento propio: agregar documentos no agranda la ventana (el desplegable del nombre es flotante). */}
            <div ref={listaRef} className="max-h-[45vh] space-y-3 overflow-y-auto pr-1 xl:max-h-none xl:min-h-0">
              {filas.map((f, i) => (
                // El margen derecho para la X de "Quitar" solo cuando se muestra (con un solo documento, no).
                <div
                  key={f.clave}
                  className={`relative space-y-3 rounded-lg bg-gray-50 p-3 dark:bg-white/[0.03] ${filas.length > 1 && !f.subido ? "pr-10" : ""}`}
                >
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
                      {/* Cada campo en su fila, a todo el ancho (los nombres de la lista son largos). */}
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <Label>Nombre del documento</Label>
                          <Select
                            textoCompleto
                            flotante
                            defaultValue={f.nombre}
                            onChange={(v) => actualizarFila(f.clave, { nombre: v })}
                            placeholder="Seleccione un documento"
                            options={OPCIONES_DOCUMENTO}
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
                        <div>
                          <Label>Archivo</Label>
                          <FileInput
                            accept={ACEPTA_DOCUMENTO}
                            onChange={(e) => actualizarFila(f.clave, { archivo: e.target.files?.[0] ?? null })}
                          />
                          <p className="mt-1 text-xs text-gray-400">{AYUDA_ARCHIVO_DOCUMENTO}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setFilas((prev) => [...prev, filaVacia(Math.max(...prev.map((x) => x.clave)) + 1)])}
              className="shrink-0 self-start text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
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
    <Modal isOpen={isOpen} onClose={onClose} bloqueado={guardando} className="max-w-5xl p-6 sm:p-8 xl:max-w-7xl">
      <h2 className="mb-1 pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">Nuevo personal</h2>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        Registre a la persona con su foto y sus documentos.
      </p>
      {/* Se monta de nuevo cada vez que se abre: el formulario siempre empieza vacío. */}
      {isOpen && <Formulario onClose={onClose} onGuardando={setGuardando} {...props} />}
    </Modal>
  );
}
