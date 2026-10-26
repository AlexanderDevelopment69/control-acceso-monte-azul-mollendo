"use client";

import { RequireRole } from "@/lib/auth/RequireRole";
import { PersonalDocumentos } from "../PersonalDocumentos";

/**
 * Personal y documentos para el vigilante: solo consulta (quién puede ingresar
 * y por qué, sus documentos y su período), sin cambiar nada ni abrir los
 * archivos. El administrador usa "/" (si entra aquí, vuelve a "/").
 */
export default function PersonalSoloLectura() {
  return (
    <RequireRole roles={["vigilancia"]}>
      <PersonalDocumentos soloLectura />
    </RequireRole>
  );
}
