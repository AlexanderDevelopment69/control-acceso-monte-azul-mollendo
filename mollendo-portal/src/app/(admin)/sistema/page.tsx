"use client";

import React, { useEffect, useState } from "react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { panelApi } from "@/lib/api/endpoints";
import type { EstadoSistema } from "@/lib/api/types";
import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { BoxCubeIcon, CheckCircleIcon, ChevronDownIcon, LockIcon, MailIcon } from "@/icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
const DOCS_URL = `${API_URL.replace(/\/api\/v1\/?$/, "")}/api/docs`;

interface ApiIntegracion {
  nombre: string;
  endpoint: string;
  metodo: "POST" | "GET";
  descripcion: string;
  autenticacion: string;
  tipo: "real" | "mock";
  headers: string[];
  ejemploRequest: string;
  ejemploRespuesta: string;
  notas: string;
}

const APIS_INTEGRACION: ApiIntegracion[] = [
  {
    nombre: "Ingreso (lector DNI + alcoholímetro)",
    endpoint: "/eventos-acceso/ingreso",
    metodo: "POST",
    descripcion: "Recibe el DNI leído y el resultado del alcohol, corre el motor de validación y responde autorizado/denegado.",
    autenticacion: "Clave de equipo (X-API-Key)",
    tipo: "real",
    headers: ["Content-Type: application/json", "X-API-Key: <DEVICE_API_KEY>"],
    ejemploRequest: `{
  "tipoDocumentoIdentidad": "DNI",
  "numeroDocumento": "12345678",
  "alcoholConforme": true,
  "torniqueteId": "T1"
}`,
    ejemploRespuesta: `// 200 OK — autorizado
{
  "eventoId": 42,
  "resultado": "autorizado",
  "persona": { "id": 1, "nombres": "Juan", "apellidos": "Pérez" },
  "motivos": {
    "dadoDeBaja": false,
    "alcohol": false,
    "documentos": false,
    "documentosFaltantes": []
  }
}

// 200 OK — denegado (puede combinar varios motivos a la vez)
{
  "eventoId": 43,
  "resultado": "denegado",
  "persona": { "id": 1, "nombres": "Juan", "apellidos": "Pérez" },
  "motivos": {
    "dadoDeBaja": false,
    "alcohol": true,
    "documentos": true,
    "documentosFaltantes": ["SCTR"]
  }
}

// 404 — el número de documento no está registrado
// 401 — X-API-Key inválida o ausente`,
    notas: "Si la persona está dada de baja, se deniega de inmediato con \"dadoDeBaja: true\" y no se evalúan alcohol ni documentos — es un motivo con prioridad sobre los demás.",
  },
  {
    nombre: "Salida (torniquete)",
    endpoint: "/eventos-acceso/salida",
    metodo: "POST",
    descripcion: "Valida el anti-passback (que exista un ingreso previo) y responde apertura/no apertura.",
    autenticacion: "Clave de equipo (X-API-Key)",
    tipo: "real",
    headers: ["Content-Type: application/json", "X-API-Key: <DEVICE_API_KEY>"],
    ejemploRequest: `{
  "tipoDocumentoIdentidad": "DNI",
  "numeroDocumento": "12345678",
  "torniqueteId": "T1"
}`,
    ejemploRespuesta: `// 200 OK — autorizado (el último movimiento fue un ingreso)
{
  "eventoId": 44,
  "resultado": "autorizado",
  "persona": { "id": 1, "nombres": "Juan", "apellidos": "Pérez" },
  "motivos": { "sinIngresoPrevio": false }
}

// 200 OK — denegado (no hay ingreso previo, o ya salió antes)
{
  "eventoId": 45,
  "resultado": "denegado",
  "persona": { "id": 1, "nombres": "Juan", "apellidos": "Pérez" },
  "motivos": { "sinIngresoPrevio": true }
}`,
    notas: "Anti-passback: solo se permite la salida si el último movimiento autorizado de la persona fue un ingreso. Un ingreso denegado no cuenta como ingreso previo.",
  },
  {
    nombre: "Webhook alcoholímetro",
    endpoint: "/integraciones/alcoholimetro/webhook",
    metodo: "POST",
    descripcion: "Recibe el resultado del proveedor del alcoholímetro. Proveedor real aún sin definir con el cliente.",
    autenticacion: "Clave de equipo (X-API-Key)",
    tipo: "mock",
    headers: ["Content-Type: application/json", "X-API-Key: <DEVICE_API_KEY>"],
    ejemploRequest: `// El formato exacto lo define el SDK del proveedor que se elija.
// Por ahora se acepta cualquier payload y solo se registra en el log.
{
  "cualquier campo del proveedor": "..."
}`,
    ejemploRespuesta: `// 200 OK
{ "recibido": true }`,
    notas: "Contrato provisional: hoy solo registra el payload recibido en el log del servidor, para poder programar el resto del flujo mientras se define el proveedor real (spec, sección 9.8 y 12).",
  },
  {
    nombre: "Comando torniquete",
    endpoint: "/integraciones/torniquete/comando",
    metodo: "POST",
    descripcion: "Envía la orden de apertura/cierre al controlador del torniquete. Marca/SDK real aún sin definir con el cliente.",
    autenticacion: "JWT (Administración / Vigilancia)",
    tipo: "mock",
    headers: ["Content-Type: application/json", "Authorization: Bearer <token>"],
    ejemploRequest: `{
  "torniqueteId": "T1",
  "comando": "abrir"
}`,
    ejemploRespuesta: `// 200 OK
{ "enviado": true }`,
    notas: "Contrato provisional: hoy solo registra el comando en el log del servidor — no está conectado a ningún SDK/hardware real todavía.",
  },
];

