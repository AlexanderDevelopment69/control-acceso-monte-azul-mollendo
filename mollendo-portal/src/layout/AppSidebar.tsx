"use client";
import React, { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  DocsIcon,
  EyeLineIcon,
  BuildingIcon,
  GroupIcon,
  HorizontaLDots,
  InfoIcon,
  ListIcon,
  PieChartIcon,
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
  { icon: <PieChartIcon />, name: "Dashboard", path: "/dashboard", roles: ["administrador"] },
  { icon: <GroupIcon />, name: "Personal y documentos", path: "/", roles: ["administrador"] },
  { icon: <BuildingIcon />, name: "Empresas", path: "/empresas", roles: ["administrador"] },
  { icon: <EyeLineIcon />, name: "Panel de vigilancia", path: "/vigilancia", roles: ["vigilancia", "administrador"] },
  { icon: <DocsIcon />, name: "Reportes", path: "/reportes", roles: ["administrador"] },
  { icon: <ListIcon />, name: "Auditoría", path: "/auditoria", roles: ["administrador"] },
  { icon: <PlugInIcon />, name: "Sistema y APIs", path: "/sistema", roles: ["administrador"] },
  { icon: <InfoIcon />, name: "Manual", path: "/manual", roles: ["administrador", "vigilancia"] },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();
  const { user } = useAuth();

  const visibleItems = navItems.filter((item) => (user ? item.roles.includes(user.rol) : false));
  // La opción elegida se marca en el instante del clic, sin esperar a que cargue la
  // página nueva (como las pestañas): así el fundido acompaña al clic. Vale mientras
  // se está en la página desde la que se hizo clic; al llegar a la nueva manda la ruta.
  const [elegida, setElegida] = useState<{ ruta: string; desde: string } | null>(null);
  const ruta = elegida && elegida.desde === pathname ? elegida.ruta : pathname;
  // También en sus vistas internas (p. ej. /dashboard/presentes resalta "Dashboard").
  const isActive = useCallback((path: string) => path === ruta || (path !== "/" && ruta.startsWith(`${path}/`)), [ruta]);

  // En el celular el menú tapa la página: se cierra al elegir una opción.
  const cerrarEnCelular = () => {
    if (isMobileOpen) toggleMobileSidebar();
  };

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-1">
      {items.map((nav) => (
        <li key={nav.name}>
          {nav.path && (
            <Link
              href={nav.path}
              onClick={(e) => {
                // Clic normal (no "abrir en otra pestaña"): se marca al instante.
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) setElegida({ ruta: nav.path!, desde: pathname });
                cerrarEnCelular();
              }}
              // Fundido del fondo y del color con un solo ritmo (0,3 s, salida suave) para el hover
              // (al entrar y al salir) y para el cambio de opción activa. Sin movimiento.
              className={`menu-item group overflow-hidden transition-colors duration-300 ease-out motion-reduce:transition-none ${
                isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
              }`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center transition-colors duration-300 ease-out motion-reduce:transition-none ${
                  isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                // Sin saltos de línea: mientras el menú se ensancha, el nombre no se
                // parte en dos líneas ni mueve las filas de abajo.
                <span className="menu-item-text whitespace-nowrap">{nav.name}</span>
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
      {/* Solo en pantallas grandes: en el celular el menú se abre debajo de la
          cabecera, que ya muestra la marca y el nombre. */}
      <div
        className={`hidden py-8 lg:flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        {/* Altura fija y texto sin saltos de línea: mientras el menú se ensancha,
            el texto no se parte en varias líneas ni empuja lo de abajo. */}
        <Link href="/" onClick={cerrarEnCelular} className="flex h-11 items-center overflow-hidden">
          {isExpanded || isHovered || isMobileOpen ? (
            <span className="flex items-center gap-3 whitespace-nowrap">
              <Image src="/images/logo/marca-monteazul.png" alt="Monte Azul" width={81} height={28} />
              <span className="text-lg font-semibold leading-tight text-gray-800 dark:text-white/90">
                Control de Acceso
                <span className="block text-xs font-normal text-gray-400">Terminal de Mollendo</span>
              </span>
            </span>
          ) : (
            <Image src="/images/logo/marca-monteazul.png" alt="Monte Azul" width={46} height={16} />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto pt-6 duration-300 ease-linear no-scrollbar lg:pt-0">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Menú" : <HorizontaLDots className="size-5" />}
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
