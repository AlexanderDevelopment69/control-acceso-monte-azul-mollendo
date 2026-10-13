import React from "react";
import type {
  EstadoControladorGarita,
  EstadoDispositivo,
  EstadoLectorDni,
  EstadoReleUsb,
  EstadoRespaldos,
  EstadoSincronizacionG4,
  EstadoSistema,
  ResultadoSincronizacionG4,
} from "@/lib/api/types";
import Badge from "@/components/ui/badge/Badge";
import { Activo, ComprobandoBadge, Falla } from "./Insignias";

// Más de 26 horas sin respaldo automático: alguno falló (se hace uno por día). Igual que los avisos (mollendo-api/src/panel/avisos-sistema.ts).
const RESPALDO_ATRASADO_MS = 26 * 60 * 60 * 1000;

function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Último respaldo automático, con aviso si está atrasado (según la hora del servidor, `ahora`). */
export function RespaldosEstado({
  comprobando,
  respaldos,
  ahora,
}: {
  comprobando: boolean;
  respaldos?: EstadoRespaldos;
  ahora?: string;
}) {
  if (comprobando) {
    return (
      <div className="mt-2">
        <ComprobandoBadge />
      </div>
    );
  }
  if (!respaldos?.disponible) {
    return (
      <>
        <div className="mt-2">
          <Badge color="light">Sin información</Badge>
        </div>
        <p className="mt-2 text-xs text-gray-400">Solo se ven en el servidor (mini PC).</p>
      </>
    );
  }
  const ultimo = respaldos.ultimoAutomatico;
  const atrasado =
    !ultimo || !ahora || new Date(ahora).getTime() - new Date(ultimo.fecha).getTime() > RESPALDO_ATRASADO_MS;
  return (
    <>
      <div className="mt-2">
        {atrasado ? <Falla>Atrasado</Falla> : <Badge color="success">Al día</Badge>}
      </div>
      <p className="mt-2 text-xs text-gray-400">
        {ultimo
          ? `Último: ${new Date(ultimo.fecha).toLocaleString("es-PE")} · ${formatearTamano(ultimo.tamanoBytes)}`
          : "Todavía no hay respaldos automáticos."}
        {" "}· Diario a las 00:00, se guardan 14 días
      </p>
    </>
  );
}

/** Si un equipo se ve conectado o no (ver push-sdk/push-sdk.service.ts: 2 min sin /iclock/getrequest = desconectado). */
export function EquiposEstado({
  comprobando,
  equipos,
  sincronizacion,
}: {
  comprobando: boolean;
  equipos?: EstadoSistema["equipos"];
  sincronizacion?: EstadoSincronizacionG4;
}) {
  if (comprobando) {
    return (
      <div className="mt-2">
        <ComprobandoBadge />
      </div>
    );
  }
  if (!equipos || equipos.total === 0) {
    return (
      <>
        <div className="mt-2">
          <Badge color="light">Sin equipos</Badge>
        </div>
        <p className="mt-2 text-xs text-gray-400">Ningún equipo se ha conectado todavía.</p>
      </>
    );
  }
  const ultimaVez = (d: EstadoDispositivo) =>
    d.ultimaActividad
      ? `últ. vez ${new Date(d.ultimaActividad).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })}`
      : "nunca conectado";
  return (
    <div className="mt-2 space-y-3">
      {equipos.dispositivos.map((d) => (
        <div key={d.serialNumber}>
          {d.enLinea ? <Activo>En línea</Activo> : <Falla>Desconectado</Falla>}
          <p className="mt-1 text-xs text-gray-400">
            {d.serialNumber}
            {!d.enLinea && ` · ${ultimaVez(d)}`}
          </p>
          <ContenidoEquipo
            datos={sincronizacion?.ultima?.porEquipo.find((e) => e.serialNumber === d.serialNumber)}
            fecha={sincronizacion?.ultima?.fecha}
          />
        </div>
      ))}
    </div>
  );
}

/** "1 persona" / "3 personas". */
export const personas = (n: number) => `${n} ${n === 1 ? "persona" : "personas"}`;

/** Usuarios y rostros del equipo según la última sincronización (no se consulta en cada verificación). */
function ContenidoEquipo({
  datos,
  fecha,
}: {
  datos?: ResultadoSincronizacionG4["porEquipo"][number];
  fecha?: string;
}) {
  if (!datos || !fecha) {
    return <p className="mt-1 text-xs text-gray-400">Usuarios: sin datos (sincroniza para verlos)</p>;
  }
  return (
    <>
      <p className="mt-1 text-xs text-gray-400">
        {datos.usuarios} {datos.usuarios === 1 ? "persona registrada" : "personas registradas"} en el equipo ·{" "}
        {datos.conRostro} con rostro · revisado el{" "}
        {new Date(fecha).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })}
      </p>
      {datos.sinRostro.length > 0 && (
        <p className="mt-1 text-xs text-brand-500 dark:text-brand-400">
          Sin rostro: {personas(datos.sinRostro.length)} (el equipo no puede reconocerlas)
        </p>
      )}
    </>
  );
}

