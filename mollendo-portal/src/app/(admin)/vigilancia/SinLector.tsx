"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { SinLector } from "@/lib/api/types";
import { eventosAccesoApi } from "@/lib/api/endpoints";
import { escucharEventos } from "@/lib/ws";
import { AvisoPanel } from "./AvisoPanel";
import { useAuth } from "@/lib/auth/AuthContext";

/*
 * Contingencia "sin lector": con el lector de DNI de una puerta desconectado
 * (y el controlador en línea), el ingreso es solo con rostro y alcohol y la
 * salida la abre el vigilante desde "Presentes ahora". Se activa y termina
 * sola; aquí, el estado y sus franjas.
 */

const NINGUNO: SinLector = { ingreso: false, salida: false };

/** Puertas con el lector de DNI desconectado; se actualiza en vivo (y cada 15 s, por si se pierde un aviso). */
export function useSinLector(): SinLector {
  const [estado, setEstado] = useState<SinLector>(NINGUNO);
  useEffect(() => {
    let activo = true;
    const cargar = () => {
      eventosAccesoApi
        .sinLector()
        .then((e) => activo && setEstado(e))
        .catch(() => {
          // Sin respuesta: se mantiene lo último conocido.
        });
    };
    cargar();
    const intervalo = setInterval(cargar, 15_000);
    const dejarDeEscuchar = escucharEventos({ "sin-lector": (e: SinLector) => setEstado(e) }, cargar);
    return () => {
      activo = false;
      clearInterval(intervalo);
      dejarDeEscuchar();
    };
  }, []);
  return estado;
}

/** Aviso de una contingencia "sin lector" (píldora roja), con una acción opcional a la derecha. */
export function FranjaSinLector({ titulo, children, accion }: { titulo: string; children: React.ReactNode; accion?: React.ReactNode }) {
  return (
    <AvisoPanel tono="error" etiqueta="Contingencia" pildora={titulo.replace(/\.$/, "")} acciones={accion}>
      {children}
    </AvisoPanel>
  );
}

/** Franjas del Panel de vigilancia: ingreso solo con rostro, y salida desde "Presentes ahora". */
export function FranjasSinLectorPanel({ estado }: { estado: SinLector }) {
  // Cada uno a su dirección de Presentes ahora (el vigilante no tiene Dashboard).
  const rol = useAuth().user?.rol;
  const conDashboard = rol === "administrador";
  return (
    <>
      {estado.ingreso && (
        <FranjaSinLector titulo="Lector de DNI de ingreso sin conexión.">
          El ingreso es solo con rostro y alcohol, sin pasar el DNI.
        </FranjaSinLector>
      )}
      {estado.salida && (
        <FranjaSinLector
          titulo="Lector de DNI de salida sin conexión."
          accion={
            <Link
              href={conDashboard ? "/dashboard/presentes" : "/presentes"}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
            >
              Ir a Presentes ahora
            </Link>
          }
        >
          Abra la salida desde <b>Presentes ahora</b>.
        </FranjaSinLector>
      )}
    </>
  );
}
