"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { RequireRole } from "@/lib/auth/RequireRole";
import React, { useEffect } from "react";
import { precargarGraficos } from "@/components/dashboard/Grafico";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // ApexCharts se carga apenas el navegador queda libre, para que el Dashboard no espere su carga.
  useEffect(() => {
    if (typeof requestIdleCallback !== "function") {
      const t = setTimeout(() => void precargarGraficos(), 1500);
      return () => clearTimeout(t);
    }
    const id = requestIdleCallback(() => void precargarGraficos(), { timeout: 3000 });
    return () => cancelIdleCallback(id);
  }, []);

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <RequireRole roles={["administrador", "vigilancia"]}>
      <div className="min-h-screen xl:flex">
        {/* Sidebar and Backdrop */}
        <AppSidebar />
        <Backdrop />
        {/* Main Content Area */}
        <div
          className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
        >
          {/* Header */}
          <AppHeader />
          {/* Page Content */}
          <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
        </div>
      </div>
    </RequireRole>
  );
}
