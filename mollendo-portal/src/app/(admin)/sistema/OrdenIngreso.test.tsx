import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OrdenIngreso } from "./OrdenIngreso";

const cambiarModoIngreso = vi.fn((facialPrimero: boolean) => Promise.resolve({ facialPrimero, desde: null, cambiadoPor: null }));
let facialPrimero = true;

vi.mock("@/lib/api/endpoints", () => ({
  eventosAccesoApi: {
    modoIngreso: () => Promise.resolve({ facialPrimero, desde: null, cambiadoPor: null }),
    cambiarModoIngreso: (valor: boolean) => cambiarModoIngreso(valor),
  },
}));
const sesion = vi.hoisted(() => ({ rol: "administrador" }));
vi.mock("@/lib/auth/AuthContext", () => ({ useAuth: () => ({ user: { rol: sesion.rol } }) }));

describe("Orden del ingreso", () => {
  it("activar el orden normal también pide confirmación, con sus pasos", async () => {
    facialPrimero = true;
    render(<OrdenIngreso />);
    await userEvent.click(await screen.findByRole("switch", { name: "DNI → Facial + Alcohol → Molinete" }));

    expect(screen.getByText("Activar DNI → Facial + Alcohol → Molinete")).toBeInTheDocument();
    expect(screen.getByText(/para hacer rostro y prueba de alcohol/)).toHaveTextContent("1 minuto");
    expect(cambiarModoIngreso).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Activar" }));
    expect(cambiarModoIngreso).toHaveBeenCalledWith(false);
  });

  it("activar facial primero muestra sus pasos (30 segundos para el DNI)", async () => {
    facialPrimero = false;
    render(<OrdenIngreso />);
    await userEvent.click(await screen.findByRole("switch", { name: "Facial + Alcohol → DNI → Molinete" }));

    expect(screen.getByText("Activar Facial + Alcohol → DNI → Molinete")).toBeInTheDocument();
    expect(screen.getByText(/pasa su DNI: tiene/)).toHaveTextContent("30 segundos");
  });

  it("tocar el orden que ya está activo no abre ninguna ventana", async () => {
    facialPrimero = false;
    render(<OrdenIngreso />);
    await userEvent.click(await screen.findByRole("switch", { name: "DNI → Facial + Alcohol → Molinete" }));
    expect(screen.queryByText(/^Activar (DNI|Facial)/)).not.toBeInTheDocument();
  });

  it("soporte lo ve, pero no puede cambiarlo", async () => {
    sesion.rol = "soporte";
    facialPrimero = true;
    render(<OrdenIngreso />);
    const normal = await screen.findByRole("switch", { name: "DNI → Facial + Alcohol → Molinete" });
    expect(normal).toBeDisabled();
    sesion.rol = "administrador";
  });
});
