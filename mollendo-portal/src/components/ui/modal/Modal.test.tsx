import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./index";

describe("Modal (ventanas)", () => {
  it("cerrada: no está en la página", () => {
    render(<Modal isOpen={false} onClose={vi.fn()}>contenido</Modal>);
    expect(screen.queryByText("contenido")).not.toBeInTheDocument();
  });

  it("abierta: muestra el contenido y bloquea el desplazamiento de la página", () => {
    const { rerender } = render(<Modal isOpen onClose={vi.fn()}>contenido</Modal>);
    expect(screen.getByText("contenido")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
    rerender(<Modal isOpen={false} onClose={vi.fn()}>contenido</Modal>);
    expect(document.body.style.overflow).toBe("unset");
  });

  it("se cierra con la ✕ y con Esc", async () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose}>contenido</Modal>);
    await userEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("mientras guarda (bloqueado) no se cierra con Esc ni con la ✕", async () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} bloqueado>contenido</Modal>);
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("deja de escuchar Esc al cerrarse", async () => {
    const onClose = vi.fn();
    const { rerender } = render(<Modal isOpen onClose={onClose}>contenido</Modal>);
    rerender(<Modal isOpen={false} onClose={onClose}>contenido</Modal>);
    await userEvent.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });
});
