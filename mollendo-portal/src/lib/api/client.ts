const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

const ACCESS_TOKEN_KEY = "mollendo_access_token";
const REFRESH_TOKEN_KEY = "mollendo_refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

// Quien muestra la sesión (AuthContext) se entera cuando cambian los tokens:
// login, renovación, cambio de contraseña o cierre de sesión.
const oyentesTokens = new Set<() => void>();

export function suscribirTokens(oyente: () => void): () => void {
  oyentesTokens.add(oyente);
  return () => oyentesTokens.delete(oyente);
}

function avisarCambioTokens(): void {
  oyentesTokens.forEach((oyente) => oyente());
}

export function setTokens(accessToken: string, refreshToken: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  avisarCambioTokens();
}

export function clearTokens(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  avisarCambioTokens();
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  isFormData?: boolean;
  /** No adjunta el Authorization header (endpoints públicos de /auth). */
  skipAuth?: boolean;
  /**
   * "blob" para archivos (p. ej. la foto del trabajador) en vez de JSON;
   * "archivo" para descargas: el contenido y el nombre que manda el servidor.
   */
  responseType?: "json" | "blob" | "archivo";
}

/**
 * Pide tokens nuevos con el de renovación. null = la sesión ya no vale (vencida,
 * cuenta dada de baja o contraseña cambiada). Si el servidor no responde o
 * falla (p. ej. mientras se reinicia en una actualización), lanza un error: la
 * sesión no se da por cerrada por eso.
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${API_URL}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
    body: JSON.stringify({ refreshToken }),
  });
  if (res.status === 400 || res.status === 401) return null;
  if (!res.ok) throw new Error(`No se pudo renovar la sesión (error ${res.status})`);

  const data = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken as string;
}

export type ResultadoRenovacion = "renovada" | "rechazada" | "sin-conexion";

/**
 * Renueva la sesión: "renovada" (tokens nuevos guardados), "rechazada" (ya no
 * vale: se borran los tokens y el portal vuelve al inicio de sesión) o
 * "sin-conexion" (el servidor no respondió; los tokens se conservan).
 */
export async function renovarSesion(): Promise<ResultadoRenovacion> {
  try {
    if (await refreshAccessToken()) return "renovada";
    clearTokens();
    return "rechazada";
  } catch {
    return "sin-conexion";
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, isFormData = false, skipAuth = false, responseType = "json" } = options;

  const doFetch = async (token: string | null) => {
    // Evita la página de advertencia que ngrok le muestra a un visitante
    // nuevo antes de dejarlo pasar — sin esto, esa página HTML llegaría en
    // vez de la respuesta JSON real cuando la API se expone por un túnel.
    // No tiene efecto si no se está usando ngrok.
    const headers: Record<string, string> = { "ngrok-skip-browser-warning": "true" };
    if (!isFormData && body !== undefined) headers["Content-Type"] = "application/json";
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    });
  };

  let token = skipAuth ? null : getAccessToken();
  let res = await doFetch(token);

  if (!skipAuth && res.status === 401) {
    token = await refreshAccessToken();
    if (token) {
      res = await doFetch(token);
    } else {
      // Sesión vencida o cerrada (p. ej. se cambió la contraseña en otro
      // equipo): se borran los tokens y el portal vuelve al inicio de sesión.
      clearTokens();
    }
  }

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const data = await res.json();
      message = Array.isArray(data.message) ? data.message.join(", ") : (data.message ?? message);
    } catch {
      // respuesta sin cuerpo JSON
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  if (responseType === "blob") return (await res.blob()) as T;
  if (responseType === "archivo") {
    const nombre = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? "descarga";
    return { blob: await res.blob(), nombre } as T;
  }
  return res.json() as Promise<T>;
}
