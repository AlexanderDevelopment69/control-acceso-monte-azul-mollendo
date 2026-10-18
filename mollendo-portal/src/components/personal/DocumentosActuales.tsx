import React from "react";
import type { Persona } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Tarjeta from "@/components/ui/tarjeta/Tarjeta";
import { VerDocumento } from "./VerDocumento";
import { formatearFecha } from "./cumplimiento";

type DocumentoActual = NonNullable<Persona["documentosActuales"]>[number];

function Seccion({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: React.ReactNode }) {
  return (
    <Tarjeta as="section" className="p-5">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{titulo}</h3>
      {descripcion && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{descripcion}</p>}
      <div className="mt-4">{children}</div>
    </Tarjeta>
  );
}

/** Última versión de cada documento, con sus botones: tarjetas en el celular y tabla en pantallas anchas. */
export function DocumentosActuales({
  personaId,
  actuales,
  onAgregar,
  onRenovar,
  onEliminar,
}: {
  personaId: number;
  actuales: DocumentoActual[];
  onAgregar: () => void;
  onRenovar: (nombre: string) => void;
  onEliminar: (documento: DocumentoActual) => void;
}) {
  /** Botones "Ver", "Renovar" y "Eliminar" de un documento (tarjeta en el celular, tabla en pantallas anchas). */
  function accionesDocumento(d: DocumentoActual, className = "") {
    return (
      <>
        <VerDocumento personaId={personaId} documentoId={d.id} className={className} />
        <Button size="sm" variant="outline" className={className} onClick={() => onRenovar(d.nombre)}>
          Renovar
        </Button>
        <Button
          size="sm"
          variant="outline-danger"
          className={className}
          onClick={() => onEliminar(d)}
        >
          Eliminar
        </Button>
      </>
    );
  }

  return (
    <Seccion
      titulo="Documentos"
      descripcion="Cuenta la última versión de cada documento. Uno que vence hoy sigue válido todo el día."
    >
      {actuales.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Todavía no tiene documentos: sin documentos no puede ingresar. Use “+ Agregar documento”.
        </p>
      ) : (
        <>
          {/* Celular: una tarjeta por documento, con los botones a la vista. */}
          <ul className="space-y-3 sm:hidden">
            {actuales.map((d) => (
              <li key={d.tipoDocumentoId} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">{d.nombre}</span>
                  {d.vigente ? <Badge color="success">Vigente</Badge> : <Badge color="error">Vencido</Badge>}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {d.fechaVencimiento ? `Vence el ${formatearFecha(d.fechaVencimiento)}` : "No vence"}
                </p>
                <div className="mt-3 flex gap-2">{accionesDocumento(d, "flex-1")}</div>
              </li>
            ))}
          </ul>

          {/* Pantallas más anchas: tabla. */}
          <div className="hidden overflow-x-auto sm:block">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="py-2 pr-4 text-start text-xs font-medium text-gray-500">Documento</TableCell>
                  <TableCell isHeader className="py-2 pr-4 text-start text-xs font-medium text-gray-500">Vence</TableCell>
                  <TableCell isHeader className="py-2 pr-4 text-start text-xs font-medium text-gray-500">Estado</TableCell>
                  <TableCell isHeader className="py-2 text-start text-xs font-medium text-gray-500"></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {actuales.map((d) => (
                  <TableRow key={d.tipoDocumentoId}>
                    <TableCell className="py-3 pr-4 text-sm text-gray-700 dark:text-gray-300">{d.nombre}</TableCell>
                    <TableCell className="whitespace-nowrap py-3 pr-4 text-sm text-gray-700 dark:text-gray-300">
                      {d.fechaVencimiento ? formatearFecha(d.fechaVencimiento) : "No vence"}
                    </TableCell>
                    <TableCell className="py-3 pr-4 text-sm">
                      {d.vigente ? <Badge color="success">Vigente</Badge> : <Badge color="error">Vencido</Badge>}
                    </TableCell>
                    <TableCell className="py-3 text-sm">
                      <div className="flex justify-end gap-2">{accionesDocumento(d)}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
      <div className="mt-4">
        <Button size="sm" variant="outline" onClick={onAgregar}>
          + Agregar documento
        </Button>
      </div>
    </Seccion>
  );
}