/** Lectores de DNI: por RS232 en la mini PC, no por red. Configurado, cable de datos conectado (puerto abierto) y la hora de la última lectura: el lector no avisa si está encendido, solo envía cuando lee un DNI. */
export function LectoresDniEstado({
  comprobando,
  lectoresDni,
}: {
  comprobando: boolean;
  lectoresDni?: EstadoSistema["lectoresDni"];
}) {
  if (comprobando) {
    return (
      <div className="mt-2">
        <ComprobandoBadge />
      </div>
    );
  }
  const filas = [
    { etiqueta: "Ingreso", lector: lectoresDni?.ingreso },
    { etiqueta: "Salida", lector: lectoresDni?.salida },
  ];
  const ultimaLectura = (lector?: EstadoLectorDni) =>
    lector?.ultimaLectura
      ? `últ. lectura ${new Date(lector.ultimaLectura).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })}`
      : "sin lecturas";
  return (
    <div className="mt-2 space-y-3">
      {filas.map(({ etiqueta, lector }) => (
        <div key={etiqueta}>
          {!lector?.configurado ? (
            <Badge color="light">Sin configurar</Badge>
          ) : lector.error === "Controlador desconectado" ? (
            <Falla>Desconectado</Falla>
          ) : lector.conectado ? (
            <Activo>Cable conectado</Activo>
          ) : (
            <Falla>Cable desconectado</Falla>
          )}
          <p className="mt-1 text-xs text-gray-400">
            {etiqueta}
            {lector?.configurado && ` · ${ultimaLectura(lector)}`}
          </p>
        </div>
      ))}
    </div>
  );
}

/** Controlador (mini PC en la garita conectada al servidor en la nube). */
export function ControladorGaritaEstado({ comprobando, controlador }: { comprobando: boolean; controlador?: EstadoControladorGarita }) {
  if (comprobando) {
    return (
      <div className="mt-2">
        <ComprobandoBadge />
      </div>
    );
  }
  const hora = (iso: string) => new Date(iso).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
  return (
    <>
      <div className="mt-2">
        {controlador?.conectado ? <Activo>Conectado</Activo> : <Falla>Desconectado</Falla>}
      </div>
      <p className="mt-2 text-xs text-gray-400">
        {controlador?.conectado && controlador.desde ? `Desde ${hora(controlador.desde)}` : "Sin conexión: nadie puede ingresar; se puede salir con la lista del personal guardada"}
      </p>
      {controlador?.estado && (
        <p className="mt-1 text-xs text-gray-400">
          Personal guardado para salir sin internet: {controlador.estado.listaPersonal.personas}
          {controlador.estado.salidasPendientes > 0 && ` · ${controlador.estado.salidasPendientes} salidas sin conexión por enviar`}
        </p>
      )}
    </>
  );
}

/** Relés USB de los molinetes (un módulo por molinete): conectado o no y la última apertura. */
export function ReleEstado({ comprobando, rele, avisos = false }: { comprobando: boolean; rele?: EstadoReleUsb; avisos?: boolean }) {
  if (comprobando) {
    return (
      <div className="mt-2">
        <ComprobandoBadge />
      </div>
    );
  }
  // Molinetes, o los relés de aviso (contacto seco en cada ingreso o salida denegados; solo los configurados).
  const filas = avisos
    ? [
        ...(rele?.avisoIngreso ? [{ etiqueta: "Ingreso denegado", r: rele.avisoIngreso }] : []),
        ...(rele?.avisoSalida ? [{ etiqueta: "Salida denegada", r: rele.avisoSalida }] : []),
      ]
    : [
        { etiqueta: "Ingreso", r: rele?.ingreso },
        { etiqueta: "Salida", r: rele?.salida },
      ];
  if (filas.length === 0) {
    return <p className="mt-2 text-xs text-gray-400">Sin relés de aviso configurados en el controlador.</p>;
  }
  return (
    <div className="mt-2 space-y-3">
      {filas.map(({ etiqueta, r }) => (
        <div key={etiqueta}>
          {r?.error === "Controlador desconectado" ? (
            <Falla>Desconectado</Falla>
          ) : r?.conectado ? (
            <Activo>Conectado</Activo>
          ) : (
            <Falla>No conectado</Falla>
          )}
          <p className="mt-1 text-xs text-gray-400">
            {etiqueta}
            {r?.serie && ` · módulo ${r.serie}`}
            {r?.conectado &&
              ` · ${r.ultimoPulso ? `${avisos ? "últ. aviso" : "últ. apertura"} ${new Date(r.ultimoPulso).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })}` : avisos ? "sin avisos" : "sin aperturas"}`}
          </p>
        </div>
      ))}
    </div>
  );
}

export function StatusCard({ icon, children, className = "" }: { icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 ${className}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
        {icon}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

/** Título de cada grupo de tarjetas. */
export function TituloSeccion({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">{children}</h2>;
}
