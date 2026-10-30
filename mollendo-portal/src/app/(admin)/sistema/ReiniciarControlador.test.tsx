import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReiniciarControlador } from "./ReiniciarControlador";

const reiniciar = vi.fn<(motivo: string) => Promise<{ enviado: boolean }>>(() => Promise.resolve({ enviado: true }));

vi.mock("@/lib/api/endpoints", () => ({
  controladorApi: { reiniciar: (motivo: string) => reiniciar(motivo) },
}));

describe("Reiniciar el Controlador (PC)", () => {
  beforeEach(() => reiniciar.mockClear());

  it("pide el motivo antes de enviar la orden", async () => {
    render(<ReiniciarControlador reiniciando={false} onEnviado={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: /Reiniciar/ }));

    expect(screen.getByText("Reiniciar el Controlador (PC)")).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole("button", { name: "Reiniciar" }).at(-1)!);
    expect(screen.getByText("Escriba el motivo del reinicio")).toBeInTheDocument();
    expect(reiniciar).not.toHaveBeenCalled();
  });

  it("envía la orden con el motivo y avisa a la página", async () => {
    const onEnviado = vi.fn();
    render(<ReiniciarControlador reiniciando={false} onEnviado={onEnviado} />);
    await userEvent.click(screen.getByRole("button", { name: /Reiniciar/ }));
    await userEvent.type(screen.getByLabelText("Motivo *"), "  el lector de salida no responde ");
    await userEvent.click(screen.getAllByRole("button", { name: "Reiniciar" }).at(-1)!);

    expect(reiniciar).toHaveBeenCalledWith("el lector de salida no responde");
    expect(onEnviado).toHaveBeenCalled();
  });

  it("mientras vuelve, el botón queda en Reiniciando… y no se puede pulsar", () => {
    render(<ReiniciarControlador reiniciando onEnviado={() => {}} />);
    expect(screen.getByRole("button", { name: /Reiniciando…/ })).toBeDisabled();
  });
});
