import React from "react";

/** Color del aviso: el del punto y la píldora (el resto es blanco con borde fino). */
export type TonoAviso = "brand" | "error" | "warning" | "success";

const PUNTO: Record<TonoAviso, { fijo: string; pulso: string }> = {
  brand: { fijo: "bg-brand-500", pulso: "bg-brand-400" },
  error: { fijo: "bg-error-500", pulso: "bg-error-400" },
  warning: { fijo: "bg-warning-500", pulso: "bg-warning-400" },
  success: { fijo: "bg-success-500", pulso: "bg-success-400" },
};

const PILDORA: Record<TonoAviso, string> = {
  brand: "bg-brand-500 text-white",
  error: "bg-error-500 text-white",
  warning: "bg-warning-500 text-white",
  success: "bg-success-500 text-white",
};

/**
 * Aviso del Panel de vigilancia, con el diseño del orden del ingreso: fondo
 * blanco con borde fino; arriba un punto que late (algo está activo ahora), la
 * etiqueta en mayúsculas y la píldora de color; debajo, el texto. Las acciones
 * (botones) van a la derecha y, en el celular, debajo.
 */
export function AvisoPanel({
  tono,
  etiqueta,
  pildora,
  children,
  acciones,
  pulso = true,
}: {
  tono: TonoAviso;
  etiqueta: string;
  pildora: React.ReactNode;
  children?: React.ReactNode;
  acciones?: React.ReactNode;
  /** false: el punto queda quieto (un aviso que ya pasó, no algo en curso). */
  pulso?: boolean;
}) {
  const punto = PUNTO[tono];
  return (
    <div
      role="status"
      className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-theme-xs sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <span aria-hidden className="relative flex size-2.5">
              {pulso && <span className={`absolute inline-flex size-full animate-ping rounded-full opacity-60 ${punto.pulso}`} />}
              <span className={`relative inline-flex size-2.5 rounded-full ${punto.fijo}`} />
            </span>
            {etiqueta}
          </span>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold shadow-theme-xs ${PILDORA[tono]}`}>{pildora}</span>
        </div>
        {children && <div className="mt-2 pl-[1.125rem] leading-relaxed text-gray-600 dark:text-gray-300">{children}</div>}
      </div>
      {acciones && <div className="flex shrink-0 flex-wrap gap-2 pl-[1.125rem] sm:pl-0">{acciones}</div>}
    </div>
  );
}
