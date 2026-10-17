"use client";

// PROTOTIPO (muestra para el cliente): la sección "Panel de vigilancia" del
// manual como PANTALLA INTERACTIVA: la captura real con puntos que se tocan;
// cada punto explica esa parte y qué hacer, con Anterior / Siguiente. No
// reemplaza al manual todavía.
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RequireRole } from "@/lib/auth/RequireRole";
import Badge from "@/components/ui/badge/Badge";
import capturas from "../capturas.json";

type Clave = keyof typeof capturas;

interface Punto {
  titulo: string;
  texto: React.ReactNode;
}

interface Pantalla {
  titulo: string;
  descripcion: string;
  clave: Clave;
  puntos: Punto[];
}

const Motivo = ({ m, hacer }: { m: string; hacer: React.ReactNode }) => (
  <li className="flex flex-col gap-0.5 py-1.5">
    <span>
      <Badge color="error">{m}</Badge>
    </span>
    <span className="text-gray-600 dark:text-gray-300">→ {hacer}</span>
  </li>
);

const PANTALLAS: Pantalla[] = [
  {
    titulo: "El panel",
    descripcion: "Lo que ves todos los días",
    clave: "vigilancia",
    puntos: [
      {
        titulo: "Resumen del día",
        texto: (
          <>
            <p>Cuántos no pudieron pasar hoy, cuántos dieron alcohol positivo y cuántos tienen documentos vencidos.</p>
            <p className="mt-2 font-medium text-gray-800 dark:text-white/90">Avisos que pueden aparecer arriba:</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>
                <b>Rojo:</b> se cayó un equipo (dice cuál y desde cuándo). Avisa a soporte; desaparece solo cuando vuelve.
              </li>
              <li>
                <b>“El servidor no responde”:</b> mientras dure, no se valida ningún ingreso.
              </li>
            </ul>
            <p className="mt-2">
              <b>Sin internet</b> no se puede ingresar; la salida sigue con la lista guardada en el controlador. El panel se reconecta solo:
              no hace falta recargar.
            </p>
          </>
        ),
      },
      {
        titulo: "Buscar",
        texto: <p>Escribe un nombre, apellido o DNI. Busca en todo el historial, no solo en lo que ves.</p>,
      },
      {
        titulo: "Elegir el día",
        texto: (
          <p>
            Por defecto ves <b>hoy</b>. Con el calendario eliges otro día o “Todos los días”; <b>“Hoy”</b> te devuelve. La tabla va de 10 en 10.
          </p>
        ),
      },
      {
        titulo: "¿Pasó o no pasó?",
        texto: (
          <>
          <ul className="space-y-2">
            <li>
              <Badge color="success">Autorizado</Badge> pasó todos los controles y se abrió el molinete.
            </li>
            <li>
              <Badge color="error">Denegado</Badge> no se abrió: al lado está el motivo.
            </li>
            <li>
              <Badge color="primary">En espera</Badge> pasó su DNI y tiene <b>1 minuto</b> para mirar el terminal y soplar. Ves su foto para
              compararla.
            </li>
            <li>
              <Badge color="light">En cola</Badge> otra persona está usando el terminal. Se atienden de una en una, en el orden en que pasaron
              el DNI.
            </li>
          </ul>
          <p className="mt-3">
            <b>Para salir</b> solo pasa su DNI por el lector de salida. Debe tener un ingreso registrado antes; puede salir aunque esté dado de
            baja o con documentos vencidos.
          </p>
          <p className="mt-2">Junto al nombre ves su perfil: contratista, conductor, visita…</p>
          </>
        ),
      },
      {
        titulo: "Por qué no pasó y qué hacer",
        texto: (
          <>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            <Motivo m="No registrado" hacer="Su DNI no está en el sistema. No puede entrar hasta que el administrador lo registre." />
            <Motivo m="Dado de baja" hacer="No puede entrar. Solo el administrador puede reactivarlo." />
            <Motivo m="Sin documentos ›" hacer="No tiene documentos registrados. El administrador debe subirlos." />
            <Motivo m="Documentos ›" hacer="Tiene un documento vencido. Tócalo para ver cuál; el administrador sube el nuevo." />
            <Motivo m="Alcohol" hacer="Dio positivo en la prueba de alcohol. No puede entrar." />
            <Motivo m="Rostro no coincide" hacer="En la verificación manual se indicó que no es la persona del DNI. No puede entrar." />
            <Motivo
              m="No completó rostro y alcohol"
              hacer="No terminó en 1 minuto (o, en verificación manual, nadie decidió en 2). Puede pasar su DNI otra vez."
            />
            <Motivo
              m="Ya figura dentro"
              hacer={<>Figura que ya entró y no marcó su salida. Si salió sin marcar: <b>“Registrar salida manual ›”</b>.</>}
            />
            <Motivo
              m="No registra ingreso"
              hacer={<>Quiere salir, pero no figura que haya entrado. Si entró sin marcar: <b>“Registrar ingreso manual ›”</b>.</>}
            />
          </ul>
          <p className="mt-3">
            <b>Corrección manual:</b> pide un motivo y <b>no abre el molinete</b>; después la persona vuelve a pasar su DNI. La hacen el
            vigilante o el administrador y queda en el reporte y en la Auditoría. Tras una emergencia con los brazos liberados, registra así la
            salida de cada uno.
          </p>
          <p className="mt-2">
            <b>Aviso ámbar “No completó”:</b> si dice que no pudo soplar, revisa si el terminal tiene un <b>punto rojo</b> (alcoholímetro
            desconectado) y avisa a soporte.
          </p>
          </>
        ),
      },
    ],
  },
  {
    titulo: "Si falla el terminal",
    descripcion: "Cómo pasar a verificación manual",
    clave: "verificacion-activar",
    puntos: [
      {
        titulo: "El aviso rojo",
        texto: (
          <p>
            Si el terminal facial deja de responder 2 minutos, aparece <b>“Terminal facial… Desconectado”</b>. Nadie puede completar rostro y
            alcohol.
          </p>
        ),
      },
      {
        titulo: "Activar verificación manual",
        texto: (
          <>
            <p>
              Tócalo, escribe el motivo y presiona <b>“Activar”</b>. Desde ahí <b>tú</b> revisas el rostro y tomas la prueba de alcohol a todos.
            </p>
            <p className="mt-2">
              Cuando el terminal vuelve, el panel te pregunta en verde: <b>“¿Volver a modo normal?”</b>. Si aún no funciona bien, elige{" "}
              <b>“Seguir en manual”</b>. No vuelve sola, a propósito.
            </p>
            <p className="mt-2">
              La activan y terminan el vigilante o el administrador. No tiene tiempo máximo. Activarla, terminarla y cada decisión quedan
              registradas con quién lo hizo.
            </p>
          </>
        ),
      },
    ],
  },
  {
    titulo: "Verificación manual",
    descripcion: "La ventana que aparece con cada persona",
    clave: "verificacion-ventana",
    puntos: [
      {
        titulo: "Tiempo para decidir",
        texto: (
          <>
            <p>
              Tienes <b>2 minutos</b>. Si nadie decide, el ingreso se deniega solo y pasa la siguiente persona; puede volver a pasar su DNI.
            </p>
            <p className="mt-2">Si llegan varias, se atienden de una en una, en el orden en que pasaron el DNI.</p>
          </>
        ),
      },
      {
        titulo: "Documentos ya revisados",
        texto: <p>El sistema ya revisó su DNI y sus documentos: están en regla. Solo te falta el rostro y el alcohol.</p>,
      },
      {
        titulo: "Qué hacer antes de decidir",
        texto: <p>Compara su rostro con la foto y tómale la prueba con el alcoholímetro de repuesto, a todos sin excepción.</p>,
      },
      {
        titulo: "“Apto: abrir”",
        texto: (
          <>
            <p>El rostro es el de la foto y el alcohol salió bien. Se abre el molinete y queda marcado como “Manual”, con tu nombre.</p>
            <p className="mt-2">Si otro vigilante decidió antes, vale la primera decisión y tu ventana se cierra.</p>
          </>
        ),
      },
      {
        titulo: "“Alcohol: no apto”",
        texto: <p>La prueba salió sobre el límite. No se abre y suena el aviso.</p>,
      },
      {
        titulo: "“No es la persona”",
        texto: <p>El rostro no es el de la foto. No se abre y queda como “Rostro no coincide”.</p>,
      },
    ],
  },
];

