import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Presentes, tiempoDentro } from "./Presentes";

const api = vi.hoisted(() => ({ presentes: vi.fn(), descargar: vi.fn() }));
vi.mock("@/lib/ws", () => ({ escucharEventos: () => () => {}, canalConectado: () => false }));
vi.mock("@/lib/api/endpoints", () => ({
  panelApi: { presentes: api.presentes },
  reportesApi: { descargar: api.descargar },
}));

const AHORA = new Date("2026-10-16T22:00:00.000Z");
const hace = (horas: number) => new Date(AHORA.getTime() - horas * 3_600_000).toISOString();

// jsdom no trae ResizeObserver (lo usa AltoEstable con una página completa).
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    disconnect() {}
  },
);

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
    render(<Presentes />);
    expect(await screen.findByText("Torres, Ana")).toBeInTheDocument();
    expect(screen.getByText("Mostrando 1 a 2 de 2 registros")).toBeInTheDocument();
    expect(screen.getByTitle("Más de 12 horas dentro")).toHaveTextContent("14 h 00 min");

    await userEvent.type(screen.getByPlaceholderText(/Buscar/), "agencia");
    expect(screen.queryByText("Torres, Ana")).not.toBeInTheDocument();
    expect(screen.getByText("Pérez, Luis")).toBeInTheDocument();
    expect(screen.getByText("Filtrando: 1 de 2 personas dentro")).toBeInTheDocument();

    await userEvent.clear(screen.getByPlaceholderText(/Buscar/));
    const perfil = screen.getByRole("combobox", { name: "Perfil" });
    await userEvent.click(perfil);
    await userEvent.click(within(document.getElementById(perfil.getAttribute("aria-controls")!)!).getByRole("option", { name: "Conductor" }));
    expect(screen.getByText("Torres, Ana")).toBeInTheDocument();
    expect(screen.queryByText("Pérez, Luis")).not.toBeInTheDocument();
  });

  it("muestra 10 por página y pasa a la siguiente", async () => {
    api.presentes.mockResolvedValue({
      generadoEn: AHORA.toISOString(),
      datos: Array.from({ length: 20 }, (_, i) => ({
        personaId: i + 1,
        nombres: `Persona${i + 1}`,
        apellidos: "Prueba",
        numeroDocumento: String(40000100 + i),
        perfil: "contratista",
        empresa: "Agencia Sur",
        ingreso: hace(20 - i),
      })),
    });
    render(<Presentes />);
    expect(await screen.findByText("Prueba, Persona1")).toBeInTheDocument();
    expect(screen.getByText("Mostrando 1 a 10 de 20 registros")).toBeInTheDocument();
    expect(screen.queryByText("Prueba, Persona11")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "2" }));
    expect(screen.getByText("Prueba, Persona11")).toBeInTheDocument();
    expect(screen.getByText("Mostrando 11 a 20 de 20 registros")).toBeInTheDocument();
  });

  it("sin nadie dentro lo dice", async () => {
    api.presentes.mockResolvedValue({ generadoEn: AHORA.toISOString(), datos: [] });
    render(<Presentes />);
    expect(await screen.findByText("No hay nadie dentro del terminal en este momento.")).toBeInTheDocument();
  });
});
