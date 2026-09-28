"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Label from "./Label";
import { CalenderIcon, ChevronLeftIcon } from "../../icons";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
// La semana empieza el lunes (uso habitual en Perú).
const DIAS_SEMANA = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

// El valor interno (lo que se manda por `onChange` y se recibe por `value`)
// siempre es "YYYY-MM-DD" — es lo que espera el backend. Lo que ve y escribe
// la persona en el campo es "DD-MM-YYYY", que es el formato pedido.
function formatearFecha(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parsearFecha(texto: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto.trim());
  if (!match) return null;
  const [, y, m, d] = match.map(Number) as unknown as [never, number, number, number];
  const fecha = new Date(y, m - 1, d);
  // new Date() "corrige" fechas imposibles (ej. 30 de febrero pasa a marzo)
  // en vez de fallar — hay que confirmar que lo que se armó es lo que se pidió.
  if (fecha.getFullYear() !== y || fecha.getMonth() !== m - 1 || fecha.getDate() !== d) return null;
  return fecha;
}

function formatearVisible(fecha: Date): string {
  const d = String(fecha.getDate()).padStart(2, "0");
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const y = fecha.getFullYear();
  return `${d}-${m}-${y}`;
}

function parsearVisible(texto: string): Date | null {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(texto.trim());
  if (!match) return null;
  const [, d, m, y] = match.map(Number) as unknown as [never, number, number, number];
  const fecha = new Date(y, m - 1, d);
  if (fecha.getFullYear() !== y || fecha.getMonth() !== m - 1 || fecha.getDate() !== d) return null;
  return fecha;
}

/**
 * Formatea lo que se va escribiendo como DD-MM-AAAA: toma solo los dígitos
 * (así "28/09/2026", "28.09.2026" o "28092026" funcionan) y pone los guiones.
 */
function formatearMientrasEscribe(texto: string): string {
  const digitos = texto.replace(/\D/g, "").slice(0, 8);
  if (digitos.length > 4) return `${digitos.slice(0, 2)}-${digitos.slice(2, 4)}-${digitos.slice(4)}`;
  if (digitos.length > 2) return `${digitos.slice(0, 2)}-${digitos.slice(2)}`;
  return digitos;
}

function mismodia(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function construirGrilla(mesVisible: Date): { fecha: Date; delMesActual: boolean }[] {
  const primerDiaMes = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 1);
  const inicio = new Date(primerDiaMes);
  inicio.setDate(inicio.getDate() - ((primerDiaMes.getDay() + 6) % 7)); // retrocede hasta el lunes

  return Array.from({ length: 42 }, (_, i) => {
    const fecha = new Date(inicio);
    fecha.setDate(inicio.getDate() + i);
    return { fecha, delMesActual: fecha.getMonth() === mesVisible.getMonth() };
  });
}

const ANCHO_CALENDARIO = 288; // w-72
const ALTO_ESTIMADO = 360; // calendario con la vista de días
const MARGEN = 8;

type Posicion = { left: number; top?: number; bottom?: number };

/**
 * El calendario se dibuja en un portal (en <body>) con posición fija, para que
 * ningún contenedor con scroll u overflow (una lista dentro de un modal, por
 * ejemplo) lo recorte. Se ubica bajo el campo o, si no hay espacio, encima.
 */
function calcularPosicion(ancla: HTMLElement): Posicion {
  const r = ancla.getBoundingClientRect();
  const left = Math.max(MARGEN, Math.min(r.left, window.innerWidth - ANCHO_CALENDARIO - MARGEN));
  const espacioAbajo = window.innerHeight - r.bottom;
  if (espacioAbajo < ALTO_ESTIMADO && r.top > espacioAbajo) {
    return { left, bottom: window.innerHeight - r.top + MARGEN };
  }
  return { left, top: r.bottom + MARGEN };
}

type PropsType = {
  id: string;
  value: string; // "YYYY-MM-DD" o ""
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  /** Fecha mínima elegible ("YYYY-MM-DD"); las anteriores quedan desactivadas. */
  min?: string;
  /** Fecha máxima elegible ("YYYY-MM-DD"), p. ej. hoy en un filtro de registros. */
  max?: string;
};

