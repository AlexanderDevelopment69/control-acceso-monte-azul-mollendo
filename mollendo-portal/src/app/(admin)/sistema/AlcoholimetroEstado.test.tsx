import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { EstadoDispositivo, EstadoSistema } from "@/lib/api/types";
import { AlcoholimetroEstado } from "./TarjetasEstado";

const REVISADO = "2026-10-21T15:56:06.000Z";

function equipos(d: Partial<EstadoDispositivo>): EstadoSistema["equipos"] {
  const dispositivo = { serialNumber: "HSR3263100192", enLinea: true, ultimaActividad: REVISADO, ...d } as EstadoDispositivo;
  return { total: 1, enLinea: dispositivo.enLinea ? 1 : 0, dispositivos: [dispositivo] };
}

describe("Tarjeta del alcoholímetro (Sistema y APIs)", () => {
  it("conectado: con la hora de la última revisión", () => {
    render(<AlcoholimetroEstado comprobando={false} equipos={equipos({ alcoholimetro: { conectado: true, revisado: REVISADO, conectadoVisto: REVISADO } })} />);
    expect(screen.getByText("Conectado")).toBeInTheDocument();
    expect(screen.getByText(/Al equipo facial · revisado/)).toBeInTheDocument();
  });

  it("desconectado: con la última vez que se lo vio conectado", () => {
    render(<AlcoholimetroEstado comprobando={false} equipos={equipos({ alcoholimetro: { conectado: false, revisado: REVISADO, conectadoVisto: REVISADO } })} />);
    expect(screen.getByText("Desconectado")).toBeInTheDocument();
    expect(screen.getByText(/Última vez conectado:/)).toBeInTheDocument();
  });

  it("sin datos: todavía no se revisó, o el equipo facial está desconectado", () => {
    const { unmount } = render(
      <AlcoholimetroEstado comprobando={false} equipos={equipos({ alcoholimetro: { conectado: null, revisado: null, conectadoVisto: null } })} />,
    );
    expect(screen.getByText("Sin datos")).toBeInTheDocument();
    expect(screen.getByText("Todavía no se revisó")).toBeInTheDocument();
    unmount();

    render(<AlcoholimetroEstado comprobando={false} equipos={equipos({ enLinea: false, alcoholimetro: { conectado: false, revisado: REVISADO, conectadoVisto: null } })} />);
    expect(screen.getByText("Sin datos")).toBeInTheDocument();
    expect(screen.getByText("El equipo facial está desconectado")).toBeInTheDocument();
    expect(screen.queryByText("Desconectado")).not.toBeInTheDocument();
  });
});
