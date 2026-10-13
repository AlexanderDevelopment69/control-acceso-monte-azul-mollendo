import React from "react";
import { ESTILO_TARJETA } from "./Tarjeta";

/**
 * Tamaños de la tarjeta según dónde va:
 * - `normal`: Dashboard.
 * - `compacta`: Personal, junto a la lista; más chica hasta 1536 px de ancho.
 * - `celular`: Panel de vigilancia; en el celular entran tres en una fila,
 *   así que se ocultan el ícono y la descripción.
 */
const TAMANOS = {
  normal: {
    caja: "gap-4 p-5",
    icono: "flex size-12 [&_svg]:size-6",
    titulo: "text-sm",
    valor: "text-2xl",
    detalle: "block",
  },
  compacta: {
    caja: "gap-3 p-4 2xl:gap-4 2xl:p-5",
    icono: "flex size-10 [&_svg]:size-5 2xl:size-12 2xl:[&_svg]:size-6",
    titulo: "whitespace-nowrap text-sm",
    valor: "text-2xl",
    detalle: "block",
  },
  celular: {
    caja: "gap-4 p-3 sm:p-5",
    icono: "hidden size-12 sm:flex [&_svg]:size-6",
    titulo: "text-xs leading-snug sm:text-sm",
    valor: "text-xl sm:text-2xl",
    detalle: "hidden sm:block",
  },
};

/**
 * Indicador con un número: ícono en un cuadro de color y, a su lado, título,
 * número y descripción. Es el mismo en Dashboard, Personal y Panel de vigilancia.
 * Con `onClick` es un botón (en Personal filtra la lista).
 */
export default function TarjetaIndicador({
  titulo,
  valor,
  detalle,
  icono,
  fondoIcono,
  colorValor = "text-gray-800 dark:text-white/90",
  tamano = "normal",
  onClick,
  title,
}: {
  titulo: string;
  /** `null` = todavía no se cargó: se muestra "—" en gris claro en vez de un 0 que luego salta. */
  valor: number | null;
  detalle?: string;
  icono: React.ReactNode;
  /** Color del cuadro del ícono, p. ej. `bg-success-500`. */
  fondoIcono: string;
  colorValor?: string;
  tamano?: keyof typeof TAMANOS;
  onClick?: () => void;
  title?: string;
}) {
  const t = TAMANOS[tamano];
  const contenido = (
    <>
      <span className={`${t.icono} shrink-0 items-center justify-center rounded-xl text-white ${fondoIcono}`}>{icono}</span>
      <span className="min-w-0">
        <span className={`block text-gray-500 dark:text-gray-400 ${t.titulo}`}>{titulo}</span>
        <span className={`block font-semibold ${t.valor} ${valor === null ? "text-gray-300 dark:text-gray-600" : colorValor}`}>
          {valor ?? "—"}
        </span>
        {detalle && <span className={`text-xs leading-snug text-gray-400 ${t.detalle}`}>{detalle}</span>}
      </span>
    </>
  );
  const clases = `flex items-center ${ESTILO_TARJETA} ${t.caja}`;
  if (onClick) {
    return (
      <button
        type="button"
        title={title}
        onClick={onClick}
        className={`${clases} text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.06]`}
      >
        {contenido}
      </button>
    );
  }
  return <div className={clases}>{contenido}</div>;
}
