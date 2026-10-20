"use client";

import React, { useEffect, useState } from "react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { panelApi } from "@/lib/api/endpoints";
import { API_BASE } from "@/lib/config";
import type { EstadoSistema } from "@/lib/api/types";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { PageHeader } from "@/components/common/PageHeader";
import Tarjeta from "@/components/ui/tarjeta/Tarjeta";
import { BellIcon, BoltIcon, BoxCubeIcon, BoxIcon, CheckCircleIcon, DocsIcon, FolderIcon, LockIcon, PlugInIcon } from "@/icons";
import { ComprobandoBadge, ConfiguradoBadge, EstadoBadge } from "./Insignias";
import {
  ControladorGaritaEstado,
  EquiposEstado,
  LectoresDniEstado,
  ReleEstado,
  RespaldosEstado,
  StatusCard,
  TituloSeccion,
} from "./TarjetasEstado";
import { SincronizacionG4 } from "./SincronizacionG4";
import { OrdenIngreso } from "./OrdenIngreso";
import { ListaApis } from "./ListaApis";
import { TarjetaMonitorG4 } from "./MonitorG4";

const DOCS_URL = `${API_BASE}/api/docs`;

function SistemaContent() {
  const [estado, setEstado] = useState<EstadoSistema | null>(null);
  const [error, setError] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  const comprobando = !estado && !error;
  // Equipos de acceso: tarjetas del mismo ancho, tantas por fila como haya (controlador y relés de aviso son opcionales).
  // Con controlador, la tarjeta de avisos se muestra siempre (aunque esté desconectado).
  const hayAvisos = !!(estado?.controladorGarita?.remoto || estado?.releMolinetes?.avisoIngreso || estado?.releMolinetes?.avisoSalida);
  const tarjetasEquipos = 3 + (estado?.controladorGarita?.remoto ? 1 : 0) + (hayAvisos ? 1 : 0);
  // Según el ancho del contenido (no de la pantalla: el menú lateral ocupa parte): todas en una fila solo si caben.
  const columnasEquipos =
    { 3: "@3xl:grid-cols-3", 4: "@3xl:grid-cols-3 @4xl:grid-cols-4", 5: "@3xl:grid-cols-3 @5xl:grid-cols-5" }[tarjetasEquipos] ??
    "@3xl:grid-cols-3";
  // Se incrementa para recargar el estado al terminar una sincronización.
  const [version, setVersion] = useState(0);

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
  }, [version]);

  return (
    <div className="@container">
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

      {/* Las tarjetas se agrupan: el servidor (4) y los equipos de garita (3), con la sincronización del G4 Pro debajo. */}
      <TituloSeccion>Servidor</TituloSeccion>
      <div className="mb-8 grid grid-cols-1 gap-4 @lg:grid-cols-2 @4xl:grid-cols-4">
        <StatusCard icon={<CheckCircleIcon className="text-gray-800 size-6 dark:text-white/90" />}>
          <p className="text-sm text-gray-500 dark:text-gray-400">Backend (mollendo-api)</p>
          <div className="mt-2">
            {comprobando ? <ComprobandoBadge /> : <EstadoBadge ok={!error && !!estado} />}
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
            {comprobando ? <ComprobandoBadge /> : <EstadoBadge ok={estado?.baseDeDatos.estado === "up"} />}
          </div>
          {estado && <p className="mt-2 text-xs text-gray-400">Latencia: {estado.baseDeDatos.latenciaMs} ms</p>}
        </StatusCard>

        <StatusCard icon={<LockIcon className="text-gray-800 size-6 dark:text-white/90" />}>
          <p className="text-sm text-gray-500 dark:text-gray-400">Clave de equipos físicos</p>
          <div className="mt-2">
            {comprobando ? (
              <ComprobandoBadge />
            ) : (
              <ConfiguradoBadge ok={!!estado?.integraciones.claveEquiposConfigurada} />
            )}
          </div>
          <p className="mt-2 text-xs text-gray-400">Para las rutas de ingreso y salida (X-API-Key)</p>
          {estado &&
            (estado.integraciones.terminalesPermitidos.length > 0 ? (
              <p className="mt-1 text-xs text-gray-400">
                Terminal facial: solo {estado.integraciones.terminalesPermitidos.join(", ")}
              </p>
            ) : (
              <p className="mt-1 text-xs text-warning-600 dark:text-orange-400">
                Terminal facial: acepta cualquier número de serie (falta G4PRO_SN_PERMITIDOS)
              </p>
            ))}
        </StatusCard>

        <StatusCard icon={<FolderIcon className="text-gray-800 size-6 dark:text-white/90" />}>
          <p className="text-sm text-gray-500 dark:text-gray-400">Respaldos</p>
          <RespaldosEstado comprobando={comprobando} respaldos={estado?.respaldos} ahora={estado?.api.fecha} />
        </StatusCard>
      </div>

      <TituloSeccion>Equipos de acceso</TituloSeccion>
      <div className={`mb-4 grid grid-cols-1 gap-4 @lg:grid-cols-2 ${columnasEquipos}`}>
        {estado?.controladorGarita?.remoto && (
          <StatusCard icon={<BoxIcon className="text-gray-800 size-6 dark:text-white/90" />}>
            <p className="text-sm text-gray-500 dark:text-gray-400">Controlador</p>
            <ControladorGaritaEstado comprobando={comprobando} controlador={estado.controladorGarita} />
          </StatusCard>
        )}
        <StatusCard icon={<PlugInIcon className="text-gray-800 size-6 dark:text-white/90" />}>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {(estado?.equipos.total ?? 1) > 1 ? "Equipos" : "Equipo"} (G4 Pro)
          </p>
          <EquiposEstado comprobando={comprobando} equipos={estado?.equipos} sincronizacion={estado?.sincronizacionG4} />
        </StatusCard>

        <StatusCard icon={<DocsIcon className="text-gray-800 size-6 dark:text-white/90" />}>
          <p className="text-sm text-gray-500 dark:text-gray-400">Lectores de DNI</p>
          <LectoresDniEstado comprobando={comprobando} lectoresDni={estado?.lectoresDni} />
        </StatusCard>

        <StatusCard icon={<BoltIcon className="text-gray-800 size-6 dark:text-white/90" />}>
          <p className="text-sm text-gray-500 dark:text-gray-400">Relés de molinetes</p>
          <ReleEstado comprobando={comprobando} rele={estado?.releMolinetes} />
        </StatusCard>

        {hayAvisos && (
          <StatusCard icon={<BellIcon className="text-gray-800 size-6 dark:text-white/90" />}>
            <p className="text-sm text-gray-500 dark:text-gray-400">Relés de aviso</p>
            <ReleEstado comprobando={comprobando} rele={estado?.releMolinetes} avisos />
          </StatusCard>
        )}
      </div>

      {error && (
        <ErrorBanner className="mb-6">
          No se pudo contactar al backend — verifique que mollendo-api esté corriendo.
        </ErrorBanner>
      )}

      <SincronizacionG4 estado={estado?.sincronizacionG4} onTerminada={() => setVersion((v) => v + 1)} />

      <OrdenIngreso />

      <TarjetaMonitorG4 />

      <TituloSeccion>APIs</TituloSeccion>
      <Tarjeta className="mb-6">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Documentación de la API (Swagger)</h2>
          {estado && !estado.api.swagger ? (
            <span className="text-right text-xs text-gray-400">Desactivada en este servidor por seguridad</span>
          ) : (
            <a
              href={DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Abrir en pestaña nueva ↗
            </a>
          )}
        </div>
      </Tarjeta>

      <ListaApis
        backendUp={!error && !!estado}
        claveConfigurada={!!estado?.integraciones.claveEquiposConfigurada}
        comprobando={comprobando}
      />
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
