"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import capturas from "./capturas.json";

type Clave = keyof typeof capturas;

const LADO = {
  izq: "-translate-x-[120%] -translate-y-1/2",
  der: "translate-x-[20%] -translate-y-1/2",
  arriba: "-translate-x-1/2 -translate-y-[120%]",
} as const;

/** Número sobre la captura, al lado del elemento que señala (donde haya espacio libre). */
function Marca({ n, x, y, lado }: { n: number; x: number; y: number; lado: string }) {
  return (
    <span
      className={`absolute flex size-6 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white shadow-theme-md ring-2 ring-white dark:ring-gray-900 ${LADO[lado as keyof typeof LADO] ?? LADO.izq}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      aria-hidden
    >
      {n}
    </span>
  );
}

function Imagen({ clave, alt, grande = false }: { clave: Clave; alt: string; grande?: boolean }) {
  const c = capturas[clave];
  return (
    <div className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element -- captura estática con números encima, a su tamaño real */}
      <img
        src={c.imagen}
        alt={alt}
        width={c.ancho}
        height={c.alto}
        loading={grande ? "eager" : "lazy"}
        className="block h-auto w-full"
      />
      {c.puntos.map((p) => (
        <Marca key={p.n} {...p} />
      ))}
    </div>
  );
}

/**
 * Captura de una pantalla del portal con números y, debajo, qué es cada uno.
 * Un clic la amplía. Las capturas y la posición de los números las genera
 * scripts/capturas-manual.mjs (public/manual/ y capturas.json).
 */
export function Captura({ clave, alt, pasos }: { clave: Clave; alt: string; pasos: React.ReactNode[] }) {
  const [ampliada, setAmpliada] = useState(false);
  return (
    <figure className="my-2 space-y-3">
      <button
        type="button"
        onClick={() => setAmpliada(true)}
        title="Ver en grande"
        className="group block w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 px-7 text-left shadow-theme-xs transition-shadow hover:shadow-theme-md dark:border-gray-800 dark:bg-white/[0.03]"
      >
        <Imagen clave={clave} alt={alt} />
      </button>
      <figcaption>
        <ol className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {pasos.map((paso, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[11px] font-semibold text-white">
                {i + 1}
              </span>
              <span>{paso}</span>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs text-gray-400">Haz clic en la imagen para verla en grande. Los datos son de demostración.</p>
      </figcaption>

      <Modal isOpen={ampliada} onClose={() => setAmpliada(false)} className="max-w-6xl p-4 sm:p-6">
        <div className="overflow-hidden rounded-lg border border-gray-200 px-7 dark:border-gray-800">
          <Imagen clave={clave} alt={alt} grande />
        </div>
      </Modal>
    </figure>
  );
}

/* Íconos de línea del recorrido (la plantilla no trae estos). */
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
        "Recibe el aviso cuando se cae un equipo. No modifica datos.",
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
  final = false,
  exito = false,
}: {
  n: number;
  titulo: string;
  detalle: string;
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
      </span>
    </li>
  );
}

/** El recorrido de ingreso y el de salida, paso a paso. */
export function RecorridoAcceso() {
  return (
    <div className="my-2 space-y-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5">
      <div>
        <p className="mb-4 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">Ingreso</p>
        <ol className="flex flex-col md:flex-row md:gap-2">
          <Paso n={1} Icono={IconoDni} titulo="Pasa su DNI" detalle="por el lector de ingreso" />
          <Paso n={2} Icono={IconoDocumentos} titulo="Se revisan sus documentos" detalle="registrado, activo y sin vencidos" />
          <Paso n={3} Icono={IconoRostro} titulo="Muestra su rostro" detalle="el terminal facial lo reconoce" />
          <Paso n={4} Icono={IconoAlcohol} titulo="Sopla" detalle="en el alcoholímetro" />
          <Paso n={5} Icono={IconoMolinete} titulo="Se abre el molinete" detalle="y queda en el Panel de vigilancia" final exito />
        </ol>
      </div>
      <div>
        <p className="mb-4 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">Salida</p>
        <ol className="flex flex-col md:flex-row md:gap-2">
          <Paso n={1} Icono={IconoDni} titulo="Pasa su DNI" detalle="por el lector de salida" />
          <Paso n={2} Icono={IconoRegistrado} titulo="Se revisa que esté registrado" detalle="también si está de baja" />
          <Paso n={3} Icono={IconoMolinete} titulo="Se abre el molinete" detalle="y queda en el Panel de vigilancia" final exito />
        </ol>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Si algo falla en cualquier paso, el molinete no se abre, suena el aviso de denegado y el Panel de vigilancia
        muestra el motivo.
      </p>
    </div>
  );
}

/* ---------- Piezas para explicar tareas (Personal y documentos y otras secciones) ---------- */

export function IconoEmpresa({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <path d="M4 21V5.5A1.5 1.5 0 0 1 5.5 4h7A1.5 1.5 0 0 1 14 5.5V21M14 10h4.5a1.5 1.5 0 0 1 1.5 1.5V21M3 21h18" />
      <path d="M7.5 8h3M7.5 11.5h3M7.5 15h3M16.5 14h1M16.5 17h1" />
    </svg>
  );
}
export function IconoCamara({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.3l1.2-1.8a1.5 1.5 0 0 1 1.2-.7h3.6a1.5 1.5 0 0 1 1.2.7L16.2 6h1.3A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </svg>
  );
}
export function IconoRenovar({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <path d="M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9" />
      <path d="M18.5 3v4.1h-4.1M5.5 21v-4.1h4.1" />
    </svg>
  );
}
export function IconoEliminar({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <path d="M4 7h16M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M10 11v6M14 11v6" />
    </svg>
  );
}
export function IconoAgregar({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <path d="M14 3H7.5A1.5 1.5 0 0 0 6 4.5v15A1.5 1.5 0 0 0 7.5 21h9a1.5 1.5 0 0 0 1.5-1.5V7z" />
      <path d="M14 3v4h4M12 11v6M9 14h6" />
    </svg>
  );
}
export function IconoBaja({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <circle cx="10" cy="8" r="3.5" />
      <path d="M3.5 19.5c.9-3 3.4-4.5 6.5-4.5 1.2 0 2.3.2 3.2.7M15.5 17.5h5" />
    </svg>
  );
}
export { IconoDni, IconoDocumentos, IconoRegistrado, IconoVigilancia as IconoVer };

/** Subtítulo dentro de una sección del manual. */
export function Subtitulo({ children }: { children: React.ReactNode }) {
  return <h3 className="pt-3 text-sm font-semibold text-gray-800 dark:text-white/90">{children}</h3>;
}

/** Condiciones que deben cumplirse, cada una con un ✓ verde. */
export function Condiciones({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="my-1 grid gap-2 sm:grid-cols-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 rounded-xl border border-success-200 bg-success-50/60 p-3 dark:border-success-500/20 dark:bg-success-500/[0.08]">
          <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-success-500 text-white">
            <svg className="size-3" viewBox="0 0 24 24" {...trazo} strokeWidth={3} aria-hidden>
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Pasos de una tarea, uno debajo del otro, cada uno con su ícono y su número. */
export function PasosTarea({
  pasos,
}: {
  pasos: { Icono: React.ComponentType<PropsIcono>; titulo: React.ReactNode; texto: React.ReactNode }[];
}) {
  return (
    <ol className="my-1">
      {pasos.map(({ Icono, titulo, texto }, i) => (
        <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
          {i < pasos.length - 1 && (
            <span aria-hidden className="absolute top-12 bottom-0 left-6 w-px bg-brand-200 dark:bg-brand-500/30" />
          )}
          <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-2xl border border-brand-100 bg-white text-brand-500 shadow-theme-xs dark:border-brand-500/30 dark:bg-gray-900 dark:text-brand-400">
            <Icono className="size-6" />
            <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-brand-500 text-[11px] font-semibold text-white">
              {i + 1}
            </span>
          </span>
          <div className="min-w-0 pt-1">
            <p className="font-medium text-gray-800 dark:text-white/90">{titulo}</p>
            <div className="mt-0.5 text-gray-600 dark:text-gray-300">{texto}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

const TONO_ACCION = {
  neutro: "bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-300",
  marca: "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400",
  exito: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
  peligro: "bg-error-50 text-error-500 dark:bg-error-500/15 dark:text-error-400",
  aviso: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400",
} as const;

/**
 * Botones (o estados) de una pantalla explicados como tarjetas: ícono, nombre y
 * qué hace. Los botones van entre comillas; con comillas = false, un estado o
 * un dato ("Autorizado", "Presentes actualmente").
 */
export function Acciones({
  items,
  columnas = 2,
}: {
  items: {
    Icono: React.ComponentType<PropsIcono>;
    boton: string;
    texto: React.ReactNode;
    tono?: keyof typeof TONO_ACCION;
    comillas?: boolean;
  }[];
  columnas?: 2 | 3;
}) {
  return (
    <div className={`my-1 grid gap-3 ${columnas === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
      {items.map(({ Icono, boton, texto, tono = "marca", comillas = true }) => (
        <div key={boton} className="flex gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${TONO_ACCION[tono]}`}>
            <Icono className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-medium text-gray-800 dark:text-white/90">{comillas ? `“${boton}”` : boton}</p>
            <div className="mt-0.5 text-gray-600 dark:text-gray-300">{texto}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Nota destacada (dato importante para no equivocarse). */
export function Nota({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-xl border border-brand-100 bg-brand-50/60 p-3 text-gray-700 dark:border-brand-500/20 dark:bg-brand-500/[0.08] dark:text-gray-300">
      <svg className="mt-0.5 size-4 shrink-0 text-brand-500 dark:text-brand-400" viewBox="0 0 24 24" {...trazo} aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </svg>
      <div>{children}</div>
    </div>
  );
}

export function IconoReloj({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}
export function IconoAviso({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <path d="M10.3 4.3 2.9 17.2A2 2 0 0 0 4.6 20h14.8a2 2 0 0 0 1.7-2.8L13.7 4.3a2 2 0 0 0-3.4 0z" />
      <path d="M12 9.5v4M12 16.5h.01" />
    </svg>
  );
}
export function IconoBuscar({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  );
}
export function IconoCalendario({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  );
}
export function IconoGrafico({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <path d="M4 4v16h16M8 16v-4M12 16V8M16 16v-6" />
    </svg>
  );
}
export function IconoUsuarios({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19c.8-2.8 3-4.3 6-4.3s5.2 1.5 6 4.3M15.5 5a3.2 3.2 0 0 1 0 6.2M17.5 14.9c1.6.6 2.8 2 3.3 4.1" />
    </svg>
  );
}
export function IconoTabla({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M3.5 14.5h17M9.5 9.5v10" />
    </svg>
  );
}
export function IconoPdf({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <path d="M14 3H7.5A1.5 1.5 0 0 0 6 4.5v15A1.5 1.5 0 0 0 7.5 21h9a1.5 1.5 0 0 0 1.5-1.5V7z" />
      <path d="M14 3v4h4M9 13h6M9 16.5h4" />
    </svg>
  );
}
export function IconoComprimido({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <path d="M4 8.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2.5M4 8.5h16v9.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M10 12.5h4" />
    </svg>
  );
}
export function IconoLlave({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 8.5-8.5M16.5 6.5l2.5 2.5M14 9l2 2" />
    </svg>
  );
}
export function IconoHistorial({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <path d="M4 12a8 8 0 1 0 2.3-5.7M4 4.5v3.8h3.8" />
      <path d="M12 8v4.5l3 1.5" />
    </svg>
  );
}
export function IconoServidor({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <rect x="3.5" y="4" width="17" height="7" rx="1.5" />
      <rect x="3.5" y="13" width="17" height="7" rx="1.5" />
      <path d="M7 7.5h.01M7 16.5h.01M11 7.5h6M11 16.5h6" />
    </svg>
  );
}
export function IconoRele({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" />
    </svg>
  );
}
export function IconoCodigo({ className }: PropsIcono) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...trazo} aria-hidden>
      <path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.5 5l-3 14" />
    </svg>
  );
}
export { IconoRostro, IconoAlcohol, IconoMolinete };
