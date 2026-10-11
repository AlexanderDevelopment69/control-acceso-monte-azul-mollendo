"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import type { RolUsuario } from "@/lib/api/types";

export function RequireRole({
  roles,
  children,
}: {
  roles: RolUsuario[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/iniciar-sesion");
      return;
    }
    if (!roles.includes(user.rol)) {
      router.replace("/");
    }
  }, [user, loading, roles, router]);

  if (loading || !user || !roles.includes(user.rol)) {
    return (
      <div className="flex h-40 items-center justify-center text-gray-400 text-sm">Cargando…</div>
    );
  }

  return <>{children}</>;
}
