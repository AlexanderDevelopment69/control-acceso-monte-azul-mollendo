import React from "react";

/** Fondo blanco con borde gris (en el tema oscuro, casi transparente): el recuadro de todas las pantallas. */
export const ESTILO_TARJETA = "rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]";

type TarjetaProps = React.HTMLAttributes<HTMLElement> & {
  /** Etiqueta HTML del recuadro: `section` para un bloque con título propio, `nav` para un índice. */
  as?: "div" | "section" | "nav";
  ref?: React.Ref<HTMLElement>;
};

/** Recuadro blanco de contenido. El margen interno y la ubicación van en `className`. */
export default function Tarjeta({ as = "div", className = "", ...props }: TarjetaProps) {
  // Las tres etiquetas son HTMLElement; TypeScript no acepta un mismo `ref` para la unión.
  const Etiqueta = as as React.ElementType;
  return <Etiqueta className={`${ESTILO_TARJETA} ${className}`} {...props} />;
}
