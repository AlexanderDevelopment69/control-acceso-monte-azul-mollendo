import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EventoAcceso } from "@/lib/api/types";
import { CorreccionAntipassback } from "./CorreccionAntipassback";
import { MarcaCorreccionManual, MotivoDenegacion } from "./CeldasEvento";

const api = vi.hoisted(() => ({ corregir: vi.fn() }));
vi.mock("@/lib/api/endpoints", () => ({ eventosAccesoApi: api }));

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

beforeEach(() => {
  api.corregir.mockReset().mockResolvedValue({ eventoId: 2 });
});

describe("antipassback en el panel", () => {
  it("motivo con su botón de corrección: ingreso → registrar salida; salida → registrar ingreso", async () => {
    const onCorregir = vi.fn();
    const { rerender } = render(<MotivoDenegacion evento={evento({ denegadoYaDentro: true })} onVerDocumentos={() => {}} onCorregir={onCorregir} />);
    expect(screen.getByText("Ya figura dentro")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Registrar salida manual ›" }));
    expect(onCorregir).toHaveBeenCalled();

    rerender(<MotivoDenegacion evento={evento({ tipoMovimiento: "salida", denegadoSinIngreso: true })} onVerDocumentos={() => {}} onCorregir={onCorregir} />);
    expect(screen.getByText("No registra ingreso")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Registrar ingreso manual ›" })).toBeInTheDocument();
  });

  it("registra la salida manual con el motivo (el motivo es obligatorio)", async () => {
    const onCorregido = vi.fn();
    render(<CorreccionAntipassback evento={evento({ denegadoYaDentro: true })} onCerrar={() => {}} onCorregido={onCorregido} />);
    expect(screen.getByRole("heading", { name: "Registrar salida manual" })).toBeInTheDocument();
    expect(screen.getByText(/No abre el molinete/)).toBeInTheDocument();
    const boton = screen.getByRole("button", { name: "Registrar salida" });
    expect(boton).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Motivo *"), "Emergencia: brazos liberados");
    await userEvent.click(boton);
    expect(api.corregir).toHaveBeenCalledWith(7, "salida", "Emergencia: brazos liberados");
    expect(onCorregido).toHaveBeenCalled();
  });

  it("registra el ingreso manual cuando la salida se denegó por no registrar ingreso", async () => {
    render(
      <CorreccionAntipassback
        evento={evento({ tipoMovimiento: "salida", denegadoSinIngreso: true })}
        onCerrar={() => {}}
        onCorregido={() => {}}
      />,
    );
    await userEvent.type(screen.getByLabelText("Motivo *"), "Entró sin marcar");
    await userEvent.click(screen.getByRole("button", { name: "Registrar ingreso" }));
    expect(api.corregir).toHaveBeenCalledWith(7, "ingreso", "Entró sin marcar");
  });

  it("la fila corregida muestra quién la registró y el motivo al pasar el mouse", () => {
    render(
      <MarcaCorreccionManual
        evento={{ correccionManual: true, motivoCorreccion: "Emergencia", verificadoPor: { id: 2, correo: "vigilancia@mollendo.local" } }}
      />,
    );
    expect(screen.getByText("Corrección manual · vigilancia@mollendo.local")).toBeInTheDocument();
    expect(screen.getByTitle(/Motivo: Emergencia/)).toBeInTheDocument();
  });
});
