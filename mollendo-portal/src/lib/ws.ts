import { io, type Socket } from "socket.io-client";
import { getAccessToken, renovarSesion } from "./api/client";
import { decodeJwt } from "./auth/decode-jwt";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
const WS_BASE = API_URL.replace(/\/api\/v1\/?$/, "");

/** Espera antes de reintentar: 2 s, 4 s, 8 s… hasta 30 s. */
const ESPERA_MAXIMA_MS = 30_000;

/** ¿El token de sesión falta o vence en menos de 30 s? */
function tokenPorVencer(): boolean {
  const token = getAccessToken();
  const payload = token ? decodeJwt(token) : null;
  return !payload || payload.exp * 1000 < Date.now() + 30_000;
}

/**
 * Canal en vivo de los ingresos y salidas (Panel de vigilancia y Dashboard).
 *
 * El token se lee en cada conexión, no solo al abrir la página: el de sesión
 * dura 1 hora y el panel queda abierto todo el día. Si el servidor corta o
 * rechaza la conexión (token vencido, reinicio por una actualización, cuenta
 * dada de baja), se renueva la sesión y se vuelve a conectar, con esperas
 * crecientes; si la sesión ya no vale, el portal vuelve al inicio de sesión.
 * `alReconectar` se llama al recuperar la conexión, para recargar lo que llegó
 * mientras estaba cortada.
 */
export function connectEventosSocket(alReconectar?: () => void): Socket {
  const socket = io(`${WS_BASE}/ws/eventos`, {
    // Bajo /api/v1, igual que el backend: así el portal lo reenvía con la misma
    // regla que la API (next.config.ts) cuando NEXT_PUBLIC_API_URL=/api/v1.
    // Sin barra final, porque Next redirige las rutas que terminan en "/".
    path: "/api/v1/socket.io",
    addTrailingSlash: false,
    auth: (enviar) => enviar({ token: getAccessToken() }),
    transports: ["websocket"],
  });

  let intentos = 0;
  let espera: ReturnType<typeof setTimeout> | null = null;
  let estable: ReturnType<typeof setTimeout> | null = null;
  let cerrado = false;
  let conectadoAntes = false;

  function reintentar() {
    if (cerrado || espera) return;
    const ms = Math.min(ESPERA_MAXIMA_MS, 2_000 * 2 ** intentos++);
    espera = setTimeout(async () => {
      espera = null;
      if (cerrado) return;
      if (tokenPorVencer()) {
        const resultado = await renovarSesion();
        if (resultado === "rechazada") return; // sin sesión: el portal vuelve al inicio de sesión
        if (resultado === "sin-conexion") return reintentar();
      }
      if (!cerrado) socket.connect();
    }, ms);
  }

  socket.on("connect", () => {
    if (conectadoAntes) alReconectar?.();
    conectadoAntes = true;
    // Las esperas vuelven a empezar de 2 s solo si la conexión se mantiene.
    if (estable) clearTimeout(estable);
    estable = setTimeout(() => (intentos = 0), 10_000);
  });
  socket.on("disconnect", (motivo) => {
    if (estable) clearTimeout(estable);
    if (motivo === "io client disconnect") {
      // La página se cerró o se fue a otra: no se reintenta.
      cerrado = true;
      if (espera) clearTimeout(espera);
      return;
    }
    // Cortado por el servidor: socket.io no reintenta solo. Otros cortes (red,
    // reinicio) sí los reintenta él, con el token vigente (ver `auth`).
    if (motivo === "io server disconnect") reintentar();
  });
  socket.on("connect_error", () => {
    if (!socket.active) reintentar();
  });
  return socket;
}
