"use client";

import React, { useEffect, useRef, useState } from "react";
import { personasApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { FilaCargaMasiva, ResultadoCargaMasiva, RevisionCargaMasiva } from "@/lib/api/types";
import { guardarArchivo } from "@/lib/descargas";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import FileInput from "@/components/form/input/FileInput";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { DownloadIcon } from "@/icons";

/** Filas que se dibujan por tanda: con 2000, la tabla entera tarda en cambiar de filtro. */
const FILAS_POR_TANDA = 100;

const ACEPTA_EXCEL = ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

type Filtro = "todas" | FilaCargaMasiva["estado"];

const ESTADO: Record<FilaCargaMasiva["estado"], { texto: string; color: "success" | "light" | "error" }> = {
  lista: { texto: "Lista", color: "success" },
  existe: { texto: "Ya registrada", color: "light" },
  error: { texto: "Con error", color: "error" },
};

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

/** "2026-10-23" → "23/10/2026". */
const fecha = (iso: string) => iso.split("-").reverse().join("/");

/** Período autorizado de la fila: el ya revisado (lista) o como se escribió en el Excel. */
function Periodo({ f }: { f: FilaCargaMasiva }) {
  const desde = f.persona?.autorizadoDesde ? fecha(f.persona.autorizadoDesde) : f.autorizadoDesde;
  const hasta = f.persona?.autorizadoHasta ? fecha(f.persona.autorizadoHasta) : f.autorizadoHasta;
  const motivo = f.persona?.motivoAutorizacion ?? f.motivoAutorizacion;
  if (!desde && !hasta && !motivo) return <span className="text-gray-400">Sin límite</span>;
  return (
    <>
      <span className="block whitespace-nowrap text-gray-800 dark:text-white/90">
        {desde || "—"} al {hasta || "—"}
      </span>
      {motivo && <span className="block text-xs text-gray-500 dark:text-gray-400">{motivo}</span>}
    </>
  );
}

/**
 * Carga masiva de personal desde Excel, en tres pasos: elegir el archivo (con
 * la plantilla para descargar), revisar cada fila sin guardar nada (lista, ya
 * registrada o con error, con su motivo) y registrar las filas listas, solo si
 * ninguna tiene error (las ya registradas se omiten). Las
 * filas con error se pueden descargar en la misma plantilla, con su motivo,
 * para corregirlas y volver a subirlas.
 */
export function CargaMasivaModal({
  isOpen,
  onClose,
  onRegistradas,
}: {
  isOpen: boolean;
  onClose: () => void;
  onRegistradas: () => void;
}) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [claveArchivo, setClaveArchivo] = useState(0);
  const [revision, setRevision] = useState<RevisionCargaMasiva | null>(null);
  const [resultado, setResultado] = useState<ResultadoCargaMasiva | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [ocupado, setOcupado] = useState<null | "plantilla" | "revisando" | "registrando" | "errores">(null);
  const [error, setError] = useState<string | null>(null);

  function reiniciar() {
    setArchivo(null);
    setClaveArchivo((k) => k + 1);
    setRevision(null);
    setResultado(null);
    setFiltro("todas");
    setError(null);
  }

  function cerrar() {
    if (ocupado === "registrando") return;
    reiniciar();
    onClose();
  }

  async function ejecutar(accion: NonNullable<typeof ocupado>, tarea: () => Promise<void>, mensaje: string) {
    setOcupado(accion);
    setError(null);
    try {
      await tarea();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : mensaje);
    } finally {
      setOcupado(null);
    }
  }

  const descargarPlantilla = () =>
    ejecutar(
      "plantilla",
      async () => {
        const { blob, nombre } = await personasApi.plantillaCarga();
        guardarArchivo(blob, nombre);
      },
      "No se pudo descargar la plantilla",
    );

  const revisar = () => {
    // El botón siempre está habilitado: sin archivo, se dice qué falta.
    if (!archivo) {
      setError("Elija el Excel con el personal");
      return;
    }
    return ejecutar(
      "revisando",
      async () => {
        const r = await personasApi.revisarCarga(archivo!);
        setRevision(r);
        // Con errores se muestran primero las filas a corregir.
        setFiltro(r.resumen.errores > 0 ? "error" : "todas");
      },
      "No se pudo revisar el archivo",
    );
  };

  const registrar = () =>
    ejecutar(
      "registrando",
      async () => {
        const personas = (revision?.filas ?? []).flatMap((f) => (f.estado === "lista" && f.persona ? [f.persona] : []));
        const r = await personasApi.registrarCarga(personas);
        setResultado(r);
        onRegistradas();
      },
      "No se pudo registrar al personal",
    );

  const descargarErrores = () =>
    ejecutar(
      "errores",
      async () => {
        const filas = (revision?.filas ?? [])
          .filter((f) => f.estado === "error")
          .map((f) => ({
            fila: f.fila,
            perfil: f.perfil,
            empresa: f.empresa,
            tipoDocumento: f.tipoDocumento,
            numeroDocumento: f.numeroDocumento,
            nombres: f.nombres,
            apellidos: f.apellidos,
            autorizadoDesde: f.autorizadoDesde ?? "",
            autorizadoHasta: f.autorizadoHasta ?? "",
            motivoAutorizacion: f.motivoAutorizacion ?? "",
            documento: f.documento ?? "",
            documentoVence: f.documentoVence ?? "",
            motivo: `Fila ${f.fila}: ${f.motivos.join(". ")}`,
            campos: f.campos,
          }));
        const { blob, nombre } = await personasApi.erroresCarga(filas);
        guardarArchivo(blob, nombre);
      },
      "No se pudo descargar el Excel de errores",
    );

  const resumen = revision?.resumen;
  const filas = (revision?.filas ?? []).filter((f) => filtro === "todas" || f.estado === filtro);

  // Cuántas filas se dibujan (como la lista de personal): vuelve a la primera tanda al cambiar de filtro o de archivo.
  const claveLista = `${filtro}|${archivo?.name ?? ""}|${resumen?.total ?? 0}`;
  const [tanda, setTanda] = useState({ clave: claveLista, cantidad: FILAS_POR_TANDA });
  const cantidad = tanda.clave === claveLista ? tanda.cantidad : FILAS_POR_TANDA;
  const hayMas = filas.length > cantidad;
  const tablaRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const final = finalRef.current;
    if (!hayMas || !final) return;
    // Al acercarse al final de la tabla (600 px antes), se agrega otra tanda.
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) setTanda({ clave: claveLista, cantidad: cantidad + FILAS_POR_TANDA });
      },
      { root: tablaRef.current, rootMargin: "600px 0px" },
    );
    observador.observe(final);
    return () => observador.disconnect();
  }, [hayMas, claveLista, cantidad]);

  return (
    <Modal isOpen={isOpen} onClose={cerrar} bloqueado={ocupado === "registrando"} className="max-w-5xl p-6 sm:p-8">
      <h2 className="mb-1 pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">Carga masiva de personal</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Registre a muchas personas a la vez desde un Excel.
      </p>

      {error && <ErrorBanner className="mt-4">{error}</ErrorBanner>}

      {resultado ? (
        // Paso 3: resultado del registro.
        <div className="mt-4 space-y-4">
          <ErrorBanner tono={resultado.registradas ? "exito" : "aviso"}>
            {resultado.registradas
              ? `Se ${resultado.registradas === 1 ? "registró 1 persona" : `registraron ${resultado.registradas} personas`}.`
              : "No se registró a nadie."}
          </ErrorBanner>
          {resultado.omitidas.length > 0 && (
            <div className="rounded-lg border border-gray-100 p-4 text-sm dark:border-gray-800">
              <p className="mb-2 font-medium text-gray-800 dark:text-white/90">
                {plural(resultado.omitidas.length, "persona omitida", "personas omitidas")} (cambió algo desde la revisión):
              </p>
              <ul className="list-inside list-disc space-y-1 text-gray-600 dark:text-gray-300">
                {resultado.omitidas.map((o) => (
                  <li key={o.numeroDocumento}>
                    {o.numeroDocumento}: {o.motivo}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {resultado.registradas > 0 && (
            <ErrorBanner tono="aviso">
              Para que puedan ingresar, a cada persona le falta su <strong>foto</strong> y sus <strong>documentos</strong>: se
              agregan en su ficha.
            </ErrorBanner>
          )}
          <div className="flex justify-end">
            <Button type="button" size="sm" onClick={cerrar}>
              Cerrar
            </Button>
          </div>
        </div>
      ) : revision && resumen ? (
        // Paso 2: revisión, sin guardar nada todavía.
        <div className="mt-4">
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Revisión de <strong className="font-medium text-gray-700 dark:text-gray-300">{archivo?.name}</strong>: todavía no se
            guardó nada.
          </p>
          {resumen.errores > 0 && (
            // Con alguna fila con error no se registra a nadie: se corrige el Excel y se vuelve a subir.
            <ErrorBanner className="mb-4">
              El archivo tiene errores. Corríjalos y vuelva a subirlo.
            </ErrorBanner>
          )}

          <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Mostrar">
            {(
              [
                ["todas", `Todas (${resumen.total})`],
                ["lista", `Listas (${resumen.listas})`],
                ["existe", `Ya registradas (${resumen.existentes})`],
                ["error", `Con error (${resumen.errores})`],
              ] as const
            ).map(([valor, texto]) => (
              <button
                key={valor}
                type="button"
                aria-pressed={filtro === valor}
                onClick={() => setFiltro(valor)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  filtro === valor
                    ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                }`}
              >
                {texto}
              </button>
            ))}
          </div>

          <div ref={tablaRef} className="max-h-[50vh] overflow-auto rounded-lg border border-gray-100 dark:border-gray-800 [&_th]:whitespace-nowrap">
            {filas.length === 0 ? (
              <p className="p-4 text-sm text-gray-400">No hay filas en este grupo.</p>
            ) : (
              <Table>
                <TableHeader className="sticky top-0 border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
                  <TableRow>
                    {["Fila", "Persona", "Empresa", "Perfil", "Período autorizado", "Documento", "Estado"].map((c) => (
                      <TableCell key={c} isHeader className="px-4 py-3 text-start text-xs font-medium text-gray-500">
                        {c}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filas.slice(0, cantidad).map((f) => (
                    <TableRow key={f.fila}>
                      <TableCell className="px-4 py-3 text-sm text-gray-500">{f.fila}</TableCell>
                      <TableCell className="px-4 py-3 text-sm">
                        <span className="block text-gray-800 dark:text-white/90">
                          {[f.apellidos, f.nombres].filter(Boolean).join(", ") || "—"}
                        </span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          {[f.tipoDocumento, f.numeroDocumento].filter(Boolean).join(" ") || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{f.empresa || "—"}</TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{f.perfil || "—"}</TableCell>
                      <TableCell className="px-4 py-3 text-sm">
                        <Periodo f={f} />
                      </TableCell>
                      {/* Solo informa qué documento le corresponde: el archivo se sube en su ficha. */}
                      <TableCell className="px-4 py-3 text-sm">
                        <span className="block text-gray-800 dark:text-white/90">{f.documentoNombre ?? (f.documento || "—")}</span>
                        <span className="block whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                          {f.documentoVenceEl ? `Vence el ${fecha(f.documentoVenceEl)}` : f.documentoVence ? `Vence el ${f.documentoVence}` : "No vence"}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm">
                        <Badge color={ESTADO[f.estado].color}>{ESTADO[f.estado].texto}</Badge>
                        {f.motivos.length > 0 && (
                          <span className={`mt-1 block text-xs ${f.estado === "error" ? "text-error-600 dark:text-error-400" : "text-gray-500"}`}>
                            {f.motivos.join(". ")}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {hayMas && (
              <p ref={finalRef} className="p-3 text-center text-xs text-gray-400">
                Mostrando {cantidad} de {filas.length}…
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" size="sm" onClick={reiniciar} disabled={!!ocupado}>
                Elegir otro archivo
              </Button>
              {resumen.errores > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void descargarErrores()}
                  disabled={!!ocupado}
                  startIcon={<DownloadIcon className="size-4" />}
                >
                  {ocupado === "errores" ? "Descargando…" : "Descargar filas con error"}
                </Button>
              )}
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => void registrar()}
              disabled={!!ocupado || resumen.errores > 0 || resumen.listas === 0}
            >
              {ocupado === "registrando"
                ? "Registrando…"
                : resumen.errores > 0
                  ? "Corrija las filas con error"
                  : resumen.listas
                    ? `Registrar ${plural(resumen.listas, "persona", "personas")}`
                    : "No hay personas para registrar"}
            </Button>
          </div>
        </div>
      ) : (
        // Paso 1: plantilla y archivo.
        <div className="mt-4 space-y-5">
          <ol className="list-inside list-decimal space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <li>Descargue la plantilla de Excel.</li>
            <li>
              Llene una fila por persona: perfil, empresa, tipo y número de documento, nombres y apellidos y, si corresponde, el
              período de autorización (la hoja <b>Instrucciones</b> explica cada columna).
            </li>
            <li>Súbala: el sistema revisa todas las filas y le muestra el resultado antes de guardar.</li>
          </ol>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void descargarPlantilla()}
            disabled={!!ocupado}
            startIcon={<DownloadIcon className="size-4" />}
          >
            {ocupado === "plantilla" ? "Descargando…" : "Descargar plantilla"}
          </Button>
          <div>
            <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400">Excel con el personal</p>
            <FileInput
              key={claveArchivo}
              accept={ACEPTA_EXCEL}
              onChange={(e) => {
                setArchivo(e.target.files?.[0] ?? null);
                setError(null);
              }}
            />
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Archivo .xlsx de hasta 5 MB y 2000 personas. Sin fotos: se agregan después en la ficha.</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" size="sm" onClick={cerrar} disabled={!!ocupado}>
              Cancelar
            </Button>
            <Button type="button" size="sm" onClick={() => void revisar()} disabled={!!ocupado}>
              {ocupado === "revisando" ? "Revisando…" : "Revisar archivo"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
