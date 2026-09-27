"use client";

import React, { useEffect, useState } from "react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { panelApi } from "@/lib/api/endpoints";
import type { EstadoSistema } from "@/lib/api/types";
import Badge from "@/components/ui/badge/Badge";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { PageHeader } from "@/components/common/PageHeader";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { BoxCubeIcon, CheckCircleIcon, ChevronDownIcon, LockIcon } from "@/icons";

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
    nombre: "Webhook ZKBio CVSecurity (terminal ZKTeco G4 Pro + alcoholímetro)",
    endpoint: "/integraciones/zkbio/webhook",
    metodo: "POST",
    descripcion:
      "ZKBio CVSecurity avisa que el terminal identificó a una persona por rostro y el resultado de su prueba de alcohol. El backend ejecuta el ingreso (motor de validación) y, si es autorizado, ordena abrir el molinete.",
    autenticacion: "Clave de equipo (X-API-Key)",
    tipo: "mock",
    headers: ["Content-Type: application/json", "X-API-Key: <DEVICE_API_KEY>"],
    ejemploRequest: `{
  "tipoDocumentoIdentidad": "DNI",   // opcional, por defecto DNI
  "numeroDocumento": "12345678",
  "resultadoAlcohol": "conforme",    // "conforme" | "no_conforme"
  "torniqueteId": "T1"               // opcional
}`,
    ejemploRespuesta: `// 200 OK — misma respuesta que /eventos-acceso/ingreso`,
    notas:
      "Contrato provisional: el formato real del evento de ZKBio (webhook o polling) se definirá cuando el cliente entregue la documentación/SDK. Hoy acepta este JSON y ya ejecuta el ingreso de verdad.",
  },
  {
    nombre: "Ingreso",
    endpoint: "/eventos-acceso/ingreso",
    metodo: "POST",
    descripcion:
      "Recibe el documento de la persona y el resultado del alcohol, corre el motor de validación y responde autorizado/denegado. Si es autorizado, ordena abrir el molinete.",
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
  "tipoMovimiento": "ingreso",
  "resultado": "autorizado",
  "fechaHora": "2026-09-26T13:05:00.000Z",
  "persona": { "id": 1, "nombres": "Juan", "apellidos": "Pérez" },
  "numeroDocumento": "12345678",
  "motivos": {
    "dadoDeBaja": false,
    "sinDocumentos": false,
    "alcohol": false,
    "documentos": false,
    "documentosVencidos": []
  }
}

// 200 OK — denegado (puede combinar varios motivos a la vez)
{
  "eventoId": 43,
  "resultado": "denegado",
  ...
  "motivos": {
    "dadoDeBaja": false,
    "sinDocumentos": false,
    "alcohol": true,
    "documentos": true,
    "documentosVencidos": ["SCTR"]
  }
}

// 200 OK — documento no registrado (no se guarda evento)
{
  "eventoId": null,
  "resultado": "denegado",
  "persona": null,
  "numeroDocumento": "99999999",
  "motivos": { "personaNoRegistrada": true }
}

