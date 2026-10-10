"use client";

import React, { useEffect, useState } from "react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { integracionesApi, panelApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
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
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { PageHeader } from "@/components/common/PageHeader";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { BellIcon, BoltIcon, BoxCubeIcon, BoxIcon, CheckCircleIcon, ChevronDownIcon, DocsIcon, FolderIcon, LockIcon, PlugInIcon } from "@/icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
const DOCS_URL = `${API_URL.replace(/\/api\/v1\/?$/, "")}/api/docs`;

interface ApiIntegracion {
  nombre: string;
  endpoint: string;
  metodo: "POST" | "GET" | "RS232" | "USB";
  descripcion: string;
  autenticacion: string;
  /** real: funciona hoy · mock: simulado (solo queda en el log) · pendiente: por programar. */
  tipo: "real" | "mock" | "pendiente";
  headers: string[];
  ejemploRequest: string;
  ejemploRespuesta: string;
  notas: string;
}

const APIS_INTEGRACION: ApiIntegracion[] = [
  {
    nombre: "Terminal ZKTeco G4 Pro + alcoholímetro (protocolo PUSH de control de acceso)",
    endpoint: "/iclock/registry · /iclock/push · /iclock/getrequest · /iclock/devicecmd · /iclock/cdata · /iclock/querydata",
    metodo: "POST",
    descripcion:
      "El G4 Pro se conecta directo a la mini PC con el protocolo PUSH del fabricante, en su variante de control de acceso (ACC). Por ahí recibe las personas (user, con el DNI como número de usuario), su nombre (extuser), su foto (biophoto, que el equipo convierte en el rostro que reconoce) y el permiso de paso mientras esperan su ingreso (userauthorize). Envía cada verificación (rostro + alcohol, table=rtlog), el estado del sensor y del relé (table=rtstate) y las respuestas a las consultas (querydata).",
    autenticacion: "Ninguna (el equipo no manda ningún token) — las rutas /iclock/* no llevan X-API-Key",
    tipo: "real",
    headers: ["El equipo no manda Content-Type reconocible; el servidor siempre lee el cuerpo como texto plano"],
    ejemploRequest: `// El equipo se registra una vez y abre sesión:
POST /iclock/registry?SN=HSR3263100192
POST /iclock/push?SN=HSR3263100192

// Órdenes que la mini PC le deja (las recoge al consultar /iclock/getrequest; campos separados por tabulador):
DATA UPDATE user CardNo=\tPin=12345678\tPassword=\tGroup=0\tStartTime=0\tEndTime=0\tName=Juan Pérez\tPrivilege=0
DATA UPDATE extuser Pin=12345678\tFunSwitch=0\tFirstName=Juan\tLastName=Pérez\tPersonalVs=0
DATA UPDATE biophoto PIN=12345678\tType=9\tSize=…\tContent=<foto JPG ≤ 20 KB en base64>\tFormat=0\tUrl=\tPostBackTmpFlag=0
DATA UPDATE userauthorize Pin=12345678\tAuthorizeTimezoneId=1\tAuthorizeDoorId=1   // habilitar
DATA DELETE userauthorize Pin=12345678\tAuthorizeDoorId=1                           // deshabilitar`,
    ejemploRespuesta: `// El servidor responde al registro:
RegistryCode=d6b7cbaab9   // estable, mismo código para el mismo equipo siempre

// Cada verificación (table=rtlog):
POST /iclock/cdata?SN=HSR3263100192&table=rtlog
time=2026-10-04 04:02:41\tpin=0\tevent=0\tverifytype=15\tConcentration=0\t...         // permitido
time=2026-10-04 04:00:37\tpin=12345678\tevent=23\tverifytype=15\tConcentration=0\t... // sin permiso`,
    notas:
      "Probado con el equipo real HSR3263100192 (04/oct/2026). Los comandos de asistencia (USERINFO) no sirven en este equipo: los rechaza con -629. event=0: permitido (llega con pin=0, el firmware no dice quién; como se habilita a una sola persona a la vez, solo puede ser la que está en su turno). event=1: alcohol sobre el umbral del equipo. event=23: rostro reconocido sin permiso, con su DNI. event=27: rostro, huella o tarjeta no registrados. El valor de alcohol no se envía (Concentration=0): el umbral se configura en el propio G4 Pro. RegistryCode y /iclock/push no están en los manuales de ZKTeco, pero sin ellos el equipo no envía datos.",
  },
  {
    nombre: "Lectores de DNI (Syble XB-7705H)",
    endpoint: "Puerto serie del adaptador USB-RS232 (/dev/serial/by-id/…)",
    metodo: "RS232",
    descripcion:
      "Cada lector lee el código de barras del reverso del DNI y envía el número por RS232 (115200 baudios, 8N1). El backend lee el puerto y registra el ingreso o la salida según el adaptador por el que llegó (igual que POST /eventos-acceso/ingreso|salida).",
    autenticacion: "No aplica (lectura local del puerto)",
    tipo: "real",
    headers: ["LECTOR_DNI_INGRESO_DISPOSITIVO / LECTOR_DNI_SALIDA_DISPOSITIVO en .env (ruta fija del adaptador)"],
    ejemploRequest: `// Lo que envía el lector al pasar un DNI:
48058719\\r\\n`,
    ejemploRespuesta: `// Registro del backend:
Lector de DNI de ingreso conectado en /dev-servidor/serial/by-id/usb-Prolific…-port0 (115200 baudios)
DNI leído en ingreso: pendiente_verificacion`,
    notas:
      "El lector viene en modo USB: se configura con el folleto de la caja (Factory Default → RS232 → 115200). Se ignora la misma lectura dentro de 3 s; si el adaptador se desconecta, se reintenta cada 5 s. El estado (Cable conectado / desconectado) corresponde al cable de datos, no a la energía del lector.",
  },
  {
    nombre: "Ingreso",
    endpoint: "/eventos-acceso/ingreso",
    metodo: "POST",
    descripcion:
      "Fase 1: solo el DNI (lo usan los lectores; también se puede llamar con la clave de equipo). Si la persona no está registrada, está de baja, no tiene documentos o tiene alguno vencido, se deniega aquí mismo. Si está en regla, queda \"en espera\": se la habilita en el G4 Pro por 1 minuto (o queda en cola si otra persona está en su turno; se habilita a una a la vez). El resultado llega del G4 Pro (table=rtlog): permitido → ingreso autorizado y relé de ingreso; sin resultado en 1 minuto → denegado \"No completó rostro y alcohol\".",
    autenticacion: "Clave de equipo (X-API-Key)",
    tipo: "real",
    headers: ["Content-Type: application/json", "X-API-Key: <DEVICE_API_KEY>"],
    ejemploRequest: `{
  "tipoDocumentoIdentidad": "DNI",
  "numeroDocumento": "12345678",
  "torniqueteId": "Ingreso"
}`,
    ejemploRespuesta: `// 201 Created — documentos en regla, esperando el resultado del equipo
{
  "estado": "pendiente_verificacion",
  "persona": { "id": 1, "nombres": "Juan", "apellidos": "Pérez" },
  "numeroDocumento": "12345678",
  "mensaje": "Documentos en regla. Esperando el resultado del equipo (rostro + alcoholímetro)."
}

// 201 Created — denegado de inmediato (documentos, baja)
{
  "eventoId": 43,
  "tipoMovimiento": "ingreso",
  "resultado": "denegado",
  "persona": { "id": 2, "nombres": "Ana", "apellidos": "Torres" },
  "numeroDocumento": "87654321",
  "motivos": { "dadoDeBaja": false, "sinDocumentos": false, "documentos": true, "documentosVencidos": ["SCTR"] }
}

// 201 Created — documento no registrado (queda en el historial sin persona)
{ "eventoId": 45, "resultado": "denegado", "persona": null, "numeroDocumento": "99999999", "motivos": { "personaNoRegistrada": true } }

// 401 — X-API-Key inválida o ausente`,
    notas:
      "Si la misma persona vuelve a pasar el DNI mientras espera, mantiene su lugar. En cola puede esperar hasta 3 minutos. Las esperas vencidas se revisan cada 5 segundos. event=1 del G4 Pro: denegado por alcohol (confirmado). Cualquier otro código desconocido también se deniega por alcohol: ante la duda, no se abre.",
  },
  {
    nombre: "Salida",
    endpoint: "/eventos-acceso/salida",
    metodo: "POST",
    descripcion:
      "Registro de salida: con un documento registrado (aunque la persona esté dada de baja o tenga documentos vencidos) se autoriza y se activa el relé de salida.",
    autenticacion: "Clave de equipo (X-API-Key)",
    tipo: "real",
    headers: ["Content-Type: application/json", "X-API-Key: <DEVICE_API_KEY>"],
    ejemploRequest: `{
  "tipoDocumentoIdentidad": "DNI",
  "numeroDocumento": "12345678",
  "torniqueteId": "Salida"
}`,
    ejemploRespuesta: `// 201 Created — autorizado
{
  "eventoId": 44,
  "tipoMovimiento": "salida",
  "resultado": "autorizado",
  "persona": { "id": 1, "nombres": "Juan", "apellidos": "Pérez" },
  "numeroDocumento": "12345678",
  "motivos": {}
}

// 201 Created — documento no registrado: no se abre y queda en el historial
{ "eventoId": 46, "resultado": "denegado", "persona": null, "numeroDocumento": "99999999", "motivos": { "personaNoRegistrada": true } }`,
    notas:
      "Sin antipassback (alcance base): no se exige un ingreso previo ni se bloquea un segundo ingreso sin salida. Solo se deniega si el documento no está registrado.",
  },
  {
    nombre: "Ingresos en espera (Panel de vigilancia)",
    endpoint: "/eventos-acceso/en-espera",
    metodo: "GET",
    descripcion:
      "DNI en regla que esperan el rostro y el alcohol del G4 Pro (en su turno o en cola), para mostrarlos en el Panel. En tiempo real se avisan por WebSocket (/ws/eventos): ingreso-en-espera y ingreso-espera-terminada.",
    autenticacion: "JWT (Administrador / Vigilancia)",
    tipo: "real",
    headers: ["Authorization: Bearer <token>"],
    ejemploRequest: `GET /eventos-acceso/en-espera`,
    ejemploRespuesta: `// 200 OK
[{
  "id": 12, "personaId": 41, "nombres": "Juan", "apellidos": "Pérez", "numeroDocumento": "12345678",
  "empresa": "Empresa S.A.C.", "tieneFoto": true, "torniqueteId": "Ingreso",
  "desde": "2026-10-04T09:02:19.000Z", "hasta": "2026-10-04T09:03:19.000Z", "enCola": false
}]`,
    notas: "enCola = true: otra persona está en su turno; entonces hasta es null y no corre el minuto todavía.",
  },
  {
    nombre: "Comando molinete (relés USB)",
    endpoint: "/integraciones/torniquete/comando",
    metodo: "POST",
    descripcion:
      "Abre un molinete con un pulso de 1 segundo en su relé (módulos USB DCTTECH, uno por molinete). El backend lo hace solo en cada salida autorizada y en cada ingreso que el G4 Pro aprueba; también se puede llamar a mano para probar un relé.",
    autenticacion: "JWT (Administrador / Vigilancia)",
    tipo: "real",
    headers: ["Content-Type: application/json", "Authorization: Bearer <token>"],
    ejemploRequest: `{
  "torniqueteId": "ingreso",
  "comando": "abrir"
}`,
    ejemploRespuesta: `// 200 OK — relé activado (false si el módulo no está conectado)
{ "enviado": true }`,
    notas:
      "torniqueteId: \"ingreso\" o \"salida\". Cada molinete usa el módulo con su número de serie (RELE_INGRESO_SERIE / RELE_SALIDA_SERIE en .env). \"cerrar\" no hace nada: el molinete se cierra solo después del paso.",
  },
  {
    nombre: "Registro de personas y rostros en el G4 Pro (saliente)",
    endpoint: "/personas · /personas/:id/foto · /integraciones/g4pro/sincronizar",
    metodo: "POST",
    descripcion:
      "Al registrar o editar a una persona, el backend la carga en el G4 Pro con su DNI y su nombre, sin permiso de paso. Al subir su foto, se la envía convertida (JPG ≤ 20 KB) y el equipo la convierte en el rostro que reconoce: no hace falta registrar rostros a mano en el equipo. POST /integraciones/g4pro/sincronizar (solo Administrador; también todos los días a medianoche) deja el equipo igual al sistema: borra a quien el sistema no conoce (registrados a mano en el equipo), quita permisos de paso sueltos y registra con foto al personal activo que falta. Con ?simular=true solo informa qué haría. También desde la tarjeta \"Sincronización con el G4 Pro\" de esta página.",
    autenticacion: "JWT (Administrador)",
    tipo: "real",
    headers: ["Authorization: Bearer <token>", "Content-Type: multipart/form-data (para la foto)"],
    ejemploRequest: `// Foto de la persona (multipart/form-data)
foto: <archivo JPG, PNG o WEBP, máximo 5 MB>

// Sincronizar a todo el personal
POST /integraciones/g4pro/sincronizar`,
    ejemploRespuesta: `// Registro del backend:
Persona 12345678 encolada para 1 equipo(s), con foto

// POST /integraciones/g4pro/sincronizar → 201
{ "simulacion": false, "equipos": 1, "agregadas": 16, "borradas": 1, "permisosQuitados": 1, "usuariosABorrar": ["777"] }`,
    notas:
      "Se registran con su número de documento (DNI, carné de extranjería o pasaporte: el equipo acepta letras, hasta 24 caracteres); los lectores, por ahora, solo reconocen el DNI. Si se cambia el número de documento, se borra el usuario anterior del equipo. La foto debe ser de frente, con buena luz y el rostro centrado. Vigilancia puede ver la foto (GET /personas/:id/foto) pero no subirla.",
  },
];

