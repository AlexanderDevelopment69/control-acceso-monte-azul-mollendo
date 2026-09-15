"use client";
import React, { useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  BoltIcon,
  CalenderIcon,
  DocsIcon,
  GridIcon,
  GroupIcon,
  HorizontaLDots,
  ListIcon,
  TaskIcon,
} from "../icons/index";
import type { RolUsuario } from "@/lib/api/types";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles: RolUsuario[];
};

const navItems: NavItem[] = [
  { icon: <GridIcon />, name: "Inicio", path: "/", roles: ["administracion", "empresa", "vigilancia"] },
  { icon: <GroupIcon />, name: "Empresas", path: "/empresas", roles: ["administracion"] },
  { icon: <TaskIcon />, name: "Puestos", path: "/puestos", roles: ["administracion"] },
  { icon: <DocsIcon />, name: "Tipos de documento", path: "/tipos-documento", roles: ["administracion"] },
  { icon: <ListIcon />, name: "Auditoría", path: "/auditoria", roles: ["administracion"] },
  { icon: <GroupIcon />, name: "Mi personal", path: "/personal", roles: ["empresa"] },
  { icon: <CalenderIcon />, name: "Solicitudes de visita", path: "/visitas", roles: ["empresa"] },
  { icon: <BoltIcon />, name: "Panel de vigilancia", path: "/vigilancia", roles: ["vigilancia", "administracion"] },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { user } = useAuth();

  const visibleItems = navItems.filter((item) => (user ? item.roles.includes(user.rol) : false));
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav) => (
        <li key={nav.name}>
          {nav.path && (
            <Link
              href={nav.path}
              className={`menu-item group ${
                isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
              }`}
            >
              <span
                className={`${
                  isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <span className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Control de Acceso
              <span className="block text-xs font-normal text-gray-400">Terminal de Mollendo</span>
            </span>
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-semibold text-white">
              M
            </span>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Menú" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(visibleItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
