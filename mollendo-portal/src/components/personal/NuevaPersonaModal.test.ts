import { describe, expect, it } from "vitest";
import type { Empresa, Persona } from "@/lib/api/types";
import { opcionesEmpresa } from "./NuevaPersonaModal";

const empresa = (id: number, razonSocial: string, estado: "activa" | "inactiva" = "activa") => ({ id, razonSocial, estado }) as Empresa;
const persona = (empresaId: number, perfil: Persona["perfil"], estado: Persona["estado"] = "activo") =>
  ({ empresaId, perfil, estado }) as Persona;

const EMPRESAS = [empresa(1, "Transportes Norte"), empresa(2, "Agencia Sur"), empresa(3, "Cerrada SAC", "inactiva"), empresa(4, "Botica Centro")];

describe("empresas del formulario según el perfil", () => {
  it("sin perfil elegido: todas las activas en orden alfabético (las nuevas se registran en Empresas)", () => {
    expect(opcionesEmpresa(EMPRESAS, [], "").map((o) => o.label)).toEqual([
      "Agencia Sur",
      "Botica Centro",
      "Transportes Norte",
    ]);
  });

  it("con perfil: primero las que ya tienen personal activo de ese perfil (con cuántos), después las demás", () => {
    const personas = [
      persona(1, "conductor"),
      persona(2, "conductor"),
      persona(2, "conductor"),
      persona(2, "conductor", "inactivo"),
      persona(4, "contratista"),
    ];
    expect(opcionesEmpresa(EMPRESAS, personas, "conductor")).toEqual([
      { value: "2", label: "Agencia Sur", detalle: "2", grupo: "Con personal Conductor" },
      { value: "1", label: "Transportes Norte", detalle: "1", grupo: "Con personal Conductor" },
      { value: "4", label: "Botica Centro", grupo: "Otras empresas" },
    ]);
  });

  it("si ninguna tiene ese perfil, la lista queda sin grupos", () => {
    expect(opcionesEmpresa(EMPRESAS, [], "visita").every((o) => !("grupo" in o) || o.grupo === undefined)).toBe(true);
  });
});
