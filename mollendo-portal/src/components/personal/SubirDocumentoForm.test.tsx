import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SubirDocumentoForm } from "./SubirDocumentoForm";

vi.mock("@/lib/api/endpoints", () => ({
  documentosApi: { subir: vi.fn() },
  tiposDocumentoApi: { create: vi.fn() },
}));

describe("Agregar documento: nombre de la lista fija", () => {
  it("el nombre se elige de la lista de cinco documentos", async () => {
    render(<SubirDocumentoForm personaId={7} onSubido={() => {}} />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "SCTR Salud y Pensión",
      "Certificado de Aptitud Médico Ocupacional (CAMO)",
      "Certificado de Inducción SSMA – Visitas",
      "Certificado de Inducción SSMA – Contratistas",
      "Certificado de Inducción SSMA – Personal de Planta",
    ]);
  });

  it("sin elegir el documento, lo pide", async () => {
    render(<SubirDocumentoForm personaId={7} onSubido={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Subir documento" }));
    expect(screen.getByText("Seleccione el documento")).toBeInTheDocument();
  });

  it("al renovar, el nombre queda fijo (sin lista)", () => {
    render(<SubirDocumentoForm personaId={7} nombreFijo="SCTR SALUD Y PENSION" onSubido={() => {}} />);
    expect(screen.getByText("SCTR SALUD Y PENSION")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
});