function EstadoBadge({ ok }: { ok: boolean }) {
  return <Badge color={ok ? "success" : "error"}>{ok ? "En línea" : "Sin conexión"}</Badge>;
}

function ConfiguradoBadge({ ok }: { ok: boolean }) {
  return <Badge color={ok ? "success" : "warning"}>{ok ? "Configurado" : "No configurado"}</Badge>;
}

function StatusCard({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
        {icon}
      </div>
      <div className="mt-5">{children}</div>
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

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">{title}</p>
      <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs leading-relaxed text-gray-200 dark:bg-black/40">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function FilaApiIntegracion({
  api,
  backendUp,
  claveConfigurada,
}: {
  api: ApiIntegracion;
  backendUp: boolean;
  claveConfigurada: boolean;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
        onClick={() => setAbierto((prev) => !prev)}
      >
        <TableCell className="px-5 py-4 text-sm">
          <ChevronDownIcon
            className={`h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${abierto ? "rotate-180" : ""}`}
          />
        </TableCell>
        <TableCell className="px-5 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">{api.nombre}</TableCell>
        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
          <Badge color="info" size="sm">{api.metodo}</Badge>{" "}
          <code className="text-xs">{api.endpoint}</code>
        </TableCell>
        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{api.autenticacion}</TableCell>
        <TableCell className="px-5 py-4 text-sm">
          <EstadoIntegracionBadge api={api} backendUp={backendUp} claveConfigurada={claveConfigurada} />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={5} className="bg-gray-50 p-0 dark:bg-white/[0.02]">
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              abierto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div
                className={`space-y-4 px-5 py-5 transition-opacity duration-300 ease-in-out ${
                  abierto ? "opacity-100 delay-100" : "opacity-0"
                }`}
              >
                <p className="text-sm text-gray-600 dark:text-gray-300">{api.descripcion}</p>

                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">Headers</p>
                  <ul className="space-y-1">
                    {api.headers.map((h) => (
                      <li key={h}>
                        <code className="rounded bg-gray-900 px-2 py-1 text-xs text-gray-200 dark:bg-black/40">{h}</code>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <CodeBlock title="Ejemplo de solicitud (body)" code={api.ejemploRequest} />
                  <CodeBlock title="Ejemplo de respuesta" code={api.ejemploRespuesta} />
                </div>

                <div className="rounded-lg bg-brand-50 px-4 py-3 text-xs text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  {api.notas}
                </div>
              </div>
            </div>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
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
        <StatusCard icon={<CheckCircleIcon className="text-gray-800 size-6 dark:text-white/90" />}>
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

        <StatusCard icon={<BoxCubeIcon className="text-gray-800 size-6 dark:text-white/90" />}>
          <p className="text-sm text-gray-500 dark:text-gray-400">Base de datos</p>
          <div className="mt-2">
            <EstadoBadge ok={estado?.baseDeDatos.estado === "up"} />
          </div>
          {estado && <p className="mt-2 text-xs text-gray-400">Latencia: {estado.baseDeDatos.latenciaMs} ms</p>}
        </StatusCard>

        <StatusCard icon={<MailIcon className="text-gray-800 size-6 dark:text-white/90" />}>
          <p className="text-sm text-gray-500 dark:text-gray-400">Correo (SMTP)</p>
          <div className="mt-2">
            <ConfiguradoBadge ok={!!estado?.integraciones.smtpConfigurado} />
          </div>
          <p className="mt-2 text-xs text-gray-400">Invitaciones y recuperación de contraseña</p>
        </StatusCard>

        <StatusCard icon={<LockIcon className="text-gray-800 size-6 dark:text-white/90" />}>
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
          <p className="mt-1 text-xs text-gray-400">Haz clic en una fila para ver el detalle de uso.</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500"></TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">API</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Endpoint</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Autenticación</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Estado</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {APIS_INTEGRACION.map((api) => (
                <FilaApiIntegracion
                  key={api.endpoint}
                  api={api}
                  backendUp={!error && !!estado}
                  claveConfigurada={!!estado?.integraciones.claveEquiposConfigurada}
                />
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
