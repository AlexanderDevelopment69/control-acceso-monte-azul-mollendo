import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "./api/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
const WS_BASE = API_URL.replace(/\/api\/v1\/?$/, "");

export function connectEventosSocket(): Socket {
  return io(`${WS_BASE}/ws/eventos`, {
    auth: { token: getAccessToken() },
    transports: ["websocket"],
  });
}
