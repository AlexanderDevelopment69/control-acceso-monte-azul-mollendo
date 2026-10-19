import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { EventoAcceso } from "@/lib/api/types";
import { MarcaCorreccionManual, MotivoDenegacion } from "./CeldasEvento";

const evento = (datos: Partial<EventoAcceso>): EventoAcceso =>
  ({
    id: 1,
    personaId: 7,
    tipoMovimiento: "ingreso",
    resultado: "denegado",
    denegadoNoRegistrado: false,
    denegadoPorBaja: false,
    denegadoSinDocumentos: false,
    denegadoPorAlcohol: false,
    denegadoSinVerificacion: false,
    denegadoPorDocumentos: false,
    persona: { id: 7, nombres: "Amiel", apellidos: "Bautista" },
    ...datos,
  }) as EventoAcceso;

describe("antipassback en el panel", () => {
  it("muestra el motivo, sin corrección manual desde el Panel", () => {
    const { rerender } = render(<MotivoDenegacion evento={evento({ denegadoYaDentro: true })} onVerDocumentos={() => {}} />);
    expect(screen.getByText("Ya figura dentro")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    rerender(<MotivoDenegacion evento={evento({ tipoMovimiento: "salida", denegadoSinIngreso: true })} onVerDocumentos={() => {}} />);
    expect(screen.getByText("No registra ingreso")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("las correcciones ya registradas siguen mostrando quién la hizo y el motivo", () => {
    render(
      <MarcaCorreccionManual
        evento={{ correccionManual: true, motivoCorreccion: "Emergencia", verificadoPor: { id: 2, correo: "vigilancia@mollendo.local" } }}
      />,
    );
    expect(screen.getByText("Corrección manual · vigilancia@mollendo.local")).toBeInTheDocument();
    expect(screen.getByTitle(/Motivo: Emergencia/)).toBeInTheDocument();
  });
});
