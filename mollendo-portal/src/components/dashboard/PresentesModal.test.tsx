import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PresentesModal, tiempoDentro } from "./PresentesModal";

const api = vi.hoisted(() => ({ presentes: vi.fn(), descargar: vi.fn() }));
vi.mock("@/lib/api/endpoints", () => ({
  panelApi: { presentes: api.presentes },
  reportesApi: { descargar: api.descargar },
}));

const AHORA = new Date("2026-10-16T22:00:00.000Z");
const hace = (horas: number) => new Date(AHORA.getTime() - horas * 3_600_000).toISOString();

beforeEach(() => {
  api.presentes.mockReset().mockResolvedValue({
    generadoEn: AHORA.toISOString(),
    datos: [
      { personaId: 1, nombres: "Ana", apellidos: "Torres", numeroDocumento: "40000001", perfil: "conductor", empresa: "Transportes Norte", ingreso: hace(14) },
      { personaId: 2, nombres: "Luis", apellidos: "Pérez", numeroDocumento: "40000002", perfil: "contratista", empresa: "Agencia Sur", ingreso: hace(2.5) },
    ],
  });
});

describe("tiempo dentro", () => {
  it("minutos, horas con minutos y días", () => {
    const ahora = AHORA.getTime();
    expect(tiempoDentro(hace(0.75), ahora)).toBe("45 min");
    expect(tiempoDentro(hace(9 + 5 / 60), ahora)).toBe("9 h 05 min");
    expect(tiempoDentro(hace(76), ahora)).toBe("3 días 4 h");
  });
});

describe("lista de presentes", () => {
  it("muestra a todos, resalta a quien lleva más de 12 h y filtra por búsqueda y perfil", async () => {
    render(<PresentesModal isOpen onClose={() => {}} />);
    expect(await screen.findByText("Torres, Ana")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Presentes ahora: 2" })).toBeInTheDocument();
    expect(screen.getByTitle("Más de 12 horas dentro")).toHaveTextContent("14 h 00 min");

    await userEvent.type(screen.getByPlaceholderText(/Buscar/), "agencia");
    expect(screen.queryByText("Torres, Ana")).not.toBeInTheDocument();
    expect(screen.getByText("Pérez, Luis")).toBeInTheDocument();
    expect(screen.getByText("Mostrando 1 de 2")).toBeInTheDocument();

    await userEvent.clear(screen.getByPlaceholderText(/Buscar/));
    const perfil = screen.getByRole("combobox", { name: "Perfil" });
    await userEvent.click(perfil);
    await userEvent.click(within(document.getElementById(perfil.getAttribute("aria-controls")!)!).getByRole("option", { name: "Conductor" }));
    expect(screen.getByText("Torres, Ana")).toBeInTheDocument();
    expect(screen.queryByText("Pérez, Luis")).not.toBeInTheDocument();
  });

  it("sin nadie dentro lo dice", async () => {
    api.presentes.mockResolvedValue({ generadoEn: AHORA.toISOString(), datos: [] });
    render(<PresentesModal isOpen onClose={() => {}} />);
    expect(await screen.findByText("No hay nadie dentro del terminal en este momento.")).toBeInTheDocument();
  });
});
