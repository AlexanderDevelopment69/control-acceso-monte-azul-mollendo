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
        "Consulta el personal y sus documentos, sin cambiar nada.",
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
  detalle: React.ReactNode;
  /** Cuánto tarda o cuánto tiempo hay (medido con el equipo real). */
  tiempo?: React.ReactNode;
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

type Color = "azul" | "verde" | "rojo";
type Punto = {
  s: number;
  color: Color;
  rotulo: string;
  lado: "start" | "middle" | "end";
  /** Rótulo en una segunda fila, para que no se monte con el del punto anterior. */
  abajo?: boolean;
  cuando: string;
  detalle: React.ReactNode;
};
type Tramo = { desde: number; hasta: number; color: "azul" | "ambar"; rotulo: string };

const PUNTO = { azul: "fill-brand-500", verde: "fill-success-500", rojo: "fill-error-500" };
const BOLA = { azul: "bg-brand-500", verde: "bg-success-500", rojo: "bg-error-500" };
const TRAMO = {
  azul: { barra: "fill-brand-300 dark:fill-brand-500/50", texto: "fill-brand-600 dark:fill-brand-300" },
  ambar: { barra: "fill-warning-200 dark:fill-warning-500/40", texto: "fill-warning-700 dark:fill-warning-400" },
};

/** Los tiempos de cada orden del ingreso, medidos con el equipo real. */
const TIEMPOS: Record<"facialPrimero" | "dniPrimero", { titulo: string; desde: string; total: number; paso: number; tramos: Tramo[]; puntos: Punto[] }> = {
  // Medido con el registro del propio equipo (21/10/2026): reconoce el rostro (0 s), mide el alcohol
  // (12 s), dice "correcto" (20 s: tarda unos 8 s después de medir) y el aviso llega al Panel ~1 s después.
  facialPrimero: {
    titulo: "Tiempos con Facial + Alcohol → DNI",
    desde: "Segundos desde que mira al equipo, medidos con el equipo real.",
    total: 50,
    paso: 10,
    tramos: [
      { desde: 0, hasta: 20, color: "azul", rotulo: "Rostro y soplido · unos 20 s" },
      { desde: 20, hasta: 50, color: "ambar", rotulo: "Tiempo para pasar el DNI · 30 s" },
    ],
    puntos: [
      { s: 0, color: "azul", rotulo: "Mira al equipo", lado: "start", cuando: "0 s", detalle: "Reconoce su rostro y le pide soplar." },
      { s: 20, color: "azul", rotulo: "Correcto", lado: "end", cuando: "unos 20 s", detalle: <>El Panel muestra <b>Aprobó … pase su DNI</b> en 1 segundo.</> },
      { s: 25, color: "verde", rotulo: "Pasa su DNI y se abre", lado: "start", cuando: "ej. a los 25 s", detalle: "El molinete se abre al pasarlo." },
      { s: 50, color: "rojo", rotulo: "Fin del plazo", lado: "end", cuando: "unos 50 s", detalle: <>Sin DNI: <b>No pasó su DNI a tiempo</b>.</> },
    ],
  },
  dniPrimero: {
    titulo: "Tiempos con DNI → Facial + Alcohol",
    desde: "Segundos desde que pasa su DNI, medidos con el equipo real.",
    total: 60,
    paso: 10,
    tramos: [{ desde: 0, hasta: 60, color: "ambar", rotulo: "Tiempo para hacer rostro y alcohol · 1 minuto" }],
    puntos: [
      { s: 0, color: "azul", rotulo: "Pasa su DNI", lado: "start", cuando: "0 s", detalle: <>Se revisan sus documentos; el Panel lo muestra <b>en espera</b>.</> },
      { s: 15, color: "azul", rotulo: "Sopla", lado: "middle", cuando: "ej. a los 15 s", detalle: "Hace rostro y alcohol en el equipo facial." },
      { s: 25, color: "verde", rotulo: "Se abre", lado: "middle", cuando: "unos 25 s", detalle: <>Al decir <b>correcto</b>.</> },
      { s: 60, color: "rojo", rotulo: "Fin del plazo", lado: "end", cuando: "60 s", detalle: <>Sin prueba: <b>No completó rostro y alcohol</b>.</> },
    ],
  },
};

/**
 * Los tiempos del ingreso en el orden activo: la línea con los tramos
 * rotulados encima, los puntos numerados y, debajo, qué significa cada uno.
 * En el celular la línea se desliza en su recuadro y la lista va en una columna.
 */