// 401 — X-API-Key inválida o ausente`,
    notas:
      "Orden de evaluación: persona dada de baja → se deniega de inmediato sin evaluar nada más. Si no, se revisan juntos: que tenga al menos un documento cargado, que ninguno esté vencido (última versión de cada uno) y el alcohol, y se informan todos los motivos.",
  },
  {
    nombre: "Salida",
    endpoint: "/eventos-acceso/salida",
    metodo: "POST",
    descripcion: "Registro básico de salida: siempre se autoriza y se ordena abrir el molinete.",
    autenticacion: "Clave de equipo (X-API-Key)",
    tipo: "real",
    headers: ["Content-Type: application/json", "X-API-Key: <DEVICE_API_KEY>"],
    ejemploRequest: `{
  "tipoDocumentoIdentidad": "DNI",
  "numeroDocumento": "12345678",
  "torniqueteId": "T1"
}`,
    ejemploRespuesta: `// 200 OK
{
  "eventoId": 44,
  "tipoMovimiento": "salida",
  "resultado": "autorizado",
  "fechaHora": "2026-09-26T21:10:00.000Z",
  "persona": { "id": 1, "nombres": "Juan", "apellidos": "Pérez" },
  "numeroDocumento": "12345678",
  "motivos": {}
}`,
    notas:
      "Sin antipassback (alcance base): no se exige un ingreso previo ni se bloquea un segundo ingreso sin salida. Solo se deniega si el documento no está registrado.",
  },
  {
    nombre: "Comando molinete",
    endpoint: "/integraciones/torniquete/comando",
    metodo: "POST",
    descripcion:
      "Envía una orden de apertura/cierre al molinete. El backend la usa automáticamente tras cada ingreso autorizado y cada salida; también se puede llamar a mano.",
    autenticacion: "JWT (Administrador / Vigilancia)",
    tipo: "mock",
    headers: ["Content-Type: application/json", "Authorization: Bearer <token>"],
    ejemploRequest: `{
  "torniqueteId": "T1",
  "comando": "abrir"
}`,
    ejemploRespuesta: `// 200 OK
{ "enviado": true }`,
    notas:
      "Contrato provisional: hoy solo registra el comando en el log del servidor. Falta la marca/modelo del molinete y su SDK para conectarlo al equipo real.",
  },
  {
    nombre: "Enrolamiento de rostro en ZKBio (saliente)",
    endpoint: "/personas/:id/foto",
    metodo: "POST",
    descripcion:
      "Cuando el administrador sube o cambia la foto del personal, el backend la guarda y debe enviarla a ZKBio CVSecurity para registrar (enrolar) el rostro en el terminal ZKTeco G4 Pro. Sin este paso, el terminal no puede reconocer a la persona.",
    autenticacion: "JWT (Administrador) para subir la foto",
    tipo: "mock",
    headers: ["Content-Type: multipart/form-data", "Authorization: Bearer <token>"],
    ejemploRequest: `// multipart/form-data
foto: <archivo JPG, PNG o WEBP, máximo 5 MB>`,
    ejemploRespuesta: `// 201 Created — persona con la ruta de su foto
{ "id": 12, "numeroDocumento": "12345678", "fotoUrl": "storage/documentos/persona-12/foto-….jpg", ... }

// 400 — no es una imagen JPG/PNG/WEBP o pesa más de 5 MB

// Envío a ZKBio (hoy simulado, queda en el log del servidor):
Enrolar rostro en ZKBio: DNI 12345678 (persona 12), foto storage/… (mock, sin SDK real todavía)`,
    notas:
      "La foto se guarda y se ve en el portal, pero el envío a ZKBio es simulado: falta la documentación/SDK de ZKBio CVSecurity para enrolar el rostro de verdad. Vigilancia puede ver la foto (GET /personas/:id/foto) pero no subirla.",
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
      <PageHeader
        title="Sistema y APIs"
        description="Estado del backend, la base de datos y las integraciones externas."
        actions={
          ultimaActualizacion ? (
            <p className="text-xs text-gray-400">
              Última verificación: {ultimaActualizacion.toLocaleTimeString("es-PE")}
            </p>
          ) : undefined
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
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


        <StatusCard icon={<LockIcon className="text-gray-800 size-6 dark:text-white/90" />}>
          <p className="text-sm text-gray-500 dark:text-gray-400">Clave de equipos físicos</p>
          <div className="mt-2">
            <ConfiguradoBadge ok={!!estado?.integraciones.claveEquiposConfigurada} />
          </div>
          <p className="mt-2 text-xs text-gray-400">ZKBio CVSecurity / molinete</p>
        </StatusCard>
      </div>

      {error && (
        <ErrorBanner className="mb-6">
          No se pudo contactar al backend — verifica que mollendo-api esté corriendo.
        </ErrorBanner>
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
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">APIs de integración (terminal ZKTeco, alcoholímetro y molinete)</h2>
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
    <RequireRole roles={["administrador"]}>
      <SistemaContent />
    </RequireRole>
  );
}
