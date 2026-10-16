"use client";

import React, { useEffect, useState } from "react";
import { AlertIcon, InfoIcon } from "@/icons";

/** Recuadro de error (rojo); con tono "info" (azul) o "aviso" (ámbar), de un aviso que no es un error. */
export function ErrorBanner({
  children,
  className = "",
  tono = "error",
}: {
  children: React.ReactNode;
  className?: string;
  tono?: "error" | "info" | "aviso";
}) {
  // Aparece con una transición de alto en vez de saltar de golpe: dentro de un
  // modal centrado con flexbox, un cambio de alto instantáneo recoloca todo el
  // modal de un salto y se percibe como un parpadeo.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${visible ? "max-h-40 opacity-100" : "max-h-0 opacity-0"} ${className}`}
    >
      <div
        className={`flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${
          tono === "info"
            ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
            : tono === "aviso"
              ? "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-orange-400"
              : "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500"
        }`}
      >
        {tono !== "error" ? <InfoIcon className="mt-0.5 size-4 shrink-0" /> : <AlertIcon className="mt-0.5 size-4 shrink-0" />}
        <span>{children}</span>
      </div>
    </div>
  );
}
