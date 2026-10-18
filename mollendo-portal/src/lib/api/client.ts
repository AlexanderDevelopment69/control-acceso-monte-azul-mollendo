import { API_URL } from "@/lib/config";

/**
 * La sesión viaja en cookies que el navegador guarda y manda solo a la API, y
 * que el código del portal no puede leer (httpOnly): si alguien lograra
 * ejecutar código en la página, no podría robarla. Antes se guardaba en
 * localStorage; esas claves viejas se borran.
 */
const CLAVES_ANTIGUAS = ["mollendo_access_token", "mollendo_refresh_token"];
if (typeof window !== "undefined") {
  try {
    CLAVES_ANTIGUAS.forEach((clave) => window.localStorage.removeItem(clave));
  } catch {
    // almacenamiento bloqueado: no hay nada que borrar
  }
}

// Quien muestra la sesión (AuthContext) se entera cuando se pierde: renovación
// rechazada (vencida, cuenta dada de baja o contraseña cambiada en otro equipo).
const oyentesSesion = new Set<() => void>();

export function suscribirSesionPerdida(oyente: () => void): () => void {
  oyentesSesion.add(oyente);
  return () => oyentesSesion.delete(oyente);
}

function avisarSesionPerdida(): void {
  oyentesSesion.forEach((oyente) => oyente());
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
  /** Rutas públicas de /auth: un 401 no intenta renovar la sesión. */
  skipAuth?: boolean;
  /**
   * "blob" para archivos (p. ej. la foto del trabajador) en vez de JSON;
   * "archivo" para descargas: el contenido y el nombre que manda el servidor.
   */
  responseType?: "json" | "blob" | "archivo";
}

/**
 * Renueva la sesión con la cookie de renovación (el servidor deja cookies
 * nuevas). false = ya no vale (vencida, cuenta dada de baja o contraseña
 * cambiada). Si el servidor no responde o falla (p. ej. mientras se reinicia
 * en una actualización), lanza un error: la sesión no se da por cerrada por eso.
 */
async function renovarCookies(): Promise<boolean> {
  const res = await fetch(`${API_URL}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (res.status === 400 || res.status === 401) return false;
  if (!res.ok) throw new Error(`No se pudo renovar la sesión (error ${res.status})`);
  return true;
}

export type ResultadoRenovacion = "renovada" | "rechazada" | "sin-conexion";

/**
 * Renueva la sesión: "renovada" (cookies nuevas), "rechazada" (ya no vale: el
 * portal vuelve al inicio de sesión) o "sin-conexion" (el servidor no
 * respondió; la sesión se conserva).
 */
export async function renovarSesion(): Promise<ResultadoRenovacion> {
  try {
    if (await renovarCookies()) return "renovada";
    avisarSesionPerdida();
    return "rechazada";
  } catch {
    return "sin-conexion";
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, isFormData = false, skipAuth = false, responseType = "json" } = options;

  const doFetch = async () => {
    // Evita la página de advertencia que ngrok le muestra a un visitante
    // nuevo antes de dejarlo pasar — sin esto, esa página HTML llegaría en
    // vez de la respuesta JSON real cuando la API se expone por un túnel.
    // No tiene efecto si no se está usando ngrok.
    const headers: Record<string, string> = { "ngrok-skip-browser-warning": "true" };
    if (!isFormData && body !== undefined) headers["Content-Type"] = "application/json";

    return fetch(`${API_URL}${path}`, {
      method,
      headers,
      // La sesión va en las cookies de la API (también al iniciar sesión, para recibirlas).
      credentials: "include",
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    });
  };

  let res = await doFetch();

  if (!skipAuth && res.status === 401) {
    if (await renovarCookies()) {
      res = await doFetch();
    } else {
      // Sesión vencida o cerrada (p. ej. se cambió la contraseña en otro
      // equipo): el portal vuelve al inicio de sesión.
      avisarSesionPerdida();
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
