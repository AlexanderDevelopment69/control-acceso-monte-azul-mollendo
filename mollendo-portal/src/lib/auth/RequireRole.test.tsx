import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequireRole } from "./RequireRole";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const sesion = vi.hoisted(() => ({ actual: { user: null as null | { rol: string }, loading: false } }));
vi.mock("./AuthContext", () => ({ useAuth: () => sesion.actual }));

function montar() {
  render(
    <RequireRole roles={["administrador"]}>
      <p>pantalla protegida</p>
    </RequireRole>,
  );
}

beforeEach(() => router.replace.mockClear());

describe("RequireRole", () => {
  it("mientras se lee la sesión: “Cargando…” y no redirige", () => {
    sesion.actual = { user: null, loading: true };
    montar();
    expect(screen.getByText("Cargando…")).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("sin sesión: manda al inicio de sesión y no muestra la pantalla", () => {
    sesion.actual = { user: null, loading: false };
    montar();
    expect(router.replace).toHaveBeenCalledWith("/iniciar-sesion");
    expect(screen.queryByText("pantalla protegida")).not.toBeInTheDocument();
  });

  it("con otro rol: manda al inicio del portal y no muestra la pantalla", () => {
    sesion.actual = { user: { rol: "vigilancia" }, loading: false };
    montar();
    expect(router.replace).toHaveBeenCalledWith("/");
    expect(screen.queryByText("pantalla protegida")).not.toBeInTheDocument();
  });

  it("con el rol correcto: muestra la pantalla", () => {
    sesion.actual = { user: { rol: "administrador" }, loading: false };
    montar();
    expect(screen.getByText("pantalla protegida")).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
