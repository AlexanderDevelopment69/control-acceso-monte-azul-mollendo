import { io, type Socket } from "socket.io-client";
import { renovarSesion } from "./api/client";
import { API_BASE } from "./config";

/** Espera antes de reintentar: 2 s, 4 s, 8 s… hasta 30 s. */
const ESPERA_MAXIMA_MS = 30_000;

/**
 * Canal en vivo de los ingresos y salidas (Panel de vigilancia y Dashboard).
 *
 * La sesión va en la cookie de la API, que el navegador manda al conectarse. La
 * de acceso dura 1 hora y el panel queda abierto todo el día: si el servidor
 * corta o rechaza la conexión (sesión vencida, reinicio por una actualización,
 * cuenta dada de baja), se renueva la sesión y se vuelve a conectar, con
 * esperas crecientes; si ya no vale, el portal vuelve al inicio de sesión.
 * `alReconectar` se llama al recuperar la conexión, para recargar lo que llegó
 * mientras estaba cortada.
 */
export function connectEventosSocket(alReconectar?: () => void): Socket {
  const socket = io(`${API_BASE}/ws/eventos`, {
    // Bajo /api/v1, igual que el backend: así el portal lo reenvía con la misma
    // regla que la API (next.config.ts) cuando NEXT_PUBLIC_API_URL=/api/v1.
    // Sin barra final, porque Next redirige las rutas que terminan en "/".
    path: "/api/v1/socket.io",
    addTrailingSlash: false,
    // Con la cookie de la sesión (cuando la API está en otra dirección, como en desarrollo).
    withCredentials: true,
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
      // No se puede saber si la cookie venció: se renueva antes de reconectar (es liviano).
      const resultado = await renovarSesion();
      if (resultado === "rechazada") return; // sin sesión: el portal vuelve al inicio de sesión
      if (resultado === "sin-conexion") return reintentar();
      if (!cerrado) socket.connect();
    }, ms);
  }

  socket.on("connect", () => {
    if (conectadoAntes && !cerrado) alReconectar?.();
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
    // reinicio) sí los reintenta él, con la cookie vigente.
    if (motivo === "io server disconnect") reintentar();
  });
  socket.on("connect_error", () => {
    if (!socket.active) reintentar();
  });

  // Al cambiar de vista mientras la conexión todavía se abre, cortarla a la mitad deja en la
  // consola "WebSocket is closed before the connection is established". Se cierra apenas se abra
  // (o falle); mientras tanto no se reintenta.
  const desconectar = socket.disconnect.bind(socket);
  socket.disconnect = () => {
    if (socket.connected || !socket.active) return desconectar();
    cerrado = true;
    if (espera) clearTimeout(espera);
    socket.once("connect", () => desconectar());
    socket.once("connect_error", () => desconectar());
    return socket;
  };
  return socket;
}
