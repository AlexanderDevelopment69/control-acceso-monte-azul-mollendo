"use client";

import React from "react";
import Link from "next/link";
import { RequireRole } from "@/lib/auth/RequireRole";
import { PageHeader } from "@/components/common/PageHeader";
import { Presentes } from "@/components/dashboard/Presentes";
import { ChevronLeftIcon } from "@/icons";
import { useAuth } from "@/lib/auth/AuthContext";

export default function PresentesPage() {
  // El vigilante llega desde el Panel (lector de salida desconectado: abre la salida desde aquí).
  const vigilante = useAuth().user?.rol === "vigilancia";
  return (
    <RequireRole roles={["administrador", "vigilancia"]}>
      <Link
        href={vigilante ? "/vigilancia" : "/dashboard"}
        className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500 dark:text-gray-400"
      >
        <ChevronLeftIcon className="size-4" />
        {vigilante ? "Panel de vigilancia" : "Dashboard"}
      </Link>
      <PageHeader
        title="Presentes ahora"
        description="Personas cuyo último movimiento es un ingreso, de mayor a menor tiempo dentro (en naranja, más de 12 horas). Se actualiza sola con cada ingreso o salida."
      />
      <Presentes />
    </RequireRole>
  );
}
