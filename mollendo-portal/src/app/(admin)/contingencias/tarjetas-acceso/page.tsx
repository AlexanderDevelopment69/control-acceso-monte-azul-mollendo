"use client";

import { RequireRole } from "@/lib/auth/RequireRole";
import { TarjetasPantalla } from "../tarjetas/TarjetasPantalla";

/** Tarjetas de acceso: abren solas el molinete (visitas, autoridades). Las maneja el administrador. */
export default function TarjetasAccesoPage() {
  return (
    <RequireRole roles={["administrador"]}>
      <TarjetasPantalla tipo="acceso" />
    </RequireRole>
  );
}
