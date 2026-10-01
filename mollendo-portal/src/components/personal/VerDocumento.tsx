"use client";

import React, { useState } from "react";
import { documentosApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import Button from "@/components/ui/button/Button";

/**
 * Botón "Ver" de un documento cargado. El archivo se pide con la sesión del
 * usuario: un PDF o una imagen se abre en una pestaña nueva; un Word se descarga
 * (el navegador no puede mostrarlo).
 */
export function VerDocumento({
  personaId,
  documentoId,
  className = "",
  variante = "boton",
}: {
  personaId: number;
  documentoId: number;
  className?: string;
  /** "boton" (como Renovar y Eliminar) o "enlace" (en listas). */
  variante?: "boton" | "enlace";
}) {
  const [abriendo, setAbriendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ver() {
    setError(null);
    setAbriendo(true);
    // La pestaña se abre en el clic (antes de esperar el archivo) para que el
    // navegador no la bloquee como ventana emergente.
    const pestana = window.open("", "_blank");
    try {
      const { blob, nombre } = await documentosApi.archivo(personaId, documentoId);
      const url = URL.createObjectURL(blob);
      if (pestana && (blob.type === "application/pdf" || blob.type.startsWith("image/"))) {
        pestana.location.href = url;
      } else {
        pestana?.close();
        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.download = nombre;
        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      pestana?.close();
      setError(err instanceof ApiError ? err.message : "No se pudo abrir el documento");
    } finally {
      setAbriendo(false);
    }
  }

  const texto = abriendo ? "Abriendo…" : "Ver";
  return (
    <span className={variante === "enlace" ? "inline-flex flex-col" : "contents"}>
      {variante === "enlace" ? (
        <button
          type="button"
          onClick={() => void ver()}
          disabled={abriendo}
          className={`text-sm font-medium text-brand-500 hover:text-brand-600 disabled:opacity-50 dark:text-brand-400 ${className}`}
        >
          {texto}
        </button>
      ) : (
        <Button size="sm" variant="outline" className={className} onClick={() => void ver()} disabled={abriendo}>
          {texto}
        </Button>
      )}
      {error && (
        <span role="alert" className="text-xs text-error-600 dark:text-error-500">
          {error}
        </span>
      )}
    </span>
  );
}
