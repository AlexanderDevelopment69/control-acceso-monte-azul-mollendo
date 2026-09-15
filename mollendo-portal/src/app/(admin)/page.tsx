"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

const HOME_BY_ROLE: Record<string, string> = {
  administracion: "/empresas",
  empresa: "/personal",
  vigilancia: "/vigilancia",
};

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace(HOME_BY_ROLE[user.rol] ?? "/signin");
    }
  }, [user, router]);

  return <div className="flex h-40 items-center justify-center text-gray-400 text-sm">Cargando…</div>;
}
