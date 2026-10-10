"use client";

import React, { FC, useId, useState } from "react";

interface FileInputProps {
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Tipos de archivo que ofrece el selector (atributo `accept`). */
  accept?: string;
}

/**
 * Campo de archivo propio: el del navegador escribe "Ningún archivo
 * seleccionado" y, en un campo angosto, lo corta por la mitad. Aquí el nombre
 * elegido se recorta al final con "…" y se ve completo al pasar el mouse.
 */
const FileInput: FC<FileInputProps> = ({ className = "", onChange, accept }) => {
  const id = useId();
  const [nombre, setNombre] = useState<string | null>(null);

  return (
    <label
      htmlFor={id}
      className={`group flex h-11 w-full cursor-pointer items-center overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm shadow-theme-xs transition-colors focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 ${className}`}
    >
      <input
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          setNombre(e.target.files?.[0]?.name ?? null);
          onChange?.(e);
        }}
      />
      <span className="flex h-full shrink-0 items-center gap-2 border-r border-gray-200 bg-gray-50 px-3.5 font-medium text-gray-700 transition-colors group-hover:bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:group-hover:bg-white/[0.06]">
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" />
        </svg>
        Elegir archivo
      </span>
      <span title={nombre ?? undefined} className={`min-w-0 flex-1 truncate px-3 ${nombre ? "text-gray-800 dark:text-white/90" : "text-gray-400"}`}>
        {nombre ?? "Ningún archivo"}
      </span>
    </label>
  );
};

export default FileInput;
