import { useEffect, useState } from "react";

/**
 * Devuelve `valor` recién cuando deja de cambiar por `ms` milisegundos. Sirve
 * para buscar en el servidor cuando la persona termina de escribir, no en cada tecla.
 */
export function useDiferido<T>(valor: T, ms = 350): T {
  const [diferido, setDiferido] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setDiferido(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return diferido;
}
