"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ApexOptions } from "apexcharts";
import type ApexChartsTipo from "apexcharts";
import { useTheme } from "@/context/ThemeContext";

// ApexCharts usa `window`: se carga solo en el navegador, una sola vez.
let ApexCharts: typeof ApexChartsTipo | null = null;
let cargaApex: Promise<void> | null = null;

/**
 * Carga ApexCharts. El portal la llama apenas queda libre (ver el layout del
 * administrador), así al entrar al Dashboard el código ya está listo y no se
 * suma su carga (~40 ms) al momento en que los gráficos empiezan a animarse.
 */
export function precargarGraficos(): Promise<void> {
  cargaApex ??= import("apexcharts/client").then((m) => {
    ApexCharts = m.default;
  });
  return cargaApex;
}

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
  // Se monta cuando ApexCharts ya está cargado (normalmente ya lo está: ver precargarGraficos).
  const [montado, setMontado] = useState(() => ApexCharts !== null);
  useEffect(() => {
    if (montado) return;
    let vigente = true;
    void precargarGraficos().then(() => {
      if (vigente) setMontado(true);
    });
    return () => {
      vigente = false;
    };
  }, [montado]);
  const oscuro = theme === "dark";
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
      // Animaciones: las de ApexCharts por defecto (a pedido del usuario).
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
      {ancho > 0 && montado && ApexCharts ? (
        <Lienzo
          key={ancho}
          Clase={ApexCharts}
          tipo={tipo}
          alto={alto}
          ancho={ancho}
          series={estable.series}
          opciones={estable.opciones}
        />
      ) : (
        <Esqueleto />
      )}
    </div>
  );
}

/**
 * El gráfico de ApexCharts en sí (en lugar de react-apexcharts): se crea una
 * vez, con su animación, y solo se actualiza cuando cambian los datos o las
 * opciones (llegan los mismos objetos si no cambian).
 */
function Lienzo({
  Clase,
  tipo,
  alto,
  ancho,
  series,
  opciones,
}: {
  Clase: typeof ApexChartsTipo;
  tipo: "bar" | "donut" | "area" | "line";
  alto: number;
  ancho: number;
  series: ApexOptions["series"];
  opciones: ApexOptions;
}) {
  const el = useRef<HTMLDivElement>(null);
  const grafico = useRef<ApexChartsTipo | null>(null);
  // ApexCharts modifica lo que recibe (p. ej. agrega `group` a cada serie): se le
  // da una copia, si no los datos del gráfico "cambian" solos y se redibuja sin animación.
  const configuracion = (): ApexOptions =>
    copiaProfunda({
      ...opciones,
      chart: { ...opciones.chart, type: tipo, height: alto, width: ancho },
      series,
    });
  const inicial = useRef(configuracion);
  // Se crea al montar (el ancho y el alto vienen fijos: si cambian, se monta otro).
  useEffect(() => {
    if (!el.current) return;
    const g = new Clase(el.current, inicial.current());
    grafico.current = g;
    void g.render();
    return () => {
      grafico.current = null;
      g.destroy();
    };
  }, [Clase]);
  // Datos u opciones nuevos (tiempo real, otro periodo, tema): se actualiza.
  const primeraVez = useRef(true);
  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false;
      return;
    }
    void grafico.current?.updateOptions(copiaProfunda({ ...opciones, series }));
  }, [series, opciones]);
  return <div ref={el} />;
}

/** Copia de objetos y listas (las funciones, como los formatos de los ejes, se conservan). */
function copiaProfunda<T>(valor: T): T {
  if (Array.isArray(valor)) return valor.map((v) => copiaProfunda(v)) as T;
  if (valor && typeof valor === "object" && Object.getPrototypeOf(valor) === Object.prototype) {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, copiaProfunda(v)])) as T;
  }
  return valor;
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