/** Mientras llega la primera respuesta del backend no se sabe el estado. */
function ComprobandoBadge() {
  return <Badge color="light">Comprobando…</Badge>;
}

function EstadoBadge({ ok }: { ok: boolean }) {
  return <Badge color={ok ? "success" : "error"}>{ok ? "En línea" : "Sin conexión"}</Badge>;
}

function ConfiguradoBadge({ ok }: { ok: boolean }) {
  return <Badge color={ok ? "success" : "warning"}>{ok ? "Configurado" : "No configurado"}</Badge>;
}

// Más de 26 horas sin respaldo automático: alguno falló (se hace uno por día). Igual que los avisos (mollendo-api/src/panel/avisos-sistema.ts).
const RESPALDO_ATRASADO_MS = 26 * 60 * 60 * 1000;


function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Último respaldo automático, con aviso si está atrasado (según la hora del servidor, `ahora`). */
function RespaldosEstado({
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
        <Badge color={atrasado ? "error" : "success"}>{atrasado ? "Atrasado" : "Al día"}</Badge>
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
function EquiposEstado({
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
          <Badge color={d.enLinea ? "success" : "error"}>{d.enLinea ? "En línea" : "Desconectado"}</Badge>
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
const personas = (n: number) => `${n} ${n === 1 ? "persona" : "personas"}`;

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

/**
 * Sincronización con los G4 Pro: si la diaria está activa, el último resultado
 * y los botones para simularla o ejecutarla (la real pide confirmación).
 */
function SincronizacionG4({
  estado,
  onTerminada,
}: {
  estado?: EstadoSincronizacionG4;
  onTerminada: () => void;
}) {
  const [ejecutando, setEjecutando] = useState<"simular" | "sincronizar" | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [resultado, setResultado] = useState<ResultadoSincronizacionG4 | null>(null);
  const [error, setError] = useState<string | null>(null);
  // "Simulando…" y el aviso de espera solo si tarda: si responde al instante (p. ej. con el
  // equipo desconectado), aparecerían y desaparecerían de golpe y la tarjeta parpadearía.
  const [lento, setLento] = useState(false);
  // La barra de arriba se ve al menos 0,7 s, para que siempre se note que se consultó.
  const [barra, setBarra] = useState(false);
  const ultima = resultado ?? estado?.ultima ?? null;
  const ocupado = ejecutando !== null || !!estado?.enCurso;

  async function ejecutar(simular: boolean) {
    setConfirmar(false);
    setEjecutando(simular ? "simular" : "sincronizar");
    setError(null);
    const aviso = setTimeout(() => setLento(true), 500);
    const inicio = Date.now();
    setBarra(true);
    try {
      setResultado(await integracionesApi.sincronizarG4(simular));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo sincronizar con el G4 Pro");
    } finally {
      clearTimeout(aviso);
      setLento(false);
      setTimeout(() => setBarra(false), Math.max(0, 700 - (Date.now() - inicio)));
      setEjecutando(null);
      onTerminada();
    }
  }

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Barra arriba mientras se consulta al equipo: superpuesta, no mueve la tarjeta. */}
      <div
        aria-hidden
        className={`absolute inset-x-0 top-0 h-1 overflow-hidden bg-brand-100 transition-opacity duration-300 dark:bg-brand-500/20 ${barra ? "opacity-100" : "opacity-0"}`}
      >
        <div className="h-full w-2/5 animate-barra-carga rounded-full bg-brand-500" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sincronización con el G4 Pro</h2>
          <p className="mt-1 text-xs text-gray-400">
            Deja el terminal igual al sistema: borra a quien no está registrado (por ejemplo, registrado a mano en el
            equipo), quita permisos de paso sueltos y registra con foto al personal activo que falte.
          </p>
          <div className="mt-2">
            {!estado ? (
              <ComprobandoBadge />
            ) : estado.diaria.activa ? (
              <Badge color="success">Diaria activa · {String(estado.diaria.hora).padStart(2, "0")}:00</Badge>
            ) : (
              <Badge color="primary">Diaria desactivada</Badge>
            )}
            {estado?.enCurso && !ejecutando && (
              <span className="ml-2">
                <Badge color="info">En curso…</Badge>
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="outline" size="sm" disabled={ocupado} onClick={() => void ejecutar(true)}>
            {lento && ejecutando === "simular" ? "Simulando…" : "Simular"}
          </Button>
          <Button type="button" size="sm" disabled={ocupado} onClick={() => setConfirmar(true)}>
            {lento && ejecutando === "sincronizar" ? "Sincronizando…" : "Sincronizar ahora"}
          </Button>
        </div>
      </div>

      {lento && ejecutando && (
        <p className="mt-3 text-xs text-gray-400">Consultando al equipo; puede tardar hasta un minuto.</p>
      )}
      {error && <ErrorBanner className="mt-3">{error}</ErrorBanner>}

      {ultima && (
        <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-sm dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Última: {new Date(ultima.fecha).toLocaleString("es-PE")} · {ultima.origen === "diaria" ? "diaria" : "manual"}
            {ultima.simulacion && " · simulación (no se cambió nada)"}
          </p>
          {ultima.error ? (
            <p className="mt-1 text-error-600 dark:text-error-400">Falló: {ultima.error}</p>
          ) : (
            <>
              <p className="mt-1 text-gray-700 dark:text-gray-300">
                {ultima.simulacion ? "Agregaría" : "Agregadas"}: <strong>{ultima.agregadas}</strong> ·{" "}
                {ultima.simulacion ? "Borraría" : "Borrados"}: <strong>{ultima.borradas}</strong> ·{" "}
                {ultima.simulacion ? "Permisos a quitar" : "Permisos quitados"}: <strong>{ultima.permisosQuitados}</strong>
              </p>
              {ultima.usuariosABorrar.length > 0 && (
                <p className="mt-1 text-xs text-brand-500 dark:text-brand-400">
                  En el equipo pero no registradas en el sistema: {personas(ultima.usuariosABorrar.length)}{" "}
                  (probablemente creadas a mano en el equipo)
                </p>
              )}
              {ultima.equiposSinRespuesta > 0 && (
                <p className="mt-1 text-xs text-error-600 dark:text-error-400">
                  {ultima.equiposSinRespuesta} equipo(s) no respondieron.
                </p>
              )}
            </>
          )}
        </div>
      )}

      <Modal isOpen={confirmar} onClose={() => setConfirmar(false)} className="max-w-md p-6 sm:p-8">
        <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">Sincronizar con el G4 Pro</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Se <strong>borrarán del terminal</strong> los usuarios que el sistema no conoce y se registrará con su foto al
          personal activo que falte. Conviene usar antes <strong>“Simular”</strong> para ver qué cambiará.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setConfirmar(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => void ejecutar(false)}>
            Sincronizar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

/** Lectores de DNI: por RS232 en la mini PC, no por red. Configurado, cable de datos conectado (puerto abierto) y la hora de la última lectura: el lector no avisa si está encendido, solo envía cuando lee un DNI. */
function LectoresDniEstado({
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
            <Badge color="error">Desconectado</Badge>
          ) : lector.conectado ? (
            <Badge color="success">Cable conectado</Badge>
          ) : (
            <Badge color="error">Cable desconectado</Badge>
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
function ControladorGaritaEstado({ comprobando, controlador }: { comprobando: boolean; controlador?: EstadoControladorGarita }) {
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
        <Badge color={controlador?.conectado ? "success" : "error"}>{controlador?.conectado ? "Conectado" : "Desconectado"}</Badge>
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
function ReleEstado({ comprobando, rele, avisos = false }: { comprobando: boolean; rele?: EstadoReleUsb; avisos?: boolean }) {
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
            <Badge color="error">Desconectado</Badge>
          ) : (
            <Badge color={r?.conectado ? "success" : "error"}>{r?.conectado ? "Conectado" : "No conectado"}</Badge>
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

function StatusCard({ icon, children, className = "" }: { icon: React.ReactNode; children: React.ReactNode; className?: string }) {
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
function TituloSeccion({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">{children}</h2>;
}

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
    return <Badge color="error">Sin conexión</Badge>;
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

function SistemaContent() {
  const [estado, setEstado] = useState<EstadoSistema | null>(null);
  const [error, setError] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  const comprobando = !estado && !error;
  // Equipos de acceso: tarjetas del mismo ancho, tantas por fila como haya (controlador y relés de aviso son opcionales).
  // Con controlador, la tarjeta de avisos se muestra siempre (aunque esté desconectado).
  const hayAvisos = !!(estado?.controladorGarita?.remoto || estado?.releMolinetes?.avisoIngreso || estado?.releMolinetes?.avisoSalida);
  const tarjetasEquipos = 3 + (estado?.controladorGarita?.remoto ? 1 : 0) + (hayAvisos ? 1 : 0);
  const columnasEquipos = { 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5" }[tarjetasEquipos] ?? "lg:grid-cols-3";
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

      {/* Las tarjetas se agrupan: el servidor (4) y los equipos de garita (3), con la sincronización del G4 Pro debajo. */}
      <TituloSeccion>Servidor</TituloSeccion>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
        <StatusCard className="lg:col-span-3" icon={<CheckCircleIcon className="text-gray-800 size-6 dark:text-white/90" />}>
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

        <StatusCard className="lg:col-span-3" icon={<BoxCubeIcon className="text-gray-800 size-6 dark:text-white/90" />}>
          <p className="text-sm text-gray-500 dark:text-gray-400">Base de datos</p>
          <div className="mt-2">
            {comprobando ? <ComprobandoBadge /> : <EstadoBadge ok={estado?.baseDeDatos.estado === "up"} />}
          </div>
          {estado && <p className="mt-2 text-xs text-gray-400">Latencia: {estado.baseDeDatos.latenciaMs} ms</p>}
        </StatusCard>

        <StatusCard className="lg:col-span-3" icon={<LockIcon className="text-gray-800 size-6 dark:text-white/90" />}>
          <p className="text-sm text-gray-500 dark:text-gray-400">Clave de equipos físicos</p>
          <div className="mt-2">
            {comprobando ? (
              <ComprobandoBadge />
            ) : (
              <ConfiguradoBadge ok={!!estado?.integraciones.claveEquiposConfigurada} />
            )}
          </div>
          <p className="mt-2 text-xs text-gray-400">Para las rutas de ingreso y salida (X-API-Key)</p>
        </StatusCard>

        <StatusCard className="lg:col-span-3" icon={<FolderIcon className="text-gray-800 size-6 dark:text-white/90" />}>
          <p className="text-sm text-gray-500 dark:text-gray-400">Respaldos</p>
          <RespaldosEstado comprobando={comprobando} respaldos={estado?.respaldos} ahora={estado?.api.fecha} />
        </StatusCard>
      </div>

      <TituloSeccion>Equipos de acceso</TituloSeccion>
      <div className={`mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 ${columnasEquipos}`}>
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
          No se pudo contactar al backend — verifica que mollendo-api esté corriendo.
        </ErrorBanner>
      )}

      <SincronizacionG4 estado={estado?.sincronizacionG4} onTerminada={() => setVersion((v) => v + 1)} />

      <TituloSeccion>APIs</TituloSeccion>
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
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">APIs de integración (terminal facial ZKTeco con alcoholímetro, lectores de DNI y relés de los molinetes)</h2>
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
                  comprobando={comprobando}
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