function LineaTiempo({ facialPrimero }: { facialPrimero: boolean }) {
  const { titulo, desde, total, paso, tramos, puntos } = TIEMPOS[facialPrimero ? "facialPrimero" : "dniPrimero"];
  const x = (seg: number) => 40 + (seg / total) * 680;
  const marcas = Array.from({ length: total / paso + 1 }, (_, i) => i * paso);
  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xs font-semibold text-gray-800 dark:text-white/90">{titulo}</p>
      <p className="mb-1 text-[11px] text-gray-500 dark:text-gray-400">{desde}</p>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 760 110" className="w-full min-w-[560px]" role="img" aria-label={`${titulo}: ${puntos.map((pt) => `${pt.rotulo} ${pt.cuando}`).join(", ")}`}>
          <g className="fill-gray-400 dark:fill-gray-500" fontSize="11" textAnchor="middle">
            {marcas.map((seg) => (
              <text key={seg} x={x(seg)} y="12">
                {seg} s
              </text>
            ))}
          </g>
          <g className="stroke-gray-200 dark:stroke-gray-800">
            {marcas.map((seg) => (
              <line key={seg} x1={x(seg)} y1="18" x2={x(seg)} y2="104" />
            ))}
          </g>
          {tramos.map((t) => (
            <text key={t.rotulo} x={(x(t.desde) + x(t.hasta)) / 2} y="36" textAnchor="middle" fontSize="12" fontWeight="600" className={TRAMO[t.color].texto}>
              {t.rotulo}
            </text>
          ))}
          <rect x={x(0)} y="50" width={x(total) - x(0)} height="8" rx="4" className="fill-gray-100 dark:fill-gray-800" />
          {tramos.map((t) => (
            <rect key={t.rotulo} x={x(t.desde)} y="50" width={x(t.hasta) - x(t.desde)} height="8" rx="4" className={TRAMO[t.color].barra} />
          ))}
          {puntos.map((pt, i) => (
            <g key={pt.rotulo}>
              <circle cx={x(pt.s)} cy="54" r="10" className={PUNTO[pt.color]} />
              <text x={x(pt.s)} y="58" textAnchor="middle" fontSize="11" fontWeight="700" className="fill-white">
                {i + 1}
              </text>
              <text
                x={x(pt.s) + (pt.lado === "start" && pt.s > 0 ? 4 : 0)}
                y={pt.abajo ? 102 : 84}
                textAnchor={pt.lado}
                fontSize="12.5"
                fontWeight="600"
                className="fill-gray-800 dark:fill-white/90"
              >
                {pt.rotulo}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <ol className="mt-2.5 grid gap-x-4 gap-y-2 border-t border-dashed border-gray-200 pt-2.5 sm:grid-cols-2 lg:grid-cols-4 dark:border-gray-800">
        {puntos.map((pt, i) => (
          <li key={pt.rotulo} className="flex gap-2 text-[11px] text-gray-600 dark:text-gray-300">
            <span className={`mt-px flex size-[18px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${BOLA[pt.color]}`}>
              {i + 1}
            </span>
            <span>
              <b className="font-semibold text-gray-800 dark:text-white/90">{pt.rotulo}</b> · {pt.cuando}
              <span className="block">{pt.detalle}</span>
            </span>
          </li>
        ))}
      </ol>
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
              <Paso n={1} Icono={IconoRostro} titulo="Muestra su rostro" detalle="el equipo facial lo reconoce" tiempo="rostro y soplido: unos 20 s" />
              <Paso n={2} Icono={IconoAlcohol} titulo="Sopla" detalle={<>en el alcoholímetro; el equipo dice <b>correcto</b></>} tiempo="el Panel lo muestra al instante" />
              <Paso n={3} Icono={IconoDni} titulo="Pasa su DNI" detalle="por el lector de ingreso, en 30 segundos" tiempo={<>máximo 30 s desde <b>pase su DNI</b></>} />
              <Paso n={4} Icono={IconoDocumentos} titulo="Se revisan sus documentos" detalle="registrado, activo y sin vencidos" tiempo="al instante" />
              <Paso n={5} Icono={IconoMolinete} titulo="Se abre el molinete" detalle="y queda en el Panel de vigilancia" tiempo="al pasar el DNI" final exito />
            </>
          ) : (
            <>
              <Paso n={1} Icono={IconoDni} titulo="Pasa su DNI" detalle="por el lector de ingreso" tiempo="al instante" />
              <Paso n={2} Icono={IconoDocumentos} titulo="Se revisan sus documentos" detalle="registrado, activo y sin vencidos" tiempo="al instante" />
              <Paso n={3} Icono={IconoRostro} titulo="Muestra su rostro" detalle="el equipo facial lo reconoce" tiempo="tiene 1 minuto desde que pasó el DNI" />
              <Paso n={4} Icono={IconoAlcohol} titulo="Sopla" detalle="en el alcoholímetro" tiempo="rostro y soplido: unos 20 s" />
              <Paso n={5} Icono={IconoMolinete} titulo="Se abre el molinete" detalle="y queda en el Panel de vigilancia" tiempo={<>al decir <b>correcto</b></>} final exito />
            </>
          )}
        </ol>
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
