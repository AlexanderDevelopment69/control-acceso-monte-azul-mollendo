import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";
import SignInForm from "./SignInForm";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("next/image", () => ({ default: ({ alt }: { alt: string }) => <span>{alt}</span> }));

const sesion = vi.hoisted(() => ({ actual: { user: null as null | { rol: string }, loading: false, login: vi.fn() } }));
vi.mock("@/lib/auth/AuthContext", () => ({ useAuth: () => sesion.actual }));

beforeEach(() => {
  router.push.mockClear();
  router.replace.mockClear();
  sesion.actual = { user: null, loading: false, login: vi.fn() };
});

async function ingresar(correo: string, password: string) {
  const usuario = userEvent.setup();
  await usuario.type(screen.getByPlaceholderText("correo@empresa.com"), correo);
  await usuario.type(screen.getByPlaceholderText("Ingrese su contraseña"), password);
  await usuario.click(screen.getByRole("button", { name: "Ingresar" }));
}

describe("SignInForm", () => {
  it("inicia sesión con el correo y la contraseña, y va al inicio", async () => {
    sesion.actual.login.mockResolvedValueOnce(undefined);
    render(<SignInForm />);
    await ingresar("admin@mollendo.pe", "Clave-123");
    expect(sesion.actual.login).toHaveBeenCalledWith("admin@mollendo.pe", "Clave-123");
    expect(router.push).toHaveBeenCalledWith("/");
  });

  it("con los campos vacíos avisa debajo de cada uno y no envía nada (no gasta intentos)", async () => {
    render(<SignInForm />);
    const usuario = userEvent.setup();
    for (let i = 0; i < 6; i++) await usuario.click(screen.getByRole("button", { name: "Ingresar" }));
    expect(screen.getByText("Ingrese su correo")).toBeInTheDocument();
    expect(screen.getByText("Ingrese su contraseña")).toBeInTheDocument();
    expect(sesion.actual.login).not.toHaveBeenCalled();
  });

  it("con un correo mal escrito avisa y no envía; el aviso se va al corregirlo", async () => {
    render(<SignInForm />);
    await ingresar("admin@mollendo", "Clave-123");
    expect(screen.getByText("Ingrese un correo válido")).toBeInTheDocument();
    expect(sesion.actual.login).not.toHaveBeenCalled();
    await userEvent.setup().type(screen.getByPlaceholderText("correo@empresa.com"), ".pe");
    expect(screen.queryByText("Ingrese un correo válido")).not.toBeInTheDocument();
  });

  it("si el servidor rechaza, muestra su mensaje y no sale de la pantalla", async () => {
    sesion.actual.login.mockRejectedValueOnce(new ApiError("Credenciales inválidas", 401));
    render(<SignInForm />);
    await ingresar("admin@mollendo.pe", "mala");
    expect(await screen.findByText("Credenciales inválidas")).toBeInTheDocument();
    expect(router.push).not.toHaveBeenCalled();
    // Se puede volver a intentar.
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeEnabled();
  });

  it("si no hay conexión, muestra un mensaje general", async () => {
    sesion.actual.login.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    render(<SignInForm />);
    await ingresar("admin@mollendo.pe", "Clave-123");
    expect(await screen.findByText("No se pudo iniciar sesión")).toBeInTheDocument();
  });

  it("mientras espera la respuesta, el botón dice “Ingresando…” y está desactivado", async () => {
    sesion.actual.login.mockReturnValueOnce(new Promise(() => {}));
    render(<SignInForm />);
    await ingresar("admin@mollendo.pe", "Clave-123");
    expect(screen.getByRole("button", { name: "Ingresando…" })).toBeDisabled();
  });

  it("el ojo muestra y oculta la contraseña", async () => {
    render(<SignInForm />);
    const campo = screen.getByPlaceholderText("Ingrese su contraseña");
    expect(campo).toHaveAttribute("type", "password");
    await userEvent.click(screen.getByRole("button", { name: "Mostrar contraseña" }));
    expect(campo).toHaveAttribute("type", "text");
    await userEvent.click(screen.getByRole("button", { name: "Ocultar contraseña" }));
    expect(campo).toHaveAttribute("type", "password");
  });

  it("el ojo se alcanza con Tab desde la contraseña y se activa con Enter", async () => {
    const usuario = userEvent.setup();
    render(<SignInForm />);
    const campo = screen.getByPlaceholderText("Ingrese su contraseña");
    await usuario.click(campo);
    await usuario.tab();
    expect(screen.getByRole("button", { name: "Mostrar contraseña" })).toHaveFocus();
    await usuario.keyboard("{Enter}");
    expect(campo).toHaveAttribute("type", "text");
  });

  it("con la sesión ya abierta, no muestra el formulario y va al inicio", () => {
    sesion.actual.user = { rol: "administrador" };
    render(<SignInForm />);
    expect(screen.queryByPlaceholderText("correo@empresa.com")).not.toBeInTheDocument();
    expect(router.replace).toHaveBeenCalledWith("/");
  });
});
