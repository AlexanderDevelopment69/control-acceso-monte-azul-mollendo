"use client";

import { useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { useTheme } from "@/context/ThemeContext";

// ApexCharts usa `window`: se carga solo en el navegador.
const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <Esqueleto />,
});

/** Espacio vacío (con el alto del gráfico) mientras se carga ApexCharts. */
function Esqueleto() {
  return <div className="h-full w-full" />;
}

/**
 * Ancho del contenedor, una vez que dejó de cambiar (0 mientras tanto).
 * ApexCharts, al redibujarse por un cambio de tamaño, pone las barras en su
 * altura final sin animación (y corta la animación si estaba en curso). Por
 * eso el gráfico se monta con el ancho ya estable y, si el ancho cambia, se
 * vuelve a montar (con su animación) en lugar de dejar que ApexCharts lo redibuje.
 */
function useAnchoEstable(ref: React.RefObject<HTMLDivElement | null>) {
  const [ancho, setAncho] = useState(0);
  // Antes de pintar: el primer ancho se toma en el acto (el alto ya es fijo) y
  // solo los cambios posteriores esperan a que el tamaño se asiente.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setAncho(Math.round(el.clientWidth));
    let espera: ReturnType<typeof setTimeout> | undefined;
    const observador = new ResizeObserver(() => {
      if (espera) clearTimeout(espera);
      espera = setTimeout(() => setAncho(Math.round(el.clientWidth)), 200);
    });
    observador.observe(el);
    return () => {
      observador.disconnect();
      if (espera) clearTimeout(espera);
    };
  }, [ref]);
  return ancho;
}

export const COLORES = {
  marca: "#465fff",
  exito: "#12b76a",
  error: "#f04438",
  aviso: "#f79009",
  celeste: "#0ba5ec",
  morado: "#7a5af8",
  gris: "#98a2b3",
};

/**
 * Gráfico de ApexCharts con el estilo del portal (fuente, colores del tema
 * claro u oscuro, sin barra de herramientas). `opciones` se combina con la base.
 */
export function Grafico({
  tipo,
  series,
  opciones,
  alto = 280,
}: {
  tipo: "bar" | "donut" | "area" | "line";
  series: ApexOptions["series"];
  opciones: ApexOptions;
  alto?: number;
}) {
  const { theme } = useTheme();
  const contenedor = useRef<HTMLDivElement>(null);
  const ancho = useAnchoEstable(contenedor);
  const oscuro = theme === "dark";
  // Cantidad de barras o porciones: define si conviene escalonar la animación.
  const puntos = (series ?? []).reduce<number>(
    (suma, s) => suma + (typeof s === "number" ? 1 : Array.isArray((s as { data?: unknown[] }).data) ? (s as { data: unknown[] }).data.length : 1),
    0,
  );
  const texto = oscuro ? "#98a2b3" : "#667085";

  const base: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
      zoom: { enabled: false },
      background: "transparent",
      // El tamaño lo maneja useAnchoEstable (ver arriba).
      redrawOnParentResize: false,
      redrawOnWindowResize: false,
      foreColor: texto,
      // Animación al cargar (las barras suben, la dona gira) y al actualizarse.
      // Corta y con salida suave; el escalonado entre barras solo con pocas
      // barras (con muchas, la última empezaría segundos después).
      // respectReducedMotion: false porque, si el sistema pide reducir el
      // movimiento, ApexCharts dibuja los gráficos sin animación.
      animations: {
        enabled: true,
        respectReducedMotion: false,
        easing: "easeout",
        speed: 550,
        animateGradually: { enabled: puntos <= 12, delay: 60 },
        dynamicAnimation: { enabled: true, speed: 350 },
      },
    },
    theme: { mode: oscuro ? "dark" : "light" },
    grid: { borderColor: oscuro ? "#1d2939" : "#e4e7ec", strokeDashArray: 4 },
    dataLabels: { enabled: false },
    legend: { position: "bottom", fontSize: "13px", labels: { colors: texto }, markers: { size: 6 } },
    tooltip: { theme: oscuro ? "dark" : "light" },
    // Sin la línea de los ejes ni sus marcas, y sin borde en barras y porciones:
    // solo queda la cuadrícula punteada de fondo.
    xaxis: { axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { axisBorder: { show: false }, axisTicks: { show: false } },
    stroke: { width: tipo === "line" || tipo === "area" ? 2 : 0 },
    noData: { text: "Sin datos en el periodo", style: { color: texto } },
  };

  // react-apexcharts compara las opciones en cada render y, si difieren, llama a
  // updateOptions: el gráfico se redibuja y las barras saltan a su altura final
  // sin animación. Las opciones traen funciones (formatos de los ejes) que son
  // nuevas en cada render, así que se conservan los mismos objetos mientras no
  // cambie su contenido (datos, opciones o tema).
  const firma = JSON.stringify({ tipo, series, opciones, oscuro }, (_, v) =>
    typeof v === "function" ? String(v) : v,
  );
  const [estable, setEstable] = useState(() => ({ firma, series, opciones: combinar(base, opciones) }));
  if (estable.firma !== firma) {
    setEstable({ firma, series, opciones: combinar(base, opciones) });
  }

  // Alto fijo desde el principio: el espacio no cambia de tamaño al aparecer el gráfico.
  return (
    <div ref={contenedor} style={{ height: alto }}>
      {ancho > 0 ? (
        <Chart key={ancho} type={tipo} height={alto} width={ancho} series={estable.series} options={estable.opciones} />
      ) : (
        <Esqueleto />
      )}
    </div>
  );
}

/** Mezcla profunda de las opciones (las del gráfico ganan sobre la base). */
function combinar<T>(base: T, extra: T): T {
  if (typeof base !== "object" || base === null || Array.isArray(base)) return extra ?? base;
  const resultado = { ...base } as Record<string, unknown>;
  for (const [clave, valor] of Object.entries((extra ?? {}) as Record<string, unknown>)) {
    const actual = resultado[clave];
    resultado[clave] =
      valor && typeof valor === "object" && !Array.isArray(valor) && actual && typeof actual === "object"
        ? combinar(actual, valor)
        : valor;
  }
  return resultado as T;
}
