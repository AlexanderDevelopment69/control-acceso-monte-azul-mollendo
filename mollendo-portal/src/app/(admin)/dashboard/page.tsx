"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RequireRole } from "@/lib/auth/RequireRole";
import { escucharEventos } from "@/lib/ws";
import { panelApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { Dashboard, Paginado, PersonaPermanencia } from "@/lib/api/types";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import Button from "@/components/ui/button/Button";
import Tarjeta from "@/components/ui/tarjeta/Tarjeta";
import TarjetaIndicador from "@/components/ui/tarjeta/TarjetaIndicador";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { COLORES, Grafico } from "@/components/dashboard/Grafico";
import { TableFooter } from "@/components/tables/TableFooter";
import { AltoEstable } from "@/components/tables/AltoEstable";
import { pieDePagina } from "@/lib/paginaServidor";
import { SelectorPeriodo, usePeriodo } from "@/components/common/SelectorPeriodo";
import { agruparTendencia } from "@/components/dashboard/agruparTendencia";
import { CheckCircleIcon, GroupIcon, TimeIcon, UserIcon } from "@/icons";

const POR_PAGINA_PERMANENCIA = 10;

/** Paso entero y redondo (1, 2, 3, 4, 5, 6, 8, 10, 20, 30…) que cubre `valor`. */
function pasoRedondo(valor: number): number {
  const potencia = 10 ** Math.floor(Math.log10(Math.max(1, valor)));
  const multiplo = [1, 2, 3, 4, 5, 6, 8, 10].find((m) => m * potencia >= valor) ?? 10;
  return multiplo * potencia;
}

/**
 * Eje de cantidades enteras con marcas redondas: una por unidad cuando los
 * valores son pocos (0 a 6) y, si no, hasta 5 marcas de un paso redondo
 * (0, 3, 6…; 0, 300, 600…). Con `holgura`, deja espacio sobre la barra más alta para el
 * número que va encima.
 */
function ejeEntero(valores: number[], holgura = false) {
  const mayor = Math.max(1, ...valores);
  const tope = holgura ? mayor * 1.15 : mayor;
  if (tope <= 6) {
    const maximo = Math.ceil(holgura ? mayor + 1 : mayor);
    return { min: 0, max: maximo, tickAmount: maximo, labels: { formatter: (v: number | string) => String(Math.round(Number(v))) } };
  }
  // Hasta la primera marca redonda que cubre el valor (51 → 0, 20, 40, 60).
  const paso = pasoRedondo(tope / 5);
  const marcas = Math.ceil(tope / paso);
  return {
    min: 0,
    max: marcas * paso,
    tickAmount: marcas,
    labels: { formatter: (v: number | string) => String(Math.round(Number(v))) },
  };
}

/** En las donas, sin porcentaje en las porciones chicas (se ve al pasar el mouse). */
const porcentajeVisible = (valor: number | string | number[]) =>
  typeof valor === "number" && valor >= 5 ? `${valor.toFixed(1)}%` : "";

/** Con movimiento continuo, el Dashboard se recarga como máximo cada tanto. */
const RECARGA_MINIMA_MS = 10_000;

const TITULO_TENDENCIA = { dia: "por día", semana: "por semana", mes: "por mes" } as const;

/** 9452.1 → "9,452.1" (un decimal como mucho). */
const horas = (v: number) => v.toLocaleString("es-PE", { maximumFractionDigits: 1 });

/** Debajo del título del gráfico: el total del periodo. */
function textoHorasHombre(d: Dashboard): string {
  const h = d.horasHombre;
  if (!h) return "Tiempo dentro del terminal, de cada ingreso a su salida";
  return `Total del periodo: ${horas(h.horas)} h, de ${h.visitas} ingresos con su salida por el molinete.`;
}

/** Horas o días transcurridos desde una fecha, para la permanencia. */
function tiempoDentro(desde: string, ahora: string): string {
  const horas = Math.floor((new Date(ahora).getTime() - new Date(desde).getTime()) / 3_600_000);
  if (horas < 48) return `${horas} h`;
  return `${Math.floor(horas / 24)} días`;
}

/**
 * Presentes actualmente = todas las personas dentro, sin importar cuándo
 * entraron. El gráfico solo cuenta los ingresos del periodo; la diferencia son
 * quienes entraron antes del periodo (p. ej. la permanencia mayor a 12 h).
 */
function detallePresentes(d: Dashboard | null): string {
  if (!d) return "Personas que ingresaron y aún no registran salida";
  const anteriores = Math.max(0, d.presencia.presentes - d.visitas.presentes);
  if (anteriores === 0) return "Personas que ingresaron y aún no registran salida";
  return `${d.visitas.presentes} ingresaron en el periodo · ${anteriores} antes del periodo`;
}

/** Recuadro de un gráfico o tabla del Dashboard, con su título y descripción. */
function Bloque({
  titulo,
  descripcion,
  children,
  className = "",
}: {
  titulo: string;
  descripcion?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Tarjeta as="section" className={`flex flex-col p-5 ${className}`}>
      <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">{titulo}</h2>
      {descripcion && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{descripcion}</p>}
      <div className="mt-4 flex flex-1 flex-col">{children}</div>
    </Tarjeta>
  );
}

function DashboardContent() {
  const periodoElegido = usePeriodo();
  const [datos, setDatos] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [paginaPermanencia, setPaginaPermanencia] = useState(1);
  const [permanencia, setPermanencia] = useState<Paginado<PersonaPermanencia> | null>(null);
  const router = useRouter();

  const { desde, hasta, rangoValido } = periodoElegido;

  const cargar = useCallback(async () => {
    if (!rangoValido) return;
    try {
      const [tablero, lista] = await Promise.all([
        panelApi.dashboard({ desde, hasta }),
        panelApi.permanencia({ pagina: paginaPermanencia, porPagina: POR_PAGINA_PERMANENCIA }),
      ]);
      setDatos(tablero);
      // Si la página quedó fuera del total (alguien registró su salida), vuelve a la primera.
      if (lista.datos.length === 0 && lista.total > 0 && paginaPermanencia > 1) setPaginaPermanencia(1);
      else setPermanencia(lista);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar los indicadores");
    } finally {
      setCargando(false);
    }
  }, [desde, hasta, rangoValido, paginaPermanencia]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Se actualiza con los ingresos y salidas (tiempo real) y cada minuto, para
  // que la permanencia mayor a 12 horas avance aunque no haya movimientos. Con
  // mucho movimiento (cambio de turno) se recarga como máximo cada 10 s: si se
  // recargara con cada persona, los gráficos se redibujarían sin parar.
  const cargarActual = useRef(cargar);
  useEffect(() => {
    cargarActual.current = cargar;
  }, [cargar]);
  useEffect(() => {
    let pendiente: ReturnType<typeof setTimeout> | null = null;
    let ultimaRecarga = Date.now();
    const recargar = () => {
      pendiente = null;
      ultimaRecarga = Date.now();
      void cargarActual.current();
    };
    // Al recuperar la conexión, recarga lo que llegó mientras estaba cortada.
    const dejarDeEscuchar = escucharEventos(
      {
        "evento-acceso": () => {
          if (pendiente) return; // ya hay una recarga programada: la incluye
          const espera = Math.max(1000, ultimaRecarga + RECARGA_MINIMA_MS - Date.now());
          pendiente = setTimeout(recargar, espera);
        },
      },
      recargar,
    );
    const intervalo = setInterval(recargar, 60_000);
    return () => {
      dejarDeEscuchar();
      if (pendiente) clearTimeout(pendiente);
      clearInterval(intervalo);
    };
  }, []);

  const d = datos;
  const { agrupacion, puntos: tendencia } = agruparTendencia(d?.movimientos.tendencia ?? []);
  const motivos = d?.movimientos.motivos;
  const totales = d?.movimientos.totales;
  const hayVisitas = (d?.visitas.total ?? 0) > 0;
  const hayDocumentos = !!d && d.documentos.vigentes + d.documentos.porVencer + d.documentos.vencidos > 0;
  const hayMotivos = !!motivos && Object.values(motivos).some((n) => n > 0);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Indicadores de presencia, ingresos y salidas, personal y documentos. Se actualiza en tiempo real."
      />

      <SelectorPeriodo estado={periodoElegido} id="dashboard" className="mb-6" />

      {error && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <ErrorBanner className="flex-1">{error}</ErrorBanner>
          <Button type="button" variant="outline" size="sm" onClick={() => void cargar()}>
            Reintentar
          </Button>
        </div>
      )}
      {!rangoValido && <ErrorBanner className="mb-6">Elija las fechas &quot;desde&quot; y &quot;hasta&quot; del periodo.</ErrorBanner>}

      {/* Indicadores principales */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaIndicador
          titulo="Presentes actualmente"
          valor={d?.presencia.presentes ?? null}
          detalle={detallePresentes(d)}
          icono={<UserIcon />}
          fondoIcono="bg-brand-500"
          title="Ver quiénes están dentro"
          onClick={() => router.push("/dashboard/presentes")}
        />
        <TarjetaIndicador
          titulo="Ingresos finalizados"
          valor={d?.visitas.finalizadas ?? null}
          detalle="Ingresos del periodo que ya registraron su salida"
          icono={<CheckCircleIcon />}
          fondoIcono="bg-success-500"
        />
        <TarjetaIndicador
          titulo="Total de ingresos"
          valor={d?.visitas.total ?? null}
          detalle="Ingresos autorizados en el periodo"
          icono={<GroupIcon />}
          fondoIcono="bg-[#7a5af8]"
        />
        <TarjetaIndicador
          // Espacio que no se corta: "12 h" siempre en la misma línea.
          titulo={"Permanencia mayor a 12\u00a0h"}
          valor={d?.presencia.masDe12h ?? null}
          detalle="Ingresaron hace más de 12 horas y no registran salida"
          icono={<TimeIcon />}
          fondoIcono="bg-warning-500"
        />
      </div>

      {cargando && !d ? (
        <p className="text-sm text-gray-400">Cargando indicadores…</p>
      ) : (
        d && (
          <div className="space-y-6">
            {/* Ingresos del periodo: presentes y finalizados */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Bloque titulo="Comparativa de ingresos" descripcion={`Total de ingresos en el periodo: ${d.visitas.total}`}>
                {!hayVisitas ? (
                  <SinDatos texto="No hubo ingresos en el periodo." />
                ) : (
                  <Grafico
                    tipo="bar"
                    series={[{ name: "Ingresos", data: [d.visitas.presentes, d.visitas.finalizadas] }]}
                    opciones={{
                      colors: [COLORES.marca, COLORES.exito],
                      plotOptions: { bar: { distributed: true, borderRadius: 6, columnWidth: "45%", dataLabels: { position: "top" } } },
                      dataLabels: { enabled: true, offsetY: -24, style: { fontSize: "13px", colors: ["#667085"] } },
                      xaxis: { categories: ["Presentes", "Finalizados"] },
                      yaxis: ejeEntero([d.visitas.presentes, d.visitas.finalizadas], true),
                      legend: { show: false },
                    }}
                  />
                )}
              </Bloque>
              <Bloque titulo="Distribución: presentes frente a finalizados" descripcion="Ingresos del periodo según hayan registrado su salida">
                {hayVisitas ? (
                  <Grafico
                    tipo="donut"
                    series={[d.visitas.presentes, d.visitas.finalizadas]}
                    opciones={{
                      labels: ["Presentes", "Finalizados"],
                      colors: [COLORES.marca, COLORES.exito],
                      dataLabels: { enabled: true, formatter: porcentajeVisible },
                      plotOptions: {
                        pie: { donut: { size: "62%", labels: { show: true, total: { show: true, label: "Total" } } } },
                      },
                    }}
                  />
                ) : (
                  <SinDatos texto="No hubo ingresos en el periodo." />
                )}
              </Bloque>
            </div>

            {/* Ingresos y salidas */}
            <Bloque
              titulo={`Ingresos y salidas ${TITULO_TENDENCIA[agrupacion]}`}
              descripcion={
                totales
                  ? `${totales.ingresosAutorizados} ingresos autorizados · ${totales.ingresosDenegados} ingresos denegados · ${totales.salidasAutorizadas} salidas`
                  : undefined
              }
            >
              <Grafico
                tipo="bar"
                alto={300}
                series={[
                  { name: "Ingresos autorizados", data: tendencia.map((t) => t.ingresos) },
                  { name: "Denegados", data: tendencia.map((t) => t.denegados) },
                  { name: "Salidas", data: tendencia.map((t) => t.salidas) },
                ]}
                opciones={{
                  colors: [COLORES.exito, COLORES.error, COLORES.celeste],
                  plotOptions: { bar: { borderRadius: 3, columnWidth: tendencia.length > 14 ? "80%" : "50%" } },
                  xaxis: {
                    categories: tendencia.map((t) => t.etiqueta),
                    tickAmount: Math.min(tendencia.length, 15),
                    labels: { rotate: 0, hideOverlappingLabels: true },
                  },
                  yaxis: ejeEntero(tendencia.flatMap((t) => [t.ingresos, t.denegados, t.salidas])),
                }}
              />
            </Bloque>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Bloque titulo="Motivos de denegación" descripcion="Una denegación puede tener varios motivos">
                {hayMotivos && motivos ? (
                  <Grafico
                    tipo="bar"
                    series={[
                      {
                        name: "Denegaciones",
                        data: [
                          motivos.documentos,
                          motivos.sinDocumentos,
                          motivos.alcohol,
                          motivos.sinVerificacion,
                          motivos.rostroNoCoincide ?? 0,
                          motivos.yaDentro ?? 0,
                          motivos.sinIngreso ?? 0,
                          motivos.fueraPeriodo ?? 0,
                          motivos.dadoDeBaja,
                          motivos.noRegistrado,
                        ],
                      },
                    ]}
                    opciones={{
                      colors: [COLORES.error],
                      plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: "55%" } },
                      dataLabels: { enabled: true },
                      xaxis: {
                        categories: [
                          "Documentos vencidos",
                          "Sin documentos",
                          "Alcohol",
                          "No completó rostro y alcohol",
                          "Rostro no coincide",
                          "Ya figura dentro",
                          "No registra ingreso",
                          "Fuera del período autorizado",
                          "Dado de baja",
                          "No registrado",
                        ],
                        ...ejeEntero(Object.values(motivos)),
                      },
                    }}
                  />
                ) : (
                  <SinDatos texto="No hubo denegaciones en el periodo." />
                )}
              </Bloque>
              <Bloque
                titulo="Documentos del personal activo"
                descripcion={`Por vencer: vencen en los próximos ${d.documentos.diasAviso} días`}
              >
                {hayDocumentos ? (
                  <Grafico
                    tipo="donut"
                    series={[d.documentos.vigentes, d.documentos.porVencer, d.documentos.vencidos]}
                    opciones={{
                      labels: ["Vigentes", "Por vencer", "Vencidos"],
                      colors: [COLORES.exito, COLORES.aviso, COLORES.error],
                      dataLabels: { enabled: true, formatter: porcentajeVisible },
                      plotOptions: {
                        pie: { donut: { size: "62%", labels: { show: true, total: { show: true, label: "Documentos" } } } },
                      },
                    }}
                  />
                ) : (
                  <SinDatos texto="Todavía no hay documentos cargados." />
                )}
              </Bloque>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Bloque titulo="Personal registrado">
                <ResumenPersonal personal={d.personal} presentes={d.presencia.presentes} />
              </Bloque>
              <Bloque titulo="Personal activo por empresa" className="lg:col-span-2">
                {d.porEmpresa.length ? (
                  <Grafico
                    tipo="bar"
                    alto={Math.max(200, d.porEmpresa.length * 42)}
                    series={[{ name: "Personas activas", data: d.porEmpresa.map((e) => e.activos) }]}
                    opciones={{
                      colors: [COLORES.marca],
                      plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: "60%" } },
                      dataLabels: { enabled: true },
                      xaxis: {
                        categories: d.porEmpresa.map((e) => e.empresa),
                        ...ejeEntero(d.porEmpresa.map((e) => e.activos)),
                      },
                      yaxis: { labels: { maxWidth: 220 } },
                      // En el celular, nombres más cortos para que las barras tengan espacio.
                      responsive: [{ breakpoint: 640, options: { yaxis: { labels: { maxWidth: 110 } } } }],
                    }}
                  />
                ) : (
                  <SinDatos texto="Todavía no hay personal activo." />
                )}
              </Bloque>
            </div>

            {/* Ingresos por perfil */}
            <Bloque
              titulo="Ingresos por perfil"
              descripcion={
                <>
                  Ingresos autorizados del periodo según el perfil de la persona. <b>Sin perfil</b>: registradas antes de que existiera el
                  perfil.
                </>
              }
            >
              {d.porPerfil?.length ? (
                <Grafico
                  tipo="bar"
                  alto={Math.max(200, d.porPerfil.length * 42)}
                  series={[{ name: "Ingresos", data: d.porPerfil.map((p) => p.ingresos) }]}
                  opciones={{
                    colors: [COLORES.marca],
                    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: "60%" } },
                    dataLabels: { enabled: true },
                    xaxis: {
                      categories: d.porPerfil.map((p) => p.perfil),
                      ...ejeEntero(d.porPerfil.map((p) => p.ingresos)),
                    },
                    yaxis: { labels: { maxWidth: 220 } },
                    responsive: [{ breakpoint: 640, options: { yaxis: { labels: { maxWidth: 110 } } } }],
                  }}
                />
              ) : (
                <SinDatos texto="Ningún ingreso autorizado en el periodo." />
              )}
            </Bloque>

            {/* Horas-hombre por empresa */}
            <Bloque
              titulo="Horas-hombre por empresa"
              descripcion={textoHorasHombre(d)}
            >
              {d.horasHombre?.porEmpresa.length ? (
                <Grafico
                  tipo="bar"
                  alto={Math.max(200, d.horasHombre.porEmpresa.length * 42)}
                  series={[{ name: "Horas-hombre", data: d.horasHombre.porEmpresa.map((e) => e.horas) }]}
                  opciones={{
                    colors: [COLORES.marca],
                    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: "60%" } },
                    dataLabels: { enabled: true, formatter: (v: number) => `${horas(v)} h` },
                    tooltip: { y: { formatter: (v: number) => `${horas(v)} h` } },
                    xaxis: {
                      categories: d.horasHombre.porEmpresa.map((e) => e.empresa),
                      labels: { formatter: (v: string) => horas(Number(v)) },
                    },
                    yaxis: { labels: { maxWidth: 260 } },
                    // En el celular, nombres más cortos para que las barras tengan espacio.
                    responsive: [{ breakpoint: 640, options: { yaxis: { labels: { maxWidth: 110 } } } }],
                  }}
                />
              ) : (
                <SinDatos texto="Ningún ingreso con salida en el periodo." />
              )}
            </Bloque>

            {/* Permanencia mayor a 12 horas */}
            <Bloque
              titulo="Permanencia mayor a 12 horas"
              descripcion="Personas cuyo último movimiento es un ingreso de hace más de 12 horas."
            >
              {!permanencia || permanencia.total === 0 ? (
                <SinDatos texto="Nadie lleva más de 12 horas dentro." />
              ) : (
                // Con poco espacio, el documento va bajo el nombre y el ingreso en dos líneas: cabe sin cortarse.
                <div className="@container overflow-x-auto [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
                  <AltoEstable
                    paginaCompleta={permanencia.datos.length === POR_PAGINA_PERMANENCIA}
                    variasPaginas={permanencia.total > POR_PAGINA_PERMANENCIA}
                  >
                    <Table>
                      <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                        <TableRow>
                          {["Persona", "Documento", "Empresa", "Ingreso", "Tiempo dentro"].map((c) => (
                            <TableCell
                              key={c}
                              isHeader
                              className={`${c === "Documento" ? "hidden @5xl:table-cell " : ""}px-4 py-3 text-start text-xs font-medium text-gray-500`}
                            >
                              {c}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {permanencia.datos.map((p) => (
                          <TableRow key={p.personaId}>
                            <TableCell className="px-4 py-3 text-sm text-gray-800 dark:text-white/90">
                              {p.nombres} {p.apellidos}
                              <span className="block text-xs text-gray-500 @5xl:hidden dark:text-gray-400">{p.numeroDocumento}</span>
                            </TableCell>
                            <TableCell className="hidden px-4 py-3 text-sm text-gray-600 @5xl:table-cell dark:text-gray-300">
                              {p.numeroDocumento}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{p.empresa}</TableCell>
                            <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                              {new Date(p.ingreso).toLocaleDateString("es-PE")}
                              <span className="block @5xl:inline @5xl:before:content-[',_'] text-gray-500 dark:text-gray-400">
                                {new Date(p.ingreso).toLocaleTimeString("es-PE")}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm font-medium text-warning-600 dark:text-orange-400">
                              {tiempoDentro(p.ingreso, d.generadoEn)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AltoEstable>
                </div>
              )}
              {!!permanencia && permanencia.total > 0 && (
                // El pie ocupa todo el ancho de la tarjeta, como en las demás tablas.
                <div className="-mx-5 -mb-5 mt-2">
                  <TableFooter {...pieDePagina(permanencia)} onPageChange={setPaginaPermanencia} />
                </div>
              )}
            </Bloque>
          </div>
        )
      )}
    </div>
  );
}

const porcentaje = (parte: number, total: number) => (total > 0 ? Math.round((parte / total) * 100) : 0);

/** Total de personal, proporción de activos y dados de baja, y cuántos están dentro ahora. */
function ResumenPersonal({ personal, presentes }: { personal: Dashboard["personal"]; presentes: number }) {
  const pActivos = porcentaje(personal.activos, personal.total);
  const pDentro = porcentaje(presentes, personal.activos);
  const filas = [
    { etiqueta: "Activos", valor: personal.activos, pct: pActivos, color: "bg-success-500" },
    { etiqueta: "Dados de baja", valor: personal.dadosDeBaja, pct: personal.total ? 100 - pActivos : 0, color: "bg-gray-300 dark:bg-gray-600" },
  ];
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-4xl font-semibold text-gray-800 dark:text-white/90">{personal.total}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">personas registradas</p>
        </div>
        <span className="flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400 [&_svg]:size-6">
          <GroupIcon />
        </span>
      </div>

      {/* Proporción de activos y dados de baja */}
      <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div className="bg-success-500 transition-[width] duration-700" style={{ width: `${pActivos}%` }} />
        <div className="bg-gray-300 dark:bg-gray-600" style={{ width: `${personal.total ? 100 - pActivos : 0}%` }} />
      </div>
      <ul className="mt-4 space-y-3">
        {filas.map((f) => (
          <li key={f.etiqueta} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span className={`size-2.5 rounded-full ${f.color}`} />
              {f.etiqueta}
            </span>
            <span className="font-medium text-gray-800 dark:text-white/90">
              {f.valor} <span className="font-normal text-gray-400">· {f.pct}%</span>
            </span>
          </li>
        ))}
      </ul>

      {/* Cuántos del personal activo están dentro ahora */}
      <div className="mt-auto pt-5">
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">En el terminal ahora</span>
            <span className="font-semibold text-brand-500 dark:text-brand-400">
              {presentes} <span className="font-normal text-gray-400">de {personal.activos}</span>
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div className="h-full rounded-full bg-brand-500 transition-[width] duration-700" style={{ width: `${Math.min(100, pDentro)}%` }} />
          </div>
          <p className="mt-2 text-xs text-gray-400">{pDentro}% del personal activo</p>
        </div>
      </div>
    </div>
  );
}

function SinDatos({ texto }: { texto: string }) {
  return <p className="flex h-40 items-center justify-center text-sm text-gray-400">{texto}</p>;
}

export default function DashboardPage() {
  return (
    <RequireRole roles={["administrador"]}>
      <DashboardContent />
    </RequireRole>
  );
}
