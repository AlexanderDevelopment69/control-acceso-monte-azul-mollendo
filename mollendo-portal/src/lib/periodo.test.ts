import { describe, expect, it } from "vitest";
import { PERIODO_VACIO, periodoDePersona, periodoParaApi, problemaPeriodo, textoPeriodo } from "./periodo";

describe("período de autorización (portal)", () => {
  it("vacío está bien (sin período) y se envía como null", () => {
    expect(problemaPeriodo(PERIODO_VACIO)).toBeNull();
    expect(periodoParaApi(PERIODO_VACIO)).toEqual({ autorizadoDesde: null, autorizadoHasta: null, motivoAutorizacion: null });
  });

  it("si hay algo, van las dos fechas y el motivo, y la finalización no antes del ingreso", () => {
    expect(problemaPeriodo({ desde: "2026-10-22", hasta: "", motivo: "" })).toMatch(/Complete el período/);
    expect(problemaPeriodo({ desde: "2026-10-22", hasta: "2026-10-31", motivo: "" })).toMatch(/Complete el período/);
    expect(problemaPeriodo({ desde: "2026-10-31", hasta: "2026-10-22", motivo: "Obra" })).toBe(
      "La fecha de finalización no puede ser anterior a la fecha de ingreso",
    );
    expect(problemaPeriodo({ desde: "2026-10-22", hasta: "2026-10-22", motivo: "Visita" })).toBeNull();
  });

  it("se lee de la persona (fechas DATE) y se muestra como del … al …", () => {
    const persona = { autorizadoDesde: "2026-10-22T00:00:00.000Z", autorizadoHasta: "2026-10-31T00:00:00.000Z", motivoAutorizacion: "Obra" };
    expect(periodoDePersona(persona)).toEqual({ desde: "2026-10-22", hasta: "2026-10-31", motivo: "Obra" });
    expect(textoPeriodo(persona)).toBe("del 22/10/2026 al 31/10/2026");
    expect(periodoParaApi({ desde: "2026-10-22", hasta: "2026-10-31", motivo: "  Visita   técnica " })).toEqual({
      autorizadoDesde: "2026-10-22",
      autorizadoHasta: "2026-10-31",
      motivoAutorizacion: "Visita técnica",
    });
  });
});
