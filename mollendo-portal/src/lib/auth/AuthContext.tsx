"use client";

import React, { createContext, useContext, useEffect, useMemo, useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/endpoints";
import { clearTokens, getAccessToken, setTokens, suscribirTokens } from "@/lib/api/client";
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
  const loading = token === undefined;
  const user = useMemo(() => (token ? usuarioDelToken(token) : null), [token]);

  // Un token guardado que no sirve (vencido, rol antiguo) se borra.
  useEffect(() => {
    if (token && !user) clearTokens();
  }, [token, user]);

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
