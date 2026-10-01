"use client";

import React, { useEffect, useRef, useState } from "react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { empresasApi, reportesApi, type TipoReporte } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { Empresa } from "@/lib/api/types";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { SelectorPeriodo, usePeriodo } from "@/components/common/SelectorPeriodo";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { DocsIcon, DownloadIcon, GroupIcon, ListIcon, PageIcon, TimeIcon, UserIcon } from "@/icons";

interface OpcionReporte {
  tipo: TipoReporte;
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
  /** Qué filtros usa. */
  periodo?: boolean;
  empresa?: boolean;
}

const REPORTES: OpcionReporte[] = [
  {
    tipo: "personal",
    titulo: "Personal y empresas",
    descripcion: "Listado del personal con su empresa, estado y si puede ingresar (con el motivo si no puede).",
    icono: <GroupIcon />,
    empresa: true,
  },
  {
    tipo: "documentos",
    titulo: "Documentos por persona",
    descripcion: "Última versión de cada documento: vigente, por vencer (30 días) o vencido, con su fecha de vencimiento.",
    icono: <DocsIcon />,
    empresa: true,
  },
  {
    tipo: "movimientos",
    titulo: "Ingresos y salidas",
    descripcion: "Historial del periodo: fecha y hora, persona, movimiento, resultado y motivo de denegación.",
    icono: <ListIcon />,
    periodo: true,
  },
  {
    tipo: "visitas",
    titulo: "Visitas del periodo",
    descripcion: "Cada ingreso autorizado con su salida y duración; finalizadas y presentes.",
    icono: <UserIcon />,
    periodo: true,
  },
  {
    tipo: "presentes",
    titulo: "Personal presente",
    descripcion: "Quiénes están dentro del terminal ahora, con su hora de ingreso y tiempo dentro.",
    icono: <TimeIcon />,
  },
  {
    tipo: "auditoria",
    titulo: "Auditoría",
    descripcion: "Quién creó, modificó o eliminó cada dato del sistema y cuándo.",
    icono: <PageIcon />,
    periodo: true,
  },
];

