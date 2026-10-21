"use client";

// Figuras del manual: las cuentas del sistema y el recorrido de ingreso y salida.
import React, { useEffect, useState } from "react";
import { eventosAccesoApi } from "@/lib/api/endpoints";

type PropsIcono = { className?: string };
const trazo = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;
function IconoDni({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="11" r="2" />
      <path d="M5.5 16c.6-1.5 1.7-2.2 3-2.2s2.4.7 3 2.2M14 10h4M14 13.5h3" />
    </svg>
  );
}
function IconoDocumentos({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <path d="M14 3H7.5A1.5 1.5 0 0 0 6 4.5v15A1.5 1.5 0 0 0 7.5 21h9a1.5 1.5 0 0 0 1.5-1.5V7z" />
      <path d="M14 3v4h4M9 14l2 2 4-4" />
    </svg>
  );
}
function IconoRostro({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
      <path d="M9 10v1M15 10v1M12 10v3h-1M9.5 15.5c1.4 1 3.6 1 5 0" />
    </svg>
  );
}
function IconoAlcohol({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <path d="M3 8h10.5a2.5 2.5 0 1 0-2.5-2.5M3 12h15.5a2.5 2.5 0 1 1-2.5 2.5M3 16h7" />
    </svg>
  );
}
function IconoMolinete({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <path d="M5 21V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v16M3 21h9" />
      <path d="M10 10h9M16 7l3 3-3 3" />
    </svg>
  );
}
function IconoRegistrado({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <circle cx="10" cy="8" r="3.5" />
      <path d="M3.5 19.5c.9-3 3.4-4.5 6.5-4.5 1.2 0 2.3.2 3.2.7M15 18l2 2 4-4" />
    </svg>
  );
}
function IconoAdministrador({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <circle cx="10" cy="8" r="3.5" />
      <path d="M3.5 19.5c.9-3 3.4-4.5 6.5-4.5" />
      <circle cx="17.5" cy="17" r="2" />
      <path d="M17.5 13.5v1.5M17.5 19v1.5M14 17h1.5M19.5 17H21" />
    </svg>
  );
}
function IconoVigilancia({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/** Las dos cuentas del sistema, cada una con lo que hace. */
export function CuentasManual() {
  const cuentas = [
    {
      titulo: "Administrador",
      Icono: IconoAdministrador,
      color: "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400",
      puntos: [
        "Registra al personal (uno por uno o con carga masiva), sus empresas y sus documentos.",
        "Ve el Dashboard y descarga Reportes en Excel o PDF.",
        "Supervisa el Panel de vigilancia, la Auditoría y el estado del sistema.",
      ],
    },
    {
      titulo: "Vigilancia",
      Icono: IconoVigilancia,
      color: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
      puntos: [
        "Ve en tiempo real cada ingreso y salida por el molinete.",
        "Ve por qué se autoriza o se deniega cada uno.",
        "Recibe el aviso cuando se cae un equipo, corrige ingresos o salidas sin marcar y activa la verificación manual si falla el terminal facial.",
      ],
    },
  ];
  return (
    <div className="my-2 grid gap-3 sm:grid-cols-2">
      {cuentas.map(({ titulo, Icono, color, puntos }) => (
        <div key={titulo} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <div className="mb-3 flex items-center gap-3">
            <span className={`flex size-10 items-center justify-center rounded-xl ${color}`}>
              <Icono className="size-5" />
            </span>
            <p className="font-semibold text-gray-800 dark:text-white/90">{titulo}</p>
          </div>
          <ul className="space-y-1.5">
            {puntos.map((punto) => (
              <li key={punto} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" aria-hidden />
                <span>{punto}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Un paso del recorrido: ícono con su número, qué pasa y dónde. */
function Paso({
  n,
  titulo,
  detalle,
  Icono,
  tiempo,
  final = false,
  exito = false,
}: {
  n: number;
  titulo: string;
  detalle: string;
  /** Cuánto tarda o cuánto tiempo hay (medido con el equipo real). */
  tiempo?: string;
  Icono: React.ComponentType<PropsIcono>;
  final?: boolean;
  /** El último paso (se abre el molinete), en verde. */
  exito?: boolean;
}) {
  return (
    <li className="relative flex flex-1 gap-3 md:flex-col md:items-center md:text-center">
      {!final && (
        <span
          aria-hidden
          className="absolute top-12 left-6 h-[calc(100%-2.5rem)] w-px bg-brand-200 md:top-6 md:left-[calc(50%+2rem)] md:h-px md:w-[calc(100%-4rem)] dark:bg-brand-500/30"
        />
      )}
      <span
        className={`relative z-10 flex size-12 shrink-0 items-center justify-center rounded-2xl border shadow-theme-xs ${
          exito
            ? "border-success-200 bg-success-50 text-success-600 dark:border-success-500/30 dark:bg-success-500/15 dark:text-success-500"
            : "border-brand-100 bg-white text-brand-500 dark:border-brand-500/30 dark:bg-gray-900 dark:text-brand-400"
        }`}
      >
        <Icono className="size-6" />
        <span
          className={`absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full text-[11px] font-semibold text-white ${
            exito ? "bg-success-500" : "bg-brand-500"
          }`}
        >
          {n}
        </span>
      </span>
      <span className="pb-5 md:pb-0">
        <span className="block font-medium text-gray-800 dark:text-white/90">{titulo}</span>
        <span className="block text-xs text-gray-500 dark:text-gray-400">{detalle}</span>
        {tiempo && (
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
            <svg className="size-3" viewBox="0 0 24 24" {...trazo} aria-hidden>
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7.5V12l3 2" />
            </svg>
            {tiempo}
          </span>
        )}
      </span>
    </li>
  );
}

/**
 * "Facial primero", los tiempos medidos con el equipo real (como en el flujo de
 * ingreso): 0-40 s desde el "correcto"; el aviso llega a los ~10 s y desde ahí
 * hay 30 s para el DNI. Escala: 17 px por segundo, desde x = 40.
 */
function LineaTiempoFacialPrimero() {
  const x = (s: number) => 40 + s * 17;
  const marcas = [0, 10, 20, 30, 40];
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Tiempos medidos con el equipo real</p>
      <svg
        viewBox="0 0 760 110"
        className="min-w-[560px] text-gray-400 dark:text-gray-500"
        role="img"
        aria-label="“Correcto” en 0 s, DNI hacia los 7 s, se abre a los 10 s al llegar el aviso, fin del plazo a los 40 s"
      >
        <g className="fill-current" fontSize="11" textAnchor="middle">
          {marcas.map((s) => (
            <text key={s} x={x(s)} y="14">
              {s} s
            </text>
          ))}
        </g>
        <g className="stroke-gray-200 dark:stroke-gray-800" strokeWidth="1">
          {marcas.map((s) => (
            <line key={s} x1={x(s)} y1="22" x2={x(s)} y2="96" />
          ))}
        </g>
        <rect x={x(0)} y="52" width={x(40) - x(0)} height="6" rx="3" className="fill-gray-100 dark:fill-gray-800" />
        <rect x={x(0)} y="52" width={x(10) - x(0)} height="6" rx="3" className="fill-brand-300 dark:fill-brand-500/60" />
        <rect x={x(10)} y="52" width={x(40) - x(10)} height="6" rx="3" className="fill-warning-200 dark:fill-warning-500/40" />
        <g fontSize="12.5" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200">
          <circle cx={x(0)} cy="55" r="8" className="fill-brand-500" />
          <text x={x(0)} y="84">
            “Correcto”
          </text>
          <circle cx={x(7)} cy="55" r="8" className="fill-brand-500" />
          <text x={x(7)} y="40">
            Pasa su DNI
          </text>
          <circle cx={x(10)} cy="55" r="8" className="fill-success-500" />
          <text x={x(10)} y="84">
            Se abre
          </text>
          <circle cx={x(40)} cy="55" r="8" className="fill-warning-500" />
          <text x={x(40) - 14} y="84" textAnchor="end">
            Fin del plazo
          </text>
        </g>
        <g className="fill-current" fontSize="11" textAnchor="middle">
          <text x={x(10)} y="100">
            llega el aviso del equipo
          </text>
          <text x={(x(10) + x(40)) / 2} y="40">
            30 s visibles en el Panel
          </text>
        </g>
      </svg>
      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
        Si el DNI llega antes que el aviso del equipo, el sistema lo espera unos segundos en silencio y abre cuando llega.
      </p>
    </div>
  );
}

/**
 * El recorrido de ingreso y el de salida, paso a paso. El ingreso, en el orden
 * que está activo (Sistema y APIs → Orden del ingreso): "facial primero" o el
 * normal. Mientras no se sabe (o sin respuesta), "facial primero", el que se usa.
 */
export function RecorridoAcceso() {
  const [facialPrimero, setFacialPrimero] = useState(true);
  useEffect(() => {
    let activo = true;
    eventosAccesoApi
      .modoIngreso()
      .then((m) => activo && setFacialPrimero(m.facialPrimero))
      .catch(() => {
        // Sin respuesta: queda "facial primero".
      });
    return () => {
      activo = false;
    };
  }, []);
  return (
    <div className="my-2 space-y-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5">
      <div>
        <p className="mb-4 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">Ingreso</p>
        <ol className="flex flex-col md:flex-row md:gap-2">
          {facialPrimero ? (
            <>
              <Paso n={1} Icono={IconoRostro} titulo="Muestra su rostro" detalle="el equipo facial lo reconoce" tiempo="rostro y soplido: 5 a 15 s" />
              <Paso n={2} Icono={IconoAlcohol} titulo="Sopla" detalle="en el alcoholímetro; el equipo dice “correcto”" tiempo="el Panel lo muestra en unos 10 s" />
              <Paso n={3} Icono={IconoDni} titulo="Pasa su DNI" detalle="por el lector de ingreso, en 30 segundos" tiempo="máximo 30 s desde “pase su DNI”" />
              <Paso n={4} Icono={IconoDocumentos} titulo="Se revisan sus documentos" detalle="registrado, activo y sin vencidos" tiempo="al instante" />
              <Paso n={5} Icono={IconoMolinete} titulo="Se abre el molinete" detalle="y queda en el Panel de vigilancia" tiempo="al pasar el DNI" final exito />
            </>
          ) : (
            <>
              <Paso n={1} Icono={IconoDni} titulo="Pasa su DNI" detalle="por el lector de ingreso" tiempo="al instante" />
              <Paso n={2} Icono={IconoDocumentos} titulo="Se revisan sus documentos" detalle="registrado, activo y sin vencidos" tiempo="al instante" />
              <Paso n={3} Icono={IconoRostro} titulo="Muestra su rostro" detalle="el equipo facial lo reconoce" tiempo="tiene 1 minuto desde que pasó el DNI" />
              <Paso n={4} Icono={IconoAlcohol} titulo="Sopla" detalle="en el alcoholímetro" tiempo="rostro y soplido: 5 a 15 s" />
              <Paso n={5} Icono={IconoMolinete} titulo="Se abre el molinete" detalle="y queda en el Panel de vigilancia" tiempo="unos 10 s después de soplar" final exito />
            </>
          )}
        </ol>
        {facialPrimero && (
          <>
            <p className="mt-4 text-xs text-gray-600 dark:text-gray-300">
              <b>Puede pasar el DNI apenas oye “correcto”:</b> el sistema espera el aviso del equipo facial. Si no lo pasa en los 30
              segundos, queda “No pasó su DNI a tiempo” y debe empezar otra vez.
            </p>
            <LineaTiempoFacialPrimero />
          </>
        )}
      </div>
      <div>
        <p className="mb-4 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">Salida</p>
        <ol className="flex flex-col md:flex-row md:gap-2">
          <Paso n={1} Icono={IconoDni} titulo="Pasa su DNI" detalle="por el lector de salida" tiempo="al instante" />
          <Paso n={2} Icono={IconoRegistrado} titulo="Se revisa su ingreso" detalle="registrado y con un ingreso antes; también si está de baja" tiempo="al instante" />
          <Paso n={3} Icono={IconoMolinete} titulo="Se abre el molinete" detalle="y queda en el Panel de vigilancia" tiempo="al pasar el DNI" final exito />
        </ol>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Si algo falla en cualquier paso, el molinete no se abre, suena el aviso de denegado y el Panel de vigilancia
        muestra el motivo.
      </p>
    </div>
  );
}

// También los usa el estado de ingreso de la ficha del personal.
export { IconoDni, IconoDocumentos, IconoRostro };
