import { describe, expect, it } from "vitest";
import type { Persona } from "@/lib/api/types";
import { cambiosPersona } from "./EditarPersonaModal";

const persona = {
  id: 7,
  empresaId: 1,
  perfil: null,
  tipoDocumentoIdentidad: "DNI",
  numeroDocumento: "45678912",
  nombres: "Rosa",
  apellidos: "Díaz",
} as Persona;
const iguales = { perfil: "" as const, empresaId: "1", tipoDocumentoIdentidad: "DNI" as const, numeroDocumento: "45678912", nombres: "Rosa", apellidos: "Díaz" };

describe("qué se envía al editar", () => {
  it("nada si no cambió nada (los espacios al borde no cuentan)", () => {
    expect(cambiosPersona(persona, { ...iguales, nombres: "  Rosa " })).toEqual({});
  });

  it("solo lo que cambió", () => {
    expect(cambiosPersona(persona, { ...iguales, perfil: "visita", empresaId: "2", apellidos: "Díaz Pérez " })).toEqual({
      perfil: "visita",
      empresaId: 2,
      apellidos: "Díaz Pérez",
    });
    expect(cambiosPersona(persona, { ...iguales, tipoDocumentoIdentidad: "CE", numeroDocumento: "X123" })).toEqual({
      tipoDocumentoIdentidad: "CE",
      numeroDocumento: "X123",
    });
  });
});
