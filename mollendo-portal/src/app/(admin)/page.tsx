"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { PersonalDocumentos } from "./PersonalDocumentos";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Vigilancia ya tiene un dashboard completo en tiempo real en /vigilancia
    // — no tiene sentido duplicarlo aquí.
    if (user?.rol === "vigilancia") {
      router.replace("/vigilancia");
    }
  }, [user, router]);

  if (!user) {
    return <div className="flex h-40 items-center justify-center text-gray-400 text-sm">Cargando…</div>;
  }

  if (user.rol === "administrador") {
    return <PersonalDocumentos />;
  }

  return <div className="flex h-40 items-center justify-center text-gray-400 text-sm">Cargando…</div>;
}
