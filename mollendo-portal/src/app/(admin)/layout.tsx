"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { RequireRole } from "@/lib/auth/RequireRole";
import React, { useEffect } from "react";
import { precargarGraficos } from "@/components/dashboard/Grafico";
import { AvisoSistema } from "@/components/common/AvisoSistema";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isMobileOpen } = useSidebar();

  // ApexCharts se carga apenas el navegador queda libre, para que el Dashboard no espere su carga.
  useEffect(() => {
    if (typeof requestIdleCallback !== "function") {
      const t = setTimeout(() => void precargarGraficos(), 1500);
      return () => clearTimeout(t);
    }
    const id = requestIdleCallback(() => void precargarGraficos(), { timeout: 3000 });
    return () => cancelIdleCallback(id);
  }, []);

  // Margen del contenido según el menú. Cerrado y con el mouse encima, el menú se abre por encima
  // del contenido, sin empujarlo (la tabla no salta).
  const mainContentMargin = isMobileOpen ? "ml-0" : isExpanded ? "lg:ml-[290px]" : "lg:ml-[90px]";

  return (
    <RequireRole roles={["administrador", "vigilancia", "soporte"]}>
      <div className="min-h-screen xl:flex">
        {/* Sidebar and Backdrop */}
        <AppSidebar />
        <Backdrop />
        {/* Main Content Area */}
        {/* min-w-0: sin él, una tabla ancha ensancha toda la página (desde 1280 px) en vez de desplazarse en su recuadro. */}
        <div className={`min-w-0 flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
          {/* Header */}
          <AppHeader />
          {/* Page Content */}
          <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
            <AvisoSistema />
            {children}
          </div>
        </div>
      </div>
    </RequireRole>
  );
}
