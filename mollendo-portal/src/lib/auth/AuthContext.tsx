"use client";

import React, { createContext, useContext, useEffect, useMemo, useCallback, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/endpoints";
import { clearTokens, getAccessToken, getRefreshToken, renovarSesion, setTokens, suscribirTokens } from "@/lib/api/client";
import { decodeJwt, isTokenExpired } from "./decode-jwt";
import type { RolUsuario } from "@/lib/api/types";

interface AuthUser {
  id: number;
  empresaId: number;
  rol: RolUsuario;
  correo: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => void;
}

const ROLES_VALIDOS: RolUsuario[] = ["administrador", "vigilancia"];

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * ¿Es un token del portal que solo está vencido (rol válido) y hay con qué
 * renovarlo? Pasa al volver después de más de 1 hora: la sesión se renueva sola
 * (hasta 7 días) en vez de pedir de nuevo la contraseña.
 */
function vencidoRenovable(token: string): boolean {
  const payload = decodeJwt(token);
  return !!payload && isTokenExpired(payload) && ROLES_VALIDOS.includes(payload.rol) && !!getRefreshToken();
}

/** Usuario del token, o null si no hay token o no sirve. */
function usuarioDelToken(token: string | null): AuthUser | null {
  if (!token) return null;
  const payload = decodeJwt(token);
  // Un token con un rol que ya no existe (p. ej. "administracion" o "empresa",
  // anteriores al alcance base) se descarta para forzar un nuevo login.
  if (!payload || isTokenExpired(payload) || !ROLES_VALIDOS.includes(payload.rol)) return null;
  return { id: payload.sub, empresaId: payload.empresaId, rol: payload.rol, correo: payload.correo };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // El token vive en localStorage: se lee como fuente externa. En el servidor
  // (y al hidratar) todavía no se conoce, por eso `undefined` = cargando.
  const token = useSyncExternalStore<string | null | undefined>(suscribirTokens, getAccessToken, () => undefined);
  const user = useMemo(() => (token ? usuarioDelToken(token) : null), [token]);
  const renovable = useMemo(() => !!token && !user && vencidoRenovable(token), [token, user]);
  // Mientras se renueva, se sigue "cargando": así no se manda al inicio de sesión.
  const loading = token === undefined || renovable;
  /** Sube para reintentar la renovación si el servidor no respondió. */
  const [reintento, setReintento] = useState(0);

  // Token vencido pero renovable: se piden tokens nuevos. Uno que no sirve
  // (rol antiguo, sin renovación) o una renovación rechazada borran la sesión.
  useEffect(() => {
    if (!token || user) return;
    if (!renovable) {
      clearTokens();
      return;
    }
    let activo = true;
    let espera: ReturnType<typeof setTimeout> | undefined;
    void renovarSesion().then((resultado) => {
      // Sin conexión: se conserva la sesión y se reintenta en 5 s.
      if (activo && resultado === "sin-conexion") espera = setTimeout(() => setReintento((n) => n + 1), 5000);
    });
    return () => {
      activo = false;
      clearTimeout(espera);
    };
  }, [token, user, renovable, reintento]);

  const login = useCallback(async (correo: string, password: string) => {
    const { accessToken, refreshToken } = await authApi.login(correo, password);
    setTokens(accessToken, refreshToken);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    router.push("/iniciar-sesion");
  }, [router]);

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
