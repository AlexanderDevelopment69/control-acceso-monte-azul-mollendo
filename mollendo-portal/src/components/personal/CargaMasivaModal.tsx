"use client";

import React, { useState } from "react";
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

const ACEPTA_EXCEL = ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

type Filtro = "todas" | FilaCargaMasiva["estado"];

const ESTADO: Record<FilaCargaMasiva["estado"], { texto: string; color: "success" | "light" | "error" }> = {
  lista: { texto: "Lista", color: "success" },
  existe: { texto: "Ya registrada", color: "light" },
  error: { texto: "Con error", color: "error" },
};

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

/**
 * Carga masiva de personal desde Excel, en tres pasos: elegir el archivo (con
 * la plantilla para descargar), revisar cada fila sin guardar nada (lista, ya
 * registrada o con error, con su motivo) y registrar las filas listas. Las
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

  const revisar = () =>
    ejecutar(
      "revisando",
      async () => {
        if (!archivo) return;
        setRevision(await personasApi.revisarCarga(archivo));
        setFiltro("todas");
      },
      "No se pudo revisar el archivo",
    );

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
          .map(({ fila, perfil, empresa, tipoDocumento, numeroDocumento, nombres, apellidos, motivos, campos }) => ({
            fila,
            perfil,
            empresa,
            tipoDocumento,
            numeroDocumento,
            nombres,
            apellidos,
            motivo: `Fila ${fila}: ${motivos.join(". ")}`,
            campos,
          }));
        const { blob, nombre } = await personasApi.erroresCarga(filas);
        guardarArchivo(blob, nombre);
      },
      "No se pudo descargar el Excel de errores",
    );

  const resumen = revision?.resumen;
  const filas = (revision?.filas ?? []).filter((f) => filtro === "todas" || f.estado === filtro);

  return (
    <Modal isOpen={isOpen} onClose={cerrar} bloqueado={ocupado === "registrando"} className="max-w-5xl p-6 sm:p-8">
      <h2 className="mb-1 pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">Carga masiva de personal</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Registra a muchas personas a la vez desde un Excel.
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
            guardó nada. Se registrarán solo las filas listas.
          </p>

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

          <div className="max-h-[50vh] overflow-auto rounded-lg border border-gray-100 dark:border-gray-800 [&_th]:whitespace-nowrap">
            {filas.length === 0 ? (
              <p className="p-4 text-sm text-gray-400">No hay filas en este grupo.</p>
            ) : (
              <Table>
                <TableHeader className="sticky top-0 border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
                  <TableRow>
                    {["Fila", "Persona", "Empresa", "Perfil", "Estado"].map((c) => (
                      <TableCell key={c} isHeader className="px-4 py-3 text-start text-xs font-medium text-gray-500">
                        {c}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filas.map((f) => (
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
            <Button type="button" size="sm" onClick={() => void registrar()} disabled={!!ocupado || resumen.listas === 0}>
              {ocupado === "registrando"
                ? "Registrando…"
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
            <li>Descarga la plantilla de Excel.</li>
            <li>
              Llena una fila por persona: perfil, empresa, tipo y número de documento, nombres y apellidos (la hoja
              &quot;Instrucciones&quot; explica cada columna).
            </li>
            <li>Súbela: el sistema revisa todas las filas y te muestra el resultado antes de guardar.</li>
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
            <FileInput key={claveArchivo} accept={ACEPTA_EXCEL} onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Archivo .xlsx de hasta 5 MB y 2000 personas. Sin fotos: se agregan después en la ficha.</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" size="sm" onClick={cerrar} disabled={!!ocupado}>
              Cancelar
            </Button>
            <Button type="button" size="sm" onClick={() => void revisar()} disabled={!archivo || !!ocupado}>
              {ocupado === "revisando" ? "Revisando…" : "Revisar archivo"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
