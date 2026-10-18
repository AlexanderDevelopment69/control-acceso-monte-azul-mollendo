import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

/** Muestra lo que el portal sabe de la sesión. */
function Sesion() {
  const { user, loading, login, logout } = useAuth();
  if (loading) return <p>cargando</p>;
  return (
    <>
      <p>{user ? `${user.rol} ${user.correo}` : "sin sesión"}</p>
      <button onClick={() => void login("admin@mollendo.pe", "Clave-12345")}>entrar</button>
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

const json = (status: number, cuerpo: unknown) => new Response(JSON.stringify(cuerpo), { status, headers: { "Content-Type": "application/json" } });
/** Respuesta de /auth/estado: qué cookies de sesión trae el navegador. */
const estado = (acceso: boolean, renovacion = acceso) => json(200, { acceso, renovacion });
const usuario = (rol: string) => ({ id: 1, empresaId: 1, rol, correo: `${rol}@mollendo.pe` });

let fetchFalso: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchFalso = vi.fn();
  vi.stubGlobal("fetch", fetchFalso);
  router.push.mockClear();
});

/** URL de la llamada `n` a fetch. */
const url = (n: number) => String(fetchFalso.mock.calls[n][0]);

describe("AuthProvider", () => {
  it("mientras pregunta al servidor, está cargando; con sesión, muestra el usuario y su rol", async () => {
    fetchFalso.mockResolvedValueOnce(estado(true)).mockResolvedValueOnce(json(200, usuario("vigilancia")));
    montar();
    expect(screen.getByText("cargando")).toBeInTheDocument();
    expect(await screen.findByText("vigilancia vigilancia@mollendo.pe")).toBeInTheDocument();
    expect(url(0)).toMatch(/\/auth\/estado$/);
    expect(url(1)).toMatch(/\/cuenta$/);
  });

  it("sin cookies de sesión: no hay usuario y no pide /cuenta ni renovar (sin 401 en la consola)", async () => {
    fetchFalso.mockResolvedValueOnce(estado(false));
    montar();
    expect(await screen.findByText("sin sesión")).toBeInTheDocument();
    expect(fetchFalso).toHaveBeenCalledTimes(1);
  });

  it("venció la de acceso pero queda la de renovación: renueva primero, sin pedir la contraseña", async () => {
    fetchFalso
      .mockResolvedValueOnce(estado(false, true))
      .mockResolvedValueOnce(json(200, {}))
      .mockResolvedValueOnce(json(200, usuario("administrador")));
    montar();
    expect(await screen.findByText("administrador administrador@mollendo.pe")).toBeInTheDocument();
    expect(url(1)).toMatch(/\/auth\/refresh-token$/);
    expect(url(2)).toMatch(/\/cuenta$/);
  });

  it("la renovación es rechazada (p. ej. cuenta dada de baja): no hay usuario", async () => {
    fetchFalso.mockResolvedValueOnce(estado(false, true)).mockResolvedValueOnce(json(401, {}));
    montar();
    expect(await screen.findByText("sin sesión")).toBeInTheDocument();
    expect(fetchFalso).toHaveBeenCalledTimes(2);
  });

  it("cookie de acceso que el servidor ya no acepta: intenta renovar y, si no puede, no hay usuario", async () => {
    fetchFalso.mockResolvedValueOnce(estado(true)).mockResolvedValueOnce(json(401, {})).mockResolvedValueOnce(json(401, {}));
    montar();
    expect(await screen.findByText("sin sesión")).toBeInTheDocument();
    expect(url(2)).toMatch(/\/auth\/refresh-token$/);
  });

  it("un usuario con un rol que ya no existe no entra", async () => {
    fetchFalso.mockResolvedValueOnce(estado(true)).mockResolvedValueOnce(json(200, usuario("empresa")));
    montar();
    expect(await screen.findByText("sin sesión")).toBeInTheDocument();
  });

  it("al iniciar sesión muestra al usuario que devuelve el servidor", async () => {
    fetchFalso.mockResolvedValueOnce(estado(false));
    montar();
    await screen.findByText("sin sesión");
    fetchFalso.mockResolvedValueOnce(json(200, { usuario: usuario("administrador") }));
    await act(async () => screen.getByText("entrar").click());
    expect(await screen.findByText("administrador administrador@mollendo.pe")).toBeInTheDocument();
  });

  it("cerrar sesión pide borrar las cookies y vuelve al inicio de sesión", async () => {
    fetchFalso
      .mockResolvedValueOnce(estado(true))
      .mockResolvedValueOnce(json(200, usuario("administrador")))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    montar();
    await screen.findByText("administrador administrador@mollendo.pe");
    act(() => screen.getByText("salir").click());
    expect(screen.getByText("sin sesión")).toBeInTheDocument();
    expect(router.push).toHaveBeenCalledWith("/iniciar-sesion");
    expect(url(2)).toMatch(/\/auth\/cerrar-sesion$/);
  });
});
