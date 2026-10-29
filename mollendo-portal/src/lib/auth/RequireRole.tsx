"use client";

import React, { useEffect } from "react";
import Image from "next/image";
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

  // Al abrir el portal, mientras se revisa la sesión: a pantalla completa, con el logo, el nombre del sistema y una ruedita.
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-gray-50 dark:bg-gray-900" role="status">
        <Image src="/images/logo/marca-monteazul.png" alt="Monte Azul" width={116} height={40} priority />
        {/* El nombre del sistema, como en el menú. "Cargando…" queda solo para los lectores de pantalla. */}
        <p className="text-center text-xl font-semibold leading-tight text-gray-800 dark:text-white/90">
          Control de Acceso
          <span className="block text-sm font-normal text-gray-400">Terminal de Mollendo</span>
        </p>
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-500/20 border-t-brand-500" aria-hidden />
        <span className="sr-only">Cargando…</span>
      </div>
    );
  }
  // Sin sesión o sin permiso: un instante, mientras se va al inicio de sesión o a su página.
  if (!user || !roles.includes(user.rol)) {
    return <div className="flex h-40 items-center justify-center text-gray-400 text-sm">Cargando…</div>;
  }

  return <>{children}</>;
}
