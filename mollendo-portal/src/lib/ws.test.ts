import { beforeEach, describe, expect, it, vi } from "vitest";

// Un socket simulado: guarda quién escucha cada aviso y permite dispararlos.
const { sockets, io } = vi.hoisted(() => {
  const sockets: Array<{
    oyentes: Map<string, Set<(...datos: unknown[]) => void>>;
    connected: boolean;
    active: boolean;
    on: (n: string, f: (...datos: unknown[]) => void) => void;
    off: (n: string, f: (...datos: unknown[]) => void) => void;
    disconnect: () => void;
    connect: () => void;
    disparar: (n: string, ...datos: unknown[]) => void;
  }> = [];
  const io = () => {
    const oyentes = new Map<string, Set<(...datos: unknown[]) => void>>();
    const socket = {
      oyentes,
      connected: false,
      active: true,
      on: (n: string, f: (...datos: unknown[]) => void) => void (oyentes.get(n) ?? oyentes.set(n, new Set()).get(n)!).add(f),
      off: (n: string, f: (...datos: unknown[]) => void) => void oyentes.get(n)?.delete(f),
      disconnect: vi.fn(() => {
        socket.connected = false;
        socket.active = false;
      }),
      connect: vi.fn(),
      disparar: (n: string, ...datos: unknown[]) => oyentes.get(n)?.forEach((f) => f(...datos)),
    };
    sockets.push(socket);
    return socket;
  };
  return { sockets, io: vi.fn(io) };
});
vi.mock("socket.io-client", () => ({ io }));
vi.mock("./api/client", () => ({ renovarSesion: vi.fn() }));

import { canalConectado, cerrarCanal, escucharEventos } from "./ws";

describe("canal en vivo compartido", () => {
  beforeEach(() => {
    cerrarCanal();
    sockets.length = 0;
    io.mockClear();
  });

  it("todas las vistas usan una sola conexión; al salir de una vista solo deja de escuchar", () => {
    const enPanel = vi.fn();
    const enDashboard = vi.fn();
    const salirPanel = escucharEventos({ "evento-acceso": enPanel });
    escucharEventos({ "evento-acceso": enDashboard });
    expect(io).toHaveBeenCalledTimes(1);

    sockets[0].disparar("evento-acceso", { eventoId: 1 });
    expect(enPanel).toHaveBeenCalledWith({ eventoId: 1 });
    expect(enDashboard).toHaveBeenCalledTimes(1);

    salirPanel();
    sockets[0].disparar("evento-acceso", { eventoId: 2 });
    expect(enPanel).toHaveBeenCalledTimes(1);
    expect(enDashboard).toHaveBeenCalledTimes(2);
    expect(sockets[0].disconnect).not.toHaveBeenCalled(); // la conexión sigue abierta
  });

  it("al recuperar la conexión recargan solo las vistas abiertas", () => {
    const recargarPanel = vi.fn();
    const recargarMonitor = vi.fn();
    escucharEventos({}, recargarPanel);
    const salirMonitor = escucharEventos({}, recargarMonitor);
    const socket = sockets[0];

    socket.connected = true;
    socket.disparar("connect"); // primera conexión: no hay nada que recargar
    expect(canalConectado()).toBe(true);
    expect(recargarPanel).not.toHaveBeenCalled();

    salirMonitor();
    socket.disparar("disconnect", "transport close");
    socket.disparar("connect");
    expect(recargarPanel).toHaveBeenCalledTimes(1);
    expect(recargarMonitor).not.toHaveBeenCalled();
  });

  it("al cerrar la sesión se cierra, y la próxima vista abre una conexión nueva", () => {
    escucharEventos({});
    cerrarCanal();
    expect(sockets[0].disconnect).toHaveBeenCalled();
    expect(canalConectado()).toBe(false);

    escucharEventos({});
    expect(io).toHaveBeenCalledTimes(2);
  });
});
