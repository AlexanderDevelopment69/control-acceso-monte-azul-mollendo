"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/endpoints";
import { clearTokens, getAccessToken, setTokens } from "@/lib/api/client";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadFromToken = useCallback(() => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    const payload = decodeJwt(token);
    // Un token con un rol que ya no existe (p. ej. "administracion" o "empresa",
    // anteriores al alcance base) se descarta para forzar un nuevo login.
    if (!payload || isTokenExpired(payload) || !ROLES_VALIDOS.includes(payload.rol)) {
      clearTokens();
      setUser(null);
      setLoading(false);
      return;
    }
    setUser({ id: payload.sub, empresaId: payload.empresaId, rol: payload.rol, correo: payload.correo });
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFromToken();
  }, [loadFromToken]);

  const login = useCallback(
    async (correo: string, password: string) => {
      const { accessToken, refreshToken } = await authApi.login(correo, password);
      setTokens(accessToken, refreshToken);
      loadFromToken();
    },
    [loadFromToken],
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    router.push("/signin");
  }, [router]);

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