/** El número va pegado al lado del elemento que señala, sin taparlo. */
const LADO = {
  izq: "-translate-x-[110%] -translate-y-1/2",
  der: "translate-x-[10%] -translate-y-1/2",
  arriba: "-translate-x-1/2 -translate-y-[110%]",
} as const;

/** Si no hay espacio al lado (el elemento está en el borde), el número entra un poco sobre él para no salirse de la imagen. */
function dentro(m: { x: number; y: number; lado: string }) {
  const x = m.lado === "izq" ? Math.max(5, m.x) : m.lado === "der" ? Math.min(95, m.x) : Math.min(97, Math.max(3, m.x));
  const y = m.lado === "arriba" ? Math.max(6, m.y) : Math.min(96, Math.max(4, m.y));
  return { x, y };
}

function PantallaInteractiva() {
  const [pantalla, setPantalla] = useState(0);
  const [punto, setPunto] = useState(0);
  const p = PANTALLAS[pantalla];
  const c = capturas[p.clave];
  const actual = p.puntos[punto];
  const total = PANTALLAS.reduce((n, x) => n + x.puntos.length, 0);
  const posicion = PANTALLAS.slice(0, pantalla).reduce((n, x) => n + x.puntos.length, 0) + punto + 1;

  function ir(pa: number, pu: number) {
    setPantalla(pa);
    setPunto(pu);
  }
  const siguiente = () =>
    punto < p.puntos.length - 1 ? ir(pantalla, punto + 1) : pantalla < PANTALLAS.length - 1 ? ir(pantalla + 1, 0) : ir(0, 0);
  const anterior = () =>
    punto > 0 ? ir(pantalla, punto - 1) : pantalla > 0 ? ir(pantalla - 1, PANTALLAS[pantalla - 1].puntos.length - 1) : undefined;

  // Flechas del teclado (salvo mientras se escribe en un campo).
  const teclas = useRef({ siguiente, anterior });
  useEffect(() => {
    teclas.current = { siguiente, anterior };
  });
  useEffect(() => {
    const alPresionar = (e: KeyboardEvent) => {
      const destino = e.target as HTMLElement | null;
      if (destino?.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "ArrowRight") teclas.current.siguiente();
      if (e.key === "ArrowLeft") teclas.current.anterior();
    };
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, []);

  // En el celular la captura es más ancha que la pantalla: lleva el número elegido a la vista.
  const marcaActiva = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    marcaActiva.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [pantalla, punto]);

  return (
    <div className="space-y-4">
      {/* Pantallas de la sección */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
        {PANTALLAS.map((x, i) => (
          <button
            key={x.titulo}
            type="button"
            onClick={() => ir(i, 0)}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3.5 py-2 text-left transition-all ${
              i === pantalla
                ? "border-brand-500 bg-brand-50 shadow-theme-xs dark:bg-brand-500/15"
                : "border-gray-200 bg-white hover:border-brand-200 dark:border-gray-800 dark:bg-white/[0.02]"
            }`}
          >
            <span
              className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                i === pantalla ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-500 dark:bg-white/[0.06]"
              }`}
            >
              {i + 1}
            </span>
            <span>
              <span className="block text-sm font-semibold text-gray-800 dark:text-white/90">{x.titulo}</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">{x.descripcion}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        {/* La pantalla real con sus puntos */}
        {/* Margen a los lados para los números que quedan fuera de la imagen. */}
        <div className="overflow-x-auto overflow-y-hidden rounded-2xl lg:sticky lg:top-24 border border-gray-200 bg-gray-100 p-4 sm:p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="relative mx-auto min-w-[560px] sm:min-w-0" style={{ maxWidth: c.ancho < 700 ? 600 : undefined }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- captura estática con puntos encima */}
            <img src={c.imagen} alt={p.titulo} width={c.ancho} height={c.alto} className="block h-auto w-full rounded-lg shadow-theme-md" />
            {c.puntos.map((m, i) => {
              const activo = i === punto;
              return (
                <button
                  key={m.n}
                  ref={activo ? marcaActiva : undefined}
                  type="button"
                  onClick={() => setPunto(i)}
                  aria-label={`${m.n}. ${p.puntos[i]?.titulo}`}
                  className={`absolute flex items-center justify-center rounded-full font-bold text-white transition-all ${LADO[m.lado as keyof typeof LADO] ?? LADO.izq} ${activo ? "size-8 bg-brand-500 text-sm ring-4 ring-brand-500/30 sm:size-9" : "size-6 bg-gray-800/80 text-xs hover:bg-brand-500 sm:size-7"}`}
                  style={{ left: `${dentro(m).x}%`, top: `${dentro(m).y}%` }}
                >
                  {activo && <span className="absolute inset-0 animate-ping rounded-full bg-brand-500 opacity-40" />}
                  <span className="relative">{m.n}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lo que explica el punto elegido */}
        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.02]">
          <div className="mb-3 flex items-center justify-between text-xs text-gray-400">
            <span>
              {posicion} de {total}
            </span>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06]">
              <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${(posicion / total) * 100}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
              {punto + 1}
            </span>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{actual.titulo}</h3>
          </div>
          <div className="mt-3 flex-1 text-[15px] leading-relaxed text-gray-600 dark:text-gray-300">{actual.texto}</div>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
            <button
              type="button"
              onClick={anterior}
              disabled={pantalla === 0 && punto === 0}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-white/[0.06]"
            >
              ← Anterior
            </button>
            <button type="button" onClick={siguiente} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
              {posicion === total ? "Volver al inicio" : "Siguiente →"}
            </button>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-gray-400">Toca los números o usa Siguiente. Los datos son de demostración.</p>
    </div>
  );
}

function Muestra() {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-brand-300 bg-brand-50/50 px-4 py-2.5 text-sm text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-300">
        <span>
          <b>Prototipo</b> del nuevo manual: sección Panel de vigilancia como pantalla interactiva. El manual actual no cambia.
        </span>
        <Link href="/manual#vigilancia" className="font-medium hover:underline">
          Ver la versión actual →
        </Link>
      </div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Panel de vigilancia</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Mira en vivo quién entra y sale, por qué alguien no pasó y qué hacer si falla un equipo.</p>
      </div>
      <PantallaInteractiva />
    </div>
  );
}

export default function MuestraManualPage() {
  return (
    <RequireRole roles={["administrador", "vigilancia"]}>
      <Muestra />
    </RequireRole>
  );
}
