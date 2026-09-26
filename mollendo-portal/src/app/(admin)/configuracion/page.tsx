"use client";

import React, { useState } from "react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { PageHeader } from "@/components/common/PageHeader";
import { EmpresasTab } from "@/components/configuracion/EmpresasTab";
import { PuestosTab } from "@/components/configuracion/PuestosTab";
import { TiposDocumentoTab } from "@/components/configuracion/TiposDocumentoTab";
import { UsuariosTab } from "@/components/configuracion/UsuariosTab";

const PESTANAS = [
  { id: "empresas", titulo: "Empresas", contenido: <EmpresasTab /> },
  { id: "puestos", titulo: "Puestos y requisitos", contenido: <PuestosTab /> },
  { id: "tipos-documento", titulo: "Tipos de documento", contenido: <TiposDocumentoTab /> },
  { id: "usuarios", titulo: "Usuarios", contenido: <UsuariosTab /> },
] as const;

type PestanaId = (typeof PESTANAS)[number]["id"];

function ConfiguracionContent() {
  const [activa, setActiva] = useState<PestanaId>("empresas");

  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Catálogos que se cargan al inicio y cambian poco: empresas, puestos con sus documentos exigidos, tipos de documento y usuarios."
      />

      <div className="mb-6 flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-900">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActiva(p.id)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activa === p.id
                ? "bg-white text-gray-900 shadow-theme-xs dark:bg-gray-800 dark:text-white"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            {p.titulo}
          </button>
        ))}
      </div>

      {PESTANAS.find((p) => p.id === activa)?.contenido}
    </div>
  );
}

export default function ConfiguracionPage() {
  return (
    <RequireRole roles={["administrador"]}>
      <ConfiguracionContent />
    </RequireRole>
  );
}
