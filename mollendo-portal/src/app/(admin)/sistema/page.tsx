"use client";

import React, { useEffect, useState } from "react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { panelApi } from "@/lib/api/endpoints";
import type { EstadoSistema } from "@/lib/api/types";
import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
const DOCS_URL = `${API_URL.replace(/\/api\/v1\/?$/, "")}/api/docs`;

interface ApiIntegracion {
  nombre: string;
  endpoint: string;
  metodo: "POST" | "GET";
  descripcion: string;
  autenticacion: string;
  tipo: "real" | "mock";
}

const APIS_INTEGRACION: ApiIntegracion[] = [
  {
    nombre: "Ingreso (lector DNI + alcoholímetro)",
    endpoint: "/eventos-acceso/ingreso",
    metodo: "POST",
    descripcion: "Recibe el DNI leído y el resultado del alcohol, corre el motor de validación y responde autorizado/denegado.",
    autenticacion: "Clave de equipo (X-API-Key)",
    tipo: "real",
  },
  {
    nombre: "Salida (torniquete)",
    endpoint: "/eventos-acceso/salida",
    metodo: "POST",
    descripcion: "Valida el anti-passback (que exista un ingreso previo) y responde apertura/no apertura.",
    autenticacion: "Clave de equipo (X-API-Key)",
    tipo: "real",
  },
  {
    nombre: "Webhook alcoholímetro",
    endpoint: "/integraciones/alcoholimetro/webhook",
    metodo: "POST",
    descripcion: "Recibe el resultado del proveedor del alcoholímetro. Proveedor real aún sin definir con el cliente.",
    autenticacion: "Clave de equipo (X-API-Key)",
    tipo: "mock",
  },
  {
    nombre: "Comando torniquete",
    endpoint: "/integraciones/torniquete/comando",
    metodo: "POST",
    descripcion: "Envía la orden de apertura/cierre al controlador del torniquete. Marca/SDK real aún sin definir con el cliente.",
    autenticacion: "JWT (Administración / Vigilancia)",
    tipo: "mock",
  },
];

function EstadoBadge({ ok }: { ok: boolean }) {
  return <Badge color={ok ? "success" : "error"}>{ok ? "En línea" : "Sin conexión"}</Badge>;
}

function ConfiguradoBadge({ ok }: { ok: boolean }) {
  return <Badge color={ok ? "success" : "warning"}>{ok ? "Configurado" : "No configurado"}</Badge>;
}

function StatusCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      {children}
    </div>
  );
}

function EstadoIntegracionBadge({ api, backendUp, claveConfigurada }: { api: ApiIntegracion; backendUp: boolean; claveConfigurada: boolean }) {
  if (api.tipo === "mock") {
    return <Badge color="warning">Simulado (mock)</Badge>;
  }
  if (!backendUp) {
    return <Badge color="error">Sin conexión</Badge>;
  }
  if (!claveConfigurada) {
    return <Badge color="warning">Clave no configurada</Badge>;
  }
  return <Badge color="success">Disponible</Badge>;
}

function SistemaContent() {
  const [estado, setEstado] = useState<EstadoSistema | null>(null);
  const [error, setError] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const data = await panelApi.estadoSistema();
        if (!activo) return;
        setEstado(data);
        setError(false);
        setUltimaActualizacion(new Date());
      } catch {
        if (!activo) return;
        setEstado(null);
        setError(true);
        setUltimaActualizacion(new Date());
      }
    }
    cargar();
    const interval = setInterval(cargar, 15000);
    return () => {
      activo = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Sistema y APIs</h1>
        {ultimaActualizacion && (
          <p className="text-xs text-gray-400">
            Última verificación: {ultimaActualizacion.toLocaleTimeString("es-PE")}
          </p>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCard>
          <p className="text-sm text-gray-500 dark:text-gray-400">Backend (mollendo-api)</p>
          <div className="mt-2">
            <EstadoBadge ok={!error && !!estado} />
          </div>
          {estado && (
            <p className="mt-2 text-xs text-gray-400">
              {estado.api.entorno} · uptime {Math.floor(estado.api.uptimeSegundos / 60)} min · Node {estado.api.nodeVersion}
            </p>
          )}
        </StatusCard>

        <StatusCard>
          <p className="text-sm text-gray-500 dark:text-gray-400">Base de datos</p>
          <div className="mt-2">
            <EstadoBadge ok={estado?.baseDeDatos.estado === "up"} />
          </div>
          {estado && <p className="mt-2 text-xs text-gray-400">Latencia: {estado.baseDeDatos.latenciaMs} ms</p>}
        </StatusCard>

        <StatusCard>
          <p className="text-sm text-gray-500 dark:text-gray-400">Correo (SMTP)</p>
          <div className="mt-2">
            <ConfiguradoBadge ok={!!estado?.integraciones.smtpConfigurado} />
          </div>
          <p className="mt-2 text-xs text-gray-400">Invitaciones y recuperación de contraseña</p>
        </StatusCard>

        <StatusCard>
          <p className="text-sm text-gray-500 dark:text-gray-400">Clave de equipos físicos</p>
          <div className="mt-2">
            <ConfiguradoBadge ok={!!estado?.integraciones.claveEquiposConfigurada} />
          </div>
          <p className="mt-2 text-xs text-gray-400">Lector DNI / alcoholímetro / torniquete</p>
        </StatusCard>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-500">
          No se pudo contactar al backend — verifica que mollendo-api esté corriendo.
        </div>
      )}

      <div className="mb-6 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Documentación de la API (Swagger)</h2>
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
          >
            Abrir en pestaña nueva ↗
          </a>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">APIs de integración (equipos físicos y proveedores externos)</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">API</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Endpoint</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Descripción</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Autenticación</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Estado</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {APIS_INTEGRACION.map((api) => (
                <TableRow key={api.endpoint}>
                  <TableCell className="px-5 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">{api.nombre}</TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <Badge color="info" size="sm">{api.metodo}</Badge>{" "}
                    <code className="text-xs">{api.endpoint}</code>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{api.descripcion}</TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{api.autenticacion}</TableCell>
                  <TableCell className="px-5 py-4 text-sm">
                    <EstadoIntegracionBadge
                      api={api}
                      backendUp={!error && !!estado}
                      claveConfigurada={!!estado?.integraciones.claveEquiposConfigurada}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default function SistemaPage() {
  return (
    <RequireRole roles={["administracion"]}>
      <SistemaContent />
    </RequireRole>
  );
}
