import { afterEach, describe, expect, it, vi } from "vitest";
import { consulta, hoy, pieDePagina } from "./paginaServidor";

describe("pieDePagina", () => {
  it("sin lista: todo en cero y una sola página", () => {
    expect(pieDePagina(null)).toEqual({ total: 0, page: 1, totalPages: 1, from: 0, to: 0 });
  });

  it("primera página completa", () => {
    const lista = { datos: Array(25).fill({}), total: 60, pagina: 1, porPagina: 25 };
    expect(pieDePagina(lista)).toEqual({ total: 60, page: 1, totalPages: 3, from: 1, to: 25 });
  });

  it("última página con menos filas", () => {
    const lista = { datos: Array(10).fill({}), total: 60, pagina: 3, porPagina: 25 };
    expect(pieDePagina(lista)).toEqual({ total: 60, page: 3, totalPages: 3, from: 51, to: 60 });
  });

  it("lista vacía: muestra 0 a 0", () => {
    const lista = { datos: [], total: 0, pagina: 1, porPagina: 25 };
    expect(pieDePagina(lista)).toMatchObject({ from: 0, to: 0, totalPages: 1 });
  });
});

describe("consulta", () => {
  it("quita los parámetros vacíos o sin valor", () => {
    expect(consulta({ pagina: 2, buscar: "", dia: undefined, porPagina: 25 })).toBe("?pagina=2&porPagina=25");
  });

  it("sin parámetros: cadena vacía", () => {
    expect(consulta({ buscar: "" })).toBe("");
  });

  it("codifica los textos (espacios, tildes, &)", () => {
    expect(consulta({ buscar: "Pérez & Hijos" })).toBe("?buscar=P%C3%A9rez+%26+Hijos");
  });
});

describe("hoy", () => {
  afterEach(() => vi.useRealTimers());

  it("devuelve la fecha local en formato AAAA-MM-DD con ceros", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 23, 30)); // 5 de enero, 11:30 p. m. (hora local)
    expect(hoy()).toBe("2026-01-05");
  });
});