export default function DatePicker({ id, value, onChange, label, placeholder, min, max }: PropsType) {
  const fechaMin = min ? parsearFecha(min) : null;
  const fechaMax = max ? parsearFecha(max) : null;
  const fueraDeRango = (fecha: Date) =>
    (!!fechaMin && fecha < fechaMin && !mismodia(fecha, fechaMin)) ||
    (!!fechaMax && fecha > fechaMax && !mismodia(fecha, fechaMax));
  const [abierto, setAbierto] = useState(false);
  const [vista, setVista] = useState<"dias" | "meses" | "anios">("dias");
  const [mesVisible, setMesVisible] = useState<Date>(() => parsearFecha(value) ?? new Date());
  const [texto, setTexto] = useState(() => {
    const fecha = parsearFecha(value);
    return fecha ? formatearVisible(fecha) : "";
  });
  // Si `value` cambia desde afuera (el padre lo resetea, por ejemplo), hay
  // que reflejarlo en el texto — pero ajustar el estado durante el render
  // (patrón recomendado por React para esto) en vez de un useEffect, para no
  // disparar un render de más ni la regla de lint que lo marca como riesgo
  // de renders en cascada.
  const [valorPrevio, setValorPrevio] = useState(value);
  if (value !== valorPrevio) {
    setValorPrevio(value);
    const fecha = parsearFecha(value);
    setTexto(fecha ? formatearVisible(fecha) : "");
    if (fecha) setMesVisible(fecha);
  }
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [posicion, setPosicion] = useState<Posicion>({ left: 0, top: 0 });

  useEffect(() => {
    if (!abierto) return;
    function handleClickOutside(event: MouseEvent) {
      const objetivo = event.target as Node;
      // El calendario vive en un portal: no está dentro de wrapperRef.
      if (!wrapperRef.current?.contains(objetivo) && !popupRef.current?.contains(objetivo)) {
        setAbierto(false);
      }
    }
    // Seguir al campo si se desplaza la página, el modal o una lista con scroll.
    function reubicar() {
      if (wrapperRef.current) setPosicion(calcularPosicion(wrapperRef.current));
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setAbierto(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", reubicar, true);
    window.addEventListener("resize", reubicar);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", reubicar, true);
      window.removeEventListener("resize", reubicar);
    };
  }, [abierto]);

  function abrir() {
    setVista("dias");
    setMesVisible(parsearFecha(value) ?? new Date());
    if (wrapperRef.current) setPosicion(calcularPosicion(wrapperRef.current));
    setAbierto(true);
  }

  function elegirDia(fecha: Date) {
    if (fueraDeRango(fecha)) return;
    onChange(formatearFecha(fecha));
    setAbierto(false);
  }

  function cambiarMes(delta: number) {
    setMesVisible((actual) => new Date(actual.getFullYear(), actual.getMonth() + delta, 1));
  }

  function cambiarAnio(delta: number) {
    setMesVisible((actual) => new Date(actual.getFullYear() + delta, actual.getMonth(), 1));
  }

  // Flechas: días → mes a mes; meses → año a año; años → de 12 en 12.
  function mover(sentido: 1 | -1) {
    if (vista === "dias") cambiarMes(sentido);
    else if (vista === "meses") cambiarAnio(sentido);
    else cambiarAnio(12 * sentido);
  }

  const inicioBloqueAnios = Math.floor(mesVisible.getFullYear() / 12) * 12;

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    let nuevoTexto = formatearMientrasEscribe(e.target.value);
    // Si se borró un guion, los dígitos no cambian y el guion volvería a
    // aparecer: en ese caso se borra también el dígito anterior.
    if (e.target.value.length < texto.length && nuevoTexto === texto) {
      nuevoTexto = formatearMientrasEscribe(nuevoTexto.replace(/\D/g, "").slice(0, -1));
    }
    setTexto(nuevoTexto);
    if (nuevoTexto === "") {
      onChange("");
      return;
    }
    const fecha = parsearVisible(nuevoTexto);
    if (fecha && !fueraDeRango(fecha)) {
      onChange(formatearFecha(fecha));
      setMesVisible(fecha);
    }
  }

  function handleInputBlur() {
    // Si lo que quedó escrito no es una fecha válida, se descarta y vuelve
    // a mostrar el último valor válido — no se deja texto suelto sin sentido.
    if (texto === "") return;
    const fecha = parsearVisible(texto);
    if (!fecha || fueraDeRango(fecha)) {
      const actual = parsearFecha(value);
      setTexto(actual ? formatearVisible(actual) : "");
    }
  }

  const seleccionada = parsearFecha(value);
  const hoy = new Date();

  return (
    <div className="relative">
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative" ref={wrapperRef}>
        <input
          id={id}
          value={texto}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          placeholder={placeholder}
          autoComplete="off"
          inputMode="numeric"
          maxLength={10}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
        />
        {/* El calendario solo se abre con el ícono; en el campo se escribe la fecha. */}
        <button
          type="button"
          onClick={() => (abierto ? setAbierto(false) : abrir())}
          aria-label={abierto ? "Cerrar calendario" : "Abrir calendario"}
          className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 dark:text-gray-400"
        >
          <CalenderIcon className="size-6" />
        </button>

        {abierto && createPortal(
        <div
          ref={popupRef}
          style={posicion}
          className="fixed z-999999 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => mover(-1)}
              className="flex size-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.05]"
            >
              <ChevronLeftIcon className="size-4" />
            </button>
            <div className="flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-400">
              {vista === "anios" ? (
                <span className="px-2 py-1">
                  {inicioBloqueAnios} – {inicioBloqueAnios + 11}
                </span>
              ) : (
                <>
                  {vista === "dias" && (
                    <button
                      type="button"
                      onClick={() => setVista("meses")}
                      className="rounded-lg px-2 py-1 hover:bg-brand-50 dark:hover:bg-white/[0.05]"
                    >
                      {MESES[mesVisible.getMonth()]}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setVista("anios")}
                    className="rounded-lg px-2 py-1 hover:bg-brand-50 dark:hover:bg-white/[0.05]"
                  >
                    {mesVisible.getFullYear()}
                  </button>
                </>
              )}
            </div>
            <button
              type="button"
              aria-label="Siguiente"
              onClick={() => mover(1)}
              className="flex size-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.05]"
            >
              <ChevronLeftIcon className="size-4 rotate-180" />
            </button>
          </div>

          {vista === "anios" ? (
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 12 }, (_, k) => inicioBloqueAnios + k).map((anio) => (
                <button
                  key={anio}
                  type="button"
                  onClick={() => {
                    setMesVisible(new Date(anio, mesVisible.getMonth(), 1));
                    setVista("meses");
                  }}
                  className={`rounded-lg px-2 py-2 text-xs font-medium ${
                    anio === mesVisible.getFullYear()
                      ? "bg-brand-500 text-white"
                      : anio === hoy.getFullYear()
                        ? "text-brand-600 ring-1 ring-brand-500 dark:text-brand-400"
                        : "text-gray-600 hover:bg-brand-50 dark:text-gray-300 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  {anio}
                </button>
              ))}
            </div>
          ) : vista === "meses" ? (
            <div className="grid grid-cols-3 gap-1.5">
              {MESES.map((nombreMes, i) => (
                <button
                  key={nombreMes}
                  type="button"
                  onClick={() => {
                    setMesVisible(new Date(mesVisible.getFullYear(), i, 1));
                    setVista("dias");
                  }}
                  className={`rounded-lg px-2 py-2 text-xs font-medium ${
                    i === mesVisible.getMonth()
                      ? "bg-brand-500 text-white"
                      : "text-gray-600 hover:bg-brand-50 dark:text-gray-300 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  {nombreMes.slice(0, 3)}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="mb-1 grid grid-cols-7 gap-y-1 text-center text-xs font-medium text-gray-400">
                {DIAS_SEMANA.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
                {construirGrilla(mesVisible).map(({ fecha, delMesActual }) => {
                  const esSeleccionada = !!seleccionada && mismodia(fecha, seleccionada);
                  const esHoy = mismodia(fecha, hoy);
                  const desactivado = fueraDeRango(fecha);
                  return (
                    <button
                      key={fecha.toISOString()}
                      type="button"
                      disabled={desactivado}
                      aria-label={`${fecha.getDate()} de ${MESES[fecha.getMonth()].toLowerCase()} de ${fecha.getFullYear()}`}
                      aria-pressed={esSeleccionada}
                      onClick={() => elegirDia(fecha)}
                      className={`mx-auto flex size-8 items-center justify-center rounded-full ${
                        desactivado
                          ? "cursor-not-allowed text-gray-300 line-through decoration-gray-300 dark:text-gray-700 dark:decoration-gray-700"
                          : !delMesActual
                            ? "text-gray-300 dark:text-gray-700"
                            : "text-gray-700 dark:text-gray-300"
                      } ${
                        esSeleccionada
                          ? "bg-brand-500 text-white"
                          : esHoy
                            ? "ring-1 ring-brand-500 text-brand-600 dark:text-brand-400"
                            : desactivado
                              ? ""
                              : "hover:bg-brand-50 dark:hover:bg-white/[0.05]"
                      }`}
                    >
                      {fecha.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 dark:border-gray-800">
            <button
              type="button"
              onClick={() => elegirDia(new Date())}
              disabled={fueraDeRango(new Date())}
              className="rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-brand-400 dark:hover:bg-white/[0.05]"
            >
              Hoy
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setAbierto(false);
                }}
                className="rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.05]"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>,
        document.body,
        )}
      </div>
    </div>
  );
}
