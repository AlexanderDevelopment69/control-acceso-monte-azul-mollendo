import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { MarcacionG4 } from "@/lib/api/types";
import { grado, horaCorta, MonitorG4, TarjetaMonitorG4 } from "./MonitorG4";

vi.mock("@/components/personal/FotoPersonal", () => ({ FotoGuardada: () => <div>foto</div> }));
vi.mock("@/lib/ws", () => ({ connectEventosSocket: () => ({ on: vi.fn(), disconnect: vi.fn() }) }));

const APROBO: MarcacionG4 = {
  id: 30,
  serialNumber: "HSR3263100192",
  numero: 28,
  faltanAntes: 2,
  dni: "71988749",
  persona: { id: 7, nombres: "Jose", apellidos: "Vilchez", tieneFoto: true },
  horaPrueba: "2026-10-19T23:27:00.000Z",
  llegada: "2026-10-19T23:27:02.000Z",
  demoraSegundos: 2,
  alcohol: "0.00g/L",
  aprobado: true,
  decision: 'Aprobó: "pase su DNI" (15 s)',
  ingreso: { id: 500, resultado: "autorizado", motivo: "", fechaHora: "2026-10-19T23:27:04.000Z" },
};

const ALCOHOL: MarcacionG4 = {
  ...APROBO,
  id: 29,
  numero: 25,
  faltanAntes: 0,
  dni: "99999999",
  persona: null,
  demoraSegundos: 16,
  alcohol: "0.000379g/L",
  aprobado: false,
  decision: "Alcohol alto: denegado con su nombre",
  ingreso: { id: 499, resultado: "denegado", motivo: "Alcohol", fechaHora: "2026-10-19T23:20:00.000Z" },
};

vi.mock("@/lib/api/endpoints", () => ({
  integracionesApi: { marcacionesG4: () => Promise.resolve([APROBO, ALCOHOL]) },
}));

describe("Monitor del G4 Pro", () => {
  it("la tarjeta de Sistema lleva a la página del monitor, sin la tabla", () => {
    render(<TarjetaMonitorG4 />);
    expect(screen.getByRole("link", { name: /Abrir monitor/ })).toHaveAttribute("href", "/sistema/monitor");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("la página muestra cada prueba: persona, grado, decisión, ingreso, demora y las que no llegaron", async () => {
    render(<MonitorG4 />);
    const fila = (await screen.findByText("Jose Vilchez")).closest("tr")!;
    expect(within(fila).getByText("0.00 g/L")).toBeInTheDocument();
    expect(within(fila).getByText('Aprobó: "pase su DNI" (15 s)')).toBeInTheDocument();
    expect(within(fila).getByText("Autorizado")).toBeInTheDocument();
    expect(within(fila).getByText("2 s después")).toBeInTheDocument();
    expect(screen.getByText(/No llegaron 2 pruebas \(N\.º 26 a 27\)/)).toBeInTheDocument();

    const otra = screen.getByText("No está en el sistema").closest("tr")!;
    expect(within(otra).getByText("0.000379 g/L")).toBeInTheDocument();
    expect(within(otra).getByText("Denegado")).toBeInTheDocument();
    expect(within(otra).getByText(/Alcohol ·/)).toBeInTheDocument();
  });

  it("formatos: grado con espacio y la hora siempre con el día", () => {
    expect(grado("0.000951g/L")).toBe("0.000951 g/L");
    expect(horaCorta("2026-10-20T13:05:09")).toBe("20/10 13:05:09");
    expect(horaCorta("2026-10-19T18:27:00")).toBe("19/10 18:27:00");
  });
});
