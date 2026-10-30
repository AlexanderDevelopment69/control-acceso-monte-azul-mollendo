import React from "react";
import { CheckLineIcon, CloseLineIcon } from "@/icons";

type EstadoTarjeta = "autorizado" | "denegado" | "espera";

/** Círculo del resultado: ✓ verde, ✕ rojo o, en espera, un punto que late. */
function IconoEstado({ estado, className = "" }: { estado: EstadoTarjeta; className?: string }) {
  const color = estado === "autorizado" ? "bg-success-500" : estado === "denegado" ? "bg-error-500" : "bg-brand-500";
  const texto = estado === "autorizado" ? "Autorizado" : estado === "denegado" ? "Denegado" : "En espera";
  return (
    <span role="img" aria-label={texto} title={texto} className={`flex items-center justify-center rounded-full text-white ${color} ${className}`}>
      {estado === "autorizado" ? (
        <CheckLineIcon className="size-3" />
      ) : estado === "denegado" ? (
        <CloseLineIcon className="size-3" />
      ) : (
        <span className="size-1.5 animate-pulse rounded-full bg-white" />
      )}
    </span>
  );
}

/**
 * Una fila de tabla convertida en tarjeta, para el celular (sin deslizar de lado). Siempre el mismo orden:
 * quién (título y subtítulo, con foto si hay; si no entran, pasan a otra línea) y cuándo (a la derecha,
 * la hora grande y la fecha debajo); debajo de una línea, qué pasó y por qué (`children`).
 * `estado`: el resultado de un vistazo, en un círculo en la esquina de la foto (✓ verde, ✕ rojo, punto azul
 * en espera); sin foto, el círculo va delante del título.
 */
export function TarjetaFila({
  estado,
  foto,
  titulo,
  subtitulo,
  hora,
  fecha,
  resaltado = false,
  children,
}: {
  estado?: EstadoTarjeta;
  foto?: React.ReactNode;
  titulo: React.ReactNode;
  subtitulo?: React.ReactNode;
  hora?: React.ReactNode;
  fecha?: React.ReactNode;
  resaltado?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <li className={`px-4 py-3.5 transition-colors duration-700 ${resaltado ? "bg-brand-50 dark:bg-brand-500/10" : ""}`}>
      <div className="flex items-start gap-3">
        {foto ? (
          <div className="relative shrink-0">
            {foto}
            {estado && <IconoEstado estado={estado} className="absolute -right-1 -bottom-1 size-5 ring-2 ring-white dark:ring-gray-900" />}
          </div>
        ) : (
          estado && <IconoEstado estado={estado} className="mt-0.5 size-5 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="break-words text-sm font-semibold text-gray-800 dark:text-white/90">{titulo}</div>
          {subtitulo && <div className="mt-0.5 break-words text-xs text-gray-500 dark:text-gray-400">{subtitulo}</div>}
        </div>
        {(hora || fecha) && (
          <div className="shrink-0 text-right">
            {hora && <div className="text-sm font-medium tabular-nums text-gray-800 dark:text-white/90">{hora}</div>}
            {fecha && <div className="text-xs text-gray-500 dark:text-gray-400">{fecha}</div>}
          </div>
        )}
      </div>
      {children && (
        <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-300">
          {children}
        </div>
      )}
    </li>
  );
}

/** Un renglón de la tarjeta con algo a la izquierda y algo a la derecha (p. ej. el movimiento y el resultado). */
export function RenglonTarjeta({ izquierda, derecha }: { izquierda: React.ReactNode; derecha?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">{izquierda}</div>
      {derecha && <div className="shrink-0">{derecha}</div>}
    </div>
  );
}

/**
 * Lista de tarjetas: solo cuando no hay espacio para la tabla (el contenedor con `@container` mide menos
 * de 56rem). Una tabla que entra en menos espacio pasa en `ocultar` su propio punto (p. ej. "@min-[52rem]:hidden").
 */
export function ListaTarjetas({ ocultar = "@4xl:hidden", children }: { ocultar?: string; children: React.ReactNode }) {
  return <ul className={`divide-y divide-gray-100 dark:divide-gray-800 ${ocultar}`}>{children}</ul>;
}

/** Aviso dentro de la lista de tarjetas (cargando, sin resultados, error). */
export function AvisoTarjetas({ children }: { children: React.ReactNode }) {
  return <li className="px-4 py-4 text-sm text-gray-400">{children}</li>;
}

/** Insignias de motivo o marcas como texto simple (en la tarjeta, una sola insignia: el resultado). */
export const COMO_TEXTO = "[&_.rounded-full]:bg-transparent! [&_.rounded-full]:p-0! [&_.rounded-full]:text-inherit!";
