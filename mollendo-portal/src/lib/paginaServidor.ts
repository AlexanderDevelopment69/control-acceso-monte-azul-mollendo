import type { Paginado } from "@/lib/api/types";

/** Datos para el pie de tabla ("Mostrando X a Y de Z" y los botones de página) de una lista paginada en el servidor. */
export function pieDePagina<T>(lista: Paginado<T> | null) {
  const total = lista?.total ?? 0;
  const porPagina = lista?.porPagina ?? 1;
  const pagina = lista?.pagina ?? 1;
  const desde = total === 0 ? 0 : (pagina - 1) * porPagina + 1;
  return {
    total,
    page: pagina,
    totalPages: Math.max(1, Math.ceil(total / porPagina)),
    from: desde,
    to: total === 0 ? 0 : desde + (lista?.datos.length ?? 0) - 1,
  };
}

/** Fecha de hoy en formato AAAA-MM-DD (hora local). */
export function hoy(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Query string sin los parámetros vacíos. */
export function consulta(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)]),
  ).toString();
  return qs ? `?${qs}` : "";
}
