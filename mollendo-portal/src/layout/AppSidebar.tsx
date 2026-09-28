"use client";
import React, { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  EyeIcon,
  GroupIcon,
  HorizontaLDots,
  InfoIcon,
  ListIcon,
  PlugInIcon,
} from "../icons/index";
import type { RolUsuario } from "@/lib/api/types";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles: RolUsuario[];
};

const navItems: NavItem[] = [
  { icon: <GroupIcon />, name: "Personal y documentos", path: "/", roles: ["administrador"] },
  { icon: <EyeIcon />, name: "Panel de vigilancia", path: "/vigilancia", roles: ["vigilancia", "administrador"] },
  { icon: <ListIcon />, name: "Auditoría", path: "/auditoria", roles: ["administrador"] },
  { icon: <PlugInIcon />, name: "Sistema y APIs", path: "/sistema", roles: ["administrador"] },
  { icon: <InfoIcon />, name: "Manual", path: "/manual", roles: ["administrador", "vigilancia"] },
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
        {/* Altura fija y texto sin saltos de línea: mientras el menú se ensancha,
            el texto no se parte en varias líneas ni empuja lo de abajo. */}
        <Link href="/" className="flex h-11 items-center overflow-hidden">
          {isExpanded || isHovered || isMobileOpen ? (
            <span className="flex items-center gap-3 whitespace-nowrap">
              <Image src="/images/logo/marca-monteazul.png" alt="Monte Azul" width={81} height={28} priority />
              <span className="text-lg font-semibold leading-tight text-gray-800 dark:text-white/90">
                Control de Acceso
                <span className="block text-xs font-normal text-gray-400">Terminal de Mollendo</span>
              </span>
            </span>
          ) : (
            <Image src="/images/logo/marca-monteazul.png" alt="Monte Azul" width={46} height={16} priority />
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
