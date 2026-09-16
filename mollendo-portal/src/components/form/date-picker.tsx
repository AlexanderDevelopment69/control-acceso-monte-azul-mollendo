"use client";

import React, { useEffect, useRef, useState } from "react";
import Label from "./Label";
import { CalenderIcon, ChevronLeftIcon } from "../../icons";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIAS_SEMANA = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

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

function mismodia(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function construirGrilla(mesVisible: Date): { fecha: Date; delMesActual: boolean }[] {
  const primerDiaMes = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 1);
  const inicio = new Date(primerDiaMes);
  inicio.setDate(inicio.getDate() - primerDiaMes.getDay());

  return Array.from({ length: 42 }, (_, i) => {
    const fecha = new Date(inicio);
    fecha.setDate(inicio.getDate() + i);
    return { fecha, delMesActual: fecha.getMonth() === mesVisible.getMonth() };
  });
}

type PropsType = {
  id: string;
  value: string; // "YYYY-MM-DD" o ""
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
};

export default function DatePicker({ id, value, onChange, label, placeholder }: PropsType) {
  const [abierto, setAbierto] = useState(false);
  const [vista, setVista] = useState<"dias" | "meses">("dias");
  const [mesVisible, setMesVisible] = useState<Date>(() => parsearFecha(value) ?? new Date());
  const [texto, setTexto] = useState(value);
  // Si `value` cambia desde afuera (el padre lo resetea, por ejemplo), hay
  // que reflejarlo en el texto — pero ajustar el estado durante el render
  // (patrón recomendado por React para esto) en vez de un useEffect, para no
  // disparar un render de más ni la regla de lint que lo marca como riesgo
  // de renders en cascada.
  const [valorPrevio, setValorPrevio] = useState(value);
  if (value !== valorPrevio) {
    setValorPrevio(value);
    setTexto(value);
    const fecha = parsearFecha(value);
    if (fecha) setMesVisible(fecha);
  }
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [abierto]);

  function abrir() {
    setVista("dias");
    setMesVisible(parsearFecha(value) ?? new Date());
    setAbierto(true);
  }

  function elegirDia(fecha: Date) {
    onChange(formatearFecha(fecha));
    setAbierto(false);
  }

  function cambiarMes(delta: number) {
    setMesVisible((actual) => new Date(actual.getFullYear(), actual.getMonth() + delta, 1));
  }

  function cambiarAnio(delta: number) {
    setMesVisible((actual) => new Date(actual.getFullYear() + delta, actual.getMonth(), 1));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const nuevoTexto = e.target.value;
    setTexto(nuevoTexto);
    if (nuevoTexto === "") {
      onChange("");
      return;
    }
    const fecha = parsearFecha(nuevoTexto);
    if (fecha) {
      onChange(nuevoTexto);
      setMesVisible(fecha);
    }
  }

  function handleInputBlur() {
    // Si lo que quedó escrito no es una fecha válida, se descarta y vuelve
    // a mostrar el último valor válido — no se deja texto suelto sin sentido.
    if (texto !== "" && !parsearFecha(texto)) setTexto(value);
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
          onFocus={abrir}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          placeholder={placeholder}
          autoComplete="off"
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800"
        />
        <button
          type="button"
          onClick={abrir}
          className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 dark:text-gray-400"
        >
          <CalenderIcon className="size-6" />
        </button>

        {abierto && (
        <div className="absolute left-0 top-full z-40 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => (vista === "dias" ? cambiarMes(-1) : cambiarAnio(-1))}
              className="flex size-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.05]"
            >
              <ChevronLeftIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setVista(vista === "dias" ? "meses" : "dias")}
              className="rounded-lg px-3 py-1 text-sm font-semibold text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-white/[0.05]"
            >
              {vista === "dias" ? `${MESES[mesVisible.getMonth()]} ${mesVisible.getFullYear()}` : mesVisible.getFullYear()}
            </button>
            <button
              type="button"
              onClick={() => (vista === "dias" ? cambiarMes(1) : cambiarAnio(1))}
              className="flex size-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.05]"
            >
              <ChevronLeftIcon className="size-4 rotate-180" />
            </button>
          </div>

          {vista === "meses" ? (
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
                  return (
                    <button
                      key={fecha.toISOString()}
                      type="button"
                      onClick={() => elegirDia(fecha)}
                      className={`mx-auto flex size-8 items-center justify-center rounded-full ${
                        !delMesActual ? "text-gray-300 dark:text-gray-700" : "text-gray-700 dark:text-gray-300"
                      } ${esSeleccionada ? "bg-brand-500 text-white" : esHoy ? "ring-1 ring-brand-500 text-brand-600 dark:text-brand-400" : "hover:bg-brand-50 dark:hover:bg-white/[0.05]"}`}
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
              className="rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-white/[0.05]"
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
        </div>
        )}
      </div>
    </div>
  );
}
