"use client";

import React, { createContext, useContext, useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, type UsuarioSesion } from "@/lib/api/endpoints";
import { ApiError, renovarSesion, suscribirSesionPerdida } from "@/lib/api/client";
import type { RolUsuario } from "@/lib/api/types";
import { cerrarCanal } from "@/lib/ws";

type AuthUser = UsuarioSesion;

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => void;
}

const ROLES_VALIDOS: RolUsuario[] = ["administrador", "vigilancia"];

/** Espera antes de volver a preguntar por la sesión si el servidor no responde. */
const REINTENTO_MS = 5000;

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Un usuario con un rol que ya no existe (p. ej. "administracion") no entra: se pide un nuevo login. */
const valido = (u: AuthUser | null): AuthUser | null => (u && ROLES_VALIDOS.includes(u.rol) ? u : null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // La sesión viaja en una cookie que el portal no puede leer: se le pregunta al
  // servidor quién la tiene. undefined = todavía no se sabe (cargando).
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    let activo = true;
    let espera: ReturnType<typeof setTimeout> | undefined;
    async function cargar() {
      try {
        // Sin cookies no hay sesión: no se pregunta (sería un 401 en rojo en la consola).
        const { acceso, renovacion } = await authApi.estado();
        if (!acceso && !renovacion) {
          if (activo) setUser(null);
          return;
        }
        // Venció la de acceso (1 hora) pero queda la de renovación (7 días): se renueva primero.
        if (!acceso) {
          const resultado = await renovarSesion();
          if (resultado === "rechazada") return; // el aviso de sesión perdida deja user en null
          if (resultado === "sin-conexion") throw new Error("sin conexión");
        }
        const usuario = await authApi.sesion();
        if (activo) setUser(valido(usuario));
      } catch (err) {
        if (!activo) return;
        // Sin sesión o rechazada: al inicio de sesión. Sin conexión: se conserva y se reintenta.
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) setUser(null);
        else espera = setTimeout(cargar, REINTENTO_MS);
      }
    }
    void cargar();
    const quitar = suscribirSesionPerdida(() => setUser(null));
    return () => {
      activo = false;
      clearTimeout(espera);
      quitar();
    };
  }, []);

  // El canal en vivo se abrió con la sesión de este usuario: al salir (o al cambiar de usuario) se
  // cierra, y la próxima vista lo abre con la sesión nueva.
  const usuarioId = user?.id;
  useEffect(() => () => cerrarCanal(), [usuarioId]);

  const login = useCallback(async (correo: string, password: string) => {
    const { usuario } = await authApi.login(correo, password);
    setUser(valido(usuario));
  }, []);

  const logout = useCallback(() => {
    // Las cookies las borra el servidor; si no responde, igual se sale (y vencen solas).
    void authApi.cerrarSesion().catch(() => undefined);
    setUser(null);
    router.push("/iniciar-sesion");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user: user ?? null, loading: user === undefined, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
