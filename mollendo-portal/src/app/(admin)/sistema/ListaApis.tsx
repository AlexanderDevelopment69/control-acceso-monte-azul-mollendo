"use client";

import React, { useState } from "react";
import Badge from "@/components/ui/badge/Badge";
import Tarjeta from "@/components/ui/tarjeta/Tarjeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDownIcon } from "@/icons";
import { APIS_INTEGRACION, type ApiIntegracion } from "./apisIntegracion";
import { ComprobandoBadge, Falla } from "./Insignias";

function EstadoIntegracionBadge({
  api,
  backendUp,
  claveConfigurada,
  comprobando,
}: {
  api: ApiIntegracion;
  backendUp: boolean;
  claveConfigurada: boolean;
  comprobando: boolean;
}) {
  if (api.tipo === "pendiente") {
    return <Badge color="light">Por programar</Badge>;
  }
  if (api.tipo === "mock") {
    return <Badge color="warning">Simulado (mock)</Badge>;
  }
  if (comprobando) {
    return <ComprobandoBadge />;
  }
  if (!backendUp) {
    return <Falla>Sin conexión</Falla>;
  }
  if (!claveConfigurada) {
    return <Badge color="warning">Clave no configurada</Badge>;
  }
  return <Badge color="success">Disponible</Badge>;
}

// Colores del código de ejemplo: comentarios, claves JSON, textos, números y
// literales, métodos HTTP y rutas. Cada token se pinta por separado.
const TOKEN_CODIGO =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*"(?=\s*:))|("(?:[^"\\]|\\.)*")|\b(true|false|null)\b|\b(GET|POST|PUT|PATCH|DELETE)\b|((?<![\w.])\/[\w\-./?=&{}:<>]+)|(-?\b\d+(?:\.\d+)?\b)/gm;
const COLOR_TOKEN = [
  "italic text-gray-400 dark:text-gray-500", // comentario
  "text-brand-600 dark:text-brand-400", // clave JSON
  "text-success-700 dark:text-success-400", // texto
  "text-orange-600 dark:text-orange-400", // true/false/null
  "font-semibold text-blue-light-600 dark:text-blue-light-400", // método HTTP
  "text-theme-purple-500 dark:text-theme-purple-500", // ruta
  "text-orange-600 dark:text-orange-400", // número
];

function resaltar(code: string): React.ReactNode[] {
  const partes: React.ReactNode[] = [];
  let ultimo = 0;
  for (const m of code.matchAll(TOKEN_CODIGO)) {
    const i = m.index ?? 0;
    if (i > ultimo) partes.push(code.slice(ultimo, i));
    const grupo = m.slice(1).findIndex((g) => g !== undefined);
    partes.push(
      <span key={i} className={COLOR_TOKEN[grupo]}>
        {m[0]}
      </span>,
    );
    ultimo = i + m[0].length;
  }
  if (ultimo < code.length) partes.push(code.slice(ultimo));
  return partes;
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">{title}</p>
      <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs leading-relaxed text-gray-700 dark:border-gray-800 dark:bg-black/40 dark:text-gray-200">
        <code>{resaltar(code)}</code>
      </pre>
    </div>
  );
}

function FilaApiIntegracion({
  api,
  backendUp,
  claveConfigurada,
  comprobando,
}: {
  api: ApiIntegracion;
  backendUp: boolean;
  claveConfigurada: boolean;
  comprobando: boolean;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
        onClick={() => setAbierto((prev) => !prev)}
      >
        <TableCell className="px-5 py-4 text-sm">
          {/* Botón real para el teclado y los lectores de pantalla; su clic sube a la fila, que es la que abre y cierra. */}
          <button
            type="button"
            aria-expanded={abierto}
            aria-label={`${abierto ? "Ocultar" : "Ver"} el detalle de ${api.nombre}`}
            className="-m-1 flex rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
          >
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${abierto ? "rotate-180" : ""}`}
            />
          </button>
        </TableCell>
        <TableCell className="px-5 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">{api.nombre}</TableCell>
        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
          <Badge color="info" size="sm">{api.metodo}</Badge>{" "}
          <code className="text-xs">{api.endpoint}</code>
        </TableCell>
        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{api.autenticacion}</TableCell>
        <TableCell className="whitespace-nowrap px-5 py-4 text-sm">
          <EstadoIntegracionBadge api={api} backendUp={backendUp} claveConfigurada={claveConfigurada} comprobando={comprobando} />
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
                        <code className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 dark:border-gray-800 dark:bg-black/40 dark:text-gray-200">{h}</code>
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

/** Tabla de las APIs de integración; cada fila se despliega con su detalle y ejemplos. */
export function ListaApis({
  backendUp,
  claveConfigurada,
  comprobando,
}: {
  backendUp: boolean;
  claveConfigurada: boolean;
  comprobando: boolean;
}) {
  return (
    <Tarjeta className="overflow-hidden">
      <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">APIs de integración (terminal facial ZKTeco con alcoholímetro, lectores de DNI y relés de los molinetes)</h2>
        <p className="mt-1 text-xs text-gray-400">Haga clic en una fila para ver el detalle de uso.</p>
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
                backendUp={backendUp}
                claveConfigurada={claveConfigurada}
                comprobando={comprobando}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </Tarjeta>
  );
}
