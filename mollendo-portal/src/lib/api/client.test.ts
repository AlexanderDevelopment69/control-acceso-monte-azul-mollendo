import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiRequest, renovarSesion, suscribirSesionPerdida } from "./client";

const API = "http://localhost:3001/api/v1";

/** Respuesta JSON simulada del servidor. */
function respuesta(status: number, cuerpo?: unknown, headers: Record<string, string> = {}): Response {
  return new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

let fetchFalso: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchFalso = vi.fn();
  vi.stubGlobal("fetch", fetchFalso);
});

/** Encabezados, cuerpo y credenciales con que se llamó a fetch la vez `n`. */
function llamada(n: number) {
  const [url, init] = fetchFalso.mock.calls[n] as [string, RequestInit];
  return { url, metodo: init.method, headers: init.headers as Record<string, string>, cuerpo: init.body, credenciales: init.credentials };
}

describe("apiRequest", () => {
  it("manda la sesión en las cookies (sin token en la página) y el cuerpo en JSON", async () => {
    fetchFalso.mockResolvedValueOnce(respuesta(200, { id: 5 }));

    await expect(apiRequest("/personas", { method: "POST", body: { nombres: "Ana" } })).resolves.toEqual({ id: 5 });

    const l = llamada(0);
    expect(l.url).toBe(`${API}/personas`);
    expect(l.metodo).toBe("POST");
    expect(l.credenciales).toBe("include");
    expect(l.headers.Authorization).toBeUndefined();
    expect(l.headers["Content-Type"]).toBe("application/json");
    expect(l.cuerpo).toBe('{"nombres":"Ana"}');
  });

  it("FormData se manda tal cual, sin Content-Type (lo pone el navegador)", async () => {
    fetchFalso.mockResolvedValueOnce(respuesta(200, {}));
    const datos = new FormData();
    await apiRequest("/documentos", { method: "POST", body: datos, isFormData: true });
    expect(llamada(0).cuerpo).toBe(datos);
    expect(llamada(0).headers["Content-Type"]).toBeUndefined();
  });

  it("sesión vencida (401): la renueva con la cookie de renovación y repite el pedido", async () => {
    fetchFalso
      .mockResolvedValueOnce(respuesta(401, { message: "Unauthorized" }))
      .mockResolvedValueOnce(respuesta(200, {}))
      .mockResolvedValueOnce(respuesta(200, [{ id: 1 }]));

    await expect(apiRequest("/personas")).resolves.toEqual([{ id: 1 }]);

    expect(llamada(1).url).toBe(`${API}/auth/refresh-token`);
    expect(llamada(1).credenciales).toBe("include");
    expect(llamada(1).cuerpo).toBeUndefined();
    expect(llamada(2).url).toBe(`${API}/personas`);
  });

  it("si la renovación es rechazada, avisa que se perdió la sesión y el error", async () => {
    const oyente = vi.fn();
    const quitar = suscribirSesionPerdida(oyente);
    fetchFalso
      .mockResolvedValueOnce(respuesta(401, { message: "Unauthorized" }))
      .mockResolvedValueOnce(respuesta(401, { message: "Token inválido" }));

    await expect(apiRequest("/personas")).rejects.toMatchObject({ status: 401 });
    expect(oyente).toHaveBeenCalled(); // el portal se entera y vuelve al inicio de sesión
    quitar();
  });

  it("con skipAuth (rutas públicas), un 401 no intenta renovar", async () => {
    fetchFalso.mockResolvedValueOnce(respuesta(401, { message: "Correo o contraseña incorrectos" }));
    await expect(apiRequest("/auth/login", { method: "POST", body: {}, skipAuth: true })).rejects.toThrow(
      "Correo o contraseña incorrectos",
    );
    expect(fetchFalso).toHaveBeenCalledTimes(1);
  });

  it("usa el mensaje del servidor; si son varios, los une", async () => {
    fetchFalso.mockResolvedValueOnce(respuesta(400, { message: ["El DNI debe tener 8 dígitos", "Falta la empresa"] }));
    const error = (await apiRequest("/personas").catch((e) => e)) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.message).toBe("El DNI debe tener 8 dígitos, Falta la empresa");
  });

  it("si el error no trae cuerpo, muestra el código", async () => {
    fetchFalso.mockResolvedValueOnce(new Response("<html>caído</html>", { status: 502 }));
    await expect(apiRequest("/personas")).rejects.toThrow("Error 502");
  });

  it("204 (sin contenido) devuelve undefined", async () => {
    fetchFalso.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(apiRequest("/personas/1", { method: "DELETE" })).resolves.toBeUndefined();
  });

  it("descargas: devuelve el archivo con el nombre que manda el servidor", async () => {
    fetchFalso.mockResolvedValueOnce(
      new Response("contenido", { status: 200, headers: { "Content-Disposition": 'attachment; filename="reporte-octubre.xlsx"' } }),
    );
    const { blob, nombre } = await apiRequest<{ blob: Blob; nombre: string }>("/reportes/x", { responseType: "archivo" });
    expect(nombre).toBe("reporte-octubre.xlsx");
    expect(await blob.text()).toBe("contenido");
  });
});

describe("renovarSesion", () => {
  it('"renovada": el servidor dejó cookies nuevas', async () => {
    fetchFalso.mockResolvedValueOnce(respuesta(200, {}));
    await expect(renovarSesion()).resolves.toBe("renovada");
  });

  it('"rechazada": avisa que se perdió la sesión', async () => {
    const oyente = vi.fn();
    const quitar = suscribirSesionPerdida(oyente);
    fetchFalso.mockResolvedValueOnce(respuesta(401, {}));
    await expect(renovarSesion()).resolves.toBe("rechazada");
    expect(oyente).toHaveBeenCalled();
    quitar();
  });

  it('"sin-conexion": si el servidor no responde, conserva la sesión', async () => {
    const oyente = vi.fn();
    const quitar = suscribirSesionPerdida(oyente);
    fetchFalso.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await expect(renovarSesion()).resolves.toBe("sin-conexion");
    expect(oyente).not.toHaveBeenCalled();
    quitar();
  });

  it('"sin-conexion" también si el servidor falla (p. ej. 503 mientras se actualiza)', async () => {
    fetchFalso.mockResolvedValueOnce(respuesta(503, {}));
    await expect(renovarSesion()).resolves.toBe("sin-conexion");
  });
});
