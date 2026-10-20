import { io, type Socket } from "socket.io-client";
import { renovarSesion } from "./api/client";
import { API_BASE } from "./config";

/** Espera antes de reintentar: 2 s, 4 s, 8 s… hasta 30 s. */
const ESPERA_MAXIMA_MS = 30_000;

/** Avisos que manda el servidor por el canal en vivo, con lo que hace cada vista al recibirlos. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- cada aviso trae su propio contenido
type Avisos = Record<string, (...datos: any[]) => void>;

/**
 * Canal en vivo de los ingresos y salidas: una sola conexión por pestaña,
 * compartida por todas las vistas (Panel de vigilancia, Dashboard, Monitor del
 * G4 Pro, Sistema). Se abre la primera vez que una vista la pide y queda
 * abierta al cambiar de vista; cada vista solo se suscribe a sus avisos al
 * entrar y se desuscribe al salir. Se cierra al cerrar la sesión.
 *
 * La sesión va en la cookie de la API, que el navegador manda al conectarse. La
 * de acceso dura 1 hora y el panel queda abierto todo el día: si el servidor
 * corta o rechaza la conexión (sesión vencida, reinicio por una actualización,
 * cuenta dada de baja), se renueva la sesión y se vuelve a conectar, con
 * esperas crecientes; si ya no vale, el portal vuelve al inicio de sesión.
 */
let canal: { socket: Socket; alReconectar: Set<() => void>; cerrar: () => void } | null = null;

function abrirCanal() {
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
  const alReconectar = new Set<() => void>();

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
    // Al recuperar la conexión, cada vista abierta recarga lo que llegó mientras estaba cortada.
    if (conectadoAntes) alReconectar.forEach((recargar) => recargar());
    conectadoAntes = true;
    // Las esperas vuelven a empezar de 2 s solo si la conexión se mantiene.
    if (estable) clearTimeout(estable);
    estable = setTimeout(() => (intentos = 0), 10_000);
  });
  socket.on("disconnect", (motivo) => {
    if (estable) clearTimeout(estable);
    // Cortado por el servidor: socket.io no reintenta solo. Otros cortes (red,
    // reinicio) sí los reintenta él, con la cookie vigente.
    if (motivo === "io server disconnect") reintentar();
  });
  socket.on("connect_error", () => {
    if (!socket.active) reintentar();
  });

  return {
    socket,
    alReconectar,
    cerrar: () => {
      cerrado = true;
      if (espera) clearTimeout(espera);
      if (estable) clearTimeout(estable);
      socket.disconnect();
    },
  };
}

/**
 * Escucha avisos del canal en vivo (lo abre si todavía no está abierto).
 * `alReconectar` se llama al recuperar la conexión. Devuelve la función que
 * deja de escucharlos, para el cierre del efecto de la vista.
 */
export function escucharEventos(avisos: Avisos, alReconectar?: () => void): () => void {
  try {
    canal ??= abrirCanal();
  } catch {
    return () => {}; // sin tiempo real: cada vista se pone al día sola cada minuto
  }
  const { socket, alReconectar: recargas } = canal;
  for (const [nombre, alRecibir] of Object.entries(avisos)) socket.on(nombre, alRecibir);
  if (alReconectar) recargas.add(alReconectar);
  return () => {
    for (const [nombre, alRecibir] of Object.entries(avisos)) socket.off(nombre, alRecibir);
    if (alReconectar) recargas.delete(alReconectar);
  };
}

/** Si el canal en vivo está conectado ahora (los cambios llegan con los avisos "connect" y "disconnect"). */
export function canalConectado(): boolean {
  return !!canal?.socket.connected;
}

/** Cierra el canal al cerrar la sesión o cambiar de usuario: la próxima vista lo abre con la sesión nueva. */
export function cerrarCanal(): void {
  canal?.cerrar();
  canal = null;
}