/** Guarda el archivo descargado con el nombre que manda el servidor. */
function guardar(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function Filtro({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="w-full sm:w-56">
      <Label>{etiqueta}</Label>
      {children}
    </div>
  );
}

function ReportesContent() {
  const [tipo, setTipo] = useState<TipoReporte>("personal");
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaId, setEmpresaId] = useState("");
  const [estado, setEstado] = useState("");
  const [estadoDocumento, setEstadoDocumento] = useState("");
  const [movimiento, setMovimiento] = useState("");
  const [resultado, setResultado] = useState("");
  const periodo = usePeriodo();
  const [descargando, setDescargando] = useState<"xlsx" | "pdf" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const filtrosRef = useRef<HTMLElement>(null);

  useEffect(() => {
    empresasApi
      .list()
      .then((lista) => setEmpresas([...lista].sort((a, b) => a.razonSocial.localeCompare(b.razonSocial))))
      .catch(() => setEmpresas([]));
  }, []);

  const opcion = REPORTES.find((r) => r.tipo === tipo)!;
  const faltanFechas = !!opcion.periodo && !periodo.rangoValido;

  async function descargar(formato: "xlsx" | "pdf") {
    setError(null);
    setDescargando(formato);
    try {
      const { blob, nombre } = await reportesApi.descargar(tipo, {
        formato,
        ...(opcion.periodo && { desde: periodo.desde, hasta: periodo.hasta }),
        ...(opcion.empresa && empresaId && { empresaId }),
        ...(tipo === "personal" && estado && { estado }),
        ...(tipo === "documentos" && estadoDocumento && { estadoDocumento }),
        ...(tipo === "movimientos" && movimiento && { movimiento }),
        ...(tipo === "movimientos" && resultado && { resultado }),
      });
      guardar(blob, nombre);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo generar el reporte");
    } finally {
      setDescargando(null);
    }
  }

  return (
    <div>
      <PageHeader title="Reportes" description="Descarga la información del sistema en Excel o PDF." />

      {/* Tipo de reporte */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {REPORTES.map((r) => {
          const activo = r.tipo === tipo;
          return (
            <button
              key={r.tipo}
              type="button"
              onClick={() => {
                setTipo(r.tipo);
                setError(null);
                // En el celular los filtros quedan debajo de la lista: se baja hasta ellos.
                if (window.innerWidth < 1024) {
                  requestAnimationFrame(() => filtrosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
                }
              }}
              aria-pressed={activo}
              className={`flex items-start gap-4 rounded-xl border p-5 text-left transition-colors ${
                activo
                  ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500 dark:border-brand-400 dark:bg-brand-500/10 dark:ring-brand-400"
                  : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-gray-700"
              }`}
            >
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl [&_svg]:size-5 ${
                  activo ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {r.icono}
              </span>
              <span>
                <span className="block text-sm font-semibold text-gray-800 dark:text-white/90">{r.titulo}</span>
                <span className="mt-1 block text-xs leading-snug text-gray-500 dark:text-gray-400">{r.descripcion}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Filtros y descarga */}
      <section
        ref={filtrosRef}
        className="scroll-mt-20 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6"
      >
        <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">{opcion.titulo}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{opcion.descripcion}</p>

        <div className="mt-5 space-y-5">
          {opcion.periodo && (
            <div>
              <Label>Periodo</Label>
              <SelectorPeriodo estado={periodo} id="reporte" />
            </div>
          )}

          {(opcion.empresa || tipo === "movimientos") && (
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              {opcion.empresa && (
                <Filtro etiqueta="Empresa">
                  <Select
                    key={`empresas-${empresas.length}`}
                    defaultValue={empresaId}
                    onChange={setEmpresaId}
                    mostrarPlaceholder={false}
                    options={[{ value: "", label: "Todas las empresas" }, ...empresas.map((e) => ({ value: String(e.id), label: e.razonSocial }))]}
                  />
                </Filtro>
              )}
              {tipo === "personal" && (
                <Filtro etiqueta="Estado">
                  <Select
                    defaultValue={estado}
                    onChange={setEstado}
                    mostrarPlaceholder={false}
                    options={[
                      { value: "", label: "Activos y dados de baja" },
                      { value: "activo", label: "Solo activos" },
                      { value: "inactivo", label: "Solo dados de baja" },
                    ]}
                  />
                </Filtro>
              )}
              {tipo === "documentos" && (
                <Filtro etiqueta="Estado del documento">
                  <Select
                    defaultValue={estadoDocumento}
                    onChange={setEstadoDocumento}
                    mostrarPlaceholder={false}
                    options={[
                      { value: "", label: "Todos" },
                      { value: "vigente", label: "Vigentes" },
                      { value: "por_vencer", label: "Por vencer (30 días)" },
                      { value: "vencido", label: "Vencidos" },
                    ]}
                  />
                </Filtro>
              )}
              {tipo === "movimientos" && (
                <>
                  <Filtro etiqueta="Movimiento">
                    <Select
                      defaultValue={movimiento}
                      onChange={setMovimiento}
                      mostrarPlaceholder={false}
                      options={[
                        { value: "", label: "Ingresos y salidas" },
                        { value: "ingreso", label: "Solo ingresos" },
                        { value: "salida", label: "Solo salidas" },
                      ]}
                    />
                  </Filtro>
                  <Filtro etiqueta="Resultado">
                    <Select
                      defaultValue={resultado}
                      onChange={setResultado}
                      mostrarPlaceholder={false}
                      options={[
                        { value: "", label: "Autorizados y denegados" },
                        { value: "autorizado", label: "Solo autorizados" },
                        { value: "denegado", label: "Solo denegados" },
                      ]}
                    />
                  </Filtro>
                </>
              )}
            </div>
          )}

          {tipo === "presentes" && (
            <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:bg-white/[0.03] dark:text-gray-300">
              Muestra la situación en el momento de descargarlo; no usa filtros.
            </p>
          )}
        </div>

        {error && <ErrorBanner className="mt-5">{error}</ErrorBanner>}
        {faltanFechas && <ErrorBanner className="mt-5">Elige las fechas &quot;desde&quot; y &quot;hasta&quot; del periodo.</ErrorBanner>}

        <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 dark:border-gray-800 sm:flex-row">
          <Button
            type="button"
            onClick={() => void descargar("xlsx")}
            disabled={descargando !== null || faltanFechas}
            startIcon={<DownloadIcon className="size-5" />}
          >
            {descargando === "xlsx" ? "Generando Excel…" : "Descargar Excel"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void descargar("pdf")}
            disabled={descargando !== null || faltanFechas}
            startIcon={<DownloadIcon className="size-5" />}
          >
            {descargando === "pdf" ? "Generando PDF…" : "Descargar PDF"}
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function ReportesPage() {
  return (
    <RequireRole roles={["administrador"]}>
      <ReportesContent />
    </RequireRole>
  );
}
