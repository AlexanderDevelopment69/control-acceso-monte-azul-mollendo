"use client";

import React, { useEffect, useRef, useState } from "react";
import { personasApi } from "@/lib/api/endpoints";
import { UserIcon } from "@/icons";

const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp"];
const FOTO_TAMANO_MAXIMO = 5 * 1024 * 1024; // igual que el backend

/** Valida la foto antes de subirla; devuelve el mensaje de error o null. */
export function validarFoto(archivo: File): string | null {
  if (!TIPOS_FOTO.includes(archivo.type)) return "La foto debe ser una imagen JPG, PNG o WEBP";
  if (archivo.size > FOTO_TAMANO_MAXIMO) return "La foto no puede pesar más de 5 MB";
  return null;
}

/** Recuadro de la foto (o un ícono si no hay). */
function Marco({ src, tamano, alt }: { src: string | null; tamano: string; alt: string }) {
  return (
    <div
      className={`${tamano} flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 text-gray-400 dark:bg-gray-800`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- blob: local, next/image no aplica
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <UserIcon className="size-1/2" />
      )}
    </div>
  );
}

/**
 * Elegir la foto (formulario de alta): vista previa local del archivo elegido.
 */
export function SelectorFoto({ archivo, onChange }: { archivo: File | null; onChange: (archivo: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previa, setPrevia] = useState<string | null>(null);

  useEffect(() => {
    if (!archivo) return;
    const url = URL.createObjectURL(archivo);
    // setState dentro de un callback asíncrono, no en el cuerpo del efecto.
    const id = requestAnimationFrame(() => setPrevia(url));
    return () => {
      cancelAnimationFrame(id);
      URL.revokeObjectURL(url);
    };
  }, [archivo]);

  return (
    <div className="flex items-center gap-4">
      <Marco src={archivo ? previa : null} tamano="size-20" alt="Vista previa de la foto" />
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
        >
          {archivo ? "Cambiar foto" : "Elegir foto"}
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          De frente, con buena luz. JPG, PNG o WEBP, hasta 5 MB.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={TIPOS_FOTO.join(",")}
          className="hidden"
          onChange={(e) => {
            onChange(e.target.files?.[0] ?? null);
            e.target.value = ""; // permite volver a elegir el mismo archivo
          }}
        />
      </div>
    </div>
  );
}

/**
 * Fotos ya descargadas en esta sesión, por persona y versión: la misma persona
 * en varias filas (Monitor del G4 Pro, Panel) se descarga una sola vez y
 * aparece enseguida al cambiar de página.
 */
const fotos = new Map<string, Promise<string>>();
const fotosListas = new Map<string, string>();

function cargarFoto(personaId: number, version?: string | null): Promise<string> {
  const clave = `${personaId}:${version ?? ""}`;
  let foto = fotos.get(clave);
  if (!foto) {
    // Una foto nueva (otra versión) reemplaza la que se guardó sin versión.
    if (version) fotos.delete(`${personaId}:`);
    foto = personasApi.foto(personaId).then((blob) => {
      const url = URL.createObjectURL(blob);
      fotosListas.set(clave, url);
      return url;
    });
    foto.catch(() => fotos.delete(clave)); // si falló, se vuelve a intentar la próxima vez
    fotos.set(clave, foto);
  }
  return foto;
}

/**
 * Foto guardada de un trabajador (ficha). La descarga con el token de sesión,
 * porque el endpoint está protegido y un <img src> no puede mandar el header.
 * `version` cambia cuando se sube una foto nueva, para volver a descargarla.
 */
export function FotoGuardada({
  personaId,
  tieneFoto,
  version,
  tamano = "size-20",
}: {
  personaId: number;
  tieneFoto: boolean;
  version?: string | null;
  tamano?: string;
}) {
  const [src, setSrc] = useState<string | null>(() => fotosListas.get(`${personaId}:${version ?? ""}`) ?? null);

  useEffect(() => {
    if (!tieneFoto) return;
    let activo = true;
    cargarFoto(personaId, version)
      .then((url) => activo && setSrc(url))
      .catch(() => activo && setSrc(null));
    return () => {
      activo = false;
    };
  }, [personaId, tieneFoto, version]);

  return <Marco src={tieneFoto ? src : null} tamano={tamano} alt="Foto del personal" />;
}
