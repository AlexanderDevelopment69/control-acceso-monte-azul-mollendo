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

type Tramo = { titulo: string; detalle: string; duracion: string; segundos: number; color: "azul" | "ambar" };
type Hito = { titulo: string; detalle: string; donde: "inicio" | number | "fin"; color: string };

const COLOR_TRAMO = {
  azul: "bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-200",
  ambar: "bg-warning-100 text-warning-800 dark:bg-warning-500/20 dark:text-warning-200",
};

/**
 * Los tiempos del ingreso, medidos con el equipo real, en el orden que está
 * activo: una barra por tramos (qué pasa y cuánto dura, de ancho proporcional
 * a su duración), los momentos clave debajo y un ejemplo. En el celular, los
 * tramos y los momentos van uno debajo del otro.
 */
function LineaTiempo({ facialPrimero }: { facialPrimero: boolean }) {
  const { titulo, desde, tramos, hitos, ejemplo } = facialPrimero
    ? {
        titulo: "Tiempos con Facial + Alcohol → DNI",
        desde: "Medidos con el equipo real, desde que el equipo dice “correcto”.",
        tramos: [
          { titulo: "Espera el aviso", detalle: "El equipo avisa al sistema quién sopló.", duracion: "unos 10 s", segundos: 10, color: "azul" },
          { titulo: "Tiempo para pasar el DNI", detalle: "El Panel muestra “Aprobó … pase su DNI”, con su foto.", duracion: "30 s", segundos: 30, color: "ambar" },
        ] satisfies Tramo[],
        hitos: [
          { titulo: "“Correcto”", detalle: "termina de soplar", donde: "inicio", color: "bg-brand-500" },
          { titulo: "Aparece “pase su DNI”", detalle: "a los ~10 s", donde: 25, color: "bg-warning-500" },
          { titulo: "Vence el plazo", detalle: "“No pasó su DNI a tiempo”", donde: "fin", color: "bg-error-500" },
        ] satisfies Hito[],
        ejemplo: "pasa su DNI apenas oye “correcto” (a los 7 s). El sistema lo espera y el molinete se abre a los ~10 s, cuando llega el aviso.",
      }
    : {
        titulo: "Tiempos con DNI → Facial + Alcohol",
        desde: "Medidos con el equipo real, desde que pasa su DNI.",
        tramos: [
          { titulo: "Tiempo para hacer rostro y alcohol", detalle: "El Panel lo muestra “en espera” mientras tanto.", duracion: "1 minuto", segundos: 60, color: "ambar" },
        ] satisfies Tramo[],
        hitos: [
          { titulo: "Pasa su DNI", detalle: "se revisan sus documentos", donde: "inicio", color: "bg-brand-500" },
          { titulo: "Sopla y se abre", detalle: "~10 s después de soplar", donde: 50, color: "bg-success-500" },
          { titulo: "Vence el plazo", detalle: "“No completó rostro y alcohol”", donde: "fin", color: "bg-error-500" },
        ] satisfies Hito[],
        ejemplo: "pasa su DNI, hace rostro y sopla en unos 15 s; el molinete se abre unos 10 s después, a los ~25 s.",
      };
  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xs font-semibold text-gray-800 dark:text-white/90">{titulo}</p>
      <p className="mb-3 text-[11px] text-gray-500 dark:text-gray-400">{desde}</p>
      <div className="flex flex-col gap-[3px] overflow-hidden rounded-lg sm:flex-row">
        {tramos.map((t) => (
          <div key={t.titulo} className={`min-w-0 px-3 py-2.5 ${COLOR_TRAMO[t.color]}`} style={{ flexGrow: t.segundos, flexBasis: 0 }}>
            <span className="block text-xs font-semibold">{t.titulo}</span>
            <span className="block text-[11px] opacity-90">{t.detalle}</span>
            <span className="mt-1 inline-block rounded-full bg-white/60 px-2 text-[11px] font-semibold dark:bg-black/25">{t.duracion}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-col gap-1.5 sm:relative sm:block sm:h-12">
        {hitos.map((h) => (
          <div
            key={h.titulo}
            className={`flex items-center gap-2 text-[11px] text-gray-600 sm:absolute sm:top-0 sm:max-w-[34%] sm:flex-col sm:gap-0.5 dark:text-gray-300 ${
              h.donde === "inicio"
                ? "sm:left-0 sm:items-start"
                : h.donde === "fin"
                  ? "sm:right-0 sm:items-end sm:text-right"
                  : "sm:-translate-x-1/2 sm:items-center sm:text-center"
            }`}
            style={typeof h.donde === "number" ? { left: `${h.donde}%` } : undefined}
          >
            <span className={`size-2.5 shrink-0 rounded-full ${h.color}`} aria-hidden />
            <span>
              <span className="font-medium text-gray-700 dark:text-gray-200">{h.titulo}</span>{" "}
              <span className="text-gray-500 sm:block dark:text-gray-400">{h.detalle}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 border-t border-dashed border-gray-200 pt-2.5 text-[11px] text-gray-600 dark:border-gray-800 dark:text-gray-300">
        <b className="text-gray-800 dark:text-white/90">Ejemplo:</b> {ejemplo}
      </p>
    </div>
  );
}

/**
 * El recorrido de ingreso y el de salida, paso a paso. El ingreso, en el orden
 * que está activo (Sistema y APIs → Orden del ingreso): "Facial + Alcohol → DNI"
 * o "DNI → Facial + Alcohol". Mientras no se sabe (o sin respuesta), el primero, el que se usa.
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
          <p className="mt-4 text-xs text-gray-600 dark:text-gray-300">
            <b>Puede pasar el DNI apenas oye “correcto”:</b> el sistema espera el aviso del equipo facial. Si no lo pasa en los 30
            segundos, queda “No pasó su DNI a tiempo” y debe empezar otra vez.
          </p>
        )}
        <LineaTiempo facialPrimero={facialPrimero} />
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
