import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "./api/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
const WS_BASE = API_URL.replace(/\/api\/v1\/?$/, "");

export function connectEventosSocket(): Socket {
  return io(`${WS_BASE}/ws/eventos`, {
    // Bajo /api/v1, igual que el backend: así el portal lo reenvía con la misma
    // regla que la API (next.config.ts) cuando NEXT_PUBLIC_API_URL=/api/v1.
    // Sin barra final, porque Next redirige las rutas que terminan en "/".
    path: "/api/v1/socket.io",
    addTrailingSlash: false,
    auth: { token: getAccessToken() },
    transports: ["websocket"],
  });
}
