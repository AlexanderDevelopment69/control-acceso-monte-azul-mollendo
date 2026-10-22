"use client";

import { RequireRole } from "@/lib/auth/RequireRole";
import { TarjetasPantalla } from "./TarjetasPantalla";

export default function TarjetasContingenciaPage() {
  return (
    <RequireRole roles={["administrador"]}>
      <TarjetasPantalla tipo="contingencia" />
    </RequireRole>
  );
}
