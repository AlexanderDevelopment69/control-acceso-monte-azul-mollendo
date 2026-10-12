import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAccessToken, setTokens } from "@/lib/api/client";
import { tokenDePrueba, tokenDeRol } from "@/test/sesion";
import { AuthProvider, useAuth } from "./AuthContext";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

/** Muestra lo que el portal sabe de la sesión. */
function Sesion() {
  const { user, loading, logout } = useAuth();
  if (loading) return <p>cargando</p>;
  return (
    <>
      <p>{user ? `${user.rol} ${user.correo}` : "sin sesión"}</p>
      <button onClick={logout}>salir</button>
    </>
  );
}

const montar = () =>
  render(
    <AuthProvider>
      <Sesion />
    </AuthProvider>,
  );

let fetchFalso: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchFalso = vi.fn();
  vi.stubGlobal("fetch", fetchFalso);
  router.push.mockClear();
});

describe("AuthProvider", () => {
  it("sin token: no hay sesión", () => {
    montar();
    expect(screen.getByText("sin sesión")).toBeInTheDocument();
  });

  it("con un token vigente: muestra el usuario y su rol", () => {
    localStorage.setItem("mollendo_access_token", tokenDeRol("vigilancia"));
    montar();
    expect(screen.getByText("vigilancia vigilancia@mollendo.pe")).toBeInTheDocument();
  });

  it("un token con un rol que ya no existe se descarta", async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    localStorage.setItem("mollendo_access_token", tokenDePrueba({ sub: 1, empresaId: 1, rol: "empresa", correo: "x@x.pe", exp }));
    montar();
    expect(screen.getByText("sin sesión")).toBeInTheDocument();
    await waitFor(() => expect(getAccessToken()).toBeNull());
  });

  it("token vencido: renueva la sesión sola, sin pedir la contraseña", async () => {
    localStorage.setItem("mollendo_access_token", tokenDeRol("administrador", { vencido: true }));
    localStorage.setItem("mollendo_refresh_token", "renovacion");
    fetchFalso.mockResolvedValueOnce(
      new Response(JSON.stringify({ accessToken: tokenDeRol("administrador"), refreshToken: "renovacion-2" }), { status: 200 }),
    );
    montar();
    // Mientras renueva no manda al inicio de sesión.
    expect(screen.getByText("cargando")).toBeInTheDocument();
    expect(await screen.findByText("administrador administrador@mollendo.pe")).toBeInTheDocument();
  });

  it("token vencido y renovación rechazada: se cierra la sesión", async () => {
    localStorage.setItem("mollendo_access_token", tokenDeRol("administrador", { vencido: true }));
    localStorage.setItem("mollendo_refresh_token", "renovacion-vencida");
    fetchFalso.mockResolvedValueOnce(new Response("{}", { status: 401 }));
    montar();
    expect(await screen.findByText("sin sesión")).toBeInTheDocument();
    expect(getAccessToken()).toBeNull();
  });

  it("cambia en el momento en que se guardan tokens nuevos (p. ej. al iniciar sesión)", () => {
    montar();
    expect(screen.getByText("sin sesión")).toBeInTheDocument();
    act(() => setTokens(tokenDeRol("administrador"), "r"));
    expect(screen.getByText("administrador administrador@mollendo.pe")).toBeInTheDocument();
  });

  it("cerrar sesión borra los tokens y vuelve al inicio de sesión", () => {
    localStorage.setItem("mollendo_access_token", tokenDeRol("administrador"));
    montar();
    act(() => screen.getByText("salir").click());
    expect(getAccessToken()).toBeNull();
    expect(screen.getByText("sin sesión")).toBeInTheDocument();
    expect(router.push).toHaveBeenCalledWith("/iniciar-sesion");
  });
});
