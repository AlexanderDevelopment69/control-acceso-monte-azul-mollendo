import { describe, expect, it } from "vitest";
import type { Cumplimiento } from "@/lib/api/types";
import { motivosCumplimiento } from "./cumplimiento";

const base: Cumplimiento = { habilitado: false, dadoDeBaja: false, sinDocumentos: false, documentosVencidos: [] };

describe("motivosCumplimiento", () => {
  it("habilitado: sin motivos", () => {
    expect(motivosCumplimiento({ ...base, habilitado: true })).toEqual([]);
  });

  it("sin documentos", () => {
    expect(motivosCumplimiento({ ...base, sinDocumentos: true })).toEqual(["Sin documentos cargados"]);
  });

  it("documentos vencidos, con sus nombres", () => {
    expect(motivosCumplimiento({ ...base, documentosVencidos: ["SCTR", "Licencia"] })).toEqual(["Vencido: SCTR, Licencia"]);
  });

  it("sin documentos y con vencidos: los dos motivos", () => {
    expect(motivosCumplimiento({ ...base, sinDocumentos: true, documentosVencidos: ["SCTR"] })).toEqual([
      "Sin documentos cargados",
      "Vencido: SCTR",
    ]);
  });

  it("de baja: solo ese motivo (con la razón, si la hay)", () => {
    const deBaja = { ...base, dadoDeBaja: true, sinDocumentos: true, documentosVencidos: ["SCTR"] };
    expect(motivosCumplimiento(deBaja, "Renuncia")).toEqual(["Dado de baja: Renuncia"]);
    expect(motivosCumplimiento(deBaja)).toEqual(["Dado de baja"]);
    expect(motivosCumplimiento(deBaja, null)).toEqual(["Dado de baja"]);
  });
});
